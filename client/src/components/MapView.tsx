import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useGameStore } from "../store/useGameStore";
import { sendAction } from "../lib/socket";

const SWITZERLAND_CENTER: [number, number] = [46.85, 8.2];

const SHAPE_COLORS = ["#e8112d", "#4a9ee8", "#e0a63a", "#9b6de0", "#3ac17a"];

type Tool = "none" | "pin" | "circle" | "line";

export default function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const cantonLayerRef = useRef<L.GeoJSON | null>(null);
  const stationLayerRef = useRef<L.LayerGroup | null>(null);
  const boardLayerRef = useRef<L.LayerGroup | null>(null);
  const previewLayerRef = useRef<L.LayerGroup | null>(null);

  const { view } = useGameStore();
  const round = view?.currentRound;
  const isHider = round?.myRole === "HIDER";
  const isSeeker = round?.myRole === "SEEKER";

  const [tool, setTool] = useState<Tool>("none");
  const [stage, setStage] = useState<{ lat: number; lon: number } | null>(null);
  const [preview, setPreview] = useState<{ type: "CIRCLE" | "LINE"; a: L.LatLng; b: L.LatLng; radiusM?: number } | null>(null);
  const [pendingPin, setPendingPin] = useState<{ lat: number; lon: number } | null>(null);
  const [label, setLabel] = useState("");
  const [probability, setProbability] = useState(50);
  const [colorIdx, setColorIdx] = useState(0);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);

  // ---- Karte initialisieren
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView(SWITZERLAND_CENTER, 8);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
      attribution: "&copy; OpenStreetMap Mitwirkende &copy; CARTO",
    }).addTo(map);
    cantonLayerRef.current = L.geoJSON(undefined, {
      style: { color: "#4a9ee8", weight: 1, fillOpacity: 0.03, opacity: 0.35 },
    }).addTo(map);
    stationLayerRef.current = L.layerGroup().addTo(map);
    boardLayerRef.current = L.layerGroup().addTo(map);
    previewLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    fetch("/data/cantons.geojson")
      .then((r) => r.json())
      .then((geo) => cantonLayerRef.current?.addData(geo));

    setTimeout(() => map.invalidateSize(), 200);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ---- Kanton-Layer hervorheben je nach Region
  useEffect(() => {
    const layer = cantonLayerRef.current;
    if (!layer) return;
    layer.setStyle((feature: any) => {
      const highlight =
        round?.size === "KANTON" && round.region && feature.properties.num === Number(round.region.id);
      return {
        color: highlight ? "#e8112d" : "#4a9ee8",
        weight: highlight ? 2.5 : 1,
        fillOpacity: highlight ? 0.12 : 0.03,
        opacity: highlight ? 0.9 : 0.3,
      };
    });
  }, [round?.size, round?.region]);

  // ---- Stationsmarker
  useEffect(() => {
    const group = stationLayerRef.current;
    const map = mapRef.current;
    if (!group || !map || !round) return;
    group.clearLayers();

    const bounds: L.LatLngExpression[] = [];
    for (const st of round.anchorStations) {
      bounds.push([st.lat, st.lon]);
      const isChosen = isHider && round.hidingZoneStation?.id === st.id;
      const marker = L.circleMarker([st.lat, st.lon], {
        radius: isChosen ? 11 : 6,
        color: isChosen ? "#e8112d" : "#f4f6f8",
        fillColor: isChosen ? "#e8112d" : "#182533",
        fillOpacity: isChosen ? 0.9 : 0.85,
        weight: isChosen ? 3 : 1.5,
      }).bindTooltip(st.name, { direction: "top" });
      if (isHider && round.phase === "HIDING") {
        marker.on("click", async () => {
          await sendAction("chooseHidingZone", { stationId: st.id });
        });
      }
      marker.addTo(group);
    }
    if (bounds.length > 0) {
      map.fitBounds(bounds as any, { padding: [30, 30], maxZoom: round.size === "STADT" ? 15 : round.size === "KANTON" ? 12 : 9 });
    }
  }, [round?.anchorStations, round?.hidingZoneStation, round?.phase, isHider]);

  // ---- Investigation Board (nur Seeker)
  // Bei aktivem Zeichenwerkzeug werden bestehende Pins/Formen nicht-interaktiv,
  // damit Taps zum Platzieren immer bei der Karte ankommen und nicht von einer
  // bestehenden Form "geschluckt" werden.
  useEffect(() => {
    const group = boardLayerRef.current;
    if (!group || !round?.board) return;
    group.clearLayers();
    const toolActive = tool !== "none";

    for (const shape of round.board.shapes) {
      if (shape.type === "CIRCLE" && shape.centerLat != null && shape.radiusM != null) {
        const layer = L.circle([shape.centerLat, shape.centerLon!], {
          radius: shape.radiusM,
          color: shape.color,
          weight: 2,
          fillOpacity: 0.06,
          interactive: !toolActive,
        })
          .bindTooltip(shape.label || "Kreis")
          .addTo(group);
        if (!toolActive) layer.on("click", () => setSelectedShape(shape.id));
      } else if (shape.type === "LINE" && shape.lat1 != null) {
        const layer = L.polyline(
          [
            [shape.lat1, shape.lon1!],
            [shape.lat2!, shape.lon2!],
          ],
          { color: shape.color, weight: 3, dashArray: "6 6", interactive: !toolActive }
        )
          .bindTooltip(shape.label || "Linie")
          .addTo(group);
        if (!toolActive) layer.on("click", () => setSelectedShape(shape.id));
      }
    }

    for (const pin of round.board.pins) {
      const color = pin.excluded ? "#5c6a79" : `hsl(${pin.probability * 1.2}, 75%, 55%)`;
      const layer = L.circleMarker([pin.lat, pin.lon], {
        radius: 9,
        color: "#0b121b",
        weight: 2,
        fillColor: color,
        fillOpacity: pin.excluded ? 0.35 : 0.9,
        interactive: !toolActive,
      })
        .bindTooltip(`${pin.label} (${pin.probability}%)${pin.excluded ? " - ausgeschlossen" : ""}`)
        .addTo(group);
      if (!toolActive) layer.on("click", () => setSelectedPin(pin.id));
    }
  }, [round?.board, tool]);

  // ---- Klick-Handler für Zeichenwerkzeuge
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isSeeker) return;
    function onClick(e: L.LeafletMouseEvent) {
      if (tool === "none") return;
      const { lat, lng } = e.latlng;
      if (tool === "pin") {
        setPendingPin({ lat, lon: lng });
        setLabel("");
        setProbability(50);
        return;
      }
      if (!stage) {
        setStage({ lat, lon: lng });
        return;
      }
      const a = L.latLng(stage.lat, stage.lon);
      const b = L.latLng(lat, lng);
      if (tool === "circle") {
        setPreview({ type: "CIRCLE", a, b, radiusM: map!.distance(a, b) });
      } else {
        setPreview({ type: "LINE", a, b });
      }
      setStage(null);
    }
    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
    };
  }, [tool, stage, isSeeker]);

  // ---- Vorschau zeichnen (Kreis/Linie im Entstehen)
  useEffect(() => {
    const group = previewLayerRef.current;
    if (!group) return;
    group.clearLayers();
    if (preview?.type === "CIRCLE") {
      L.circle(preview.a, { radius: preview.radiusM, color: SHAPE_COLORS[colorIdx], weight: 2, dashArray: "4 4" }).addTo(group);
    } else if (preview?.type === "LINE") {
      L.polyline([preview.a, preview.b], { color: SHAPE_COLORS[colorIdx], weight: 3, dashArray: "4 4" }).addTo(group);
    }
    if (stage) {
      L.circleMarker([stage.lat, stage.lon], { radius: 5, color: SHAPE_COLORS[colorIdx] }).addTo(group);
    }
  }, [preview, stage, colorIdx]);

  async function confirmShape() {
    if (!preview) return;
    if (preview.type === "CIRCLE") {
      await sendAction("addBoardShape", {
        type: "CIRCLE",
        centerLat: preview.a.lat,
        centerLon: preview.a.lng,
        radiusM: preview.radiusM,
        color: SHAPE_COLORS[colorIdx],
        label,
      });
    } else {
      await sendAction("addBoardShape", {
        type: "LINE",
        lat1: preview.a.lat,
        lon1: preview.a.lng,
        lat2: preview.b.lat,
        lon2: preview.b.lng,
        color: SHAPE_COLORS[colorIdx],
        label,
      });
    }
    setPreview(null);
    setLabel("");
    setTool("none");
  }

  function cancelDrawing() {
    setPreview(null);
    setStage(null);
    setPendingPin(null);
    setSelectedPin(null);
    setSelectedShape(null);
    setTool("none");
  }

  async function confirmPin() {
    if (!pendingPin) return;
    await sendAction("addBoardPin", { lat: pendingPin.lat, lon: pendingPin.lon, label: label || "Vermutung", probability });
    setPendingPin(null);
    setLabel("");
    setTool("none");
  }

  const selectedPinData = round?.board?.pins.find((p) => p.id === selectedPin);
  const selectedShapeData = round?.board?.shapes.find((s) => s.id === selectedShape);

  return (
    <div className="stack">
      {isHider && round?.phase === "HIDING" && (
        <div className="badge badge--red" style={{ alignSelf: "flex-start" }}>
          📍 Tippe eine Station an, um deine Hiding Zone zu wählen
        </div>
      )}
      <div style={{ position: "relative" }}>
        <div ref={containerRef} style={{ width: "100%", height: 380, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-soft)" }} />
      </div>

      {isHider && round?.phase === "HIDING" && round.hidingZoneStation && (
        <div className="panel panel--tight stack">
          <p className="small">
            Gewählte Hiding Zone: <b>{round.hidingZoneStation.name}</b>
          </p>
          <button className="btn btn--primary btn--block" onClick={() => sendAction("endHidingEarly")}>
            ✅ Bereit - Vorsprung jetzt beenden
          </button>
        </div>
      )}

      {isSeeker && (
        <div className="panel panel--tight stack">
          <div className="row row--wrap">
            <button className={`btn btn--sm ${tool === "pin" ? "btn--primary" : "btn--secondary"}`} onClick={() => (cancelDrawing(), setTool(tool === "pin" ? "none" : "pin"))}>
              📍 Pin setzen
            </button>
            <button className={`btn btn--sm ${tool === "circle" ? "btn--primary" : "btn--secondary"}`} onClick={() => (cancelDrawing(), setTool(tool === "circle" ? "none" : "circle"))}>
              ⭕ Kreis zeichnen
            </button>
            <button className={`btn btn--sm ${tool === "line" ? "btn--primary" : "btn--secondary"}`} onClick={() => (cancelDrawing(), setTool(tool === "line" ? "none" : "line"))}>
              📏 Linie zeichnen
            </button>
            {tool !== "none" && (
              <button className="btn btn--ghost btn--sm" onClick={cancelDrawing}>
                Abbrechen
              </button>
            )}
          </div>
          {tool === "circle" && !preview && <p className="small muted">Tippe zuerst die Mitte, dann den Rand des Kreises an.</p>}
          {tool === "line" && !preview && <p className="small muted">Tippe Start- und Endpunkt der Linie an.</p>}
          {tool === "pin" && <p className="small muted">Tippe auf die Karte, um einen Vermutungs-Pin zu setzen.</p>}

          {(tool === "circle" || tool === "line") && (
            <div className="row row--wrap">
              {SHAPE_COLORS.map((c, i) => (
                <div
                  key={c}
                  onClick={() => setColorIdx(i)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: c,
                    border: colorIdx === i ? "2px solid white" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          )}

          {preview && (
            <div className="stack">
              <input className="input" placeholder="Beschriftung (optional)" value={label} onChange={(e) => setLabel(e.target.value)} />
              <div className="row">
                <button className="btn btn--primary" onClick={confirmShape}>
                  Übernehmen
                </button>
                <button className="btn btn--ghost" onClick={cancelDrawing}>
                  Verwerfen
                </button>
              </div>
            </div>
          )}

          {pendingPin && (
            <div className="stack">
              <input className="input" placeholder="Beschriftung (z.B. Ortsname)" value={label} onChange={(e) => setLabel(e.target.value)} />
              <label className="field">
                Wahrscheinlichkeit: {probability}%
                <input type="range" min={0} max={100} value={probability} onChange={(e) => setProbability(Number(e.target.value))} />
              </label>
              <div className="row">
                <button className="btn btn--primary" onClick={confirmPin}>
                  Pin setzen
                </button>
                <button className="btn btn--ghost" onClick={cancelDrawing}>
                  Verwerfen
                </button>
              </div>
            </div>
          )}

          {selectedPinData && (
            <div className="panel panel--tight stack">
              <b className="small">{selectedPinData.label}</b>
              <label className="field">
                Wahrscheinlichkeit: {selectedPinData.probability}%
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedPinData.probability}
                  onChange={(e) => sendAction("updateBoardPin", { pinId: selectedPinData.id, probability: Number(e.target.value) })}
                />
              </label>
              <div className="row">
                <button
                  className="btn btn--sm btn--secondary"
                  onClick={() => sendAction("updateBoardPin", { pinId: selectedPinData.id, excluded: !selectedPinData.excluded })}
                >
                  {selectedPinData.excluded ? "Wieder aktivieren" : "Ausschliessen"}
                </button>
                <button className="btn btn--sm btn--danger" onClick={() => (sendAction("removeBoardPin", { pinId: selectedPinData.id }), setSelectedPin(null))}>
                  Löschen
                </button>
                <button className="btn btn--sm btn--ghost" onClick={() => setSelectedPin(null)}>
                  Schliessen
                </button>
              </div>
            </div>
          )}

          {selectedShapeData && (
            <div className="panel panel--tight stack">
              <b className="small">{selectedShapeData.label || (selectedShapeData.type === "CIRCLE" ? "Kreis" : "Linie")}</b>
              <div className="row">
                <button
                  className="btn btn--sm btn--danger"
                  onClick={() => (sendAction("removeBoardShape", { shapeId: selectedShapeData.id }), setSelectedShape(null))}
                >
                  Löschen
                </button>
                <button className="btn btn--sm btn--ghost" onClick={() => setSelectedShape(null)}>
                  Schliessen
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

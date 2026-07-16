import { useGameStore } from "../store/useGameStore";
import Modal from "./Modal";
import { CATEGORY_ICON } from "./icons";

export default function RulesModal({ onClose }: { onClose: () => void }) {
  const gameData = useGameStore((s) => s.gameData);

  return (
    <Modal title="Spielregeln" onClose={onClose}>
      <section className="stack">
        <h3>Grundidee</h3>
        <p>
          Ein Spieler ist der <b>Hider</b>, alle anderen sind das <b>Seeker</b>-Team. Der Hider
          reist mit dem öffentlichen Verkehr in ein geheimes Gebiet (die <b>Hiding Zone</b>) und
          versucht, so lange wie möglich unentdeckt zu bleiben. Die Seeker stellen Fragen,
          werten Antworten aus und reisen los, um ihn zu finden.
        </p>
      </section>

      <section className="stack">
        <h3>Ablauf einer Runde</h3>
        <p>
          <b>1. Hiding Period</b> - der Hider bekommt einen Vorsprung, wählt eine Hiding Zone und
          reist dorthin. Die Seeker dürfen währenddessen nicht aktiv suchen.
          <br />
          <b>2. Seeking Period</b> - die Seeker stellen Fragen und reisen los. Für jede
          beantwortete Frage zieht der Hider Karten.
          <br />
          <b>3. Endgame</b> - sobald die Seeker das Team-Signal "In der Zone angekommen" geben,
          muss der Hider an einem öffentlich zugänglichen Ort bleiben, bis er gefunden wird.
        </p>
      </section>

      {gameData && (
        <section className="stack">
          <h3>Spielgrössen</h3>
          {gameData.sizes.map((s) => (
            <div key={s.id} className="panel panel--tight stack" style={{ gap: 4 }}>
              <div className="row row--between">
                <b>{s.label}</b>
                <span className="badge">{s.hidingPeriodMinutes} Min. Vorsprung</span>
              </div>
              <p className="small">{s.description}</p>
              <div className="row small muted row--wrap">
                <span>Zone-Radius ~{(s.hidingZoneRadiusMeters / 1000).toFixed(1)} km</span>
                <span>·</span>
                <span>Handlimit {s.handLimit}</span>
                <span>·</span>
                <span>
                  Dauer {s.minRoundHours}-{s.maxRoundHours} Std.
                </span>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="stack">
        <h3>Fragen &amp; Preise</h3>
        <p>
          Jede Frage kostet Karten: Der Hider zieht X Karten und behält Y davon. Eine{" "}
          <b>verstärkte Frage</b> liefert mehr Information, kostet dafür mehr Karten. Wird
          dieselbe Frage erneut gestellt, verdoppelt (verdreifacht, ...) sich ihr Preis.
        </p>
        {gameData && (
          <div className="stack">
            {Object.entries(gameData.categoryLabels).map(([cat, label]) => (
              <div key={cat} className="row small">
                <span>{CATEGORY_ICON[cat]}</span>
                <b>{label}</b>
                <span className="muted">
                  - {gameData.questions.filter((q) => q.category === cat).length} Fragen
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="stack">
        <h3>Karten</h3>
        <p>
          <b>Zeitbonus</b> verlängert am Ende die gemessene Versteckzeit. <b>Powerups</b> geben
          dem Hider Vorteile (mehr Handkarten, Kartenvorschuss, Fragen blockieren, ...).{" "}
          <b>Curses</b> erschweren den Seekern das Leben (Kategorien sperren, Zeit stehlen,
          Aufgaben stellen, ...). Karten mit dem Hinweis "Ehrenregel" werden nicht technisch
          erzwungen, sondern beruhen auf Fairplay - wie im echten Spiel.
        </p>
        <p className="small muted">
          Handlimit: Wird es überschritten, muss der Hider zuerst Karten spielen oder abwerfen,
          bevor er neue Karten ziehen kann.
        </p>
      </section>

      <section className="stack">
        <h3>Gefunden werden</h3>
        <p>
          Ein Seeker meldet "Gefunden", der Hider muss dies bestätigen oder ablehnen. Nur so
          zählt die Runde als beendet - niemand kann sich das Ende einfach ausdenken.
        </p>
      </section>

      <section className="stack">
        <h3>Punkte</h3>
        <p>
          Endpunktzahl = tatsächliche Versteckzeit + Zeitbonuskarten + Spezialboni - Verspätungs-
          Strafen. Verspätete Antworten pausieren die Uhr des Hiders und kosten zusätzlich
          Minuten. Wer die volle Rundendauer übersteht, erhält einen grossen Bonus.
        </p>
      </section>
    </Modal>
  );
}

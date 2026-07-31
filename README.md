# Backyard Ultra Timer

Lokale Desktop-App (Electron + React + TypeScript) für die Live-Anzeige bei einem Backyard Ultra. Läuft komplett offline, ohne Internetverbindung.

## Funktionen

- Durchlaufender Event-Timer (HH:MM:SS), der niemals automatisch zurückgesetzt wird
- Distanzanzeige in Schritten von 6.7 km (konfigurierbar), gesteuert über die Pfeiltasten
- Rundenzähler und "Aktuelle Runde: n / ∞"
- Countdown "Nächster Start in" (zählt von 60:00 herunter, springt automatisch wieder auf 60:00)
- Stundenrunde (floor(Timer / 60 Min) + 1)
- Durchschnittspace seit Eventbeginn
- Anzeige des nächsten Meilensteins (nächstes Vielfache von 6.7 km)
- Uhrzeit des Rechners oben rechts
- Automatisches Speichern alle 5 Sekunden, Wiederherstellung nach Neustart (der Timer läuft dabei realzeit-korrekt weiter)
- Sicherheitsabfrage vor jedem Reset
- Optionaler Signalton zur vollen Stunde sowie in den letzten 10 Sekunden vor dem nächsten Start
- Dunkles, grossflächiges Design für gute Lesbarkeit aus der Distanz

## Bedienung

| Taste       | Aktion                          |
| ----------- | -------------------------------- |
| `↑`         | Distanz +6.7 km (Runde +1)       |
| `↓`         | Distanz -6.7 km (Runde -1)       |
| `Leertaste` | Timer starten/pausieren          |
| `F`         | Vollbild umschalten              |
| `ESC`       | Vollbild verlassen                |
| `R`         | Reset (mit Sicherheitsabfrage)   |

Alternativ stehen unten am Bildschirmrand dezente **Start/Pause**- und **Reset Event**-Buttons zur Verfügung.

## Entwicklung

```bash
npm install
npm run dev
```

Startet Vite + Electron mit Hot-Reload.

## Build

```bash
npm run build      # Typecheck + Vite-Build (renderer + electron/main + preload)
npm run dist:win    # Windows-Installer (.exe) via electron-builder
npm run dist:mac    # macOS (.dmg)
npm run dist:linux  # Linux (AppImage)
```

Die fertigen Pakete landen im Ordner `release/`.

> Für ein eigenes App-Icon `build/icon.ico` (Windows), `build/icon.icns` (macOS) bzw. `build/icon.png` (Linux) ablegen und in der `build`-Konfiguration in `package.json` referenzieren.

## Konfiguration

Zentrale Einstellungen (Rundendistanz, Countdown-Länge, Farben, Ton) befinden sich in [`src/config/settings.ts`](src/config/settings.ts).

## Projektstruktur

```
electron/            Electron main- und preload-Prozess
src/
  components/         Reine Anzeige-Komponenten
  hooks/               Timer-/Event-State, Tastatursteuerung, Vollbild, Sound
  config/              Zentrale Einstellungen
  utils/               Zeit-Formatierung, Ereignis-Berechnungen, Persistenz, Sound
```

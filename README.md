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

Das App-Icon liegt bereits unter `build/icon.ico` (Windows), `build/icon.icns` (macOS) und `build/icon.png` (Linux + Fenstersymbol im Dev-Modus) und ist in der `build`-Konfiguration in `package.json` referenziert. Zum Austauschen einfach die Dateien ersetzen (gleicher Dateiname) und `public/icon.png` für das Fenster-/Taskleistensymbol aktualisieren.

### Windows-Build erzeugen

`npm run dist:win` muss entweder **auf einem Windows-Rechner** laufen, oder auf Linux/macOS mit installiertem [Wine](https://wiki.winehq.org/Download) (electron-builder nutzt Wine, um das Icon und die Metadaten in die `.exe` einzubetten). Ohne Wine bricht der Build unter Linux mit `wine is required` ab. Alternativ lässt sich der Build z. B. über eine GitHub-Actions-Pipeline mit `windows-latest`-Runner automatisieren.

Ergebnis in `release/`:
- `Backyard Ultra Timer Setup <version>.exe` – Installer (NSIS)
- `Backyard Ultra Timer <version>.exe` – Portable Version (kein Setup nötig)

## Installation unter Windows

1. **Installer-Variante (empfohlen):** Die Datei `Backyard Ultra Timer Setup <version>.exe` aus `release/` auf den Windows-Laptop kopieren und doppelklicken. Der NSIS-Installer lässt sich (dank `allowToChangeInstallationDirectory`) auf einen beliebigen Ordner installieren; danach erscheint eine Verknüpfung im Startmenü/Desktop.
2. **Portable Variante (ohne Installation):** Alternativ einfach `Backyard Ultra Timer <version>.exe` direkt ausführen – läuft ohne Installation von einem USB-Stick oder beliebigen Ordner.
3. **SmartScreen-Warnung:** Da die App nicht mit einem kostenpflichtigen Code-Signing-Zertifikat signiert ist, zeigt Windows beim ersten Start eventuell "Windows hat den Computer geschützt" an. Auf **"Weitere Informationen"** und dann **"Trotzdem ausführen"** klicken.
4. **Start:** Die App startet direkt im Vollbild. Mit `F`/`ESC` lässt sich der Vollbildmodus umschalten, mit `R` (inkl. Sicherheitsabfrage) das Event zurücksetzen.

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

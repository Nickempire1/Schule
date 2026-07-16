# Verstecken CH

Ein digitales Hide+Seek-Spiel im Stil von *Jet Lag: The Game - Hide + Seek*, gebaut für die
Schweiz. Ein Spieler versteckt sich irgendwo im gewählten Gebiet (Stadt, Kanton oder ganze
Schweiz), die anderen jagen ihn per Fragen, Kartenspiel und öffentlichem Verkehr.

Für mobile Browser gebaut (PWA, "zum Home-Bildschirm hinzufügen" möglich). Eine Person hostet
eine Session, alle anderen treten per Code oder QR-Code/Link mit ihrem eigenen Handy bei -
alle im selben WLAN/Netzwerk.

## Projektstruktur

```
server/   Node.js + Express + Socket.IO - Spiellogik, Session-Verwaltung, Medien-Uploads
client/   React + Vite + TypeScript + Leaflet - Mobile-first UI
scripts/  Build-Hilfsskripte
```

Statische Spieldaten (Fragen, Karten, Spielgrössen, Schweizer Bahnhöfe/Städte, Kantons-
Geodaten) liegen serverseitig unter `server/src/game/` und werden dem Client zur Laufzeit über
`/api/gamedata` ausgeliefert. Die Kantonsgrenzen (`client/public/data/cantons.geojson`) stammen
aus dem offiziellen swissBOUNDARIES3D-Datensatz (vereinfacht, © swisstopo / via
labs.karavia.ch, Lizenz opendata.swiss).

## Voraussetzungen

- Node.js 20+
- npm

## Installation

```bash
npm run install:all
```

Installiert Abhängigkeiten für `server` und `client`.

## Entwicklung (lokal, mit Hot-Reload)

```bash
npm run dev
```

Startet Server (Port 4000) und Client-Dev-Server (Port 5173, mit API/Socket-Proxy zu 4000)
parallel. Öffne `http://localhost:5173`.

## Produktion / im selben WLAN mit mehreren Handys spielen

1. Build erstellen:

   ```bash
   npm run build
   ```

   Baut den Client und kopiert ihn in `server/public`, danach wird der Server kompiliert.

2. Server starten:

   ```bash
   npm start
   ```

   Der Server läuft auf Port 4000 (änderbar über die Umgebungsvariable `PORT`) und ist unter
   `http://0.0.0.0:4000` erreichbar - liefert sowohl die API/Sockets als auch das gebaute
   Frontend aus.

3. Herausfinden, welche lokale IP-Adresse der Host-Rechner im WLAN hat (z.B. `ipconfig` unter
   Windows, `ifconfig` / `ip a` unter macOS/Linux - meist etwas wie `192.168.1.23`).

4. Der Host öffnet im Browser `http://<lokale-ip>:4000`, erstellt eine Session und teilt den
   angezeigten QR-Code oder Link. Alle anderen Spieler:innen müssen im selben WLAN sein und
   scannen den QR-Code oder öffnen den Link direkt auf ihrem Handy - das trägt den Session-Code
   automatisch ein.

Damit das funktioniert, muss die Firewall des Host-Rechners eingehende Verbindungen auf dem
gewählten Port zulassen.

### Über mehrere Tage spielen (Spielgrösse "Ganze Schweiz")

Sessions werden serverseitig alle paar Sekunden auf Disk gesichert (`server/data/sessions/`),
sodass ein Neustart des Servers laufende Spiele nicht verliert. Der Host-Rechner muss für die
Dauer des Spiels aber erreichbar bleiben (online/eingeschaltet).

## Spielregeln

Eine vollständige Erklärung aller Regeln, Spielgrössen, Fragekategorien, Karten und des
Punktesystems ist direkt in der App über den Button "Regeln" (oder "Wie funktioniert das
Spiel?" auf dem Startbildschirm) abrufbar.

## Wichtige Design-Entscheidung: Ehrenregeln

Wie im analogen Original setzt ein Teil der Karten- und Curse-Effekte (z.B. Bewegungsfreiheit,
verbotene Verkehrsmittel, Umwege) auf Fairplay statt auf technische Durchsetzung, da die App die
reale Position/Bewegung der Spieler:innen nicht per GPS überwacht. Diese Effekte sind in der App
mit dem Hinweis "🤝 Ehrenregel" gekennzeichnet. Alle anderen Effekte (Fragekategorien sperren,
Kartenpreise, Handlimit, Zeitstrafen, Antwortfristen, Foto-Bedingungen) werden vom Server
automatisch durchgesetzt.

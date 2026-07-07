# PixelPost 💌

**Deine Grußkarte als begehbares Mini-Spiel im Retro-Stil.**

Sammle Grüße (Name + Text) von Freunden, Familie oder Kollegen — jeder Gruß wird
ein Männchen in einem Pixel-Raum im Game-Boy-Look. Der Empfänger steuert eine
Figur (Pfeiltasten/WASD, am Handy D-Pad + A-Knopf), läuft zu den Männchen und
liest die Grüße in der klassischen Dialogbox mit Schreibmaschinen-Text.

Anlässe: 🎂 Geburtstag · 👋 Abschied · 💍 Hochzeit · 🏆 Jubiläum · 💌 Einfach so
Sprache der Karte wählbar: **Deutsch / English** (komplett übersetzt, auch die
Ersteller-Seite).

## Wie es funktioniert

1. **Erstellen:** Auf der Seite Sprache, Anlass, Figur und Begrüßung wählen,
   Grüße eintragen (jeweils optional mit Emoji).
2. **Teilen:** Entweder als **Link** (die komplette Karte steckt komprimiert in
   der URL — kein Server, nichts wird hochgeladen) oder als **HTML-Datei**
   (läuft komplett offline).
3. **Spielen:** Der Empfänger öffnet Link oder Datei und läuft los.

### Optional: Sammel-Link (mehrere tragen ein)

Statt alle Grüße selbst einzutragen, kann man einen **Sammel-Link** starten und
herumschicken — jede/r trägt den eigenen Gruß ein, und der Ersteller baut am
Ende mit seinem privaten Verwalten-Link die fertige (weiterhin serverlose)
Karte. Nur dafür werden die Grüße kurz in einer Supabase-Datenbank
zwischengespeichert:

- Tabellen sind per Row-Level-Security komplett gesperrt; jeder Zugriff läuft
  über geprüfte `SECURITY DEFINER`-Funktionen (`create_collection`,
  `collection_info`, `add_greeting`, `list_greetings`, `set_collection_open`).
- Beitragende können nur eintragen (nicht mitlesen); nur wer den geheimen
  `owner_token` (im Verwalten-Link) hat, sieht die gesammelten Grüße.
- Limits gegen Missbrauch: max. 200 Grüße/Sammlung, Längenbegrenzungen.
- Der `anon`/publishable Key ist bewusst öffentlich (Sicherheit steckt in RLS +
  Funktionen).

## Technik

- Reines HTML/CSS/JS, keine Build-Tools, kein Backend, kein Tracking.
- `js/engine.js` — die Spiel-Engine als eine einzige plain function
  (`PIXELPOST_RUNTIME`). Sie baut ihr eigenes DOM + CSS und wird per
  `.toString()` in die Download-HTML eingebettet → **eine** Quelle für
  Live-Ansicht und Export.
- `js/app.js` — Ersteller-Formular, URL-Codec (JSON → deflate-raw →
  base64url im Hash), Viewer-Modus, Datei-Export.
- Canvas intern 160 × 144 (echtes Game-Boy-Maß), ganzzahlig hochskaliert.
  Einheitlicher Look: klassischer Blau-Raum, Deko + Figuren bunt
  (Game-Boy-Color-Gefühl).
- **Der Raum wächst mit der Gruß-Anzahl** — in Breite *und* Höhe. Die Figuren
  stehen auf einem Gitter (garantiert alle erreichbar), die Kamera scrollt bei
  großen Karten in beide Richtungen (getestet bis 50 Grüße). Viel Deko:
  Bücherregal, Stehlampen, Wanduhr, Bild, Pflanzen, Geschenke, plus
  **anlassabhängige** Stücke (Kuchen + Ballons, Koffer + Umzugskartons,
  Herz-Teppich + Blumen, Pokal + Bowle + Wimpelkette) und Konfetti/Blütenblätter
  auf dem Boden.
- Jede Figur sieht anders aus: Frisur, Haarfarbe, Hautton und Kleidungsfarbe
  werden stabil aus dem Namen abgeleitet (gleiche Person = gleiches Männchen).
  Alle Figuren sind detailreich schattiert (Haar-Glanz, Tunika-Licht/-Schatten,
  Hautschatten, Augenbrauen, Mund, Kragen, zweifarbige Beine) — die Töne werden
  aus der Grundfarbe berechnet. Die gesteuerte Spielfigur nutzt denselben
  Renderer und ist in 6 Varianten wählbar.
- Funktioniert am **Handy** (Touch-D-Pad + A-Knopf) wie am Desktop
  (Pfeiltasten/WASD); die Ersteller- und Sammel-Seiten sind responsiv.
- Optionales **Emoji pro Gruß**, das über der Figur schwebt; beim Ansprechen
  zeigt die Dialogbox ein **Porträt** des Absenders und die Figur hüpft kurz.
- Grüße öffnen sich automatisch, sobald man neben einer Figur stehen bleibt;
  ungelesene Figuren haben ein blinkendes „!", ein **Kompass-Pfeil** weist bei
  großen Karten zur nächsten ungelesenen Figur, oben rechts zählt ein
  Gelesen-Zähler mit, und wer alle Grüße gelesen hat, bekommt eine Fanfare
  mit **Konfetti-Regen**.
- Sanfte **Hintergrund-Chiptune** je Anlass (stummschaltbar, pausiert im
  Hintergrund-Tab). **Barrierefreiheit:** alle Grüße sind zusätzlich als
  Textliste abrufbar (Screenreader + „≡"-Knopf).
- **QR-Code** zum Link auf der Ersteller-Seite (lokal im Browser erzeugt) und
  eine **Link-Vorschau** (Open Graph) für hübsche Vorschaubilder in Messengern.
- Schrift: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)
  (SIL Open Font License, auch kommerziell frei nutzbar).
- Sound: prozedurale Web-Audio-Bleeps, kein Asset. Stummschaltbar (🔊-Knopf),
  Einstellung bleibt gespeichert.

## Rechtliches

- Sämtliche Pixel-Art ist **selbst erstellt** (prozedural gezeichnet) —
  „im Stil von" Retro-Klassikern, aber ohne fremde Assets oder Namen.
- Vor einem kommerziellen Verkauf: Impressum + Datenschutzerklärung ergänzen.

© 2026 — alle Rechte vorbehalten.

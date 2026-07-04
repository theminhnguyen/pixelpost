# PixelPost 💌

**Deine Grußkarte als begehbares Mini-Spiel im Retro-Stil.**

Sammle Grüße (Name + Text) von Freunden, Familie oder Kollegen — jeder Gruß wird
ein Männchen in einem Pixel-Raum im Game-Boy-Look. Der Empfänger steuert eine
Figur (Pfeiltasten/WASD, am Handy D-Pad + A-Knopf), läuft zu den Männchen und
liest die Grüße in der klassischen Dialogbox mit Schreibmaschinen-Text.

Anlässe: 🎂 Geburtstag · 👋 Abschied · 💍 Hochzeit · 🏆 Jubiläum · 💌 Einfach so

## Wie es funktioniert

1. **Erstellen:** Auf der Seite Anlass, Farb-Edition und Begrüßung wählen,
   Grüße eintragen.
2. **Teilen:** Entweder als **Link** (die komplette Karte steckt komprimiert in
   der URL — kein Server, nichts wird hochgeladen) oder als **HTML-Datei**
   (läuft komplett offline).
3. **Spielen:** Der Empfänger öffnet Link oder Datei und läuft los.

## Technik

- Reines HTML/CSS/JS, keine Build-Tools, kein Backend, kein Tracking.
- `js/engine.js` — die Spiel-Engine als eine einzige plain function
  (`PIXELPOST_RUNTIME`). Sie baut ihr eigenes DOM + CSS und wird per
  `.toString()` in die Download-HTML eingebettet → **eine** Quelle für
  Live-Ansicht und Export.
- `js/app.js` — Ersteller-Formular, URL-Codec (JSON → deflate-raw →
  base64url im Hash), Viewer-Modus, Datei-Export.
- Canvas intern 160 × 144 (echtes Game-Boy-Maß), ganzzahlig hochskaliert.
  Raum in 4-Farben-Editions-Palette (Blau/Rot/Gold), Deko + Figuren bunt
  (Game-Boy-Color-Gefühl).
- Jede Figur sieht anders aus: Frisur, Haarfarbe, Hautton und Kleidungsfarbe
  werden stabil aus dem Namen abgeleitet (gleiche Person = gleiches Männchen).
- Grüße öffnen sich automatisch, sobald man neben einer Figur stehen bleibt;
  ungelesene Figuren haben ein blinkendes „!", oben rechts zählt ein
  Gelesen-Zähler mit, und wer alle Grüße gelesen hat, bekommt eine
  kleine Fanfare.
- Schrift: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)
  (SIL Open Font License, auch kommerziell frei nutzbar).
- Sound: prozedurale Web-Audio-Bleeps, kein Asset. Stummschaltbar (🔊-Knopf),
  Einstellung bleibt gespeichert.

## Rechtliches

- Sämtliche Pixel-Art ist **selbst erstellt** (prozedural gezeichnet) —
  „im Stil von" Retro-Klassikern, aber ohne fremde Assets oder Namen.
- Vor einem kommerziellen Verkauf: Impressum + Datenschutzerklärung ergänzen.

© 2026 — alle Rechte vorbehalten.

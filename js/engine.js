/* ===================================================================
   PixelPost Engine — begehbare Grußkarte im Game-Boy-Color-Stil.
   Eine einzige plain function, die ihr eigenes DOM + CSS baut:
   - läuft live auf der Ersteller-Seite (Vorschau + Link-Ansicht)
   - wird per PIXELPOST_RUNTIME.toString() in die Download-HTML
     eingebettet (kein Modul, keine Doppelpflege!)
   Alles eigene Pixel-Art (prozedural gezeichnet), keine fremden Assets.
   Ein einheitlicher Look: klassischer Game-Boy-Blau-Raum, Deko + Figuren
   bunt (Game-Boy-Color-Gefühl). Sprache DE/EN.

   PIXELPOST_RUNTIME(CARD, opts?)
     CARD = { title, occasion, lang, greetings:[{name,text}], appUrl }
     opts = { onClose } → Vorschau-Modus mit ✕-Knopf + Esc
   =================================================================== */
function PIXELPOST_RUNTIME(CARD, opts) {
  "use strict";
  const O = opts || {};

  /* ---------- Palette (klassischer Blau-Raum, hell → dunkel) ---------- */
  const PAL = ["#e8f0f8", "#a8c0e0", "#5878a8", "#182840"];
  const INK = PAL[3], PAPER = "#f8f8f8";

  /* ---------- Bunte Akzentfarben (GBC-Gefühl) ---------- */
  const C = {
    red: "#c04040", green: "#3f8850", leaf: "#2f6636", yellow: "#e8c850",
    brown: "#8a5a2c", tan: "#c89858", pink: "#e87898", white: "#f8f8f8",
    sky: "#98d0e8",
  };

  /* ---------- Sprache (DE/EN) — alle In-Game-Texte ---------- */
  const LANG = CARD.lang === "en" ? "en" : "de";
  const STR = {
    de: {
      hint: "Pfeile/WASD gehen · <b>E</b> sprechen",
      suffix: " - Sprich mit allen Leuten!",
      allRead: "Das waren alle Grüße - schön, dass du da warst!",
      empty1: "NOCH KEINE", empty2: "GRÜSSE …",
      brand: "✉ erstellt mit PixelPost",
      listTitle: "Alle Grüße als Text", close: "Schließen", noName: "Jemand",
      intro: { einfach: "Eine Karte für dich!", geburtstag: "Alles Gute zum Geburtstag!", abschied: "Mach's gut - auf Wiedersehen!", hochzeit: "Alles Gute zur Hochzeit!", jubilaeum: "Glückwunsch zum Jubiläum!" },
    },
    en: {
      hint: "Arrows/WASD move · <b>E</b> talk",
      suffix: " - Go talk to everyone!",
      allRead: "That was everyone - thanks for stopping by!",
      empty1: "NO GREETINGS", empty2: "HERE YET …",
      brand: "✉ made with PixelPost",
      listTitle: "All greetings as text", close: "Close", noName: "Someone",
      intro: { einfach: "A card just for you!", geburtstag: "Happy Birthday!", abschied: "Farewell - all the best!", hochzeit: "Congrats on your wedding!", jubilaeum: "Happy anniversary!" },
    },
  };
  const L = STR[LANG];

  /* ---------- Anlässe (nur Deko-Konfiguration; Texte kommen aus L.intro) ---------- */
  const OCC = {
    einfach:    { table: "envelope", side: null,                            extra: "plant",        festive: false, sprinkle: null },
    geburtstag: { table: "cake",     side: ["balloonRed", "balloonYellow"], extra: "presents",     festive: true,  sprinkle: [C.red, C.yellow, C.green] },
    abschied:   { table: "envelope", side: ["suitcase", "box"],             extra: "box",          festive: false, sprinkle: null },
    hochzeit:   { table: "envelope", side: ["flowerRed", "flowerYellow"],   extra: "flowerYellow", festive: true,  heartRug: true, sprinkle: [C.pink, C.white] },
    jubilaeum:  { table: "trophy",   side: ["flag", "flag"],                extra: "drinks",       festive: true,  sprinkle: [C.yellow, C.red] },
  };
  const occ = OCC[CARD.occasion] || OCC.einfach;

  /* ---------- Pixel-Sprites (Grund-Silhouette) ----------
     '.'=durchsichtig · 0=Haut · e=Augen · 2=Tunika · 3=Haare (Kopf, Reihen 1–7)
     bzw. Umriss/Beine (ab Reihe 8). enrich() fügt daraus Schatten, Gesichtszüge,
     Kragen, Hose + Schuhe usw. hinzu. */
  const SPR = {
    down0: ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3300000033...", "...300e00e003...", "...3000000003...", "....30000003....", "...3222222223...", "..322222222223..", "..302222222203..", "...3222222223...", "....32222223....", "....33....33....", "....33....33....", "................"],
    down1: ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3300000033...", "...300e00e003...", "...3000000003...", "....30000003....", "...3222222223...", "..322222222223..", "..302222222203..", "...3222222223...", "....32222223....", "....33..33......", "........33......", "................"],
    up0:   ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3333333333...", "...3333333333...", "...3333333333...", "....33333333....", "...3222222223...", "..322222222223..", "..302222222203..", "...3222222223...", "....32222223....", "....33....33....", "....33....33....", "................"],
    up1:   ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3333333333...", "...3333333333...", "...3333333333...", "....33333333....", "...3222222223...", "..322222222223..", "..302222222203..", "...3222222223...", "....32222223....", "......33..33....", "......33........", "................"],
    side0: ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3333000033...", "...33300e0033...", "...3330000033...", "....33000033....", "...3222222233...", "...32222222230..", "...3222222223...", "...3222222223...", "....32222223....", "....33...33.....", "....33...33.....", "................"],
    side1: ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3333000033...", "...33300e0033...", "...3330000033...", "....33000033....", "...3222222233...", "...32222222230..", "...3222222223...", "...3222222223...", "....32222223....", ".....33.33......", "....33...33.....", "................"],
  };

  /* ---------- Individuelle, detailreiche Figuren ----------
     Aussehen wird stabil aus Name abgeleitet (gleiche Person = gleiches
     Männchen). Aus der Grundfarbe werden Licht-/Schatten-Töne berechnet, dazu
     kommen Gesichtszüge (Brauen, Mund, Wangen), Kragen, Gürtelzone, zweifarbige
     Beine (Hose + Schuhe) und Haar-Glanz. */
  const HAIRS  = ["#402818", "#e8c860", "#b04820", "#181818", "#c8c8c8"]; // braun, blond, rot, schwarz, grau
  const TUNICS = ["#c04040", "#3f8850", "#4060b8", "#8848a0", "#d07828", "#2f8f8f"];
  const SKINS  = ["#f8d8b8", "#e0a878", "#a86838"];
  const CAPS   = ["#c04040", "#4060b8", "#3f8850", "#333a4a"];
  const OUTLINE = "#241c22", BOOTS = "#2a2320", GLASS = "#181418";
  function shade(hex, f) { // f>0 heller, f<0 dunkler
    const n = parseInt(hex.slice(1), 16);
    const cl = (c) => Math.max(0, Math.min(255, Math.round(c + 255 * f)));
    return "#" + (0x1000000 + (cl((n >> 16) & 255) << 16) + (cl((n >> 8) & 255) << 8) + cl(n & 255)).toString(16).slice(1);
  }
  function lookOf(name, i) {
    let h = 0;
    const s = String(name || "");
    for (let k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) >>> 0;
    const base = h + i * 7;
    const accRoll = Math.floor(base / 180) % 4; // 0,1 nichts · 2 Brille · 3 Mütze
    return {
      tunic: TUNICS[base % 6],
      hair: HAIRS[Math.floor(base / 6) % 5],
      skin: SKINS[Math.floor(base / 30) % 3],
      style: Math.floor(base / 90) % 2,          // 0 kurz · 1 lange Haare
      acc: accRoll === 2 ? "glasses" : accRoll === 3 ? "cap" : null,
      cap: CAPS[Math.floor(base / 720) % CAPS.length],
    };
  }
  function figColors(look) {
    const cap = look.cap || look.tunic;
    return {
      hair: look.hair, hairHi: shade(look.hair, 0.20), skin: look.skin, skinSh: shade(look.skin, -0.13),
      tunic: look.tunic, tunicHi: shade(look.tunic, 0.15), tunicSh: shade(look.tunic, -0.18),
      pants: shade(look.tunic, -0.34), boots: BOOTS, outline: OUTLINE,
      eye: "#241a20", brow: shade(look.hair, -0.1), mouth: shade(look.skin, -0.42),
      cap: cap, capSh: shade(cap, -0.22), glass: GLASS,
    };
  }
  const put = (row, i, ch) => row.slice(0, i) + ch + row.slice(i + 1);
  const rep = (row, i, from, to) => (row[i] === from ? put(row, i, to) : row); // nur ersetzen, wenn passend
  function edgesTo(row, from, to) { // erstes + letztes Vorkommen ersetzen (Seitenschatten)
    const a = row.indexOf(from); if (a < 0) return row;
    const b = row.lastIndexOf(from);
    return b === a ? put(row, a, to) : put(put(row, a, to), b, to);
  }
  function enrich(base, face, look) {
    const r = base.slice();
    const longHair = look.style === 1, acc = look.acc;
    r[13] = r[13].replace(/3/g, "p");                       // Hose
    r[14] = r[14].replace(/3/g, "b");                       // Schuhe
    r[12] = r[12].replace(/2/g, "D");                       // Taille/Gürtelzone dunkler
    r[8] = rep(rep(r[8], 7, "2", "L"), 8, "2", "L");        // Kragen
    r[9] = rep(r[9], 7, "2", "L");                          // Brust-Highlight
    r[10] = edgesTo(r[10], "2", "D"); r[11] = edgesTo(r[11], "2", "D"); // Tunika-Seitenschatten
    r[2] = rep(rep(r[2], 6, "3", "H"), 7, "3", "H");        // Haar-Glanz
    r[3] = rep(r[3], 5, "3", "H");
    if (longHair) { r[8] = put(put(r[8], 2, "h"), 13, "h"); r[9] = put(put(r[9], 2, "h"), 13, "h"); }
    // Mütze: Reihen 1–3 = Mützenfarbe, Reihe 3 dunkles Band, vorne kleiner Schirm
    if (acc === "cap") {
      for (let y = 1; y <= 3; y++) r[y] = r[y].replace(/[3H]/g, "C");
      r[3] = r[3].replace(/C/g, "c");
      if (face === "front") r[4] = rep(rep(r[4], 4, "3", "c"), 11, "3", "c");
    }
    if (face === "front") {
      if (acc !== "glasses") r[4] = rep(rep(r[4], 6, "0", "B"), 9, "0", "B"); // Augenbrauen
      r[6] = rep(r[6], 7, "0", "m");                        // Mund
      r[7] = rep(rep(r[7], 5, "0", "k"), 10, "0", "k");     // Wangen/Kinnschatten
      if (acc === "glasses") r[5] = put(put(put(put(r[5], 5, "G"), 7, "G"), 8, "G"), 10, "G"); // Brille um die Augen
    } else if (face === "side") {
      if (acc !== "glasses") r[4] = rep(r[4], 8, "0", "B");
      r[6] = rep(r[6], 8, "0", "m");
      r[7] = rep(r[7], 9, "0", "k");
      if (acc === "glasses") r[5] = put(put(r[5], 7, "G"), 9, "G");
    }
    return r;
  }
  function colorFor(ch, ry, c) {
    switch (ch) {
      case "0": return c.skin; case "k": return c.skinSh;
      case "e": return c.eye; case "B": return c.brow; case "m": return c.mouth;
      case "2": return c.tunic; case "L": return c.tunicHi; case "D": return c.tunicSh;
      case "p": return c.pants; case "b": return c.boots;
      case "H": return c.hairHi; case "h": return c.hair;
      case "C": return c.cap; case "c": return c.capSh; case "G": return c.glass;
      case "3": return ry <= 7 ? c.hair : c.outline;
      default: return c.outline;
    }
  }
  function renderFigure(base, look, opts) {
    opts = opts || {};
    const c = figColors(look);
    const cnv = document.createElement("canvas"); cnv.width = 16; cnv.height = 16;
    const x = cnv.getContext("2d");
    enrich(base, opts.face, look).forEach((row, ry) => {
      for (let rx = 0; rx < 16; rx++) {
        const ch = row[rx];
        if (ch === "." || ch == null) continue;
        x.fillStyle = colorFor(ch, ry, c);
        x.fillRect(opts.flip ? 15 - rx : rx, ry, 1, 1);
      }
    });
    return cnv;
  }
  function figureSet(look) {
    return {
      down: [renderFigure(SPR.down0, look, { face: "front" }), renderFigure(SPR.down1, look, { face: "front" })],
      up: [renderFigure(SPR.up0, look, { face: "back" }), renderFigure(SPR.up1, look, { face: "back" })],
      right: [renderFigure(SPR.side0, look, { face: "side" }), renderFigure(SPR.side1, look, { face: "side" })],
      left: [renderFigure(SPR.side0, look, { face: "side", flip: true }), renderFigure(SPR.side1, look, { face: "side", flip: true })],
    };
  }

  /* ---------- Spieler-Figur (wählbares Preset, gleicher Detail-Renderer) ---------- */
  const HERO_PRESETS = [
    { skin: "#f8d8b8", hair: "#7a4a24", tunic: "#3f8850", style: 0 },                         // Grün/Braun
    { skin: "#f8d8b8", hair: "#e8c860", tunic: "#c04040", style: 0, acc: "glasses" },          // Rot/Blond + Brille
    { skin: "#e0a878", hair: "#181818", tunic: "#4060b8", style: 0, acc: "cap", cap: "#c04040" }, // Blau + rote Mütze
    { skin: "#f8d8b8", hair: "#b04820", tunic: "#8848a0", style: 1 },                          // Lila/Rot (lange Haare)
    { skin: "#a86838", hair: "#2a1a10", tunic: "#d07828", style: 0, acc: "glasses" },          // Orange/Dunkel + Brille
    { skin: "#f8d8b8", hair: "#c8c8c8", tunic: "#2f8f8f", style: 0, acc: "cap", cap: "#333a4a" }, // Türkis + dunkle Mütze
  ];
  const heroIdx = Math.min(HERO_PRESETS.length - 1, Math.max(0, (CARD.hero | 0)));
  const heroLook = HERO_PRESETS[heroIdx];

  // Sprite-Vorschau für den Figuren-Wähler auf der Ersteller-Seite:
  // PIXELPOST_RUNTIME({}, { spritePreview: true }) → Array aus 16×16-PNG-DataURLs.
  if (O.spritePreview) return HERO_PRESETS.map((look) => renderFigure(SPR.down0, look, { face: "front" }).toDataURL());

  /* ---------- Kacheln (16×16, prozedural) ---------- */
  function makeTile(draw) {
    const cnv = document.createElement("canvas"); cnv.width = 16; cnv.height = 16;
    draw(cnv.getContext("2d")); return cnv;
  }
  const T = {};
  T.floor = makeTile((x) => {
    x.fillStyle = PAL[0]; x.fillRect(0, 0, 16, 16);
    x.fillStyle = PAL[1]; x.fillRect(0, 15, 16, 1); x.fillRect(15, 0, 1, 16);
    x.fillRect(3, 3, 1, 1); x.fillRect(11, 9, 1, 1);
  });
  // Konfetti/Blütenblätter auf dem Boden (Anlass-Farbtupfer)
  T.sprinkle = occ.sprinkle && makeTile((x) => {
    x.drawImage(T.floor, 0, 0);
    const spots = [[3, 5], [9, 3], [6, 10], [12, 12], [2, 12]];
    spots.forEach(([sx, sy], i) => {
      x.fillStyle = occ.sprinkle[i % occ.sprinkle.length];
      x.fillRect(sx, sy, i % 2 ? 2 : 1, 1);
    });
  });
  T.wall = makeTile((x) => {
    x.fillStyle = PAL[2]; x.fillRect(0, 0, 16, 16);
    x.fillStyle = PAL[3];
    for (let y = 3; y < 16; y += 4) x.fillRect(0, y, 16, 1);
    x.fillRect(7, 0, 1, 4); x.fillRect(3, 4, 1, 4); x.fillRect(11, 4, 1, 4);
    x.fillRect(7, 8, 1, 4); x.fillRect(3, 12, 1, 4); x.fillRect(11, 12, 1, 4);
    x.fillRect(0, 0, 16, 1);
  });
  T.window = makeTile((x) => {
    x.drawImage(T.wall, 0, 0);
    x.fillStyle = PAL[3]; x.fillRect(2, 3, 12, 10);
    x.fillStyle = C.sky; x.fillRect(3, 4, 10, 8);          // Himmel!
    x.fillStyle = C.white; x.fillRect(9, 5, 3, 1); x.fillRect(4, 8, 3, 1); // Wölkchen
    x.fillStyle = PAL[1]; x.fillRect(3, 10, 10, 2);        // Fensterbank
    x.fillStyle = PAL[3]; x.fillRect(7, 4, 1, 8); x.fillRect(3, 7, 10, 1);
  });
  function rugBase(x) {
    x.fillStyle = PAL[1]; x.fillRect(0, 0, 16, 16);
    x.fillStyle = PAL[2]; x.fillRect(0, 0, 16, 1); x.fillRect(0, 15, 16, 1); x.fillRect(0, 0, 1, 16); x.fillRect(15, 0, 1, 16);
  }
  T.rug = makeTile((x) => {
    rugBase(x);
    x.fillStyle = PAL[2]; x.fillRect(4, 4, 2, 2); x.fillRect(10, 10, 2, 2); x.fillRect(10, 4, 2, 2); x.fillRect(4, 10, 2, 2);
  });
  T.rugHeart = makeTile((x) => {
    rugBase(x);
    x.fillStyle = C.red;
    x.fillRect(5, 4, 2, 2); x.fillRect(9, 4, 2, 2); x.fillRect(4, 6, 8, 2);
    x.fillRect(5, 8, 6, 1); x.fillRect(6, 9, 4, 1); x.fillRect(7, 10, 2, 1);
  });
  T.plant = makeTile((x) => {
    x.drawImage(T.floor, 0, 0);
    x.fillStyle = C.brown; x.fillRect(5, 10, 6, 5); x.fillRect(4, 14, 8, 1); // Topf
    x.fillStyle = PAL[3]; x.fillRect(5, 10, 6, 1);
    x.fillStyle = C.green; x.fillRect(6, 2, 4, 8); x.fillRect(3, 4, 4, 5); x.fillRect(9, 4, 4, 5); // Blätter
    x.fillStyle = C.leaf; x.fillRect(7, 6, 2, 4); x.fillRect(5, 5, 1, 2); x.fillRect(10, 5, 1, 2);
  });
  function tableBase(x) {
    x.drawImage(T.floor, 0, 0);
    x.fillStyle = PAL[3]; x.fillRect(1, 4, 14, 9);
    x.fillStyle = C.tan; x.fillRect(2, 5, 12, 6);          // Holzplatte
    x.fillStyle = C.brown; x.fillRect(2, 9, 12, 2);
  }
  T.envelope = makeTile((x) => {
    tableBase(x);
    x.fillStyle = C.white; x.fillRect(4, 6, 4, 3);
    x.fillStyle = C.brown; x.fillRect(4, 6, 4, 1);
    x.fillStyle = C.red; x.fillRect(5, 7, 1, 1);           // Siegel
  });
  T.cake = makeTile((x) => {
    tableBase(x);
    x.fillStyle = PAL[3]; x.fillRect(4, 9, 8, 1);          // Teller
    x.fillStyle = C.white; x.fillRect(5, 5, 6, 4);         // Kuchen
    x.fillStyle = C.pink; x.fillRect(5, 7, 6, 1);          // Cremeschicht
    x.fillStyle = C.red; x.fillRect(7, 3, 1, 2);           // Kerze
    x.fillStyle = C.yellow; x.fillRect(7, 2, 1, 1);        // Flamme
  });
  T.trophy = makeTile((x) => {
    tableBase(x);
    x.fillStyle = C.yellow; x.fillRect(5, 4, 6, 3); x.fillRect(4, 4, 1, 2); x.fillRect(11, 4, 1, 2); // Pokal + Henkel
    x.fillStyle = C.white; x.fillRect(5, 4, 2, 1);         // Glanz
    x.fillStyle = C.brown; x.fillRect(7, 7, 2, 1);         // Stiel
    x.fillStyle = PAL[3]; x.fillRect(6, 8, 4, 1); x.fillRect(5, 9, 6, 1); // Sockel
  });
  function balloonTile(color) {
    return makeTile((x) => {
      x.drawImage(T.floor, 0, 0);
      x.fillStyle = color; x.fillRect(6, 2, 4, 1); x.fillRect(5, 3, 6, 5); x.fillRect(6, 8, 4, 1);
      x.fillStyle = C.white; x.fillRect(6, 3, 1, 2);       // Glanzpunkt
      x.fillStyle = PAL[3]; x.fillRect(7, 9, 2, 1);        // Knoten
      x.fillRect(8, 10, 1, 2); x.fillRect(7, 12, 1, 2);    // Schnur
    });
  }
  T.balloonRed = balloonTile(C.red);
  T.balloonYellow = balloonTile(C.yellow);
  T.suitcase = makeTile((x) => {
    x.drawImage(T.floor, 0, 0);
    x.fillStyle = C.brown; x.fillRect(2, 7, 12, 7);
    x.fillStyle = PAL[3];
    x.fillRect(2, 7, 12, 1); x.fillRect(2, 13, 12, 1); x.fillRect(2, 7, 1, 7); x.fillRect(13, 7, 1, 7);
    x.fillRect(6, 5, 4, 1); x.fillRect(6, 6, 1, 1); x.fillRect(9, 6, 1, 1); // Griff
    x.fillRect(4, 8, 1, 5); x.fillRect(11, 8, 1, 5);       // Riemen
    x.fillStyle = C.yellow; x.fillRect(7, 10, 2, 1);       // Schnalle
  });
  T.box = makeTile((x) => {
    x.drawImage(T.floor, 0, 0);
    x.fillStyle = C.tan; x.fillRect(3, 6, 10, 8);
    x.fillStyle = C.brown;
    x.fillRect(3, 6, 10, 1); x.fillRect(3, 13, 10, 1); x.fillRect(3, 6, 1, 8); x.fillRect(12, 6, 1, 8);
    x.fillRect(3, 8, 10, 1);                               // Klappen-Falz
    x.fillRect(7, 6, 2, 8);                                // Klebeband
    x.fillStyle = C.white; x.fillRect(4, 10, 2, 2);        // Etikett
  });
  function flowerTile(color) {
    return makeTile((x) => {
      x.drawImage(T.floor, 0, 0);
      x.fillStyle = C.brown; x.fillRect(5, 11, 6, 3); x.fillRect(4, 14, 8, 1); // Topf
      x.fillStyle = C.green; x.fillRect(7, 8, 1, 3); x.fillRect(4, 9, 1, 2); x.fillRect(11, 9, 1, 2); // Stiele
      x.fillStyle = color; x.fillRect(6, 5, 3, 3); x.fillRect(3, 7, 2, 2); x.fillRect(10, 7, 2, 2); // Blüten
      x.fillStyle = C.yellow; x.fillRect(7, 6, 1, 1);      // Blütenmitte
    });
  }
  T.flowerRed = flowerTile(C.red);
  T.flowerYellow = flowerTile(C.pink);
  T.flag = makeTile((x) => {
    x.drawImage(T.floor, 0, 0);
    x.fillStyle = C.brown; x.fillRect(7, 2, 1, 11); x.fillRect(5, 13, 5, 1); // Stange + Fuß
    x.fillStyle = C.red; x.fillRect(8, 2, 5, 2); x.fillRect(8, 4, 3, 2); x.fillRect(8, 6, 2, 1); // Wimpel
    x.fillStyle = C.yellow; x.fillRect(9, 3, 1, 1);
  });
  T.shelf = makeTile((x) => {
    x.drawImage(T.floor, 0, 0);
    x.fillStyle = PAL[3]; x.fillRect(1, 1, 14, 13);        // Regal-Korpus
    x.fillStyle = C.tan; x.fillRect(2, 2, 12, 11);
    x.fillStyle = PAL[3]; x.fillRect(2, 6, 12, 1); x.fillRect(2, 10, 12, 1); // Regalböden
    const books = [C.red, C.green, C.yellow, C.sky, C.pink];
    for (let i = 0; i < 5; i++) {
      x.fillStyle = books[i]; x.fillRect(3 + i * 2, 3, 2, 3);            // Buchrücken oben
      x.fillStyle = books[(i + 2) % 5]; x.fillRect(3 + i * 2, 7, 2, 3);  // Buchrücken unten
    }
    x.fillStyle = PAL[3]; x.fillRect(1, 14, 3, 1); x.fillRect(12, 14, 3, 1); // Füße
  });
  T.lamp = makeTile((x) => {
    x.drawImage(T.floor, 0, 0);
    x.fillStyle = C.yellow; x.fillRect(5, 2, 6, 4);        // Lampenschirm
    x.fillStyle = C.white; x.fillRect(6, 3, 1, 2);         // Lichtschein
    x.fillStyle = PAL[3]; x.fillRect(5, 2, 6, 1);
    x.fillRect(7, 6, 2, 7); x.fillRect(5, 13, 6, 1);       // Ständer + Fuß
  });
  T.drinks = makeTile((x) => {
    tableBase(x);
    x.fillStyle = C.red; x.fillRect(4, 5, 5, 3);           // Bowle
    x.fillStyle = C.pink; x.fillRect(4, 5, 5, 1);
    x.fillStyle = PAL[3]; x.fillRect(3, 8, 7, 1);          // Schüsselrand
    x.fillStyle = C.white; x.fillRect(11, 6, 2, 2); x.fillRect(11, 8, 2, 1); // Becher
  });
  T.presents = makeTile((x) => {
    x.drawImage(T.floor, 0, 0);
    x.fillStyle = C.red; x.fillRect(2, 8, 6, 6);           // großes Geschenk
    x.fillStyle = C.yellow; x.fillRect(4, 8, 2, 6); x.fillRect(3, 6, 1, 2); x.fillRect(6, 6, 1, 2); // Band + Schleife
    x.fillStyle = C.green; x.fillRect(9, 10, 5, 4);        // kleines Geschenk
    x.fillStyle = C.pink; x.fillRect(11, 10, 1, 4); x.fillRect(10, 9, 3, 1);
  });
  T.clock = makeTile((x) => {
    x.drawImage(T.wall, 0, 0);
    x.fillStyle = PAL[3]; x.fillRect(4, 3, 8, 9);          // Uhrengehäuse
    x.fillStyle = C.white; x.fillRect(5, 4, 6, 7);
    x.fillStyle = PAL[3]; x.fillRect(7, 5, 1, 3); x.fillRect(8, 7, 2, 1); // Zeiger
  });
  T.picture = makeTile((x) => {
    x.drawImage(T.wall, 0, 0);
    x.fillStyle = C.brown; x.fillRect(3, 3, 10, 9);        // Rahmen
    x.fillStyle = C.sky; x.fillRect(4, 4, 8, 3);           // Himmel
    x.fillStyle = C.green; x.fillRect(4, 7, 8, 4);         // Wiese
    x.fillStyle = C.red; x.fillRect(6, 8, 1, 1);
    x.fillStyle = C.yellow; x.fillRect(9, 9, 1, 1);        // Blumen
  });
  function buntingTile(c1, c2) { // Wimpelkette an der Wand (festliche Anlässe)
    return makeTile((x) => {
      x.drawImage(T.wall, 0, 0);
      x.fillStyle = PAL[3]; x.fillRect(0, 2, 16, 1);       // Schnur
      [[2, c1], [10, c2]].forEach(([bx, col]) => {
        x.fillStyle = col;
        x.fillRect(bx, 3, 4, 2); x.fillRect(bx + 1, 5, 2, 1);
      });
    });
  }
  T.buntingA = buntingTile(C.red, C.yellow);
  T.buntingB = buntingTile(C.green, C.pink);

  /* ---------- Sound (Web Audio, prozedurale Retro-Bleeps) ---------- */
  const SND = { ctx: null, muted: false };
  try { SND.muted = localStorage.getItem("pixelpost_muted") === "1"; } catch (e) {}
  function ensureAudio() {
    if (SND.muted) return;
    if (!SND.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) SND.ctx = new AC();
      } catch (e) {}
    }
    if (SND.ctx) startMusic();
  }
  function blip(freq, dur, vol, delay, type) {
    if (SND.muted || !SND.ctx) return;
    try {
      if (SND.ctx.state === "suspended") SND.ctx.resume();
      const t = SND.ctx.currentTime + (delay || 0);
      const o = SND.ctx.createOscillator(), g = SND.ctx.createGain();
      o.type = type || "square"; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.03, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.05));
      o.connect(g); g.connect(SND.ctx.destination);
      o.start(t); o.stop(t + (dur || 0.05) + 0.02);
    } catch (e) {}
  }
  function fanfare() { // kleine Abschluss-Melodie (C-E-G-C)
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => blip(f, 0.14, 0.035, i * 0.11));
  }

  /* ---------- Hintergrund-Musik (sanfte Chiptune-Schleife je Anlass) ---------- */
  const A = 440, C5 = 523.25, D5 = 587.33, E5 = 659.25, F4 = 349.23, G4 = 392, Ab4 = 415.30, B4 = 493.88, G5 = 783.99, A5 = 880;
  const MELODIES = {
    cheerful: [C5, E5, G5, E5, D5, E5, G5, 0, A5, G5, E5, D5, C5, D5, E5, 0],
    soft:     [G4, C5, E5, C5, A, C5, 0, 0, F4, A, C5, A, G4, 0, 0, 0],
    wistful:  [A, C5, E5, 0, D5, C5, A, 0, Ab4, B4, 0, 0, A, G4, 0, 0],
  };
  const MEL_FOR = { geburtstag: "cheerful", jubilaeum: "cheerful", einfach: "cheerful", hochzeit: "soft", abschied: "wistful" };
  const melody = MELODIES[MEL_FOR[CARD.occasion] || "cheerful"];
  function startMusic() {
    if (SND.musicTimer || SND.muted || !SND.ctx) return;
    let i = 0;
    SND.musicTimer = setInterval(() => {
      if (SND.muted || !SND.ctx) { return; }
      const f = melody[i % melody.length]; i++;
      if (f) blip(f, 0.22, 0.02, 0, "triangle");
    }, 268);
  }
  function stopMusic() { if (SND.musicTimer) { clearInterval(SND.musicTimer); SND.musicTimer = null; } }

  /* ---------- DOM + CSS (komplett selbst gebaut, Präfix pp; kein
     globales html/body-Styling, damit die Vorschau die Seite nicht kaputtmacht) ---------- */
  const CSS = "" +
    ".pp{position:fixed;inset:0;z-index:99990;display:grid;place-items:center;background:#0c1422;font-family:Inter,-apple-system,'Segoe UI',sans-serif}" +
    ".pp__screen{image-rendering:pixelated;image-rendering:crisp-edges;border-radius:6px;background:" + PAL[3] + ";box-shadow:0 0 0 8px " + PAL[3] + ",0 0 0 10px #0a0e14,0 30px 80px rgba(0,0,0,.6)}" +
    ".pp__hint{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);font-size:12px;color:rgba(255,255,255,.65);background:rgba(0,0,0,.4);padding:6px 14px;border-radius:999px;white-space:nowrap}.pp__hint b{color:#fff}" +
    ".pp__pad{position:fixed;left:0;right:0;bottom:40px;display:flex;justify-content:space-between;align-items:center;padding:0 28px;pointer-events:none}.pp__pad[hidden]{display:none}" +
    ".pp__dpad{display:grid;grid-template-columns:48px 48px 48px;grid-template-rows:48px 48px;gap:2px;pointer-events:auto}" +
    ".pp__dpad button{font-size:17px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.1);color:#fff;touch-action:none}" +
    ".pp__dpad .pp-up{grid-column:2;grid-row:1}.pp__dpad .pp-left{grid-column:1;grid-row:2}.pp__dpad .pp-right{grid-column:3;grid-row:2}.pp__dpad .pp-down{grid-column:2;grid-row:2}" +
    ".pp__a{width:64px;height:64px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:#a83248;color:#fff;font-weight:700;font-size:19px;pointer-events:auto;touch-action:none}" +
    ".pp__mute,.pp__x,.pp__listbtn{position:fixed;top:14px;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.42);color:#fff;font-size:15px;cursor:pointer;opacity:.85}" +
    ".pp__mute:hover,.pp__x:hover,.pp__listbtn:hover{opacity:1}" +
    ".pp__listbtn{left:14px;font-size:18px}" +
    ".pp__sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}" +
    ".pp__list{position:fixed;inset:0;z-index:99991;overflow:auto;padding:28px 22px;background:rgba(8,12,20,.96);color:#e8f0f8;font-family:Inter,-apple-system,'Segoe UI',sans-serif}.pp__list[hidden]{display:none}" +
    ".pp__list h2{font-size:18px;margin:0 auto 14px;max-width:640px}.pp__list dl{max-width:640px;margin:0 auto}.pp__list dt{font-weight:700;margin-top:14px;color:#a8c0e0}.pp__list dd{margin:2px 0 0;line-height:1.5;white-space:pre-wrap}" +
    ".pp__listclose{display:block;margin:24px auto 0;padding:10px 20px;border-radius:10px;border:1px solid rgba(255,255,255,.25);background:#5878a8;color:#fff;font:inherit;font-weight:600;cursor:pointer}" +
    ".pp__brand{position:fixed;bottom:14px;right:14px;font-size:11px;color:rgba(255,255,255,.45);text-decoration:none}.pp__brand:hover{color:rgba(255,255,255,.8)}";
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const mk = (cls, tag) => { const d = document.createElement(tag || "div"); d.className = cls; return d; };
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const overlay = mk("pp"); document.body.appendChild(overlay);
  const cv = document.createElement("canvas");
  cv.width = 160; cv.height = 144; cv.className = "pp__screen";
  overlay.appendChild(cv);
  const ctx = cv.getContext("2d"); ctx.imageSmoothingEnabled = false;

  const hint = mk("pp__hint");
  hint.innerHTML = L.hint;
  overlay.appendChild(hint);

  const pad = mk("pp__pad"); overlay.appendChild(pad);
  const dpad = mk("pp__dpad"); pad.appendChild(dpad);
  const mkBtn = (cls, txt, parent) => { const b = mk(cls, "button"); b.type = "button"; b.textContent = txt; (parent || dpad).appendChild(b); return b; };
  const bUp = mkBtn("pp-up", "▲"), bLeft = mkBtn("pp-left", "◀"), bRight = mkBtn("pp-right", "▶"), bDown = mkBtn("pp-down", "▼");
  const aBtn = mkBtn("pp__a", "A", pad);

  const muteBtn = mk("pp__mute", "button");
  muteBtn.type = "button";
  muteBtn.style.right = O.onClose ? "62px" : "14px";
  muteBtn.textContent = SND.muted ? "🔇" : "🔊";
  muteBtn.title = "Ton an/aus";
  overlay.appendChild(muteBtn);
  muteBtn.onclick = () => {
    SND.muted = !SND.muted;
    muteBtn.textContent = SND.muted ? "🔇" : "🔊";
    try { localStorage.setItem("pixelpost_muted", SND.muted ? "1" : "0"); } catch (e) {}
    if (SND.muted) stopMusic();
    else { ensureAudio(); blip(880, 0.06, 0.035); }
  };

  let xBtn = null;
  if (O.onClose) {
    xBtn = mk("pp__x", "button");
    xBtn.type = "button"; xBtn.style.right = "14px"; xBtn.textContent = "✕"; xBtn.title = "Schließen";
    overlay.appendChild(xBtn);
  }
  if (CARD.appUrl && !O.onClose) {
    const brand = mk("pp__brand", "a");
    brand.href = CARD.appUrl; brand.target = "_blank"; brand.rel = "noopener";
    brand.textContent = L.brand;
    overlay.appendChild(brand);
  }

  /* ---------- Raum (großzügig, wächst mit der Gruß-Anzahl) ----------
     Die Figuren werden zufällig verstreut (nicht im Raster), deshalb wird der
     Raum großzügig dimensioniert (~50 % Belegung bei Mindestabstand 2), damit
     die Zufallsplatzierung locker Platz findet. Kamera scrollt in beide
     Richtungen. */
  const greet = (CARD.greetings || []).filter((g) => (g.text || "").trim() || (g.name || "").trim());
  const n = greet.length;
  const roomNeed = Math.max(6, n) * 10; // gewünschte begehbare Streufläche (großzügig für Abstand)
  const COLS = Math.max(11, Math.min(22, Math.ceil(Math.sqrt(roomNeed))));
  const ROWS = Math.max(12, Math.min(34, Math.ceil(roomNeed / (COLS - 2)) + 6));
  const midX = Math.floor(COLS / 2);
  const festive = !!occ.festive;

  const solid = new Set();
  const tiles = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    let img = T.floor;
    if (y <= 1) {
      solid.add(x + ",0"); solid.add(x + ",1");
      if (y === 0) img = T.wall;
      else if (x === 2) img = T.clock;                                   // Wanduhr
      else if (x === COLS - 3) img = T.picture;                          // Bild
      else if (festive && x > 2 && x < COLS - 3 && x % 2 === 0) img = (x % 4 === 0 ? T.buntingA : T.buntingB); // Wimpelkette
      else if (x % 3 === 1) img = T.window;                             // Fenster mit Himmel
      else img = T.wall;
    } else if (T.sprinkle && (x * 7 + y * 5) % 11 === 3) img = T.sprinkle; // Konfetti/Blüten
    tiles.push({ x, y, img });
  }
  // Willkommens-Teppich unten, unter dem Spieler-Start (Hochzeit: mit Herz)
  const rugTile = occ.heartRug ? T.rugHeart : T.rug;
  for (let y = ROWS - 3; y <= ROWS - 2; y++) for (let x = midX - 1; x <= midX + 1; x++) tiles.push({ x, y, img: rugTile });

  // Deko (alle solide): Kaminsims-Reihe y=2, Ecken, Seiten, Boden
  const deco = [
    [0, 2, T.plant], [COLS - 1, 2, T.plant], [0, ROWS - 1, T.plant], [COLS - 1, ROWS - 1, T.plant],
    [1, 2, T.shelf], [COLS - 2, 2, T.lamp],
    [midX - 1, 2, T[occ.table]], [midX, 2, T.envelope],
    [0, Math.floor(ROWS / 2), T.lamp], [COLS - 1, Math.floor(ROWS / 2), T.plant],
    [1, ROWS - 2, T[occ.extra]], [COLS - 2, ROWS - 2, T.presents],
  ];
  if (occ.side) { deco.push([3, 2, T[occ.side[0]]]); deco.push([COLS - 4, 2, T[occ.side[1]]]); }
  deco.forEach(([x, y, img]) => {
    if (!img) return;
    tiles.push({ x, y, img }); solid.add(x + "," + y);
  });

  /* ---------- NPCs: zufällig verstreut, aber garantiert erreichbar ----------
     Deterministisch pro Karte (Seed aus den Grüßen) → gleiche Karte = gleiche
     Anordnung (und identisch in Live-Ansicht + Download). Mindestabstand 2 (auch
     diagonal) verhindert, dass Figuren einen Weg versperren; zusätzlich prüft
     ein BFS die Erreichbarkeit. Klappt das nach vielen Versuchen nicht, greift
     ein geordnetes Gitter (immer erreichbar, immer genug Plätze). */
  const startX = midX, startY = ROWS - 2;
  const STEPS = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  let seed = (Math.imul(n + 1, 2654435761)) >>> 0;
  for (let i = 0; i < greet.length; i++) {
    const s = (greet[i].name || "") + "|" + (greet[i].text || "");
    for (let k = 0; k < s.length; k++) seed = (Math.imul(seed, 31) + s.charCodeAt(k)) >>> 0;
    seed = (seed + Math.imul(i + 1, 2654435761)) >>> 0;
  }
  function reachOK(placed) {
    const block = new Set(solid); for (const p of placed) block.add(p[0] + "," + p[1]);
    const walk = (x, y) => x >= 0 && x < COLS && y >= 2 && y < ROWS && !block.has(x + "," + y);
    if (!walk(startX, startY)) return false;
    const seen = new Set([startX + "," + startY]); const q = [[startX, startY]];
    while (q.length) { const c = q.pop(); for (const [dx, dy] of STEPS) { const nx = c[0] + dx, ny = c[1] + dy, kk = nx + "," + ny; if (!seen.has(kk) && walk(nx, ny)) { seen.add(kk); q.push([nx, ny]); } } }
    return placed.every((p) => STEPS.some(([dx, dy]) => seen.has((p[0] + dx) + "," + (p[1] + dy))));
  }
  function placeNpcs() {
    if (n === 0) return [];
    const interior = [];
    for (let y = 3; y <= ROWS - 4; y++) for (let x = 1; x <= COLS - 2; x++)
      if (!solid.has(x + "," + y) && !(x === startX && y === startY)) interior.push([x, y]);
    const rng = mulberry32(seed);
    for (let attempt = 0; attempt < 60; attempt++) {
      const placed = []; const used = new Set(); let ok = true;
      for (let i = 0; i < n; i++) {
        let found = null;
        for (let t = 0; t < 300 && !found; t++) {
          const cand = interior[(rng() * interior.length) | 0];
          if (used.has(cand[0] + "," + cand[1])) continue;
          // Mindestabstand Manhattan 3 → nie zwei Figuren am selben Nachbarfeld (kein Flankieren)
          let clash = false;
          for (const p of placed) if (Math.abs(p[0] - cand[0]) + Math.abs(p[1] - cand[1]) < 3) { clash = true; break; }
          if (!clash) found = cand;
        }
        if (!found) { ok = false; break; }
        placed.push(found); used.add(found[0] + "," + found[1]);
      }
      if (ok && reachOK(placed)) return placed;
    }
    // Fallback: geordnetes Gitter, danach beliebige freie Felder auffüllen
    const g = [], used = new Set();
    const tryPush = (x, y) => { const k = x + "," + y; if (!used.has(k) && !solid.has(k) && !(x === startX && y === startY)) { used.add(k); g.push([x, y]); } };
    for (let y = 3; g.length < n && y <= ROWS - 4; y += 2) for (let x = 2; g.length < n && x <= COLS - 3; x += 2) tryPush(x, y);
    for (let y = 3; g.length < n && y <= ROWS - 4; y++) for (let x = 1; g.length < n && x <= COLS - 2; x++) tryPush(x, y);
    return g;
  }
  const spots = placeNpcs();
  const npcs = greet.slice(0, spots.length).map((g, i) => ({
    g, x: spots[i][0], y: spots[i][1], dir: "down", read: false, hopUntil: 0,
    emoji: (g.emoji || "").trim().slice(0, 8),
    spr: figureSet(lookOf(g.name, i)),
  }));
  npcs.forEach((nn) => solid.add(nn.x + "," + nn.y));

  /* ---------- Spieler (detaillierte Figur, wählbares Preset) ---------- */
  const sprites = figureSet(heroLook);
  const P = { x: midX, y: ROWS - 2, px: 0, py: 0, dir: "up", step: 0, moving: false, mx: 0, my: 0, prog: 0 };
  P.px = P.x * 16; P.py = P.y * 16;

  /* ---------- Barrierefreiheit: alle Grüße als Text ----------
     Immer als sr-only-Liste im DOM (Screenreader) + auf Knopfdruck als
     sichtbares Panel (wer nicht spielen kann/will). */
  const introText = (CARD.title || "").trim() || L.intro[CARD.occasion] || L.intro.einfach;
  const listInner = "<h2>" + esc(introText) + "</h2><dl>"
    + greet.map((g) => "<dt>" + esc((g.name || "").trim() || L.noName) + "</dt><dd>" + esc(g.text || "") + "</dd>").join("")
    + "</dl>";
  const srList = mk("pp__sr"); srList.setAttribute("aria-label", L.listTitle); srList.innerHTML = listInner;
  overlay.appendChild(srList);
  const listBtn = mk("pp__listbtn", "button"); listBtn.type = "button"; listBtn.textContent = "≡";
  listBtn.title = L.listTitle; listBtn.setAttribute("aria-label", L.listTitle);
  overlay.appendChild(listBtn);
  const listPanel = mk("pp__list"); listPanel.setAttribute("role", "dialog"); listPanel.hidden = true;
  listPanel.innerHTML = listInner + "<button type='button' class='pp__listclose'>" + esc(L.close) + "</button>";
  overlay.appendChild(listPanel);
  listBtn.onclick = () => { listPanel.hidden = false; };
  listPanel.addEventListener("click", (e) => { if (e.target === listPanel || e.target.classList.contains("pp__listclose")) listPanel.hidden = true; });

  /* ---------- Dialog ---------- */
  const D = { open: false, pages: [], page: 0, shown: 0, speaker: null };
  function wrap(text, width) {
    const words = String(text).split(/\s+/); const lines = []; let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (t.length > (width || 17) && line) { lines.push(line); line = w; } else line = t;
    }
    if (line) lines.push(line);
    return lines;
  }
  function openDialog(text, speaker) {
    // Mit Porträt (Absender) ist links weniger Platz → schmaler umbrechen
    const lines = wrap(text, speaker ? 15 : 17);
    D.pages = []; for (let i = 0; i < lines.length; i += 2) D.pages.push(lines.slice(i, i + 2));
    D.page = 0; D.shown = 0; D.open = true; D.speaker = speaker || null;
  }

  /* ---------- Mit einer Figur sprechen (manuell oder automatisch) ---------- */
  const OPP = { up: "down", down: "up", left: "right", right: "left" };
  const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  let autoArmed = true; // Auto-Gruß erlaubt? Nach jedem Schritt neu scharf, nach Auto-Popup aus
  let celebrated = false;

  /* ---------- Konfetti (Abschluss-Feier) ---------- */
  const CONFETTI_COLORS = [C.red, C.yellow, C.green, C.pink, C.sky, heroLook.tunic];
  const confetti = [];
  function spawnConfetti() {
    for (let i = 0; i < 60; i++) confetti.push({
      x: Math.random() * 160, y: -Math.random() * 60 - 4,
      vy: 0.5 + Math.random() * 1.1, vx: (Math.random() - 0.5) * 0.6,
      c: CONFETTI_COLORS[i % CONFETTI_COLORS.length], s: Math.random() < 0.5 ? 2 : 3,
    });
  }
  function talkTo(n, dir) {
    P.dir = dir;
    n.dir = OPP[dir];
    n.read = true;
    n.hopUntil = frame + 16;   // kleiner Freude-Hüpfer
    const name = (n.g.name || "").trim();
    openDialog((name ? name.toUpperCase() + ": " : "") + (n.g.text || "…"), n);
    blip(880, 0.06, 0.035);
  }
  /* Auto-Gruß: poppt nur bei STILLSTAND neben einer NOCH UNGELESENEN Figur auf
     (Vorbeilaufen unterbricht nicht), oder wenn man in eine ungelesene Figur
     hineinläuft. Gelesene ziehen NICHT mehr rein. Höchstens einmal pro Halt
     (autoArmed) → man kommt jederzeit durch Weggehen los. */
  const findAdj = (dir) => npcs.find((nn) => !nn.read && nn.x === P.x + DELTA[dir][0] && nn.y === P.y + DELTA[dir][1]);
  function tryAutoGreet() {
    if (!autoArmed || P.moving || D.open) return;
    const held = dirFromKeys();
    if (held) { // in eine ungelesene Figur hineinlaufen → ansprechen; sonst nichts (kein Vorbeilauf-Popup)
      const n = findAdj(held);
      if (n) { talkTo(n, held); autoArmed = false; }
      return;
    }
    const order = [P.dir].concat(["up", "down", "left", "right"].filter((d) => d !== P.dir));
    for (const dir of order) { const n = findAdj(dir); if (n) { talkTo(n, dir); autoArmed = false; return; } }
  }
  function aPress() {
    ensureAudio();
    if (!D.open) {
      const n = npcs.find((n) => n.x === P.x + DELTA[P.dir][0] && n.y === P.y + DELTA[P.dir][1]);
      if (n) talkTo(n, P.dir);
      return;
    }
    const total = D.pages[D.page].join(" ").length + D.pages[D.page].length;
    if (D.shown < total) { D.shown = total; return; }
    if (D.page < D.pages.length - 1) { D.page++; D.shown = 0; blip(700, 0.05, 0.03); }
    else {
      D.open = false; blip(520, 0.05, 0.03);
      // Alle Grüße gelesen? → einmalige Gratulation + Fanfare
      if (!celebrated && npcs.length && npcs.every((n) => n.read)) {
        celebrated = true;
        openDialog(L.allRead);
        fanfare();
        spawnConfetti();
      }
    }
  }

  /* ---------- Eingabe ---------- */
  const keys = {};
  function dirFromKeys() {
    if (keys["arrowup"] || keys["w"]) return "up";
    if (keys["arrowdown"] || keys["s"]) return "down";
    if (keys["arrowleft"] || keys["a"]) return "left";
    if (keys["arrowright"] || keys["d"]) return "right";
    return null;
  }
  function onKeyDown(e) {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    keys[k] = true;
    ensureAudio();
    if (k === "e" || k === " " || k === "enter") aPress();
    if (k === "escape" && O.onClose) close();
  }
  function onKeyUp(e) { keys[e.key.toLowerCase()] = false; }
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  // Musik pausieren, solange der Tab im Hintergrund ist
  function onVisibility() { if (document.hidden) stopMusic(); else if (!SND.muted && SND.ctx) startMusic(); }
  document.addEventListener("visibilitychange", onVisibility);

  // Touch: D-Pad + A-Knopf (setzen dieselben Key-Flags)
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  pad.hidden = !isTouch;
  if (isTouch) hint.hidden = true;
  const bindBtn = (b, key) => {
    const on = (e) => { e.preventDefault(); ensureAudio(); if (key === "e") aPress(); else keys[key] = true; };
    const off = (e) => { e.preventDefault(); keys[key] = false; };
    b.addEventListener("touchstart", on, { passive: false });
    b.addEventListener("touchend", off); b.addEventListener("touchcancel", off);
  };
  bindBtn(bUp, "arrowup"); bindBtn(bDown, "arrowdown");
  bindBtn(bLeft, "arrowleft"); bindBtn(bRight, "arrowright"); bindBtn(aBtn, "e");

  /* ---------- Skalierung (ganzzahlig, echtes Pixel-Raster) ---------- */
  function fit() {
    const s = Math.max(1, Math.floor(Math.min(window.innerWidth / 160, (window.innerHeight - (isTouch ? 150 : 0)) / 144)));
    cv.style.width = 160 * s + "px"; cv.style.height = 144 * s + "px";
  }
  fit();
  window.addEventListener("resize", fit);

  /* ---------- Loop ---------- */
  const walkable = (x, y) => x >= 0 && x < COLS && y >= 2 && y < ROWS && !solid.has(x + "," + y);
  let raf = 0, frame = 0, closed = false;
  function loop() {
    if (closed) return;
    frame++;
    if (!D.open) {
      if (!P.moving) {
        const d = dirFromKeys();
        if (d) {
          P.dir = d;
          const nx = P.x + (d === "left" ? -1 : d === "right" ? 1 : 0);
          const ny = P.y + (d === "up" ? -1 : d === "down" ? 1 : 0);
          if (walkable(nx, ny)) { P.moving = true; P.mx = nx; P.my = ny; P.prog = 0; }
        }
      }
      if (P.moving) {
        P.prog += 1 / 16; // ~16 Frames pro Kachel (noch gemütlicheres Schritttempo)
        if (P.prog >= 1) { P.x = P.mx; P.y = P.my; P.moving = false; P.prog = 0; autoArmed = true; } // Schritt fertig → wieder scharf
        const fx = P.moving ? P.x + (P.mx - P.x) * P.prog : P.x;
        const fy = P.moving ? P.y + (P.my - P.y) * P.prog : P.y;
        P.px = Math.round(fx * 16); P.py = Math.round(fy * 16);
        if (frame % 10 === 0) P.step = 1 - P.step;
      } else { P.px = P.x * 16; P.py = P.y * 16; P.step = 0; }
      tryAutoGreet(); // nur im Stillstand / beim Hineinlaufen, nur ungelesene

      // Figuren schauen sich ab und zu um (deterministisch pseudozufällig)
      if (npcs.length && frame % 160 === 0) {
        const n = npcs[(Math.floor(frame / 160) * 7) % npcs.length];
        if (Math.abs(n.x - P.x) + Math.abs(n.y - P.y) > 1)
          n.dir = ["down", "left", "right", "up"][(Math.floor(frame / 160) * 13) % 4];
      }
    }

    // Kamera folgt dem Spieler horizontal + vertikal, an den Rändern geklemmt
    const camX = Math.max(0, Math.min(P.px - 72, COLS * 16 - 160));
    const camY = Math.max(0, Math.min(P.py - 64, ROWS * 16 - 144));

    ctx.fillStyle = PAL[3]; ctx.fillRect(0, 0, 160, 144);
    // Kacheln (nur sichtbare zeichnen — Performance bei großen Räumen)
    for (const t of tiles) {
      const sx = t.x * 16 - camX, sy = t.y * 16 - camY;
      if (sx > -16 && sx < 160 && sy > -16 && sy < 144) ctx.drawImage(t.img, sx, sy);
    }
    for (const np of npcs) {
      const sx = np.x * 16 - camX, sy = np.y * 16 - camY;
      if (sx < -16 || sx > 160 || sy < -20 || sy > 150) continue; // Culling
      const hop = np.hopUntil > frame ? Math.round(Math.sin((np.hopUntil - frame) / 16 * Math.PI) * 3) : 0;
      ctx.drawImage(np.spr[np.dir][0], sx, sy - 2 - hop);
      if (np.emoji) { // Emoji schwebt über dem Kopf (wippt sanft)
        const bob = Math.round(Math.sin(frame / 20 + np.x) * 1.5);
        ctx.font = "10px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
        ctx.fillText(np.emoji, sx + 8, sy - 5 + bob - hop);
        ctx.textAlign = "left";
      } else if (!np.read && !D.open && frame % 40 < 28) { // sonst "!" wenn ungelesen
        ctx.fillStyle = C.red;
        ctx.fillRect(sx + 7, sy - 8 - hop, 2, 4); ctx.fillRect(sx + 7, sy - 3 - hop, 2, 2);
      }
    }
    ctx.drawImage(sprites[P.dir][P.moving ? P.step : 0], P.px - camX, P.py - camY - 2);

    // Kompass-Pfeil zur nächsten ungelesenen Figur (nur wenn sie außerhalb des Bildes liegt)
    if (!D.open && npcs.length > 6 && frame % 40 < 30) {
      let best = null, bd = 1e9;
      for (const np of npcs) if (!np.read) { const d = Math.abs(np.x - P.x) + Math.abs(np.y - P.y); if (d < bd) { bd = d; best = np; } }
      if (best) {
        const tx = best.x * 16 - camX + 8, ty = best.y * 16 - camY + 8;
        if (tx < 8 || tx > 152 || ty < 20 || ty > 136) {
          const ang = Math.atan2(ty - 72, tx - 80);
          const tX = Math.min(Math.abs(66 / Math.cos(ang)) || 1e9, Math.abs(50 / Math.sin(ang)) || 1e9);
          const px = 80 + Math.cos(ang) * tX, py = 72 + Math.sin(ang) * tX;
          ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
          ctx.fillStyle = C.red;
          ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(-4, -4); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
      }
    }

    // Gelesen-Zähler (kleines Papier-Schild oben rechts)
    if (npcs.length) {
      const label = npcs.filter((n) => n.read).length + "/" + npcs.length;
      const w = label.length * 8 + 6;
      ctx.fillStyle = PAPER; ctx.fillRect(158 - w, 2, w, 13);
      ctx.fillStyle = INK; ctx.fillRect(158 - w, 2, w, 1); ctx.fillRect(158 - w, 14, w, 1);
      ctx.fillRect(158 - w, 2, 1, 13); ctx.fillRect(157, 2, 1, 13);
      ctx.font = "8px 'Press Start 2P', monospace"; ctx.textBaseline = "top"; ctx.textAlign = "left";
      ctx.fillText(label, 161 - w, 5);
    }

    // Dialogbox (weiß, doppelter Rahmen, Schreibmaschine, optional mit Absender-Porträt)
    if (D.open) {
      ctx.fillStyle = PAPER; ctx.fillRect(2, 102, 156, 40);
      ctx.fillStyle = INK;
      ctx.fillRect(2, 102, 156, 2); ctx.fillRect(2, 140, 156, 2); ctx.fillRect(2, 102, 2, 40); ctx.fillRect(156, 102, 2, 40);
      ctx.fillStyle = PAPER; ctx.fillRect(5, 105, 150, 34);
      ctx.fillStyle = INK; ctx.fillRect(5, 105, 150, 1); ctx.fillRect(5, 138, 150, 1); ctx.fillRect(5, 105, 1, 34); ctx.fillRect(154, 105, 1, 34);
      let textX = 10;
      if (D.speaker) { // Porträt der sprechenden Figur links im Kasten
        ctx.fillStyle = INK; ctx.fillRect(7, 108, 18, 18);
        ctx.fillStyle = PAPER; ctx.fillRect(8, 109, 16, 16);
        ctx.drawImage(D.speaker.spr.down[0], 8, 109);
        ctx.fillStyle = INK; ctx.fillRect(26, 108, 1, 18); // Trennlinie
        textX = 30;
      }
      const lines = D.pages[D.page] || [];
      const total = lines.join(" ").length + lines.length;
      if (D.shown < total) {
        D.shown++;
        if (D.shown % 2 === 0) blip(D.shown % 4 === 0 ? 620 : 760, 0.03, 0.02); // Schreibmaschinen-Bleep
      }
      let budget = D.shown;
      ctx.font = "8px 'Press Start 2P', monospace"; ctx.textBaseline = "top"; ctx.textAlign = "left"; ctx.fillStyle = INK;
      lines.forEach((ln, i) => {
        const part = ln.slice(0, Math.max(0, budget)); budget -= ln.length + 1;
        ctx.fillText(part, textX, 111 + i * 13);
      });
      if (D.shown >= total && frame % 30 < 18) { // ▼ blinkt
        ctx.fillStyle = INK;
        ctx.fillRect(146, 132, 6, 2); ctx.fillRect(147, 134, 4, 1); ctx.fillRect(148, 135, 2, 1);
      }
    } else if (npcs.length === 0) {
      ctx.fillStyle = PAPER; ctx.fillRect(2, 110, 156, 26);
      ctx.font = "8px 'Press Start 2P', monospace"; ctx.textBaseline = "top"; ctx.textAlign = "left"; ctx.fillStyle = INK;
      ctx.fillText(L.empty1, 10, 114); ctx.fillText(L.empty2, 10, 124);
    }

    // Konfetti (Abschluss-Feier) — über allem
    for (let i = confetti.length - 1; i >= 0; i--) {
      const pp = confetti[i]; pp.y += pp.vy; pp.x += pp.vx;
      if (pp.y > 148) { confetti.splice(i, 1); continue; }
      ctx.fillStyle = pp.c; ctx.fillRect(Math.round(pp.x), Math.round(pp.y), pp.s, pp.s);
    }

    raf = requestAnimationFrame(loop);
  }

  /* ---------- Schließen (Vorschau-Modus) ---------- */
  function close() {
    if (closed) return; closed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("resize", fit);
    document.removeEventListener("visibilitychange", onVisibility);
    overlay.remove(); style.remove();
    stopMusic();
    if (SND.ctx) { try { SND.ctx.close(); } catch (e) {} SND.ctx = null; }
    if (O.onClose) O.onClose();
  }
  if (xBtn) xBtn.onclick = close;

  /* ---------- Start ---------- */
  const boot = () => {
    if (closed) return;
    openDialog(introText + L.suffix);
    if (window.__PP_DEBUG) {
      // Sind alle Figuren vom Spieler-Start aus erreichbar? (BFS über begehbare Felder)
      const allReachable = () => {
        const seen = new Set([P.x + "," + P.y]);
        const q = [[P.x, P.y]];
        const steps = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        while (q.length) {
          const [x, y] = q.shift();
          for (const [dx, dy] of steps) {
            const nx = x + dx, ny = y + dy, k = nx + "," + ny;
            if (!seen.has(k) && walkable(nx, ny)) { seen.add(k); q.push([nx, ny]); }
          }
        }
        return npcs.every((nn) => steps.some(([dx, dy]) => seen.has((nn.x + dx) + "," + (nn.y + dy))));
      };
      window.__ppCard = { P, npcs, D, aPress, close, allReachable, sprites, confetti, heroIdx, walkableAt: (x, y) => walkable(x, y), state: () => ({ x: P.x, y: P.y, dir: P.dir, dialog: D.open, npcs: npcs.length, cols: COLS, rows: ROWS, read: npcs.filter((n) => n.read).length, speaker: !!D.speaker, confetti: confetti.length, listOpen: !listPanel.hidden }) };
    }
    raf = requestAnimationFrame(loop);
  };
  (document.fonts ? document.fonts.load("8px 'Press Start 2P'").catch(() => {}).then(boot) : Promise.resolve().then(boot));

  return { close };
}

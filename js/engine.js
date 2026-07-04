/* ===================================================================
   PixelPost Engine — begehbare Grußkarte im Game-Boy-Color-Stil.
   Eine einzige plain function, die ihr eigenes DOM + CSS baut:
   - läuft live auf der Ersteller-Seite (Vorschau + Link-Ansicht)
   - wird per PIXELPOST_RUNTIME.toString() in die Download-HTML
     eingebettet (kein Modul, keine Doppelpflege!)
   Alles eigene Pixel-Art (prozedural gezeichnet), keine fremden Assets.
   Raum/Wände bleiben in der Editions-Palette getönt, Deko und Figuren
   sind bunt (Game-Boy-Color-Gefühl).

   PIXELPOST_RUNTIME(CARD, opts?)
     CARD = { title, occasion, edition, greetings:[{name,text}], appUrl }
     opts = { onClose } → Vorschau-Modus mit ✕-Knopf + Esc
   =================================================================== */
function PIXELPOST_RUNTIME(CARD, opts) {
  "use strict";
  const O = opts || {};

  /* ---------- Editionen (4-Farben-Grundpaletten, hell → dunkel) ---------- */
  const EDITIONS = {
    blau: ["#e8f0f8", "#a8c0e0", "#5878a8", "#182840"],
    rot:  ["#f8ece4", "#e8b4a0", "#c05038", "#3c1410"],
    gold: ["#f8f4e0", "#e0c878", "#a08028", "#342808"],
  };
  const PAL = EDITIONS[CARD.edition] || EDITIONS.blau;
  const INK = PAL[3], PAPER = "#f8f8f8";

  /* ---------- Bunte Akzentfarben (editionsunabhängig, GBC-Gefühl) ---------- */
  const C = {
    red: "#c04040", green: "#3f8850", leaf: "#2f6636", yellow: "#e8c850",
    brown: "#8a5a2c", tan: "#c89858", pink: "#e87898", white: "#f8f8f8",
    sky: "#98d0e8", eye: "#202020",
  };

  /* ---------- Anlässe (Deko + Standard-Begrüßung) ---------- */
  const OCC = {
    einfach:    { intro: "Eine Karte für dich!",          table: "envelope", side: null, sprinkle: null },
    geburtstag: { intro: "Alles Gute zum Geburtstag!",    table: "cake",     side: ["balloonRed", "balloonYellow"], sprinkle: [C.red, C.yellow, C.green] },
    abschied:   { intro: "Mach's gut - auf Wiedersehen!", table: "envelope", side: ["suitcase", "box"], sprinkle: null },
    hochzeit:   { intro: "Alles Gute zur Hochzeit!",      table: "envelope", side: ["flowerRed", "flowerYellow"], heartRug: true, sprinkle: [C.pink, C.white] },
    jubilaeum:  { intro: "Glückwunsch zum Jubiläum!",     table: "trophy",   side: ["flag", "flag"], sprinkle: [C.yellow, C.red] },
  };
  const occ = OCC[CARD.occasion] || OCC.einfach;

  /* ---------- Pixel-Sprites ----------
     '.'=durchsichtig · 0=Haut · e=Augen · 2=Tunika · 3=Haare (Kopfbereich,
     Reihen 1–7) bzw. Umriss/Stiefel (ab Reihe 8) · h=Haar-Extrapixel (lange
     Frisur) · c=Kappe */
  const SPR = {
    down0: ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3300000033...", "...300e00e003...", "...3000000003...", "....30000003....", "...3222222223...", "..322222222223..", "..302222222203..", "...3222222223...", "....32222223....", "....33....33....", "....33....33....", "................"],
    down1: ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3300000033...", "...300e00e003...", "...3000000003...", "....30000003....", "...3222222223...", "..322222222223..", "..302222222203..", "...3222222223...", "....32222223....", "....33..33......", "........33......", "................"],
    up0:   ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3333333333...", "...3333333333...", "...3333333333...", "....33333333....", "...3222222223...", "..322222222223..", "..302222222203..", "...3222222223...", "....32222223....", "....33....33....", "....33....33....", "................"],
    up1:   ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3333333333...", "...3333333333...", "...3333333333...", "....33333333....", "...3222222223...", "..322222222223..", "..302222222203..", "...3222222223...", "....32222223....", "......33..33....", "......33........", "................"],
    side0: ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3333000033...", "...33300e0033...", "...3330000033...", "....33000033....", "...3222222233...", "...32222222230..", "...3222222223...", "...3222222223...", "....32222223....", "....33...33.....", "....33...33.....", "................"],
    side1: ["................", ".....333333.....", "....33333333....", "...3333333333...", "...3333000033...", "...33300e0033...", "...3330000033...", "....33000033....", "...3222222233...", "...32222222230..", "...3222222223...", "...3222222223...", "....32222223....", ".....33.33......", "....33...33.....", "................"],
  };

  /* ---------- Individuelle Figuren ----------
     Aussehen wird stabil aus Name + Position abgeleitet: gleiche Person
     sieht immer gleich aus, aber alle unterscheiden sich deutlich. */
  const HAIRS  = ["#402818", "#e8c860", "#b04820", "#181818", "#c8c8c8"]; // braun, blond, rot, schwarz, grau
  const TUNICS = ["#c04040", "#3f8850", "#4060b8", "#8848a0", "#d07828", "#2f8f8f"];
  const SKINS  = ["#f8d8b8", "#e0a878", "#a86838"];
  function lookOf(name, i) {
    let h = 0;
    const s = String(name || "");
    for (let k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) >>> 0;
    const base = h + i * 7;
    return {
      tunic: TUNICS[base % 6],
      hair: HAIRS[Math.floor(base / 6) % 5],
      skin: SKINS[Math.floor(base / 30) % 3],
      style: Math.floor(base / 90) % 3, // 0 normal · 1 lange Haare · 2 Kappe
    };
  }
  const setPx = (rows, y, x, ch) => {
    if (rows[y][x] === ".") rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1);
  };
  function applyStyle(base, style) {
    const rows = base.slice();
    if (style === 1) { // lange Haare: Strähnen über den Schultern/Rücken
      setPx(rows, 8, 2, "h"); setPx(rows, 8, 13, "h");
      setPx(rows, 9, 2, "h"); setPx(rows, 9, 13, "h");
    }
    if (style === 2) { // Kappe: oben Kappenfarbe, Reihe 3 bleibt dunkler Schirm
      for (let y = 1; y <= 2; y++) rows[y] = rows[y].replace(/3/g, "c");
    }
    return rows;
  }
  function renderFigure(base, look, flip) {
    const cnv = document.createElement("canvas"); cnv.width = 16; cnv.height = 16;
    const x = cnv.getContext("2d");
    applyStyle(base, look.style).forEach((row, ry) => {
      for (let rx = 0; rx < 16; rx++) {
        const ch = row[rx];
        if (ch === "." || ch == null) continue;
        x.fillStyle =
          ch === "0" ? look.skin :
          ch === "e" ? C.eye :
          ch === "2" ? look.tunic :
          ch === "h" ? look.hair :
          ch === "c" ? look.tunic :
          ry <= 7 ? look.hair : PAL[3]; // '3' im Kopf = Haar, sonst Umriss/Stiefel
        x.fillRect(flip ? 15 - rx : rx, ry, 1, 1);
      }
    });
    return cnv;
  }
  function figureSet(look) {
    return {
      down: [renderFigure(SPR.down0, look), renderFigure(SPR.down1, look)],
      up: [renderFigure(SPR.up0, look), renderFigure(SPR.up1, look)],
      right: [renderFigure(SPR.side0, look), renderFigure(SPR.side1, look)],
      left: [renderFigure(SPR.side0, look, true), renderFigure(SPR.side1, look, true)],
    };
  }

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

  /* ---------- Sound (Web Audio, prozedurale Retro-Bleeps) ---------- */
  const SND = { ctx: null, muted: false };
  try { SND.muted = localStorage.getItem("pixelpost_muted") === "1"; } catch (e) {}
  function ensureAudio() {
    if (SND.ctx || SND.muted) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) SND.ctx = new AC();
    } catch (e) {}
  }
  function blip(freq, dur, vol, delay) {
    if (SND.muted || !SND.ctx) return;
    try {
      if (SND.ctx.state === "suspended") SND.ctx.resume();
      const t = SND.ctx.currentTime + (delay || 0);
      const o = SND.ctx.createOscillator(), g = SND.ctx.createGain();
      o.type = "square"; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.03, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.05));
      o.connect(g); g.connect(SND.ctx.destination);
      o.start(t); o.stop(t + (dur || 0.05) + 0.02);
    } catch (e) {}
  }
  function fanfare() { // kleine Abschluss-Melodie (C-E-G-C)
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => blip(f, 0.14, 0.035, i * 0.11));
  }

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
    ".pp__mute,.pp__x{position:fixed;top:14px;width:38px;height:38px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.42);color:#fff;font-size:15px;cursor:pointer;opacity:.85}" +
    ".pp__mute:hover,.pp__x:hover{opacity:1}" +
    ".pp__brand{position:fixed;bottom:14px;right:14px;font-size:11px;color:rgba(255,255,255,.45);text-decoration:none}.pp__brand:hover{color:rgba(255,255,255,.8)}";
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const mk = (cls, tag) => { const d = document.createElement(tag || "div"); d.className = cls; return d; };
  const overlay = mk("pp"); document.body.appendChild(overlay);
  const cv = document.createElement("canvas");
  cv.width = 160; cv.height = 144; cv.className = "pp__screen";
  overlay.appendChild(cv);
  const ctx = cv.getContext("2d"); ctx.imageSmoothingEnabled = false;

  const hint = mk("pp__hint");
  hint.innerHTML = "Pfeile/WASD gehen · <b>E</b> sprechen";
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
    if (!SND.muted) { ensureAudio(); blip(880, 0.06, 0.035); }
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
    brand.textContent = "✉ erstellt mit PixelPost";
    overlay.appendChild(brand);
  }

  /* ---------- Raum ---------- */
  const greet = (CARD.greetings || []).filter((g) => (g.text || "").trim() || (g.name || "").trim());
  const COLS = 10;
  const ROWS = Math.max(9, 7 + Math.ceil(greet.length / 3) * 2); // wächst mit Grüßen
  const solid = new Set();
  const tiles = [];
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    let img = T.floor;
    if (y === 0 || y === 1) { img = (y === 0 || x % 3 !== 1) ? T.wall : T.window; solid.add(x + ",0"); solid.add(x + ",1"); }
    else if (T.sprinkle && (x * 7 + y * 5) % 11 === 3) img = T.sprinkle; // Konfetti/Blüten
    tiles.push({ x, y, img });
  }
  // Teppich in der Mitte (Hochzeit: mit Herz)
  const rugTile = occ.heartRug ? T.rugHeart : T.rug;
  for (let y = 3; y <= 4; y++) for (let x = 3; x <= 6; x++) tiles.push({ x, y, img: rugTile });
  // Deko: Pflanzen in den Ecken, Tisch oben (linke Tischkachel trägt die Anlass-Deko)
  const deco = [
    [0, 2, T.plant], [COLS - 1, 2, T.plant], [0, ROWS - 1, T.plant], [COLS - 1, ROWS - 1, T.plant],
    [4, 2, T[occ.table]], [5, 2, T.envelope],
  ];
  // Anlass-Deko links/rechts neben dem Tisch — auf Spalte 1/8, damit sie
  // nicht direkt über den Köpfen der ersten Männchen-Reihe (Spalte 2/7) hängt
  if (occ.side) { deco.push([1, 2, T[occ.side[0]]]); deco.push([8, 2, T[occ.side[1]]]); }
  deco.forEach(([x, y, img]) => { tiles.push({ x, y, img }); solid.add(x + "," + y); });

  /* ---------- NPCs (ein Männchen pro Gruß, Aussehen aus dem Namen) ----------
     ⚠️ Schleife läuft über spots.length < greet.length — bei 0 Grüßen darf sie
     gar nicht erst starten (Math.max(n,1) wäre eine Endlosschleife, war Live-Bug). */
  const spots = [];
  for (let row = 3; spots.length < greet.length; row += 2)
    for (const gx of [2, 7, 4]) { if (spots.length < greet.length) spots.push([gx, row + (gx === 4 ? 1 : 0)]); }
  const npcs = greet.map((g, i) => ({
    g, x: spots[i][0], y: spots[i][1], dir: "down", read: false,
    spr: figureSet(lookOf(g.name, i)),
  }));
  npcs.forEach((n) => solid.add(n.x + "," + n.y));

  /* ---------- Spieler (klassischer Look in Editionsfarben) ---------- */
  const sprites = figureSet({ skin: SKINS[0], hair: PAL[3], tunic: PAL[2], style: 0 });
  const P = { x: Math.floor(COLS / 2), y: ROWS - 2, px: 0, py: 0, dir: "up", step: 0, moving: false, mx: 0, my: 0, prog: 0 };
  P.px = P.x * 16; P.py = P.y * 16;

  /* ---------- Dialog ---------- */
  const D = { open: false, pages: [], page: 0, shown: 0 };
  function wrap(text, width) {
    const words = String(text).split(/\s+/); const lines = []; let line = "";
    for (const w of words) {
      const t = line ? line + " " + w : w;
      if (t.length > (width || 17) && line) { lines.push(line); line = w; } else line = t;
    }
    if (line) lines.push(line);
    return lines;
  }
  function openDialog(text) {
    const lines = wrap(text);
    D.pages = []; for (let i = 0; i < lines.length; i += 2) D.pages.push(lines.slice(i, i + 2));
    D.page = 0; D.shown = 0; D.open = true;
  }

  /* ---------- Mit einer Figur sprechen (manuell oder automatisch) ---------- */
  const OPP = { up: "down", down: "up", left: "right", right: "left" };
  const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  let autoRef = null;   // Figur, deren Gruß gerade automatisch aufging (verhindert Dauerschleife)
  let celebrated = false;
  function talkTo(n, dir) {
    P.dir = dir;
    n.dir = OPP[dir];
    n.read = true;
    autoRef = n;
    const name = (n.g.name || "").trim();
    openDialog((name ? name.toUpperCase() + ": " : "") + (n.g.text || "…"));
    blip(880, 0.06, 0.035);
  }
  // Nach jedem Schritt: Steht eine Figur direkt daneben? → Gruß poppt auf.
  function autoGreet() {
    const order = [P.dir].concat(["up", "down", "left", "right"].filter((d) => d !== P.dir));
    for (const dir of order) {
      const n = npcs.find((n) => n.x === P.x + DELTA[dir][0] && n.y === P.y + DELTA[dir][1]);
      if (n) {
        if (autoRef !== n) talkTo(n, dir);
        return;
      }
    }
    autoRef = null; // von allen Figuren weggelaufen → nächste darf wieder aufpoppen
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
        openDialog("Das waren alle Grüße - schön, dass du da warst!");
        fanfare();
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
        P.prog += 1 / 13; // ~13 Frames pro Kachel (gemütliches Tempo)
        if (P.prog >= 1) { P.x = P.mx; P.y = P.my; P.moving = false; P.prog = 0; autoGreet(); }
        const fx = P.moving ? P.x + (P.mx - P.x) * P.prog : P.x;
        const fy = P.moving ? P.y + (P.my - P.y) * P.prog : P.y;
        P.px = Math.round(fx * 16); P.py = Math.round(fy * 16);
        if (frame % 9 === 0) P.step = 1 - P.step;
      } else { P.px = P.x * 16; P.py = P.y * 16; P.step = 0; }

      // Figuren schauen sich ab und zu um (deterministisch pseudozufällig)
      if (npcs.length && frame % 160 === 0) {
        const n = npcs[(Math.floor(frame / 160) * 7) % npcs.length];
        if (Math.abs(n.x - P.x) + Math.abs(n.y - P.y) > 1)
          n.dir = ["down", "left", "right", "up"][(Math.floor(frame / 160) * 13) % 4];
      }
    }

    // Kamera folgt vertikal (Raum ist genau 160 breit)
    const camY = Math.max(0, Math.min(P.py - 64, ROWS * 16 - 144));

    ctx.fillStyle = PAL[3]; ctx.fillRect(0, 0, 160, 144);
    for (const t of tiles) ctx.drawImage(t.img, t.x * 16, t.y * 16 - camY);
    for (const n of npcs) {
      ctx.drawImage(n.spr[n.dir][0], n.x * 16, n.y * 16 - camY - 2);
      // "!"-Hinweis über allen noch ungelesenen Grüßen (blinkt sanft)
      if (!n.read && !D.open && frame % 40 < 28) {
        ctx.fillStyle = C.red;
        ctx.fillRect(n.x * 16 + 7, n.y * 16 - camY - 8, 2, 4);
        ctx.fillRect(n.x * 16 + 7, n.y * 16 - camY - 3, 2, 2);
      }
    }
    ctx.drawImage(sprites[P.dir][P.moving ? P.step : 0], P.px, P.py - camY - 2);

    // Gelesen-Zähler (kleines Papier-Schild oben rechts)
    if (npcs.length) {
      const label = npcs.filter((n) => n.read).length + "/" + npcs.length;
      const w = label.length * 8 + 6;
      ctx.fillStyle = PAPER; ctx.fillRect(158 - w, 2, w, 13);
      ctx.fillStyle = INK; ctx.fillRect(158 - w, 2, w, 1); ctx.fillRect(158 - w, 14, w, 1);
      ctx.fillRect(158 - w, 2, 1, 13); ctx.fillRect(157, 2, 1, 13);
      ctx.font = "8px 'Press Start 2P', monospace"; ctx.textBaseline = "top";
      ctx.fillText(label, 161 - w, 5);
    }

    // Dialogbox (weiß, doppelter Rahmen, Schreibmaschine)
    if (D.open) {
      ctx.fillStyle = PAPER; ctx.fillRect(2, 102, 156, 40);
      ctx.fillStyle = INK;
      ctx.fillRect(2, 102, 156, 2); ctx.fillRect(2, 140, 156, 2); ctx.fillRect(2, 102, 2, 40); ctx.fillRect(156, 102, 2, 40);
      ctx.fillStyle = PAPER; ctx.fillRect(5, 105, 150, 34);
      ctx.fillStyle = INK; ctx.fillRect(5, 105, 150, 1); ctx.fillRect(5, 138, 150, 1); ctx.fillRect(5, 105, 1, 34); ctx.fillRect(154, 105, 1, 34);
      const lines = D.pages[D.page] || [];
      const total = lines.join(" ").length + lines.length;
      if (D.shown < total) {
        D.shown++;
        if (D.shown % 2 === 0) blip(D.shown % 4 === 0 ? 620 : 760, 0.03, 0.02); // Schreibmaschinen-Bleep
      }
      let budget = D.shown;
      ctx.font = "8px 'Press Start 2P', monospace"; ctx.textBaseline = "top"; ctx.fillStyle = INK;
      lines.forEach((ln, i) => {
        const part = ln.slice(0, Math.max(0, budget)); budget -= ln.length + 1;
        ctx.fillText(part, 10, 111 + i * 13);
      });
      if (D.shown >= total && frame % 30 < 18) { // ▼ blinkt
        ctx.fillStyle = INK;
        ctx.fillRect(146, 132, 6, 2); ctx.fillRect(147, 134, 4, 1); ctx.fillRect(148, 135, 2, 1);
      }
    } else if (npcs.length === 0) {
      ctx.fillStyle = PAPER; ctx.fillRect(2, 110, 156, 26);
      ctx.font = "8px 'Press Start 2P', monospace"; ctx.textBaseline = "top"; ctx.fillStyle = INK;
      ctx.fillText("NOCH KEINE", 10, 114); ctx.fillText("GRUESSE …", 10, 124);
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
    overlay.remove(); style.remove();
    if (SND.ctx) { try { SND.ctx.close(); } catch (e) {} SND.ctx = null; }
    if (O.onClose) O.onClose();
  }
  if (xBtn) xBtn.onclick = close;

  /* ---------- Start ---------- */
  const introText = (CARD.title || "").trim() || occ.intro;
  const boot = () => {
    if (closed) return;
    openDialog(introText + " - Sprich mit allen Leuten!");
    if (window.__PP_DEBUG)
      window.__ppCard = { P, npcs, D, aPress, close, state: () => ({ x: P.x, y: P.y, dir: P.dir, dialog: D.open, npcs: npcs.length, rows: ROWS, read: npcs.filter((n) => n.read).length }) };
    raf = requestAnimationFrame(loop);
  };
  (document.fonts ? document.fonts.load("8px 'Press Start 2P'").catch(() => {}).then(boot) : Promise.resolve().then(boot));

  return { close };
}

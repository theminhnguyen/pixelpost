/* ===================================================================
   PixelPost App — Ersteller-Seite + Link-Viewer.
   - Ohne Hash: Formular (Sprache, Anlass, Begrüßung, Grüße-Liste),
     Vorschau, Link erzeugen (Grüße komprimiert in der URL), Download.
   - Mit Hash #c=… / #d=…: Karte dekodieren und direkt spielen.
   Kein Server, kein Tracking — alles bleibt im Browser bzw. im Link.
   =================================================================== */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);

  // Ändert sich nur der #Hash (z. B. Karten-Link bei offener Seite eingefügt),
  // lädt der Browser nicht neu — dann würde der Viewer nie starten. Also: neu laden.
  window.addEventListener("hashchange", () => location.reload());

  /* ---------------- Übersetzungen der Ersteller-Seite ---------------- */
  const I18N = {
    de: {
      docTitle: "PixelPost — Grußkarte als Mini-Spiel im Retro-Stil",
      tagline: "Deine Grußkarte als begehbares Mini-Spiel im Retro-Stil.",
      sub: "Sammle Grüße von allen — jeder Gruß wird ein Männchen im Pixel-Raum. Der Empfänger läuft herum, spricht die Leute an und liest eure Nachrichten in der klassischen Dialogbox. Läuft komplett im Browser, kostenlos, ohne Anmeldung.",
      stepLang: "Sprache der Karte",
      stepOccasion: "Anlass wählen",
      stepGreeting: "Begrüßung",
      stepCollect: "Grüße sammeln",
      stepDone: "Fertig!",
      occ_geburtstag: "🎂 Geburtstag", occ_abschied: "👋 Abschied", occ_hochzeit: "💍 Hochzeit", occ_jubilaeum: "🏆 Jubiläum", occ_einfach: "💌 Einfach so",
      titlePh: "z. B. Alles Gute zum 30., liebe Mia!",
      titleNote: "Erscheint als erste Dialogbox, wenn der Empfänger die Karte öffnet. Leer lassen = Standard-Begrüßung zum Anlass.",
      collectNote: "Jeder Gruß wird ein eigenes Männchen im Raum. Sammle die Texte z. B. per Messenger ein und trag sie hier zusammen.",
      namePh: "Name (z. B. Oma Inge)",
      textPh: "Gruß (z. B. Alles Liebe! Bleib wie du bist …)",
      addGreet: "+ Gruß hinzufügen",
      delTitle: "Gruß entfernen",
      g_one: "Gruß", g_many: "Grüße", g_suffix: "ausgefüllt",
      btnPreview: "▶ Vorschau spielen",
      btnLink: "🔗 Link erstellen",
      btnDownload: "💾 Als Datei speichern",
      btnCopy: "Kopieren", btnCopied: "✓ Kopiert!",
      shareNote: "Der <b>Link</b> enthält die komplette Karte (kein Server, nichts wird hochgeladen). Die <b>Datei</b> läuft sogar offline — einfach per Mail oder Messenger schicken.",
      shareOk: "Link an den Empfänger schicken — die ganze Karte steckt im Link, kein Server nötig.",
      shareLong: "⚠️ Sehr lange Karte — manche Messenger kürzen so lange Links. Nimm zur Sicherheit die Datei-Variante.",
      needGreet: "Trag erst mindestens einen Gruß ein 🙂",
      reset: "Alles zurücksetzen",
      resetConfirm: "Wirklich alles löschen und neu anfangen?",
      footer: "PixelPost · 100 % im Browser · deine Grüße bleiben bei dir · eigene Pixel-Art, inspiriert von Klassikern — keine fremden Spiel-Inhalte.",
      fileName: "pixelpost-karte",
      stepHero: "Deine Spielfigur",
      heroNote: "So sieht die Figur aus, die der Empfänger durch den Raum steuert.",
      emojiPh: "🙂", emojiTitle: "Emoji für diesen Gruß (schwebt über der Figur)",
      qrNote: "Oder scannen lassen:",
      qrAlt: "QR-Code zum Karten-Link",
      qrTooLong: "Diese Karte ist zu lang für einen QR-Code — nimm den Link oder die Datei.",
    },
    en: {
      docTitle: "PixelPost — greeting card as a retro mini-game",
      tagline: "Your greeting card as a walkable mini-game in retro style.",
      sub: "Collect greetings from everyone — each one becomes a character in a pixel room. The recipient walks around, talks to people and reads your messages in the classic dialog box. Runs entirely in the browser, free, no sign-up.",
      stepLang: "Card language",
      stepOccasion: "Choose the occasion",
      stepGreeting: "Welcome message",
      stepCollect: "Collect greetings",
      stepDone: "Done!",
      occ_geburtstag: "🎂 Birthday", occ_abschied: "👋 Farewell", occ_hochzeit: "💍 Wedding", occ_jubilaeum: "🏆 Anniversary", occ_einfach: "💌 Just because",
      titlePh: "e.g. Happy 30th, dear Mia!",
      titleNote: "Shows as the first dialog box when the recipient opens the card. Leave empty for a default greeting matching the occasion.",
      collectNote: "Each greeting becomes its own character in the room. Gather the texts (e.g. via messenger) and collect them here.",
      namePh: "Name (e.g. Grandma Inge)",
      textPh: "Greeting (e.g. All the best! Stay the way you are …)",
      addGreet: "+ Add greeting",
      delTitle: "Remove greeting",
      g_one: "greeting", g_many: "greetings", g_suffix: "filled in",
      btnPreview: "▶ Play preview",
      btnLink: "🔗 Create link",
      btnDownload: "💾 Save as file",
      btnCopy: "Copy", btnCopied: "✓ Copied!",
      shareNote: "The <b>link</b> holds the entire card (no server, nothing is uploaded). The <b>file</b> even works offline — just send it by mail or messenger.",
      shareOk: "Send the link to the recipient — the whole card is inside the link, no server needed.",
      shareLong: "⚠️ Very long card — some messengers truncate links this long. Use the file option to be safe.",
      needGreet: "Please enter at least one greeting first 🙂",
      reset: "Reset everything",
      resetConfirm: "Really delete everything and start over?",
      footer: "PixelPost · 100 % in the browser · your greetings stay with you · original pixel art, inspired by classics — no third-party game content.",
      fileName: "pixelpost-card",
      stepHero: "Your character",
      heroNote: "This is the figure the recipient steers through the room.",
      emojiPh: "🙂", emojiTitle: "Emoji for this greeting (floats above the figure)",
      qrNote: "Or let them scan:",
      qrAlt: "QR code for the card link",
      qrTooLong: "This card is too long for a QR code — use the link or file instead.",
    },
  };
  const detectLang = () => {
    try {
      const saved = localStorage.getItem("pixelpost_lang");
      if (saved === "de" || saved === "en") return saved;
    } catch (e) {}
    return (navigator.language || "de").toLowerCase().startsWith("de") ? "de" : "en";
  };

  /* ---------------- URL-Codec ----------------
     kompaktes Format {v:2,t,o,l,g:[[name,text],…]} → JSON → UTF-8
     → deflate-raw (CompressionStream) → base64url.
     Präfix c= komprimiert, d= unkomprimiert (Fallback alte Browser).
     v1 (mit Editions-Feld e) wird beim Dekodieren noch akzeptiert. */
  const b64urlEnc = (u8) => {
    let s = "";
    for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  const b64urlDec = (str) => {
    const b = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    const u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return u;
  };
  async function encodePayload(card) {
    const compact = {
      v: 3,
      t: card.title || "",
      o: card.occasion || "einfach",
      l: card.lang === "en" ? "en" : "de",
      h: card.hero | 0,
      // g-Eintrag: [name, text] oder [name, text, emoji] (Emoji nur wenn gesetzt)
      g: (card.greetings || [])
        .filter((g) => (g.name || "").trim() || (g.text || "").trim())
        .map((g) => ((g.emoji || "").trim() ? [g.name || "", g.text || "", (g.emoji || "").trim()] : [g.name || "", g.text || ""])),
    };
    const bytes = new TextEncoder().encode(JSON.stringify(compact));
    if (typeof CompressionStream !== "undefined") {
      try {
        const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate-raw"));
        const buf = new Uint8Array(await new Response(stream).arrayBuffer());
        return "c=" + b64urlEnc(buf);
      } catch (e) { /* Fallback unten */ }
    }
    return "d=" + b64urlEnc(bytes);
  }
  async function decodePayload(hash) {
    const m = /^#?(c|d)=([A-Za-z0-9\-_]+)$/.exec(hash || "");
    if (!m) return null;
    let bytes = b64urlDec(m[2]);
    if (m[1] === "c") {
      if (typeof DecompressionStream === "undefined") throw new Error("browser-zu-alt");
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    }
    const c = JSON.parse(new TextDecoder().decode(bytes));
    if (!c || (c.v !== 1 && c.v !== 2 && c.v !== 3)) throw new Error("unbekanntes-format");
    return {
      title: String(c.t || ""),
      occasion: String(c.o || "einfach"),
      lang: c.l === "en" ? "en" : "de",
      hero: c.h | 0,
      greetings: (Array.isArray(c.g) ? c.g : []).map((p) => ({ name: String(p[0] || ""), text: String(p[1] || ""), emoji: String(p[2] || "") })),
    };
  }

  /* ---------------- Standalone-HTML (Download, läuft offline) ---------------- */
  const escHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function buildStandaloneHTML(card) {
    const json = JSON.stringify(card).replace(/</g, "\\u003c");
    return "<!DOCTYPE html>\n<html lang=\"" + (card.lang === "en" ? "en" : "de") + "\"><head><meta charset=\"utf-8\">"
      + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
      + "<title>" + escHtml(card.title || "PixelPost") + "</title>"
      + "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>"
      + "<link href=\"https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap\" rel=\"stylesheet\">"
      + "<style>html,body{margin:0;height:100%;background:#0c1422}</style></head>"
      + "<body><script>(" + PIXELPOST_RUNTIME.toString() + ")(" + json + ");<\/script></body></html>";
  }

  /* ---------------- Viewer-Modus (Link geöffnet) ---------------- */
  const APP_URL = location.origin + location.pathname;
  function showViewerError(err) {
    const tooOld = String(err && err.message) === "browser-zu-alt";
    const box = document.createElement("div");
    box.className = "viewer-error";
    box.innerHTML = "<h1>Karte kaputt · Card broken 😕</h1>"
      + "<p>" + (tooOld
        ? "Dein Browser ist zu alt, um diese Karte zu öffnen. · Your browser is too old to open this card."
        : "Dieser Link ist unvollständig oder beschädigt — bitte komplett kopieren lassen. · This link is incomplete or damaged — please have it copied in full.")
      + "</p><p><a href=\"" + APP_URL + "\">Selbst eine Karte erstellen · Create your own card →</a></p>";
    document.body.appendChild(box);
  }
  if (document.documentElement.classList.contains("is-viewer")) {
    decodePayload(location.hash)
      .then((card) => {
        if (!card) throw new Error("kein-inhalt");
        card.appUrl = APP_URL;
        PIXELPOST_RUNTIME(card);
      })
      .catch(showViewerError);
    return; // Ersteller-UI gar nicht erst initialisieren
  }

  /* ---------------- Ersteller-Seite ---------------- */
  const state = {
    title: "",
    occasion: "geburtstag",
    lang: detectLang(),
    hero: 0,
    greetings: [{ name: "", text: "", emoji: "" }],
  };

  // Entwurf laden (Autosave, localStorage)
  try {
    const draft = JSON.parse(localStorage.getItem("pixelpost_draft") || "null");
    if (draft && Array.isArray(draft.greetings) && draft.greetings.length) {
      state.title = String(draft.title || "");
      state.occasion = String(draft.occasion || "geburtstag");
      if (draft.lang === "de" || draft.lang === "en") state.lang = draft.lang;
      state.hero = draft.hero | 0;
      state.greetings = draft.greetings.map((g) => ({ name: String(g.name || ""), text: String(g.text || ""), emoji: String(g.emoji || "") }));
    }
  } catch (e) {}
  let saveTimer = 0;
  function saveDraft() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem("pixelpost_draft", JSON.stringify(state)); } catch (e) {}
    }, 300);
  }

  const t = (key) => (I18N[state.lang] || I18N.de)[key];

  function cardFromState() {
    return {
      title: state.title.trim(),
      occasion: state.occasion,
      lang: state.lang,
      hero: state.hero | 0,
      greetings: state.greetings.map((g) => ({ name: g.name.trim(), text: g.text.trim(), emoji: (g.emoji || "").trim() })),
    };
  }
  const filledCount = () => state.greetings.filter((g) => g.name.trim() || g.text.trim()).length;

  /* ----- Sprache anwenden (statische Texte + Platzhalter) ----- */
  function applyLang() {
    document.documentElement.lang = state.lang;
    document.title = t("docTitle");
    for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
    for (const el of document.querySelectorAll("[data-i18n-html]")) el.innerHTML = t(el.dataset.i18nHtml);
    for (const el of document.querySelectorAll("[data-i18n-ph]")) el.placeholder = t(el.dataset.i18nPh);
    // Aktive Sprach-/Anlass-Buttons markieren
    for (const b of document.querySelectorAll("#langPick button")) b.classList.toggle("is-active", b.dataset.value === state.lang);
    renderGreetings(); // Platzhalter + Zähler folgen der Sprache
  }

  /* ----- Picker (Buttons mit data-value) ----- */
  function bindPicker(containerId, key, onChange) {
    const c = $(containerId);
    const update = () => {
      for (const b of c.querySelectorAll("button"))
        b.classList.toggle("is-active", b.dataset.value === state[key]);
    };
    c.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-value]");
      if (!b) return;
      state[key] = b.dataset.value;
      update(); saveDraft(); invalidateShare();
      if (onChange) onChange();
    });
    update();
  }

  /* ----- Grüße-Liste ----- */
  const listEl = $("greetList");
  function renderGreetings() {
    listEl.innerHTML = "";
    state.greetings.forEach((g, i) => {
      const row = document.createElement("div");
      row.className = "greet";
      const emoji = document.createElement("input");
      emoji.type = "text"; emoji.className = "greet__emoji"; emoji.placeholder = t("emojiPh");
      emoji.maxLength = 4; emoji.value = g.emoji || ""; emoji.title = t("emojiTitle");
      emoji.addEventListener("input", () => { g.emoji = emoji.value; saveDraft(); invalidateShare(); });
      const name = document.createElement("input");
      name.type = "text"; name.placeholder = t("namePh"); name.maxLength = 24; name.value = g.name;
      name.addEventListener("input", () => { g.name = name.value; saveDraft(); invalidateShare(); updateCount(); });
      const text = document.createElement("textarea");
      text.placeholder = t("textPh"); text.maxLength = 500; text.rows = 2; text.value = g.text;
      text.addEventListener("input", () => { g.text = text.value; saveDraft(); invalidateShare(); updateCount(); });
      const del = document.createElement("button");
      del.type = "button"; del.className = "greet__del"; del.textContent = "✕"; del.title = t("delTitle");
      del.addEventListener("click", () => {
        state.greetings.splice(i, 1);
        if (!state.greetings.length) state.greetings.push({ name: "", text: "", emoji: "" });
        renderGreetings(); saveDraft(); invalidateShare();
      });
      row.appendChild(emoji); row.appendChild(name); row.appendChild(text); row.appendChild(del);
      listEl.appendChild(row);
    });
    updateCount();
  }
  function updateCount() {
    const n = filledCount();
    $("greetCount").textContent = n + " " + (n === 1 ? t("g_one") : t("g_many")) + " " + t("g_suffix");
  }
  $("addGreet").addEventListener("click", () => {
    state.greetings.push({ name: "", text: "", emoji: "" });
    renderGreetings(); saveDraft(); invalidateShare();
    const rows = listEl.querySelectorAll(".greet");
    if (rows.length) { const nm = rows[rows.length - 1].querySelector("input:not(.greet__emoji)"); if (nm) nm.focus(); }
  });

  /* ----- Titel ----- */
  const titleEl = $("cardTitle");
  titleEl.value = state.title;
  titleEl.addEventListener("input", () => { state.title = titleEl.value; saveDraft(); invalidateShare(); });

  /* ----- Vorschau ----- */
  let preview = null;
  $("btnPreview").addEventListener("click", () => {
    if (preview) return;
    preview = PIXELPOST_RUNTIME(cardFromState(), { onClose: () => { preview = null; } });
  });

  /* ----- Link erzeugen + kopieren ----- */
  const shareBox = $("shareBox"), shareUrl = $("shareUrl"), shareHint = $("shareHint");
  function invalidateShare() { shareBox.hidden = true; const qb = $("qrBox"); if (qb) qb.hidden = true; }
  $("btnLink").addEventListener("click", async () => {
    if (!filledCount()) { alert(t("needGreet")); return; }
    const payload = await encodePayload(cardFromState());
    const url = APP_URL + "#" + payload;
    shareUrl.value = url;
    shareBox.hidden = false;
    shareHint.textContent = url.length > 7000 ? t("shareLong") : t("shareOk");
    renderQR(url);
    shareUrl.select();
  });
  $("btnCopy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(shareUrl.value);
    } catch (e) {
      shareUrl.select();
      document.execCommand && document.execCommand("copy");
    }
    $("btnCopy").textContent = t("btnCopied");
    setTimeout(() => { $("btnCopy").textContent = t("btnCopy"); }, 1600);
  });

  /* ----- Download (Offline-Datei) ----- */
  $("btnDownload").addEventListener("click", () => {
    if (!filledCount()) { alert(t("needGreet")); return; }
    const card = cardFromState();
    const blob = new Blob([buildStandaloneHTML(card)], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (card.title || t("fileName")).replace(/[^\wäöüÄÖÜß\-]+/g, "_").slice(0, 60) + ".html";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  /* ----- Alles zurücksetzen ----- */
  $("btnReset").addEventListener("click", () => {
    if (!confirm(t("resetConfirm"))) return;
    state.title = ""; state.occasion = "geburtstag"; state.hero = 0;
    state.greetings = [{ name: "", text: "", emoji: "" }];
    titleEl.value = "";
    try { localStorage.removeItem("pixelpost_draft"); } catch (e) {}
    bindPicker("occasionPick", "occasion");
    updateHeroPicker();
    renderGreetings(); invalidateShare();
  });

  /* ----- Figuren-Wähler (Vorschau-Sprites der 6 Presets) ----- */
  const HERO_PREVIEW = ["#3f8850", "#c04040", "#4060b8", "#8848a0", "#d07828", "#2f8f8f"];
  const heroPick = $("heroPick");
  function updateHeroPicker() {
    for (const b of heroPick.querySelectorAll("button")) b.classList.toggle("is-active", (b.dataset.value | 0) === (state.hero | 0));
  }
  HERO_PREVIEW.forEach((col, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "hero-opt"; b.dataset.value = String(i);
    b.style.setProperty("--hc", col);
    b.setAttribute("aria-label", "Figur " + (i + 1));
    heroPick.appendChild(b);
  });
  heroPick.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-value]");
    if (!b) return;
    state.hero = b.dataset.value | 0;
    updateHeroPicker(); saveDraft(); invalidateShare();
  });

  /* ----- QR-Code zum Link (Bibliothek von CDN, nur Ersteller-Seite) ----- */
  function renderQR(url) {
    const box = $("qrBox"), img = $("qrImg"), note = $("qrNote");
    if (!box) return;
    if (typeof qrcode === "undefined" || url.length > 1200) {
      box.hidden = true;
      if (url.length > 1200) { note.textContent = t("qrTooLong"); note.hidden = false; } else note.hidden = true;
      return;
    }
    try {
      const qr = qrcode(0, "M");        // Typ 0 = automatische Version
      qr.addData(url); qr.make();
      img.src = qr.createDataURL(4, 8); // Zellgröße 4px, Rand 8 Module
      img.alt = t("qrAlt");
      note.textContent = t("qrNote"); note.hidden = false;
      box.hidden = false;
    } catch (e) { box.hidden = true; note.textContent = t("qrTooLong"); note.hidden = false; }
  }

  /* ----- Init ----- */
  bindPicker("occasionPick", "occasion");
  bindPicker("langPick", "lang", () => { try { localStorage.setItem("pixelpost_lang", state.lang); } catch (e) {} applyLang(); updateHeroPicker(); });
  updateHeroPicker();
  applyLang(); // ruft renderGreetings() mit

  // Test-Hooks (nur für automatisierte Prüfung)
  if (window.__PP_DEBUG) window.__ppApp = { state, encodePayload, decodePayload, buildStandaloneHTML, cardFromState, applyLang, renderQR };
})();

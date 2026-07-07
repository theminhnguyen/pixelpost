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
      stepCollab: "Lieber gemeinsam sammeln?",
      collabIntro: "Statt alles selbst einzutragen: Starte einen Sammel-Link und schick ihn rum — jede/r trägt den eigenen Gruß ein. Am Ende baust du daraus die fertige Karte. (Die Grüße werden dafür kurz auf einem kostenlosen Server zwischengespeichert.)",
      btnCollab: "🔗 Sammel-Link starten",
      collabWorking: "Wird angelegt …",
      collabErr: "Konnte den Sammel-Link nicht anlegen. Bitte später noch einmal versuchen.",
      collabInviteLabel: "1) Einlade-Link — an alle schicken, die einen Gruß beisteuern sollen:",
      collabManageLabel: "2) Dein privater Verwalten-Link — gut aufheben!",
      collabManageNote: "Nur mit diesem Link kommst du an die gesammelten Grüße und baust die Karte. Nicht weiterschicken! (Ist auch in diesem Browser gespeichert.)",
      collabOpenManage: "Grüße ansehen / Karte bauen →",
      savedCollabs: "Deine Sammel-Links (in diesem Browser gespeichert):",
      cHeading: "Trag deinen Gruß ein ✍️",
      cSubtitle: "Dein Gruß wird Teil einer Überraschungs-Grußkarte im Retro-Stil — als kleines Männchen in einem Pixel-Raum.",
      cSubmit: "Gruß abschicken",
      cThanks: "Danke! Dein Gruß ist dabei 🎉",
      cAnother: "Noch einen Gruß hinzufügen",
      cCountSuffix: "Grüße bisher gesammelt",
      cClosed: "Diese Sammlung nimmt gerade keine Grüße mehr an. 🙈",
      cNotFound: "Diese Sammlung gibt es nicht (mehr).",
      cFull: "Diese Sammlung ist voll — melde dich beim Absender.",
      cErr: "Hat nicht geklappt — bitte noch einmal versuchen.",
      mHeading: "Gesammelte Grüße",
      mCountSuffix: "Grüße gesammelt",
      mRefresh: "🔄 Aktualisieren",
      mBuild: "✨ Fertige Karte bauen",
      mToggleClose: "Sammlung schließen (keine neuen Grüße)",
      mToggleOpen: "Sammlung wieder öffnen",
      mEmpty: "Noch keine Grüße — teile den Einlade-Link! 📨",
      mForbidden: "Kein Zugriff — der Verwalten-Link ist unvollständig oder falsch.",
      mInvite: "Einlade-Link (zum Weiterteilen):",
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
      stepCollab: "Prefer to collect together?",
      collabIntro: "Instead of entering everything yourself: start a collection link and pass it around — everyone adds their own greeting. At the end you build the finished card from them. (Greetings are briefly stored on a free server for this.)",
      btnCollab: "🔗 Start a collection link",
      collabWorking: "Creating …",
      collabErr: "Couldn't create the collection link. Please try again later.",
      collabInviteLabel: "1) Invite link — send to everyone who should add a greeting:",
      collabManageLabel: "2) Your private manage link — keep it safe!",
      collabManageNote: "Only this link lets you see the collected greetings and build the card. Don't share it! (It's also saved in this browser.)",
      collabOpenManage: "View greetings / build card →",
      savedCollabs: "Your collection links (saved in this browser):",
      cHeading: "Add your greeting ✍️",
      cSubtitle: "Your greeting becomes part of a surprise retro greeting card — as a little character in a pixel room.",
      cSubmit: "Send greeting",
      cThanks: "Thank you! Your greeting is in 🎉",
      cAnother: "Add another greeting",
      cCountSuffix: "greetings collected so far",
      cClosed: "This collection isn't accepting greetings right now. 🙈",
      cNotFound: "This collection doesn't exist (anymore).",
      cFull: "This collection is full — contact the sender.",
      cErr: "That didn't work — please try again.",
      mHeading: "Collected greetings",
      mCountSuffix: "greetings collected",
      mRefresh: "🔄 Refresh",
      mBuild: "✨ Build the finished card",
      mToggleClose: "Close collection (no new greetings)",
      mToggleOpen: "Reopen collection",
      mEmpty: "No greetings yet — share the invite link! 📨",
      mForbidden: "No access — the manage link is incomplete or wrong.",
      mInvite: "Invite link (to share):",
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

  /* ================= Sammel-Link (optionales Backend) =================
     Mehrere Leute tragen über EINEN Link Grüße ein; nur der Ersteller sieht
     mit seinem Geheim-Token alles und baut daraus die fertige (weiterhin
     serverlose) Karte. Zugriff nur über geprüfte RPC-Funktionen. */
  const SB_URL = "https://moezhswmybxxeplncgyy.supabase.co";
  const SB_KEY = "sb_publishable_XNkGqoR-HyQmi5mjAXXt_A_u6gL1P-f";
  async function rpc(fn, params) {
    const res = await fetch(SB_URL + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(params || {}),
    });
    if (!res.ok) {
      let msg = "http_" + res.status;
      try { msg = (await res.json()).message || msg; } catch (e) {}
      throw new Error(msg);
    }
    return res.json();
  }
  const L2 = (lang, key) => (I18N[lang === "en" ? "en" : "de"] || I18N.de)[key];
  function makeQR(url) {
    try { if (typeof qrcode === "undefined" || url.length > 1200) return null; const q = qrcode(0, "M"); q.addData(url); q.make(); return q.createDataURL(4, 8); } catch (e) { return null; }
  }

  // localStorage-Merkliste der eigenen Sammlungen
  function savedCollabs() { try { return JSON.parse(localStorage.getItem("pixelpost_collabs") || "[]"); } catch (e) { return []; } }
  function rememberCollab(c) { try { const a = savedCollabs().filter((x) => x.id !== c.id); a.unshift(c); localStorage.setItem("pixelpost_collabs", JSON.stringify(a.slice(0, 12))); } catch (e) {} }

  function collabRoot() {
    document.documentElement.classList.add("is-viewer");
    const w = document.createElement("div"); w.className = "collab"; document.body.appendChild(w); return w;
  }
  const shell = (inner) => "<div class='collab__card'><a class='collab__logo' href='" + APP_URL + "'>PIXEL<span>POST</span></a>" + inner + "</div>";
  function collabError(w, lang, key) { w.innerHTML = shell("<p class='collab__msg'>" + escHtml(L2(lang, key)) + "</p><a class='collab__home' href='" + APP_URL + "'>PixelPost →</a>"); }

  /* ----- Beitragende: Gruß eintragen (#collect=<id>) ----- */
  async function initContributor(id) {
    const w = collabRoot();
    w.innerHTML = shell("<p class='collab__msg'>…</p>");
    let info;
    try { info = (await rpc("collection_info", { p_id: id }))[0]; } catch (e) { info = null; }
    if (!info) return collabError(w, "de", "cNotFound");
    const lang = info.lang === "en" ? "en" : "de", tr = (k) => L2(lang, k);
    document.documentElement.lang = lang;
    if (!info.open) return collabError(w, lang, "cClosed");
    let count = info.count | 0;

    const render = () => {
      w.innerHTML = shell(
        "<h1>" + escHtml(info.title || tr("cHeading")) + "</h1>" +
        "<p class='collab__sub'>" + escHtml(tr("cSubtitle")) + "</p>" +
        "<div class='collab__form'>" +
        "<div class='collab__row'><input id='cEmoji' maxlength='4' placeholder='🙂' title='Emoji'>" +
        "<input id='cName' type='text' maxlength='24' placeholder='" + escHtml(L2(lang, "namePh")) + "'></div>" +
        "<textarea id='cText' rows='3' maxlength='500' placeholder='" + escHtml(L2(lang, "textPh")) + "'></textarea>" +
        "<button id='cSend' class='btn btn--primary'>" + escHtml(tr("cSubmit")) + "</button>" +
        "<p id='cMsg' class='collab__note'></p></div>" +
        "<p class='collab__count'>" + count + " " + escHtml(tr("cCountSuffix")) + "</p>");
      const send = document.getElementById("cSend"), msg = document.getElementById("cMsg");
      send.addEventListener("click", async () => {
        const name = document.getElementById("cName").value.trim();
        const text = document.getElementById("cText").value.trim();
        const emoji = document.getElementById("cEmoji").value.trim();
        if (!name && !text) { msg.textContent = L2(lang, "needGreet"); return; }
        send.disabled = true; msg.textContent = "…";
        try {
          await rpc("add_greeting", { p_collection: id, p_name: name, p_text: text, p_emoji: emoji });
          count++;
          w.innerHTML = shell(
            "<h1>" + escHtml(tr("cThanks")) + "</h1>" +
            "<p class='collab__count'>" + count + " " + escHtml(tr("cCountSuffix")) + "</p>" +
            "<button id='cMore' class='btn'>" + escHtml(tr("cAnother")) + "</button>");
          document.getElementById("cMore").addEventListener("click", render);
        } catch (e) {
          send.disabled = false;
          msg.textContent = /closed/.test(e.message) ? tr("cClosed") : /full/.test(e.message) ? tr("cFull") : L2(lang, "cErr") || "…";
        }
      });
    };
    render();
  }

  /* ----- Ersteller: Grüße ansehen + Karte bauen (#manage=<id>~<token>) ----- */
  async function initManage(id, token) {
    const w = collabRoot();
    w.innerHTML = shell("<p class='collab__msg'>…</p>");
    let info, rows;
    try {
      info = (await rpc("collection_info", { p_id: id }))[0];
      rows = await rpc("list_greetings", { p_collection: id, p_token: token });
    } catch (e) { return collabError(w, "de", /forbidden/.test(e.message) ? "mForbidden" : "cNotFound"); }
    if (!info) return collabError(w, "de", "cNotFound");
    const lang = info.lang === "en" ? "en" : "de", tr = (k) => L2(lang, k);
    document.documentElement.lang = lang;
    rememberCollab({ id: id, token: token, title: info.title, lang: lang });
    const inviteUrl = APP_URL + "#collect=" + id;

    async function refresh() {
      try { rows = await rpc("list_greetings", { p_collection: id, p_token: token }); info = (await rpc("collection_info", { p_id: id }))[0]; } catch (e) {}
      render();
    }
    function render() {
      const listHtml = rows.length
        ? "<ul class='collab__list'>" + rows.map((g) => "<li><b>" + escHtml((g.emoji ? g.emoji + " " : "") + (g.name || "—")) + "</b>" + escHtml(g.text || "") + "</li>").join("") + "</ul>"
        : "<p class='collab__msg'>" + escHtml(tr("mEmpty")) + "</p>";
      w.innerHTML = shell(
        "<h1>" + escHtml(tr("mHeading")) + "</h1>" +
        "<p class='collab__count'>" + rows.length + " " + escHtml(tr("mCountSuffix")) + (info.open ? "" : " · 🔒") + "</p>" +
        "<div class='collab__row2'><button id='mRefresh' class='btn btn--small'>" + escHtml(tr("mRefresh")) + "</button>" +
        "<button id='mToggle' class='btn btn--small'>" + escHtml(info.open ? tr("mToggleClose") : tr("mToggleOpen")) + "</button></div>" +
        listHtml +
        "<div class='collab__invite'><label>" + escHtml(tr("mInvite")) + "</label><div class='share__row'><input id='mInvite' readonly value='" + escHtml(inviteUrl) + "'><button id='mInviteCopy' class='btn btn--small'>" + escHtml(L2(lang, "btnCopy")) + "</button></div></div>" +
        "<button id='mBuild' class='btn btn--primary collab__build'" + (rows.length ? "" : " disabled") + ">" + escHtml(tr("mBuild")) + "</button>" +
        "<div id='mShare'></div>");
      document.getElementById("mRefresh").addEventListener("click", refresh);
      document.getElementById("mInviteCopy").addEventListener("click", () => copyField("mInvite", "mInviteCopy", L2(lang, "btnCopied"), L2(lang, "btnCopy")));
      document.getElementById("mToggle").addEventListener("click", async () => {
        try { await rpc("set_collection_open", { p_collection: id, p_token: token, p_open: !info.open }); info.open = !info.open; render(); } catch (e) {}
      });
      document.getElementById("mBuild").addEventListener("click", buildCard);
    }
    async function buildCard() {
      const card = { title: info.title, occasion: info.occasion, lang: lang, hero: info.hero | 0,
        greetings: rows.map((g) => ({ name: g.name, text: g.text, emoji: g.emoji })) };
      const url = APP_URL + "#" + await encodePayload(card);
      const qr = makeQR(url);
      const box = document.getElementById("mShare");
      box.innerHTML =
        "<div class='share'><div class='share__row'><input id='mCardUrl' readonly value='" + escHtml(url) + "'>" +
        "<button id='mCardCopy' class='btn btn--primary'>" + escHtml(L2(lang, "btnCopy")) + "</button></div>" +
        "<div class='collab__row2'><button id='mPreview' class='btn'>" + escHtml(L2(lang, "btnPreview")) + "</button>" +
        "<button id='mDownload' class='btn'>" + escHtml(L2(lang, "btnDownload")) + "</button></div>" +
        (qr ? "<div class='qr'><img src='" + qr + "' alt='QR'></div>" : "") + "</div>";
      document.getElementById("mCardCopy").addEventListener("click", () => copyField("mCardUrl", "mCardCopy", L2(lang, "btnCopied"), L2(lang, "btnCopy")));
      document.getElementById("mPreview").addEventListener("click", () => PIXELPOST_RUNTIME(card, { onClose: () => {} }));
      document.getElementById("mDownload").addEventListener("click", () => {
        const blob = new Blob([buildStandaloneHTML(card)], { type: "text/html" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
        a.download = (card.title || L2(lang, "fileName")).replace(/[^\wäöüÄÖÜß\-]+/g, "_").slice(0, 60) + ".html";
        a.click(); URL.revokeObjectURL(a.href);
      });
      box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    render();
  }
  async function copyField(inputId, btnId, doneLabel, label) {
    const inp = document.getElementById(inputId), btn = document.getElementById(btnId);
    try { await navigator.clipboard.writeText(inp.value); } catch (e) { inp.select(); document.execCommand && document.execCommand("copy"); }
    btn.textContent = doneLabel; setTimeout(() => { btn.textContent = label; }, 1600);
  }

  // Test-Hooks fürs Backend (nur bei __PP_DEBUG)
  if (window.__PP_DEBUG) window.__ppCollab = { rpc, initContributor, initManage };

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
  // Routing nach Hash: Sammel-Beitrag, Verwalten, fertige Karte — oder Ersteller
  const collectM = /^#collect=([0-9a-fA-F-]{36})$/.exec(location.hash);
  const manageM = /^#manage=([0-9a-fA-F-]{36})~([0-9a-fA-F]{64})$/.exec(location.hash);
  if (collectM) { initContributor(collectM[1]); return; }
  if (manageM) { initManage(manageM[1], manageM[2]); return; }
  if (/^#(c|d)=/.test(location.hash)) {
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

  /* ----- Figuren-Wähler (echte Sprite-Vorschau der Presets) ----- */
  const heroPick = $("heroPick");
  function updateHeroPicker() {
    for (const b of heroPick.querySelectorAll("button")) b.classList.toggle("is-active", (b.dataset.value | 0) === (state.hero | 0));
  }
  let heroPreviews = [];
  try { if (typeof PIXELPOST_RUNTIME === "function") heroPreviews = PIXELPOST_RUNTIME({}, { spritePreview: true }) || []; } catch (e) {}
  const heroCount = heroPreviews.length || 6;
  for (let i = 0; i < heroCount; i++) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "hero-opt"; b.dataset.value = String(i);
    b.setAttribute("aria-label", "Figur " + (i + 1));
    if (heroPreviews[i]) { const img = document.createElement("img"); img.src = heroPreviews[i]; img.alt = ""; b.appendChild(img); }
    heroPick.appendChild(b);
  }
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

  /* ----- Sammel-Link starten (Backend) ----- */
  async function startCollab() {
    const btn = $("btnCollab"), out = $("collabResult");
    const orig = btn.textContent; btn.disabled = true; btn.textContent = t("collabWorking");
    try {
      const c = cardFromState();
      const r = (await rpc("create_collection", { p_title: c.title, p_occasion: c.occasion, p_lang: c.lang, p_hero: c.hero }))[0];
      rememberCollab({ id: r.id, token: r.owner_token, title: c.title, lang: c.lang });
      const invite = APP_URL + "#collect=" + r.id;
      const manage = APP_URL + "#manage=" + r.id + "~" + r.owner_token;
      const iqr = makeQR(invite);
      out.hidden = false;
      out.innerHTML =
        "<div class='share'>" +
        "<label>" + escHtml(t("collabInviteLabel")) + "</label>" +
        "<div class='share__row'><input id='ciUrl' readonly value='" + escHtml(invite) + "'><button type='button' id='ciCopy' class='btn btn--primary'>" + escHtml(t("btnCopy")) + "</button></div>" +
        (iqr ? "<div class='qr'><img src='" + iqr + "' alt='QR'></div>" : "") +
        "<label class='collab__ml'>" + escHtml(t("collabManageLabel")) + "</label>" +
        "<div class='share__row'><input id='cmUrl' readonly value='" + escHtml(manage) + "'><button type='button' id='cmCopy' class='btn'>" + escHtml(t("btnCopy")) + "</button></div>" +
        "<p class='note'>" + escHtml(t("collabManageNote")) + "</p>" +
        "<a class='btn btn--primary collab__build' href='" + escHtml(manage) + "'>" + escHtml(t("collabOpenManage")) + "</a></div>";
      $("ciCopy").addEventListener("click", () => copyField("ciUrl", "ciCopy", t("btnCopied"), t("btnCopy")));
      $("cmCopy").addEventListener("click", () => copyField("cmUrl", "cmCopy", t("btnCopied"), t("btnCopy")));
    } catch (e) {
      out.hidden = false; out.innerHTML = "<p class='note'>" + escHtml(t("collabErr")) + "</p>";
    } finally { btn.disabled = false; btn.textContent = orig; }
  }
  $("btnCollab").addEventListener("click", startCollab);
  (function showSavedCollabs() {
    const saved = savedCollabs(); const box = $("savedCollabs");
    if (!box || !saved.length) return;
    box.hidden = false;
    box.innerHTML = "<p class='note'>" + escHtml(t("savedCollabs")) + "</p>" +
      saved.map((c) => "<a class='saved-link' href='" + escHtml(APP_URL + "#manage=" + c.id + "~" + c.token) + "'>" + escHtml(c.title || "PixelPost") + " →</a>").join("");
  })();

  /* ----- Init ----- */
  bindPicker("occasionPick", "occasion");
  bindPicker("langPick", "lang", () => { try { localStorage.setItem("pixelpost_lang", state.lang); } catch (e) {} applyLang(); updateHeroPicker(); });
  updateHeroPicker();
  applyLang(); // ruft renderGreetings() mit

  // Test-Hooks (nur für automatisierte Prüfung)
  if (window.__PP_DEBUG) window.__ppApp = { state, encodePayload, decodePayload, buildStandaloneHTML, cardFromState, applyLang, renderQR };
})();

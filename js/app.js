/* ===================================================================
   PixelPost App — Ersteller-Seite + Link-Viewer.
   - Ohne Hash: Formular (Anlass, Edition, Begrüßung, Grüße-Liste),
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

  /* ---------------- URL-Codec ----------------
     kompaktes Format {v,t,o,e,g:[[name,text],…]} → JSON → UTF-8
     → deflate-raw (CompressionStream) → base64url.
     Präfix c= komprimiert, d= unkomprimiert (Fallback alte Browser). */
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
      v: 1,
      t: card.title || "",
      o: card.occasion || "einfach",
      e: card.edition || "blau",
      g: (card.greetings || [])
        .filter((g) => (g.name || "").trim() || (g.text || "").trim())
        .map((g) => [g.name || "", g.text || ""]),
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
    if (!c || c.v !== 1) throw new Error("unbekanntes-format");
    return {
      title: String(c.t || ""),
      occasion: String(c.o || "einfach"),
      edition: String(c.e || "blau"),
      greetings: (Array.isArray(c.g) ? c.g : []).map((p) => ({ name: String(p[0] || ""), text: String(p[1] || "") })),
    };
  }

  /* ---------------- Standalone-HTML (Download, läuft offline) ---------------- */
  const escHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function buildStandaloneHTML(card) {
    const json = JSON.stringify(card).replace(/</g, "\\u003c");
    return "<!DOCTYPE html>\n<html lang=\"de\"><head><meta charset=\"utf-8\">"
      + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
      + "<title>" + escHtml(card.title || "PixelPost-Karte") + "</title>"
      + "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>"
      + "<link href=\"https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap\" rel=\"stylesheet\">"
      + "<style>html,body{margin:0;height:100%;background:#0c1422}</style></head>"
      + "<body><script>(" + PIXELPOST_RUNTIME.toString() + ")(" + json + ");<\/script></body></html>";
  }

  /* ---------------- Viewer-Modus (Link geöffnet) ---------------- */
  const APP_URL = location.origin + location.pathname;
  function showViewerError(err) {
    const box = document.createElement("div");
    box.className = "viewer-error";
    box.innerHTML = "<h1>Ups — Karte kaputt 😕</h1>"
      + "<p>" + (String(err && err.message) === "browser-zu-alt"
        ? "Dein Browser ist zu alt, um diese Karte zu entpacken. Bitte aktualisiere ihn oder öffne den Link auf einem anderen Gerät."
        : "Dieser Link ist unvollständig oder beschädigt. Bitte lass dir den Link noch einmal schicken — er muss komplett kopiert werden.")
      + "</p><p><a href=\"" + APP_URL + "\">Selbst eine Karte erstellen →</a></p>";
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
    edition: "blau",
    greetings: [{ name: "", text: "" }],
  };

  // Entwurf laden (Autosave, localStorage)
  try {
    const draft = JSON.parse(localStorage.getItem("pixelpost_draft") || "null");
    if (draft && Array.isArray(draft.greetings) && draft.greetings.length) {
      state.title = String(draft.title || "");
      state.occasion = String(draft.occasion || "geburtstag");
      state.edition = String(draft.edition || "blau");
      state.greetings = draft.greetings.map((g) => ({ name: String(g.name || ""), text: String(g.text || "") }));
    }
  } catch (e) {}
  let saveTimer = 0;
  function saveDraft() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem("pixelpost_draft", JSON.stringify(state)); } catch (e) {}
    }, 300);
  }

  function cardFromState() {
    return {
      title: state.title.trim(),
      occasion: state.occasion,
      edition: state.edition,
      greetings: state.greetings.map((g) => ({ name: g.name.trim(), text: g.text.trim() })),
    };
  }
  const filledCount = () => state.greetings.filter((g) => g.name.trim() || g.text.trim()).length;

  /* ----- Anlass & Edition (Buttons mit data-value) ----- */
  function bindPicker(containerId, key) {
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
      const name = document.createElement("input");
      name.type = "text"; name.placeholder = "Name (z. B. Oma Inge)"; name.maxLength = 24; name.value = g.name;
      name.addEventListener("input", () => { g.name = name.value; saveDraft(); invalidateShare(); });
      const text = document.createElement("textarea");
      text.placeholder = "Gruß (z. B. Alles Liebe! Bleib wie du bist …)"; text.maxLength = 500; text.rows = 2; text.value = g.text;
      text.addEventListener("input", () => { g.text = text.value; saveDraft(); invalidateShare(); });
      const del = document.createElement("button");
      del.type = "button"; del.className = "greet__del"; del.textContent = "✕"; del.title = "Gruß entfernen";
      del.addEventListener("click", () => {
        state.greetings.splice(i, 1);
        if (!state.greetings.length) state.greetings.push({ name: "", text: "" });
        renderGreetings(); saveDraft(); invalidateShare();
      });
      row.appendChild(name); row.appendChild(text); row.appendChild(del);
      listEl.appendChild(row);
    });
    $("greetCount").textContent = filledCount() + " " + (filledCount() === 1 ? "Gruß" : "Grüße") + " ausgefüllt";
  }
  $("addGreet").addEventListener("click", () => {
    state.greetings.push({ name: "", text: "" });
    renderGreetings(); saveDraft(); invalidateShare();
    const inputs = listEl.querySelectorAll(".greet input");
    if (inputs.length) inputs[inputs.length - 1].focus();
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
  function invalidateShare() { shareBox.hidden = true; }
  $("btnLink").addEventListener("click", async () => {
    if (!filledCount()) { alert("Trag erst mindestens einen Gruß ein 🙂"); return; }
    const payload = await encodePayload(cardFromState());
    const url = APP_URL + "#" + payload;
    shareUrl.value = url;
    shareBox.hidden = false;
    shareHint.textContent = url.length > 7000
      ? "⚠️ Sehr lange Karte — manche Messenger kürzen so lange Links. Nimm zur Sicherheit die Datei-Variante."
      : "Link an den Empfänger schicken — die ganze Karte steckt im Link, kein Server nötig.";
    shareUrl.select();
  });
  $("btnCopy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(shareUrl.value);
      $("btnCopy").textContent = "✓ Kopiert!";
    } catch (e) {
      shareUrl.select();
      document.execCommand && document.execCommand("copy");
      $("btnCopy").textContent = "✓ Kopiert!";
    }
    setTimeout(() => { $("btnCopy").textContent = "Kopieren"; }, 1600);
  });

  /* ----- Download (Offline-Datei) ----- */
  $("btnDownload").addEventListener("click", () => {
    if (!filledCount()) { alert("Trag erst mindestens einen Gruß ein 🙂"); return; }
    const card = cardFromState();
    const blob = new Blob([buildStandaloneHTML(card)], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (card.title || "pixelpost-karte").replace(/[^\wäöüÄÖÜß\-]+/g, "_").slice(0, 60) + ".html";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  /* ----- Alles zurücksetzen ----- */
  $("btnReset").addEventListener("click", () => {
    if (!confirm("Wirklich alles löschen und neu anfangen?")) return;
    state.title = ""; state.occasion = "geburtstag"; state.edition = "blau";
    state.greetings = [{ name: "", text: "" }];
    titleEl.value = "";
    try { localStorage.removeItem("pixelpost_draft"); } catch (e) {}
    bindPicker("occasionPick", "occasion"); bindPicker("editionPick", "edition");
    renderGreetings(); invalidateShare();
  });

  bindPicker("occasionPick", "occasion");
  bindPicker("editionPick", "edition");
  renderGreetings();

  // Test-Hooks (nur für automatisierte Prüfung)
  if (window.__PP_DEBUG) window.__ppApp = { state, encodePayload, decodePayload, buildStandaloneHTML, cardFromState };
})();

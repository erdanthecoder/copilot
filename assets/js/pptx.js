// PowerPoint (.pptx) support: teachers upload their own decks; each slide becomes
// a "pptx" slide that renders inside the normal presentation player, so sharing
// and live presenting work exactly like built-in slides.
// Rendering uses the pptx-preview library (loaded from the jsDelivr CDN).
const LIB = "https://cdn.jsdelivr.net/npm/pptx-preview@1.0.7/dist/pptx-preview.umd.js";
const W = 960, H = 540;

let libPromise = null;
function loadLib() {
  if (window.pptxPreview) return Promise.resolve(window.pptxPreview);
  if (!libPromise) libPromise = new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = LIB; s.async = true;
    s.onload = () => (window.pptxPreview ? res(window.pptxPreview) : rej(new Error("PowerPoint viewer failed to load")));
    s.onerror = () => { libPromise = null; rej(new Error("Could not load the PowerPoint viewer — check your internet connection.")); };
    document.head.append(s);
  });
  return libPromise;
}

// One hidden, fully rendered copy of each deck; slides are cloned from it.
const decks = new Map();
function hiddenHost() {
  let host = document.getElementById("pptx-host");
  if (!host) { host = document.createElement("div"); host.id = "pptx-host"; host.setAttribute("aria-hidden", "true"); Object.assign(host.style, { position: "fixed", left: "-20000px", top: "0", width: W + "px", pointerEvents: "none" }); document.body.append(host); }
  return host;
}
export function loadDeck(src) {
  if (decks.has(src)) return decks.get(src);
  const p = (async () => {
    const lib = await loadLib();
    const buf = src instanceof ArrayBuffer ? src : await (await fetch(src)).arrayBuffer();
    const box = document.createElement("div"); hiddenHost().append(box);
    const viewer = lib.init(box, { width: W, height: H, mode: "list" });
    await viewer.preview(buf);
    const slides = [...box.querySelectorAll(".pptx-preview-slide-wrapper")];
    return { count: slides.length, slide: (i) => slides[i] || null, titles: slides.map(s => (s.innerText || "").trim().split(/\n+/)[0].slice(0, 80)) };
  })();
  p.catch(() => decks.delete(src));
  decks.set(src, p);
  return p;
}

// Put slide `index` of deck `url` into `stage` (a 16:9 box), scaled to fit.
export function mountPptxSlide(stage, url, index) {
  const holder = document.createElement("div");
  holder.className = "pptx-holder";
  holder.innerHTML = '<div class="pptx-loading">Loading slide…</div>';
  stage.append(holder);
  loadDeck(url).then((deck) => {
    const src = deck.slide(index);
    if (!src) { holder.innerHTML = '<div class="pptx-loading">Slide not found</div>'; return; }
    const clone = src.cloneNode(true);
    clone.style.margin = "0";
    holder.replaceChildren(clone);
    // Fit any slide size (16:9, 4:3, …) inside the 16:9 stage, centred.
    const sw = parseFloat(src.style.width) || W, sh = parseFloat(src.style.height) || H;
    const fit = () => {
      const w = stage.clientWidth || W, hgt = stage.clientHeight || w * H / W;
      const k = Math.min(w / sw, hgt / sh);
      clone.style.transform = `translate(${(w - sw * k) / 2}px, ${(hgt - sh * k) / 2}px) scale(${k})`;
      holder.classList.toggle("letterbox", Math.abs(sw / sh - W / H) > 0.02);
    };
    fit();
    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(stage);
  }).catch((e) => { holder.innerHTML = `<div class="pptx-loading">${String(e.message || e).replace(/</g, "&lt;")}</div>`; });
}

// Microsoft's free online viewer shows the original file exactly (animations included).
export function officeViewerUrl(url) { return "https://view.officeapps.live.com/op/embed.aspx?src=" + encodeURIComponent(url); }
export function deckUrlOf(pres) { const s = (pres.slides || []).find(x => x.type === "pptx"); return s ? s.url : null; }

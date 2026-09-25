// Shared UI helpers: DOM builder, icons, mascot, sounds, confetti, toasts, modals.

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") { for (const [sk, sv] of Object.entries(v)) { if (sv == null) continue; if (sk.startsWith("--")) el.style.setProperty(sk, sv); else el.style[sk] = sv; } }
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "html") el.innerHTML = v;
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
export const $ = (sel, root = document) => root.querySelector(sel);
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const P = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.8"/><path d="M16 14.2a5.5 5.5 0 0 1 6 5.8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  flame: '<path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3-1-3 0-7 1-9.5z" fill="currentColor" stroke="none"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor" stroke="none"/>',
  heart: '<path d="M12 21s-8-5.2-8-11.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8 2.8C20 15.8 12 21 12 21z" fill="currentColor" stroke="none"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  speaker: '<path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  micOff: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M3 3l18 18"/>',
  cam: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/>',
  camOff: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3M3 3l18 18"/>',
  screen: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4M12 13V7M9 10l3-3 3 3"/>',
  phone: '<path d="M3.5 14.5c5-5 12-5 17 0l-2.5 3-3.5-1.5v-2.5a10 10 0 0 0-5 0V16L6 17.5z" fill="currentColor"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6.5 7S5 18.5 4 16l-1.5-3.5a1.4 1.4 0 0 1 2.4-1.4L8 14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>',
  play: '<path d="M7 4v16l13-8z" fill="currentColor"/>',
  left: '<path d="m15 5-7 7 7 7"/>',
  right: '<path d="m9 5 7 7-7 7"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" fill="currentColor" stroke="none"/>',
  trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8M9 18h6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="currentColor" stroke="none"/>',
  slides: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M12 17v4M8 21h8M7 9h6M7 12h10"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  pen: '<path d="M3 21l3.5-1L19 7.5 16.5 5 4 17.5zM14 7.5l2.5 2.5"/>',
  shuffle: '<path d="M3 7h3c5 0 7 10 12 10h3M3 17h3c2 0 3.2-1.5 4.3-3.4M13.7 10.4C14.8 8.5 16 7 18 7h3M18 4l3 3-3 3M18 14l3 3-3 3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  flag: '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>',
  type: '<path d="M4 7V5h16v2M12 5v14M9 19h6"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
};
export function icon(name, cls = "") {
  const span = document.createElement("span");
  span.className = "ic " + cls;
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;
  return span;
}

// Илбирс — the snow leopard mascot. mood: happy | sad | wow | wave | think
export function mascot(mood = "happy", size = 120) {
  const mouth = {
    happy: '<path d="M50 78 q10 10 20 0" fill="#c2415c" stroke="#3b3f46" stroke-width="2.5"/><path d="M55 83 q5 4 10 0" fill="#ff8fa3"/>',
    wave: '<path d="M50 78 q10 10 20 0" fill="#c2415c" stroke="#3b3f46" stroke-width="2.5"/><path d="M55 83 q5 4 10 0" fill="#ff8fa3"/>',
    sad: '<path d="M52 83 q8 -7 16 0" fill="none" stroke="#3b3f46" stroke-width="2.5" stroke-linecap="round"/>',
    wow: '<ellipse cx="60" cy="81" rx="5" ry="6" fill="#c2415c" stroke="#3b3f46" stroke-width="2"/>',
    think: '<path d="M53 81 h14" stroke="#3b3f46" stroke-width="2.5" stroke-linecap="round"/>',
  }[mood] || "";
  const brows = mood === "sad" ? '<path d="M36 47 l12 4M84 47 l-12 4" stroke="#3b3f46" stroke-width="2.5" stroke-linecap="round"/>' : mood === "think" ? '<path d="M37 48 l11 -2M72 45 l11 3" stroke="#3b3f46" stroke-width="2.5" stroke-linecap="round"/>' : "";
  const paw = mood === "wave" ? '<g class="m-wave"><ellipse cx="101" cy="72" rx="9" ry="11" fill="#eef2f6" stroke="#b9c3cf" stroke-width="2"/><circle cx="98" cy="66" r="2" fill="#5b6470"/><circle cx="104" cy="67" r="2" fill="#5b6470"/></g>' : "";
  const wrap = document.createElement("span");
  wrap.className = "mascot mood-" + mood;
  wrap.innerHTML = `<svg viewBox="0 0 120 120" width="${size}" height="${size}" aria-label="Ilbirs the snow leopard" role="img">
    <ellipse cx="60" cy="112" rx="34" ry="5" fill="rgba(0,0,0,.08)"/>
    <path d="M22 40 q-6 -26 18 -18 z" fill="#eef2f6" stroke="#b9c3cf" stroke-width="2"/>
    <path d="M98 40 q6 -26 -18 -18 z" fill="#eef2f6" stroke="#b9c3cf" stroke-width="2"/>
    <path d="M27 36 q-2 -12 9 -9 z" fill="#ffb3c1"/><path d="M93 36 q2 -12 -9 -9 z" fill="#ffb3c1"/>
    <ellipse cx="60" cy="66" rx="44" ry="41" fill="#eef2f6" stroke="#b9c3cf" stroke-width="2"/>
    <g fill="#6b7480"><circle cx="34" cy="38" r="3.2"/><circle cx="42" cy="31" r="2.4"/><circle cx="78" cy="31" r="2.4"/><circle cx="86" cy="38" r="3.2"/><circle cx="60" cy="30" r="2.8"/><circle cx="24" cy="62" r="3"/><circle cx="96" cy="62" r="3"/><circle cx="28" cy="76" r="2.2"/><circle cx="92" cy="76" r="2.2"/></g>
    <g fill="none" stroke="#6b7480" stroke-width="2.2"><path d="M50 36 a4 4 0 1 1 6 3"/><path d="M70 36 a4 4 0 1 0 -6 3"/></g>
    <ellipse cx="60" cy="80" rx="20" ry="15" fill="#ffffff"/>
    ${brows}
    <g class="m-eyes"><ellipse cx="44" cy="58" rx="9" ry="10" fill="#fff" stroke="#3b3f46" stroke-width="2"/><ellipse cx="76" cy="58" rx="9" ry="10" fill="#fff" stroke="#3b3f46" stroke-width="2"/>
    <circle cx="45" cy="60" r="5.5" fill="#35a7b8"/><circle cx="75" cy="60" r="5.5" fill="#35a7b8"/>
    <circle cx="45" cy="60" r="2.6" fill="#1f2328"/><circle cx="75" cy="60" r="2.6" fill="#1f2328"/>
    <circle cx="47" cy="57.5" r="1.6" fill="#fff"/><circle cx="77" cy="57.5" r="1.6" fill="#fff"/></g>
    <path d="M55 70 h10 l-5 5 z" fill="#ff8fa3" stroke="#3b3f46" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M60 75 v3" stroke="#3b3f46" stroke-width="2"/>
    ${mouth}
    <g stroke="#b9c3cf" stroke-width="1.5" stroke-linecap="round"><path d="M38 76 l-14 -2M38 80 l-13 3M82 76 l14 -2M82 80 l13 3"/></g>
    <circle cx="34" cy="72" r="5" fill="#ffc2cf" opacity=".6"/><circle cx="86" cy="72" r="5" fill="#ffc2cf" opacity=".6"/>
    ${paw}
  </svg>`;
  return wrap;
}

// ── sounds (synthesised, no files) ──
let actx = null;
function ctx() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); } catch { actx = null; } return actx; }
function tone(freq, start, dur, type = "sine", vol = 0.18) {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime + start);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g); g.connect(c.destination); o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
}
export const sound = {
  enabled: (() => { try { return localStorage.getItem("lk.sound") !== "off"; } catch { return true; } })(),
  set(on) { this.enabled = on; try { localStorage.setItem("lk.sound", on ? "on" : "off"); } catch {} },
  correct() { if (!this.enabled) return; tone(784, 0, .12, "triangle"); tone(1175, .09, .22, "triangle"); },
  wrong() { if (!this.enabled) return; tone(220, 0, .18, "sawtooth", .08); tone(180, .12, .25, "sawtooth", .08); },
  tap() { if (!this.enabled) return; tone(520, 0, .05, "sine", .08); },
  match() { if (!this.enabled) return; tone(988, 0, .1, "triangle", .12); },
  done() { if (!this.enabled) return; [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .11, .3, "triangle", .16)); tone(1319, .5, .5, "triangle", .12); },
  ring() { if (!this.enabled) return; [880, 660, 880, 660].forEach((f, i) => tone(f, i * .18, .16, "sine", .12)); },
};

// Kyrgyz text-to-speech, only when the device really has a Kyrgyz voice.
export function kyVoice() {
  if (!("speechSynthesis" in window)) return null;
  return speechSynthesis.getVoices().find(v => /^ky/i.test(v.lang)) || null;
}
export function speakKy(text) {
  const v = kyVoice(); if (!v) return false;
  const u = new SpeechSynthesisUtterance(text); u.voice = v; u.lang = v.lang; u.rate = .9;
  speechSynthesis.cancel(); speechSynthesis.speak(u); return true;
}

export function confetti(duration = 1800) {
  const cv = h("canvas", { class: "confetti" }); document.body.append(cv);
  const g = cv.getContext("2d"); const W = cv.width = innerWidth, H = cv.height = innerHeight;
  const colors = ["#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b", "#ce82ff", "#ff9600"];
  const parts = Array.from({ length: 140 }, () => ({ x: W / 2 + (Math.random() - .5) * W * .3, y: H * .35, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 4, c: colors[Math.floor(Math.random() * colors.length)], a: Math.random() * 6, s: Math.random() * .3 - .15 }));
  const t0 = performance.now();
  (function frame(t) {
    g.clearRect(0, 0, W, H);
    for (const p of parts) { p.vy += .35; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.a += p.s; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore(); }
    if (t - t0 < duration) requestAnimationFrame(frame); else cv.remove();
  })(t0);
}

export function toast(msg, kind = "") {
  let host = $(".toasts"); if (!host) { host = h("div", { class: "toasts" }); document.body.append(host); }
  const t = h("div", { class: "toast " + kind }, msg); host.append(t);
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 3200);
}

// modal({ title, body: Node|string, actions: [{label, kind, onClick -> false keeps open}] })
export function modal({ title, body, actions = [], wide = false, onClose }) {
  const close = () => { back.remove(); onClose && onClose(); };
  const box = h("div", { class: "modal" + (wide ? " wide" : ""), role: "dialog", "aria-modal": "true" },
    h("div", { class: "modal-head" }, h("h3", {}, title || ""), h("button", { class: "icon-btn", "aria-label": "Close", onClick: close }, icon("x"))),
    h("div", { class: "modal-body" }, typeof body === "string" ? h("p", {}, body) : body),
    actions.length ? h("div", { class: "modal-actions" }, actions.map(a => h("button", { class: "btn " + (a.kind || "ghost"), onClick: async () => { const r = a.onClick ? await a.onClick() : undefined; if (r !== false) close(); } }, a.label))) : null);
  const back = h("div", { class: "modal-back", onClick: (e) => { if (e.target === back) close(); } }, box);
  document.body.append(back);
  const f = box.querySelector("input,textarea,select"); if (f) setTimeout(() => f.focus(), 30);
  return { close, box };
}
export function confirmBox(title, text, okLabel = "OK", danger = false) {
  return new Promise(res => modal({ title, body: text, onClose: () => res(false), actions: [
    { label: "Cancel", kind: "ghost", onClick: () => res(false) },
    { label: okLabel, kind: danger ? "danger" : "primary", onClick: () => { res(true); } },
  ] }));
}

export function fmtDate(d, lang = "en") {
  return new Date(d).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
export function relTime(d, lang = "en") {
  const ms = new Date(d) - Date.now(); const abs = Math.abs(ms);
  const rtf = new Intl.RelativeTimeFormat(lang === "ru" ? "ru" : "en", { numeric: "auto" });
  if (abs < 3600e3) return rtf.format(Math.round(ms / 60e3), "minute");
  if (abs < 86400e3) return rtf.format(Math.round(ms / 3600e3), "hour");
  return rtf.format(Math.round(ms / 86400e3), "day");
}
export function gradeChip(g, extra = "") {
  return h("span", { class: `grade g${g} ${extra}`, title: { 5: "Отлично", 4: "Хорошо", 3: "Удовлетворительно", 2: "Неудовлетворительно" }[g] || "" }, String(g));
}
export function initials(name) { return (name || "?").trim().split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase(); }
export function avatar(name, color = "#58cc02", size = 36) {
  return h("span", { class: "avatar", style: { background: color, width: size + "px", height: size + "px", fontSize: Math.round(size * .4) + "px" } }, initials(name));
}

// On-screen row of the letters most keyboards lack.
export function kyKeys(input) {
  return h("div", { class: "ky-keys" }, ["ң", "ө", "ү", "Ң", "Ө", "Ү"].map(ch => h("button", { type: "button", class: "key", onMousedown: (e) => e.preventDefault(), onClick: () => {
    const s = input.selectionStart ?? input.value.length, e = input.selectionEnd ?? s;
    input.value = input.value.slice(0, s) + ch + input.value.slice(e); input.focus();
    input.setSelectionRange(s + 1, s + 1); input.dispatchEvent(new Event("input"));
  } }, ch)));
}

export function errMsg(e) {
  const m = (e && (e.message || e.error_description || e.msg)) || String(e);
  return m.replace(/^.*?ERROR:\s*/, "");
}

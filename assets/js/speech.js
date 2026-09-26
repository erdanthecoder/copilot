// Kyrgyz pronunciation.
// Almost no phone or computer ships a Kyrgyz voice, and reading Kyrgyz with a Turkish or
// Russian voice gets many sounds wrong (к/қ, г/ғ, ң, ө, ү, ы, long vowels, stress).
// So we synthesise Kyrgyz ourselves with eSpeak NG's Kyrgyz voice, compiled to WebAssembly
// (assets/vendor/espeak, ~1.5 MB, loaded on first use). A real Kyrgyz system voice is used
// if the device has one.
const BASE = new URL("../vendor/espeak/", import.meta.url).href;

let engine = null, enginePromise = null, engineFailed = false, sampleRate = 22050;
function loadEngine() {
  if (engine) return Promise.resolve(engine);
  if (!enginePromise) {
    enginePromise = (async () => {
      const mod = await import(BASE + "espeak-ng.js");
      const m = await mod.default({ locateFile: (p) => BASE + p, print: () => {}, printErr: () => {} });
      const w = new m.eSpeakNGWorker();
      if (w.set_voice("ky") !== 0) throw new Error("no Kyrgyz voice");
      sampleRate = w.get_samplerate();
      engine = w; return w;
    })().catch((e) => { engineFailed = true; enginePromise = null; console.warn("Kyrgyz speech engine failed", e); throw e; });
  }
  return enginePromise;
}

let ctx = null;
function audio() {
  if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}
// Browsers only allow sound after a tap: unlock audio and start loading the engine then.
if (typeof window !== "undefined") {
  const unlock = () => {
    const a = audio(); if (a) { try { const b = a.createBuffer(1, 1, 22050); const s = a.createBufferSource(); s.buffer = b; s.connect(a.destination); s.start(0); } catch {} }
    loadEngine().catch(() => {});
  };
  window.addEventListener("pointerdown", unlock, { once: true, capture: true });
  window.addEventListener("keydown", unlock, { once: true, capture: true });
}

// Settings per use: words are said slowly and clearly; dialogue speakers get different voices.
const cache = new Map();
function synth(text, { variant = "", rate = 140, pitch = 50 } = {}) {
  const key = `${variant}|${rate}|${pitch}|${text}`;
  if (cache.has(key)) return cache.get(key);
  engine.set_voice(variant ? `ky+${variant}` : "ky");
  engine.set_rate(rate); engine.set_pitch(pitch);
  const chunks = []; let n = 0;
  engine.synthesize(text, (s) => { if (s && s.length) { chunks.push(s); n += s.length; } return 0; });
  const a = audio(); if (!a || !n) return null;
  const buf = a.createBuffer(1, n, sampleRate); const ch = buf.getChannelData(0);
  let o = 0; for (const c of chunks) { for (let i = 0; i < c.length; i++) ch[o + i] = c[i] / 32768; o += c.length; }
  if (cache.size > 300) cache.delete(cache.keys().next().value);
  cache.set(key, buf);
  return buf;
}

let current = null;
function stopCurrent() { if (current) { try { current.onended = null; current.stop(); } catch {} current = null; } }
function play(buf) {
  return new Promise((resolve) => {
    const a = audio(); if (!a || !buf) return resolve();
    stopCurrent();
    const src = a.createBufferSource(); src.buffer = buf;
    const g = a.createGain(); g.gain.value = 0.95; src.connect(g); g.connect(a.destination);
    src.onended = () => { if (current === src) current = null; resolve(); };
    current = src; src.start();
  });
}

// ── A real Kyrgyz system voice, if the device has one ──
let voices = [];
function loadVoices() { try { voices = speechSynthesis.getVoices(); } catch { voices = []; } }
if (typeof window !== "undefined" && "speechSynthesis" in window) { loadVoices(); speechSynthesis.addEventListener?.("voiceschanged", loadVoices); }
function systemKy() {
  if (!("speechSynthesis" in window)) return null;
  if (!voices.length) loadVoices();
  return voices.find(v => /^ky/i.test(v.lang)) || null;
}
function saySystem(v, text, rate = 0.85, pitch = 1) {
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text); u.voice = v; u.lang = v.lang; u.rate = rate; u.pitch = pitch;
    let done = false; const fin = () => { if (!done) { done = true; resolve(); } };
    u.onend = fin; u.onerror = fin; setTimeout(fin, Math.max(1500, text.length * 120) * 3);
    try { speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { fin(); }
  });
}

export function voiceInfo() {
  const sys = systemKy();
  if (sys) return { name: sys.name, lang: sys.lang, mode: "ky", label: "Kyrgyz (device voice)" };
  if (!engineFailed) return { name: "eSpeak NG", lang: "ky", mode: "ky", label: "Kyrgyz" };
  return null;
}

export const voice = {
  enabled: (() => { try { return localStorage.getItem("lk.voice") !== "off"; } catch { return true; } })(),
  set(on) { this.enabled = on; try { localStorage.setItem("lk.voice", on ? "on" : "off"); } catch {} },
  available() { return !!systemKy() || (!engineFailed && typeof WebAssembly === "object" && !!(window.AudioContext || window.webkitAudioContext)); },
};

let lastRequest = 0;
// Say a Kyrgyz word or sentence. `force` plays even when auto-voice is off (speaker button).
export function sayKy(text, { force = false } = {}) {
  if (!text || (!voice.enabled && !force)) return false;
  text = String(text).split("|")[0].trim(); if (!text) return false;
  const sys = systemKy();
  if (sys) { saySystem(sys, text); return true; }
  if (!voice.available()) return false;
  const req = ++lastRequest;
  if (engine) { play(synth(text)); return true; }
  loadEngine().then(() => { if (req === lastRequest) play(synth(text)); }).catch(() => {});
  return true;
}

// Speak and resolve when finished (dialogues). opts.speaker "A" | "B" picks the voice.
export async function sayKyAsync(text, { rate = 0.85, speaker = "A" } = {}) {
  text = String(text || "").split("|")[0].trim();
  const est = Math.max(1200, text.length * 95);
  if (!text || !voice.enabled) return new Promise(r => setTimeout(r, est));
  const sys = systemKy();
  if (sys) return saySystem(sys, text, rate, speaker === "B" ? 1.15 : 0.95);
  try { await loadEngine(); } catch { return new Promise(r => setTimeout(r, est)); }
  const buf = synth(text, { variant: speaker === "B" ? "f3" : "m3", rate: Math.round(165 * rate), pitch: speaker === "B" ? 58 : 44 });
  return play(buf);
}

// Wait until something can speak (the engine has loaded).
export async function ensureVoices(ms = 6000) {
  if (systemKy()) return true;
  try { await Promise.race([loadEngine(), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]); return true; } catch { return !!engine; }
}
export function stopSpeaking() { lastRequest++; stopCurrent(); try { speechSynthesis.cancel(); } catch {} }

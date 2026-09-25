// Pronunciation. Very few devices ship a Kyrgyz voice, so when there isn't one we
// read the word with a Turkish voice using Turkish spelling (ж→c, ч→ç, ш→ş, ы→ı,
// ө→ö, ү→ü). Kyrgyz and Turkish share most sounds, so this is a close approximation.
const TR = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "c", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", ң: "ng", о: "o", ө: "ö", п: "p", р: "r", с: "s", т: "t", у: "u", ү: "ü", ф: "f", х: "h", ц: "ts", ч: "ç", ш: "ş", щ: "şç", ъ: "", ы: "ı", ь: "", э: "e", ю: "yu", я: "ya" };
export function toTurkishSpelling(s) {
  return s.toLowerCase().replace(/[а-яёңөү]/g, (ch) => TR[ch] ?? ch);
}

let voices = [];
function loadVoices() { try { voices = speechSynthesis.getVoices(); } catch { voices = []; } }
if ("speechSynthesis" in window) { loadVoices(); speechSynthesis.addEventListener?.("voiceschanged", loadVoices); }

// Voice priority: Kyrgyz → Turkish (Turkish spelling) → Russian (Cyrillic, with
// ө/ү/ң adjusted) → any English voice (Latin letters). Something always speaks.
const RU = { ң: "нг", ө: "ё", ү: "ю", Ң: "Нг", Ө: "Ё", Ү: "Ю" };
export function toRussianReading(s) { return s.replace(/[ңөүҢӨҮ]/g, (c) => RU[c]); }
const LAT = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", ң: "ng", о: "o", ө: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya" };
function toLatinReading(s) { return s.toLowerCase().replace(/[а-яёңөү]/g, (c) => LAT[c] ?? c); }
function best(list) { return list.find(v => /google|natural|enhanced|premium|yelda|milena|siri/i.test(v.name)) || list[0]; }
function pickVoice() {
  if (!voices.length) loadVoices();
  const by = (re) => voices.filter(v => re.test(v.lang));
  const ky = by(/^ky/i); if (ky.length) return { voice: best(ky), mode: "ky" };
  const tr = by(/^tr/i); if (tr.length) return { voice: best(tr), mode: "tr" };
  const ru = by(/^ru/i); if (ru.length) return { voice: best(ru), mode: "ru" };
  const en = by(/^en/i); if (en.length) return { voice: best(en), mode: "latin" };
  return voices.length ? { voice: voices[0], mode: "latin" } : null;
}
function textFor(mode, text) { return mode === "ky" ? text : mode === "tr" ? toTurkishSpelling(text) : mode === "ru" ? toRussianReading(text) : toLatinReading(text); }
export function voiceInfo() {
  const v = pickVoice(); if (!v) return null;
  const label = { ky: "Kyrgyz", tr: "Turkish (close to Kyrgyz)", ru: "Russian (approximate)", latin: "English (rough)" }[v.mode];
  return { name: v.voice.name, lang: v.voice.lang, mode: v.mode, label };
}
// Some browsers (iOS Safari, Chrome) need speech to be "unlocked" by a tap and
// stop reading long queues; keep it alive and resume if paused.
let keepAlive = null;
function nudge() { try { if (speechSynthesis.paused) speechSynthesis.resume(); } catch {} }

export const voice = {
  enabled: (() => { try { return localStorage.getItem("lk.voice") !== "off"; } catch { return true; } })(),
  set(on) { this.enabled = on; try { localStorage.setItem("lk.voice", on ? "on" : "off"); } catch {} },
  available() { return "speechSynthesis" in window && !!pickVoice(); },
};

// Say a Kyrgyz word or sentence. `force` plays even when auto-voice is off (speaker button).
export function sayKy(text, { force = false } = {}) {
  if (!text || !("speechSynthesis" in window) || (!voice.enabled && !force)) return false;
  const v = pickVoice(); if (!v) return false;
  const u = new SpeechSynthesisUtterance(textFor(v.mode, text));
  u.voice = v.voice; u.lang = v.voice.lang; u.rate = v.mode === "ky" || v.mode === "tr" ? 0.82 : 0.78; u.pitch = 1.05; u.volume = 1;
  try { speechSynthesis.cancel(); speechSynthesis.speak(u); nudge(); } catch { return false; }
  return true;
}

// Speak and resolve when finished (for dialogue playback). Resolves after an
// estimated duration if no voice is available, so read-along still works silently.
// Chrome fills the voice list asynchronously; wait briefly for it.
export function ensureVoices(ms = 1500) {
  return new Promise((res) => {
    if (!("speechSynthesis" in window)) return res(false);
    loadVoices(); if (voices.length) return res(true);
    const t0 = Date.now(); const iv = setInterval(() => { loadVoices(); if (voices.length || Date.now() - t0 > ms) { clearInterval(iv); res(voices.length > 0); } }, 100);
  });
}
export function sayKyAsync(text, { pitch = 1.05, rate = 0.82 } = {}) {
  return new Promise((resolve) => {
    const est = Math.max(1200, text.length * 95);
    const v = voice.enabled && "speechSynthesis" in window ? pickVoice() : null;
    if (!v) { setTimeout(resolve, est); return; }
    const u = new SpeechSynthesisUtterance(textFor(v.mode, text));
    u.voice = v.voice; u.lang = v.voice.lang; u.rate = v.mode === "ky" || v.mode === "tr" ? rate : rate * 0.95; u.pitch = pitch; u.volume = 1;
    let done = false; const fin = () => { if (!done) { done = true; clearInterval(keepAlive); resolve(); } };
    u.onend = fin; u.onerror = fin;
    setTimeout(fin, est * 3 + 2000);
    try { speechSynthesis.speak(u); nudge(); clearInterval(keepAlive); keepAlive = setInterval(nudge, 1000); } catch { fin(); }
  });
}
export function stopSpeaking() { try { speechSynthesis.cancel(); } catch {} }

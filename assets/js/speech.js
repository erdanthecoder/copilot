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

function pickVoice() {
  if (!voices.length) loadVoices();
  const ky = voices.find(v => /^ky/i.test(v.lang));
  if (ky) return { voice: ky, mode: "ky" };
  const tr = voices.find(v => /^tr/i.test(v.lang) && /google|yelda|natural|enhanced/i.test(v.name)) || voices.find(v => /^tr/i.test(v.lang));
  if (tr) return { voice: tr, mode: "tr" };
  return null;
}

export const voice = {
  enabled: (() => { try { return localStorage.getItem("lk.voice") !== "off"; } catch { return true; } })(),
  set(on) { this.enabled = on; try { localStorage.setItem("lk.voice", on ? "on" : "off"); } catch {} },
  available() { return "speechSynthesis" in window && !!pickVoice(); },
};

// Say a Kyrgyz word or sentence. `force` plays even when auto-voice is off (speaker button).
export function sayKy(text, { force = false } = {}) {
  if (!text || !("speechSynthesis" in window) || (!voice.enabled && !force)) return false;
  const v = pickVoice(); if (!v) return false;
  const u = new SpeechSynthesisUtterance(v.mode === "ky" ? text : toTurkishSpelling(text));
  u.voice = v.voice; u.lang = v.voice.lang; u.rate = 0.82; u.pitch = 1.05; u.volume = 0.9;
  try { speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { return false; }
  return true;
}

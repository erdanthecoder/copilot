// Printable A4 worksheets and tests, generated from the curriculum.
// Every "New version" is freshly randomised, so neighbours get different sheets.
import { TOPICS } from "./curriculum.js";
import { translit } from "./engine.js";

const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const first = (s) => String(s).split("|")[0];
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tokens = (s) => s.replace(/[.,!?;:«»"“”]/g, "").replace(/\s—\s/g, " ").split(/\s+/).filter(Boolean);

export const SECTIONS = {
  match: { ky: "Сөздөрдү жупташтыр", en: "Match the words", ru: "Соедините слова", pts: 8 },
  translate: { ky: "Котор", en: "Translate into English", ru: "Переведите на русский", pts: 6 },
  toKyrgyz: { ky: "Кыргызча жаз", en: "Write in Kyrgyz", ru: "Напишите по-кыргызски", pts: 6 },
  gaps: { ky: "Бош орундарды толтур", en: "Fill in the gaps (use the words in the box)", ru: "Заполните пропуски (слова в рамке)", pts: 5 },
  order: { ky: "Сөздөрдү туура иретте жаз", en: "Put the words in the right order", ru: "Расставьте слова в правильном порядке", pts: 4 },
  choice: { ky: "Туура жоопту танда", en: "Choose the right answer", ru: "Выберите правильный ответ", pts: 5 },
  reading: { ky: "Текстти окуп, суроолорго жооп бер", en: "Read the text and answer the questions", ru: "Прочитайте текст и ответьте на вопросы", pts: 3 },
  writing: { ky: "Кыргызча 3 сүйлөм жаз", en: "Write 3 sentences in Kyrgyz", ru: "Напишите 3 предложения по-кыргызски", pts: 6 },
};

function collect(topicIds, lang) {
  const li = lang === "ru" ? 2 : 1;
  const words = [], sents = [], passages = [];
  for (const id of topicIds) {
    const t = TOPICS[id]; if (!t) continue;
    t.words.forEach(w => words.push({ ky: first(w[0]), tr: first(w[li]) }));
    t.sentences.forEach(s => sents.push({ ky: first(s[0]), tr: first(s[li]) }));
    (t.passages || []).forEach(p => passages.push({ ky: p.ky, q: p.questions.map(q => ({ q: q.q[lang === "ru" ? 1 : 0], options: q.options.map(o => o[lang === "ru" ? 1 : 0]), answer: q.answer })) }));
  }
  // de-duplicate by Kyrgyz text
  const uniq = (arr) => { const s = new Set(); return arr.filter(x => (s.has(x.ky) ? false : (s.add(x.ky), true))); };
  return { words: uniq(words), sents: uniq(sents), passages };
}

// Returns { html, key } — full documents ready for an iframe / printing.
export function buildWorksheet({ topicIds, lang = "en", kind = "worksheet", sections = Object.keys(SECTIONS), withKey = true, title = "", className = "", minutes = 40 }) {
  const { words, sents, passages } = collect(topicIds, lang);
  const ru = lang === "ru"; const isTest = kind === "test";
  const out = [], key = [];
  let n = 0, totalPts = 0;
  const head = (id, extra = "") => { n++; const s = SECTIONS[id]; totalPts += s.pts; return `<h2><span class="num">${n}</span>${esc(s.ky)} <small>· ${esc(ru ? s.ru : s.en)}</small>${isTest ? `<span class="pts">/${s.pts}</span>` : ""}</h2>${extra}`; };
  const ws = shuffle(words);
  let wi = 0; const takeW = (k) => { const r = []; for (let i = 0; i < k && ws.length; i++) r.push(ws[(wi++) % ws.length]); return r; };
  const ss = shuffle(sents); let si = 0; const takeS = (k, f = () => true) => { const pool = ss.filter(f); const r = []; for (let i = 0; i < k && pool.length; i++) r.push(pool[(si++) % pool.length]); return r; };

  for (const id of sections) {
    if (id === "match" && words.length >= 4) {
      const items = takeW(Math.min(8, words.length)); const letters = "abcdefgh";
      const right = shuffle(items.map((w, i) => ({ tr: w.tr, i })));
      out.push(`<section>${head("match")}<div class="match"><ol>${items.map(w => `<li><b class="ky">${esc(w.ky)}</b></li>`).join("")}</ol><ul>${right.map((r, j) => `<li><b>${letters[j]})</b> ${esc(r.tr)}</li>`).join("")}</ul></div><p class="answers">${items.map((_, i) => `${i + 1} → ___`).join("&nbsp;&nbsp; ")}</p></section>`);
      key.push(`<p><b>${n}.</b> ${items.map((_, i) => `${i + 1}–${letters[right.findIndex(r => r.i === i)]}`).join(", ")}</p>`);
    }
    if (id === "translate" && words.length) {
      const items = takeW(6);
      out.push(`<section>${head("translate")}<ol class="lines two">${items.map(w => `<li><b class="ky">${esc(w.ky)}</b> <span class="tl">(${esc(translit(w.ky))})</span> — <span class="blank"></span></li>`).join("")}</ol></section>`);
      key.push(`<p><b>${n}.</b> ${items.map((w, i) => `${i + 1}) ${esc(w.tr)}`).join("; ")}</p>`);
    }
    if (id === "toKyrgyz" && words.length) {
      const items = takeW(6);
      out.push(`<section>${head("toKyrgyz")}<ol class="lines two">${items.map(w => `<li>${esc(w.tr)} — <span class="blank"></span></li>`).join("")}</ol></section>`);
      key.push(`<p><b>${n}.</b> ${items.map((w, i) => `${i + 1}) ${esc(w.ky)}`).join("; ")}</p>`);
    }
    if (id === "gaps" && sents.length) {
      const items = takeS(5, s => tokens(s.ky).length >= 3);
      if (items.length) {
        const gaps = items.map(s => { const tk = tokens(s.ky); const j = 1 + Math.floor(Math.random() * (tk.length - 1)); return { s, word: tk[j], text: s.ky.replace(new RegExp(`(^|\\s)${tk[j].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[\\s.,!?;:]|$)`), "$1________") }; });
        const bank = shuffle(gaps.map(g => g.word).concat(takeW(2).map(w => w.ky.split(" ")[0])));
        out.push(`<section>${head("gaps")}<div class="bank">${bank.map(b => `<span>${esc(b)}</span>`).join("")}</div><ol class="lines">${gaps.map(g => `<li><span class="ky">${esc(g.text)}</span> <span class="hint">(${esc(g.s.tr)})</span></li>`).join("")}</ol></section>`);
        key.push(`<p><b>${n}.</b> ${gaps.map((g, i) => `${i + 1}) ${esc(g.word)}`).join("; ")}</p>`);
      }
    }
    if (id === "order" && sents.length) {
      const items = takeS(4, s => tokens(s.ky).length >= 3);
      if (items.length) {
        out.push(`<section>${head("order")}<ol class="lines">${items.map(s => `<li><span class="scramble">${shuffle(tokens(s.ky)).map(t => `<span>${esc(t)}</span>`).join(" / ")}</span> <span class="hint">(${esc(s.tr)})</span><div class="writeline"></div></li>`).join("")}</ol></section>`);
        key.push(`<p><b>${n}.</b> ${items.map((s, i) => `${i + 1}) ${esc(s.ky)}`).join("; ")}</p>`);
      }
    }
    if (id === "choice" && words.length >= 4) {
      const items = takeW(5);
      const qs = items.map(w => { const opts = shuffle([w.tr, ...shuffle(words.filter(x => x.tr !== w.tr)).slice(0, 2).map(x => x.tr)]); return { w, opts, ans: opts.indexOf(w.tr) }; });
      out.push(`<section>${head("choice")}<ol class="lines">${qs.map(q => `<li>${ru ? "Что значит" : "What does"} <b class="ky">«${esc(q.w.ky)}»</b> ${ru ? "?" : "mean?"}<div class="opts">${q.opts.map((o, j) => `<span>□ ${"abc"[j]}) ${esc(o)}</span>`).join("")}</div></li>`).join("")}</ol></section>`);
      key.push(`<p><b>${n}.</b> ${qs.map((q, i) => `${i + 1}) ${"abc"[q.ans]}`).join("; ")}</p>`);
    }
    if (id === "reading" && passages.length) {
      const p = shuffle(passages)[0];
      out.push(`<section>${head("reading")}<div class="passage ky">${esc(p.ky)}</div><ol class="lines">${p.q.slice(0, 3).map(q => `<li>${esc(q.q)}<div class="opts">${q.options.map((o, j) => `<span>□ ${"abcd"[j]}) ${esc(o)}</span>`).join("")}</div></li>`).join("")}</ol></section>`);
      key.push(`<p><b>${n}.</b> ${p.q.slice(0, 3).map((q, i) => `${i + 1}) ${"abcd"[q.answer]}`).join("; ")}</p>`);
    }
    if (id === "writing") {
      const topicName = topicIds.map(t => TOPICS[t] ? (ru ? TOPICS[t].ru : TOPICS[t].en) : "").filter(Boolean).slice(0, 2).join(", ");
      out.push(`<section>${head("writing")}<p class="hint">${ru ? "Тема" : "Topic"}: ${esc(topicName)}</p>${[1, 2, 3].map(() => `<div class="writeline"></div>`).join("")}</section>`);
      key.push(`<p><b>${n}.</b> ${ru ? "Свободный ответ — оценивает учитель." : "Open answer — marked by the teacher."}</p>`);
    }
  }

  const topicNames = topicIds.map(t => TOPICS[t] ? `${esc(TOPICS[t].ky)}` : "").filter(Boolean).join(" · ");
  const header = `<header>
    <div class="brand">Learn<b>Kyrgyz</b></div>
    <h1>${esc(title || (isTest ? "Текшерүү иши" : "Иш барагы"))}<small>${isTest ? (ru ? "Контрольная работа" : "Test") : (ru ? "Рабочий лист" : "Worksheet")}${className ? " · " + esc(className) : ""}</small></h1>
    <p class="topics">${topicNames}</p>
    <div class="fields"><span>Аты-жөнү / ${ru ? "Имя" : "Name"}: <i></i></span><span>Класс: <i class="short"></i></span><span>Күнү / ${ru ? "Дата" : "Date"}: <i class="short"></i></span></div>
    ${isTest ? `<div class="fields score"><span>${ru ? "Время" : "Time"}: ${minutes} ${ru ? "мин" : "min"}</span><span>Упай / ${ru ? "Баллы" : "Score"}: ____ / ${totalPts}</span><span>Баа / ${ru ? "Оценка" : "Grade"}: <b class="gradebox"></b></span></div>
      <p class="scale">5: ≥ ${Math.ceil(totalPts * 0.9)} · 4: ≥ ${Math.ceil(totalPts * 0.75)} · 3: ≥ ${Math.ceil(totalPts * 0.5)} · 2: &lt; ${Math.ceil(totalPts * 0.5)}</p>` : ""}
  </header>`;
  const keyPage = withKey ? `<div class="page-break"></div><section class="key"><h2>${ru ? "Ответы (для учителя)" : "Answer key (for the teacher)"}</h2>${key.join("")}</section>` : "";
  return { html: doc(header + out.join("") + keyPage, lang), totalPts };
}

function fontFaces() {
  const u = (f) => new URL(`../fonts/${f}`, import.meta.url).href;
  return ["latin", "cyrillic", "cyrillic-ext"].flatMap(sub => [700, 800, 900].map(w => `@font-face{font-family:Nunito;font-weight:${w};src:url(${u(`nunito-${sub}-${w}-normal.woff2`)}) format("woff2");}`)).join("");
}
function doc(body, lang) {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>LearnKyrgyz worksheet</title><style>
${fontFaces()}
@page { size: A4; margin: 14mm 14mm 16mm; }
* { box-sizing: border-box; }
body { font-family: Nunito, "Segoe UI", Arial, sans-serif; color: #1f2328; font-size: 12.5pt; margin: 0; padding: 0; background: #fff; }
.sheet { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 14mm; }
@media screen { body { background: #e9edf2; } .sheet { background: #fff; box-shadow: 0 4px 24px rgba(0,0,0,.12); margin: 12px auto; } }
@media print { .sheet { width: auto; min-height: 0; padding: 0; } }
header { border-bottom: 2.5px solid #58cc02; padding-bottom: 8px; margin-bottom: 10px; }
.brand { font-weight: 900; color: #58cc02; font-size: 13pt; }
.brand b { color: #1cb0f6; }
h1 { margin: 4px 0 2px; font-size: 20pt; font-weight: 900; }
h1 small { font-size: 11pt; color: #777; font-weight: 800; margin-left: 10px; }
.topics { margin: 0 0 8px; color: #555; font-weight: 800; }
.fields { display: flex; gap: 18px; flex-wrap: wrap; font-weight: 800; font-size: 11.5pt; margin-top: 4px; }
.fields i { display: inline-block; width: 70mm; border-bottom: 1.5px solid #333; height: 1em; }
.fields i.short { width: 28mm; }
.gradebox { display: inline-block; width: 12mm; height: 9mm; border: 2px solid #333; border-radius: 3px; vertical-align: middle; }
.scale { font-size: 9.5pt; color: #666; margin: 4px 0 0; }
section { margin: 12px 0 6px; break-inside: avoid; }
h2 { font-size: 13.5pt; margin: 0 0 6px; font-weight: 900; display: flex; align-items: center; gap: 8px; }
h2 small { font-weight: 700; color: #666; font-size: 10.5pt; }
h2 .num { display: inline-grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: #58cc02; color: #fff; font-size: 11pt; flex: none; }
h2 .pts { margin-left: auto; font-size: 10.5pt; color: #333; border: 1.5px solid #333; border-radius: 4px; padding: 0 6px; }
.ky { font-weight: 800; }
.tl, .hint { color: #777; font-size: 10pt; }
ol.lines { margin: 0; padding-left: 22px; }
ol.lines li { margin: 5px 0; }
ol.two { columns: 2; column-gap: 10mm; }
.blank { display: inline-block; min-width: 38mm; border-bottom: 1.2px solid #333; }
.writeline { border-bottom: 1.2px solid #999; height: 8mm; margin: 2mm 0; }
.match { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; }
.match ol, .match ul { margin: 0; padding-left: 22px; } .match ul { list-style: none; padding-left: 0; }
.match li { margin: 4px 0; }
.answers { font-weight: 800; color: #444; }
.bank { display: flex; flex-wrap: wrap; gap: 6px; border: 1.5px dashed #58cc02; border-radius: 8px; padding: 6px 8px; margin-bottom: 6px; }
.bank span { font-weight: 800; padding: 1px 8px; background: #effbe4; border-radius: 6px; }
.scramble span { font-weight: 800; }
.opts { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 2px; }
.passage { border-left: 4px solid #1cb0f6; padding: 6px 10px; background: #f3fbff; line-height: 1.55; margin-bottom: 6px; }
.page-break { break-after: page; height: 0; }
.key { font-size: 11pt; } .key h2 { color: #ce2b2b; }
footer { margin-top: 10px; font-size: 8.5pt; color: #999; text-align: right; }
</style></head><body><div class="sheet">${body}<footer>learnkyrgyz.web.app</footer></div></body></html>`;
}

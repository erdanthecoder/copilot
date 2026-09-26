// Exercise generation and answer checking. Pure logic — no DOM.
import { TOPICS, TOPIC_ORDER, TOPIC_AREA } from "./curriculum.js";

export const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
const first = (s) => s.split("|")[0];
const alts = (s) => s.split("|");

const TR = { а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"j",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",ң:"ng",о:"o",ө:"ö",п:"p",р:"r",с:"s",т:"t",у:"u",ү:"ü",ф:"f",х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"shch",ъ:"",ы:"ı",ь:"",э:"e",ю:"yu",я:"ya" };
export function translit(s) {
  return s.replace(/[А-Яа-яЁёҢңӨөҮү]/g, (ch) => {
    const lower = ch.toLowerCase(); const r = TR[lower] ?? ch;
    return ch === lower ? r : r.charAt(0).toUpperCase() + r.slice(1);
  });
}

export function normalize(s) {
  return (s || "").toLowerCase().replace(/ё/g, "е").replace(/[’`]/g, "'")
    .replace(/[.,!?;:«»"“”—–\-()]/g, " ").replace(/\s+/g, " ").trim();
}
// Folding the special Kyrgyz letters lets us recognise "almost right" answers typed without them.
const fold = (s) => s.replace(/ң/g, "н").replace(/ө/g, "о").replace(/ү/g, "у");

function lev(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

// Returns { ok, typo, special, expected }
export function checkTyped(input, accepted) {
  const n = normalize(input);
  const list = accepted.map(normalize);
  if (list.includes(n)) return { ok: true };
  for (const a of list) {
    if (fold(a) === fold(n)) return { ok: true, special: true, expected: a };
    const tol = a.length > 12 ? 2 : a.length > 4 ? 1 : 0;
    if (tol && lev(a, n) <= tol) return { ok: true, typo: true, expected: a };
    if (tol && lev(fold(a), fold(n)) <= tol) return { ok: true, typo: true, special: true, expected: a };
  }
  return { ok: false };
}

export function gradeFor(pct) { return pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 50 ? 3 : 2; }

function pool(topicIds) {
  const words = [], sentences = [];
  for (const id of topicIds) {
    const t = TOPICS[id]; if (!t) continue;
    t.words.forEach((w, i) => words.push({ ky: w[0], en: w[1], ru: w[2], id: `${id}:w${i}`, topic: id }));
    t.sentences.forEach((s, i) => sentences.push({ ky: s[0], en: s[1], ru: s[2], id: `${id}:s${i}`, topic: id }));
  }
  return { words, sentences };
}
const allPool = () => pool(TOPIC_ORDER);

const altSet = (s) => new Set(alts(s).map(normalize));
function overlaps(a, b) { for (const x of a) if (b.has(x)) return true; return false; }
// Distractors must not share any accepted Kyrgyz form or translation with the answer.
function distract(correct, candidates, key, n, lang) {
  const cKy = altSet(correct.ky), cTr = altSet(correct[lang]);
  const seen = new Set([normalize(first(correct[key]))]);
  const out = [];
  for (const c of shuffle(candidates)) {
    const v = normalize(first(c[key]));
    if (seen.has(v)) continue;
    if (overlaps(altSet(c.ky), cKy) || overlaps(altSet(c[lang]), cTr)) continue;
    seen.add(v); out.push(c); if (out.length >= n) break;
  }
  return out;
}

// Every Kyrgyz form that means the same as the prompt counts as correct (e.g. эне and апа for “mother”).
function acceptedKy(item, all, lang) {
  const want = altSet(item[lang]); const out = new Set(alts(item.ky));
  const same = item.id.includes(":s") ? all.sentences : all.words;
  for (const x of same) if (normalize(first(x[lang])) === normalize(first(item[lang])) || (want.has(normalize(first(x[lang]))) && altSet(x[lang]).has(normalize(first(item[lang]))))) alts(x.ky).forEach(k => out.add(k));
  return [...out];
}
function acceptedTr(item, all, lang) {
  const out = new Set(alts(item[lang])); const k = normalize(first(item.ky));
  for (const x of all.words.concat(all.sentences)) if (normalize(first(x.ky)) === k) alts(x[lang]).forEach(v => out.add(v));
  return [...out];
}

const tokens = (s) => s.replace(/[.,!?;:«»"“”]/g, "").replace(/\s—\s/g, " ").split(/\s+/).filter(Boolean);

/*
  Exercise shapes:
  - choose:   { type, prompt, promptLang, options:[text], answer:index, item }
  - match:    { type, pairs:[{ky, tr}] }
  - build:    { type, prompt, promptLang, target (tokens), bank:[tokens], item, lang }
  - type:     { type, prompt, promptLang, accepted:[..], lang, item }
  - blank:    { type, before, after, options, answer, item, hint }
*/
export function makeExercise(kind, item, P, lang, all) {
  const tr = (x) => x[lang];
  const sameTopicWords = item ? P.words.filter(w => w.topic === item.topic && w !== item) : [];
  const wordCands = sameTopicWords.length >= 3 ? sameTopicWords : P.words.concat(all.words);
  if (kind === "choose-ky") { // Kyrgyz prompt → pick translation
    const ds = distract(item, item.ky.includes(" ") && item.id.includes(":s") ? P.sentences.concat(all.sentences) : wordCands, lang, 3, lang);
    const options = shuffle([item, ...ds]);
    return { type: "choose", prompt: first(item.ky), promptLang: "ky", options: options.map(o => first(tr(o))), answer: options.indexOf(item), item };
  }
  if (kind === "choose-tr") { // translation prompt → pick Kyrgyz
    const ds = distract(item, item.id.includes(":s") ? P.sentences.concat(all.sentences) : wordCands, "ky", 3, lang);
    const options = shuffle([item, ...ds]);
    return { type: "choose", prompt: first(tr(item)), promptLang: lang, options: options.map(o => first(o.ky)), answer: options.indexOf(item), item, optionLang: "ky" };
  }
  if (kind === "match") {
    const picked = [];
    const seenKy = new Set(), seenTr = new Set();
    for (const w of shuffle(P.words)) {
      const a = normalize(first(w.ky)), b = normalize(first(tr(w)));
      if (seenKy.has(a) || seenTr.has(b)) continue;
      seenKy.add(a); seenTr.add(b); picked.push(w); if (picked.length === 5) break;
    }
    return { type: "match", pairs: picked.map(w => ({ ky: first(w.ky), tr: first(tr(w)), item: w })) };
  }
  if (kind === "build-ky") { // translation → arrange Kyrgyz tiles
    const target = tokens(first(item.ky));
    const extra = shuffle(all.sentences.flatMap(s => tokens(first(s.ky)))).filter(t => !target.map(normalize).includes(normalize(t)));
    const bank = shuffle(target.concat([...new Set(extra)].slice(0, Math.min(4, Math.max(2, 7 - target.length)))));
    return { type: "build", prompt: first(tr(item)), promptLang: lang, target, accepted: alts(item.ky), bank, lang: "ky", item };
  }
  if (kind === "build-tr") { // Kyrgyz → arrange translation tiles
    const target = tokens(first(tr(item)));
    const extra = shuffle(all.sentences.flatMap(s => tokens(first(tr(s))))).filter(t => !target.map(normalize).includes(normalize(t)));
    const bank = shuffle(target.concat([...new Set(extra)].slice(0, Math.min(4, Math.max(2, 7 - target.length)))));
    return { type: "build", prompt: first(item.ky), promptLang: "ky", target, accepted: alts(tr(item)), bank, lang, item };
  }
  if (kind === "type-ky") { // write it in Kyrgyz
    return { type: "type", prompt: first(tr(item)), promptLang: lang, accepted: acceptedKy(item, all, lang), lang: "ky", item };
  }
  if (kind === "type-tr") {
    return { type: "type", prompt: first(item.ky), promptLang: "ky", accepted: acceptedTr(item, all, lang), lang, item };
  }
  if (kind === "blank") {
    const toks = tokens(first(item.ky));
    const idx = Math.floor(Math.random() * toks.length);
    const answer = toks[idx];
    const pool2 = [...new Set(P.words.concat(all.words).map(w => first(w.ky)).filter(k => !k.includes(" ") && normalize(k) !== normalize(answer)))];
    const opts = shuffle([answer, ...shuffle(pool2).slice(0, 3)]);
    return { type: "blank", before: toks.slice(0, idx).join(" "), after: toks.slice(idx + 1).join(" "), options: opts, answer: opts.indexOf(answer), hint: first(tr(item)), item };
  }
}

/*
  Build a lesson. level 0..2 increases difficulty (more typing, more sentences).
  opts: { count, level, lang, review:[topicIds] }
*/
/*
  Three steps per topic, each gentle:
    level 0 "Learn words"    — teaches 4-5 new words at a time (new-word cards), then only
                                picks meanings / Kyrgyz words and matches pairs. No sentences.
    level 1 "Practise words" — all the topic's words: pick, match, type the translation.
                                Phrase topics (greetings, grammar…) add their phrases as picks.
    level 2 "Sentences"      — sentence tiles, fill-in and typing in Kyrgyz.
  Everything is freshly randomised on every call, so each student gets a different lesson.
  `known` (a Set of word ids) lets level 0 continue with the next unlearned words.
*/
export function nextWordBatch(topicIds, known, size = 5) {
  const words = pool(topicIds).words;
  return known ? words.filter(w => !known.has(w.id)).slice(0, size) : shuffle(words).slice(0, size);
}
export function buildLesson(topicIds, { count = 12, level = 0, lang = "en", intro = false, known = null, typing = false } = {}) {
  const P = pool(topicIds), all = allPool();
  const lv = Math.max(0, Math.min(2, level));
  const phraseTopic = topicIds.some(id => (TOPIC_AREA[id] || "vocab") !== "vocab");
  const plan = [];
  const scored = () => plan.filter(x => x && x.type !== "intro").length;
  const pushNoRepeat = (kinds, set) => {
    const last = plan[plan.length - 1];
    let w = pick(set), guard = 0;
    while (set.length > 1 && last && last.item === w && guard++ < 5) w = pick(set);
    plan.push(makeExercise(pick(kinds), w, P, lang, all));
  };

  if (lv === 0) {
    let fresh = nextWordBatch(topicIds, known, 5);
    if (!fresh.length) fresh = shuffle(P.words).slice(0, 5); // everything known: review
    const review = shuffle(P.words.filter(w => !fresh.includes(w) && (!known || known.has(w.id)))).slice(0, Math.max(0, 5 - fresh.length));
    const set = fresh.concat(review);
    const small = { words: set, sentences: [] };
    for (const w of fresh) {
      if (intro) plan.push(introCard(w, P, lang));
      plan.push(makeExercise("choose-ky", w, small, lang, all));
    }
    let matched = 0;
    while (scored() < count) {
      if (set.length >= 4 && matched < 2 && (scored() === Math.round(count * 0.55) || scored() === count - 1)) { plan.push(makeExercise("match", null, small, lang, all)); matched++; continue; }
      const w = pick(set); const last = plan[plan.length - 1];
      if (set.length > 1 && last && last.item === w) continue;
      plan.push(makeExercise(scored() < count * 0.5 ? pick(["choose-ky", "choose-tr"]) : pick(["choose-tr", "choose-tr", "choose-ky"]), w, small, lang, all));
    }
  } else if (lv === 1) {
    // Practise: recognise and recall every word of the topic. No typing.
    const words = shuffle(P.words);
    const phrases = phraseTopic ? shuffle(P.sentences) : [];
    let wi = 0, pi = 0;
    const matchAt = P.words.length >= 4 ? new Set([Math.round(count * 0.35), Math.round(count * 0.75)]) : new Set();
    for (let i = 0; i < count; i++) {
      if (matchAt.has(i)) { plan.push(makeExercise("match", null, P, lang, all)); continue; }
      const p = count > 1 ? i / (count - 1) : 0;
      if (phrases.length && i % 3 === 2) { plan.push(makeExercise(p < 0.6 ? "choose-ky" : "choose-tr", phrases[pi++ % phrases.length], P, lang, all)); continue; }
      const w = words[wi++ % words.length];
      plan.push(makeExercise(p < 0.4 ? "choose-ky" : pick(["choose-tr", "choose-ky", "choose-tr"]), w, P, lang, all));
      if (typing && p > 0.7) plan[plan.length - 1] = makeExercise("type-tr", w, P, lang, all);
    }
  } else {
    // Sentences, step by step: meet a sentence -> pick its meaning -> order the
    // translation -> fill a gap -> finally build it in Kyrgyz. Typing only when asked (homework).
    const sents = shuffle(P.sentences.slice().sort((x, y) => tokens(first(x.ky)).length - tokens(first(y.ky)).length).slice(0, Math.max(4, Math.ceil(P.sentences.length * 0.8))));
    const words = shuffle(P.words);
    let si = 0, wi = 0;
    const nextS = () => sents[si++ % sents.length];
    if (!sents.length) { for (let i = 0; i < count; i++) plan.push(makeExercise(pick(["choose-tr", "choose-ky"]), words[wi++ % words.length], P, lang, all)); }
    else {
      const taughtS = sents.slice(0, Math.min(2, sents.length));
      for (const x of taughtS) { if (intro !== false) plan.push(introCard(x, P, lang, true)); plan.push(makeExercise("choose-ky", x, P, lang, all)); }
      si = taughtS.length;
      const ramp = ["build-tr", "choose-tr", "build-tr", "match", "blank", "build-tr", "blank", "build-ky", "build-ky", "build-ky"];
      let r = 0;
      while (scored() < count) {
        let kind = ramp[r++ % ramp.length];
        if (kind === "match") { if (P.words.length >= 4) plan.push(makeExercise("match", null, P, lang, all)); continue; }
        const x = nextS();
        if (tokens(first(x.ky)).length < 3 && (kind.startsWith("build") || kind === "blank")) kind = "choose-tr";
        if (typing && scored() >= count - 3) kind = pick(["type-tr", "type-ky"]);
        plan.push(makeExercise(kind, x, P, lang, all));
      }
    }
  }
  // Reading topics: swap some exercises for comprehension questions.
  const reads = readingExercises(topicIds, lang);
  if (reads.length && lv === 0) {
    plan.push(...shuffle(reads).slice(0, 2));
  } else if (reads.length) {
    const n = Math.min(reads.length, Math.max(2, Math.round(count / 3)));
    const rq = shuffle(reads).slice(0, n);
    for (let i = 0; i < rq.length; i++) plan.splice(Math.min(plan.length, 1 + i * 3), 1, rq[i]);
  }
  return plan.filter(Boolean);
}

function introCard(w, P, lang, sentence = false) {
  const ex = sentence ? null : P.sentences.find(x => normalize(x.ky).split(" ").includes(normalize(first(w.ky))));
  return { type: "intro", sentence, ky: first(w.ky), tr: first(w[lang]), example: ex ? [first(ex.ky), first(ex[lang])] : null, item: w };
}

export function readingExercises(topicIds, lang) {
  const out = [];
  for (const id of topicIds) {
    for (const p of TOPICS[id]?.passages || []) {
      p.questions.forEach((q, qi) => {
        const li = lang === "ru" ? 1 : 0;
        const order = shuffle(q.options.map((o, i) => i));
        out.push({ type: "read", text: p.ky, translation: p[lang], prompt: q.q[li], options: order.map(i => q.options[i][li]), answer: order.indexOf(q.answer), item: { id: `${id}:r${qi}`, topic: id, ky: p.ky } });
      });
    }
  }
  return out;
}

// Teacher-written questions → exercises.
export function customExercise(q, setId, idx) {
  const item = { id: `set:${setId}:${idx}`, topic: null, custom: true };
  const explain = q.explain || "";
  if (q.type === "choice" || q.type === "truefalse") {
    const opts = q.type === "truefalse" ? [q.trueLabel || "Туура", q.falseLabel || "Туура эмес"] : q.options.filter(o => o && o.trim());
    const ans = q.answer ?? 0;
    const order = q.type === "truefalse" ? [0, 1] : shuffle(opts.map((_, i) => i));
    return { type: "choose", prompt: q.prompt, promptLang: "mixed", options: order.map(i => opts[i]), answer: order.indexOf(ans), item, explain };
  }
  if (q.type === "type") {
    return { type: "type", prompt: q.prompt, promptLang: "mixed", accepted: (q.answers || []).filter(Boolean), lang: "ky", item, explain };
  }
  if (q.type === "build") {
    const target = tokens(q.sentence);
    const extra = tokens(q.extra || "");
    return { type: "build", prompt: q.prompt, promptLang: "mixed", target, accepted: [q.sentence], bank: shuffle(target.concat(extra)), lang: "ky", item, explain };
  }
  return null;
}

export function allWords(lang) {
  return TOPIC_ORDER.flatMap(id => TOPICS[id].words.map((w, i) => ({ ky: w[0], tr: first(lang === "ru" ? w[2] : w[1]), topic: id, id: `${id}:w${i}` })));
}

// ── Word hints: tap a Kyrgyz word to see what it means ──
// Looks the word up in the curriculum; if it carries an ending (мектеп-ке, китеб-им),
// strips common suffixes to find the dictionary form.
const SUFFIXES = ["лардын", "лердин", "дардын", "дердин", "тардын", "тердин", "лардан", "лерден", "дардан", "дерден", "тардан", "терден",
  "ларга", "лерге", "дарга", "дерге", "тарга", "терге", "ларда", "лерде", "дарда", "дерде", "тарда", "терде",
  "мын", "мин", "мун", "мүн", "быз", "биз", "буз", "бүз", "сың", "сиң", "суң", "сүң",
  "лар", "лер", "лор", "лөр", "дар", "дер", "дор", "дөр", "тар", "тер", "тор", "төр",
  "нын", "нин", "нун", "нүн", "дын", "дин", "дун", "дүн", "тын", "тин", "тун", "түн",
  "дан", "ден", "дон", "дөн", "тан", "тен", "тон", "төн",
  "га", "ге", "го", "гө", "ка", "ке", "ко", "кө", "да", "де", "до", "дө", "та", "те", "то", "тө",
  "ны", "ни", "ну", "нү", "ды", "ди", "ду", "дү", "ты", "ти", "ту", "тү",
  "ым", "им", "ум", "үм", "бы", "би", "бу", "бү", "м", "ң", "ы", "и", "у", "ү"];
const ENDING = {
  en: { га: "to", ка: "to", да: "in/at", та: "in/at", дан: "from", тан: "from", нын: "of", дын: "of", тын: "of", ны: "(object)", ды: "(object)", ты: "(object)", лар: "(plural)", дар: "(plural)", тар: "(plural)", м: "my", ым: "my", ң: "your", ы: "his/her", бы: "?" },
  ru: { га: "к/в", ка: "к/в", да: "в/на", та: "в/на", дан: "из/от", тан: "из/от", нын: "(род. п.)", дын: "(род. п.)", тын: "(род. п.)", ны: "(вин. п.)", ды: "(вин. п.)", ты: "(вин. п.)", лар: "(мн. ч.)", дар: "(мн. ч.)", тар: "(мн. ч.)", м: "мой", ым: "мой", ң: "твой", ы: "его/её", бы: "?" },
};
const VOWEL_NORM = { е: "а", о: "а", ө: "а", и: "ы", у: "ы", ү: "ы", г: "к", д: "т" };
function endingMeaning(suf, lang) {
  const key = suf.replace(/[еоө]/g, "а").replace(/[иуү]/g, "ы");
  const table = ENDING[lang] || ENDING.en;
  for (const k of [suf, key, key.replace(/^[гкдт]/, (c) => VOWEL_NORM[c] || c)]) if (table[k]) return table[k];
  const base = key.replace(/^л/, "л").replace(/^[дт]/, "д");
  return table[base] || "";
}
let DICT = null;
function dict(lang) {
  if (DICT && DICT.lang === lang) return DICT.map;
  const map = new Map();
  for (const id of TOPIC_ORDER) for (const w of TOPICS[id].words) {
    const tr = first(lang === "ru" ? w[2] : w[1]);
    for (const k of alts(w[0])) { const n = normalize(k); if (!map.has(n)) map.set(n, tr); }
  }
  DICT = { lang, map };
  return map;
}
export function glossKy(word, lang = "en") {
  const m = dict(lang); const n = normalize(word);
  if (!n) return null;
  if (m.has(n)) return { stem: n, meaning: m.get(n) };
  for (const suf of SUFFIXES) {
    if (n.length - suf.length < 2 || !n.endsWith(suf)) continue;
    let stem = n.slice(0, -suf.length);
    const cands = [stem, stem.replace(/б$/, "п"), stem.replace(/г$/, "к"), stem + "ы", stem + "и"];
    for (const c of cands) if (m.has(c)) return { stem: c, meaning: m.get(c), ending: suf, endingMeaning: endingMeaning(suf, lang) };
  }
  return null;
}

// ── Exams: a mixed test over topics, easy → hard, randomised per student ──
// Each question uses a different word or sentence where possible.
export function buildExam(topicIds, { count = 20, lang = "en", sealed = false } = {}) {
  const P = pool(topicIds), all = allPool();
  const words = shuffle(P.words), sents = shuffle(P.sentences.filter(x => tokens(first(x.ky)).length >= 2));
  let wi = 0, si = 0;
  const W = () => words[wi++ % words.length], S = () => sents[si++ % sents.length];
  const recipe = [
    ["w", "choose-ky", 0.25], ["w", "choose-tr", 0.2], ["m", "match", 0.05],
    ["s", "choose-ky", 0.1], ["s", "build-tr", 0.1], ["s", "blank", 0.1],
    ["w", "type-tr", 0.08], ["s", "build-ky", 0.07], ["w", "type-ky", 0.05],
  ];
  const plan = [];
  for (const [what, kind, share] of recipe) {
    const n = Math.max(what === "m" ? (P.words.length >= 4 ? 1 : 0) : 1, Math.round(count * share));
    for (let i = 0; i < n && plan.length < count; i++) {
      if (what === "m") { if (P.words.length >= 4) plan.push(sealed ? makeExercise("choose-tr", W(), P, lang, all) : makeExercise("match", null, P, lang, all)); continue; }
      const item = what === "s" && sents.length ? S() : W();
      if (!item) continue;
      let k = kind;
      if (item.id.includes(":s") && tokens(first(item.ky)).length < 3 && (k.startsWith("build") || k === "blank")) k = "choose-tr";
      plan.push(makeExercise(k, item, P, lang, all));
    }
  }
  const reads = readingExercises(topicIds, lang);
  if (reads.length) plan.splice(Math.floor(plan.length / 2), 0, ...shuffle(reads).slice(0, 3));
  return plan.filter(Boolean);
}

// ── Spaced repetition (Leitner boxes): words come back just before you'd forget ──
const GAPS = [0, 1, 2, 4, 7, 14, 30]; // days until the next review, by box
export function srsUpdate(entry, ok, today) {
  const box = ok ? Math.min(GAPS.length - 1, (entry?.box || 0) + 1) : 1;
  const d = new Date(today); d.setDate(d.getDate() + GAPS[box]);
  return { box, due: d.toISOString().slice(0, 10) };
}
export function srsDue(srs, today) { return Object.entries(srs || {}).filter(([, e]) => e.due <= today).map(([id]) => id); }
export function wordById(id) {
  const [topic, w] = id.split(":w"); const t = TOPICS[topic]; const i = +w;
  if (!t || !t.words[i]) return null;
  const x = t.words[i]; return { ky: x[0], en: x[1], ru: x[2], id, topic };
}
// A review lesson built only from the given word ids.
export function buildReview(ids, { count = 12, lang = "en" } = {}) {
  const words = ids.map(wordById).filter(Boolean);
  if (!words.length) return [];
  const small = { words, sentences: [] }, all = allPool();
  const plan = [];
  const pickW = () => words[Math.floor(Math.random() * words.length)];
  let matched = 0;
  while (plan.length < Math.min(count, Math.max(6, words.length * 2))) {
    if (words.length >= 4 && matched < 1 && plan.length === Math.floor(count / 2)) { plan.push(makeExercise("match", null, small, lang, all)); matched++; continue; }
    const kind = plan.length < count / 3 ? "choose-ky" : plan.length < (count * 2) / 3 ? "choose-tr" : pick(["type-tr", "choose-tr"]);
    plan.push(makeExercise(kind, pickW(), small, lang, all));
  }
  return plan;
}

// ── Sealed exam papers: the questions a student sees, and a separate answer key that stays on the server ──
const SAFE = ["type", "prompt", "promptLang", "options", "optionLang", "bank", "lang", "before", "after", "hint", "text", "title"];
export function sealPaper(exercises) {
  const questions = [], key = [];
  for (const ex of exercises) {
    if (!ex || ex.type === "match" || ex.type === "intro" || ex.type === "tip") continue;
    const q = {};
    for (const f of SAFE) if (ex[f] != null) q[f] = ex[f];
    if (ex.type === "choose" || ex.type === "read" || ex.type === "blank") {
      key.push({ c: ex.answer, s: ex.type === "blank" ? `${ex.before} ${ex.options[ex.answer]} ${ex.after}`.trim() : ex.options[ex.answer] });
    } else {
      key.push({ a: [...new Set(ex.accepted.map(normalize))], typed: ex.type === "type", s: ex.accepted[0] });
    }
    questions.push(q);
  }
  return { questions, answer_key: key };
}

// Game question bank: ready-made multiple-choice questions for every topic, for quiz
// games such as Quoldek (quoldek.web.app). Deterministic, so the same topic always gives
// the same questions (games can cache them). Used by scripts/quoldek-feed.mjs to publish
// /api/quoldek/v1/*.json and by the teacher app's "Games" export.
import { UNITS, TOPICS, TOPIC_ORDER, topicUnit } from "./curriculum.js";
import { translit } from "./engine.js";

export const BANK_VERSION = "2.0";
const first = (s) => String(s).split("|")[0];
function rng(seed) { // mulberry32 seeded from a string
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h |= 0; h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const shuffleR = (a, r) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Every meaning of an entry (all alternatives, both languages, without "(polite)" notes),
// so a wrong option can never secretly be right too.
const core = (v) => v.toLowerCase().replace(/\([^)]*\)/g, "").replace(/[.,!?«»“”"]/g, "").replace(/\s+/g, " ").trim();
const meanings = (x) => new Set([...String(x.en).split("|"), ...String(x.ru).split("|")].map(core));
function distractors(item, pool, key, n, r) {
  const mine = meanings(item);
  const seen = new Set([core(first(item[key])), core(first(item.ky))]);
  const out = [];
  for (const x of shuffleR(pool, r)) {
    const v = core(first(x[key])), k = core(first(x.ky));
    if (seen.has(v) || seen.has(k) || [...meanings(x)].some(m => mine.has(m))) continue;
    seen.add(v); seen.add(k); out.push(x); if (out.length === n) break;
  }
  return out;
}

// One multiple-choice question; options stay in the same order for English and Russian.
function mc(id, kind, item, others, r) {
  const opts = shuffleR([item, ...others], r);
  const answer = opts.indexOf(item);
  const ky = first(item.ky);
  const q = { id, kind, answer, time_limit: 20, kyrgyz: ky, translit: translit(ky), audio_text: ky };
  if (kind === "meaning") {
    q.question = { en: `What does “${ky}” mean?`, ru: `Что значит «${ky}»?`, ky };
    q.options = { en: opts.map(o => first(o.en)), ru: opts.map(o => first(o.ru)) };
  } else if (kind === "say") {
    q.question = { en: `How do you say “${first(item.en)}” in Kyrgyz?`, ru: `Как по-кыргызски «${first(item.ru)}»?`, ky: null };
    q.options = { en: opts.map(o => first(o.ky)), ru: opts.map(o => first(o.ky)) };
    q.options_are_kyrgyz = true;
  } else {
    q.question = { en: `What does this sentence mean? “${ky}”`, ru: `Что значит это предложение? «${ky}»`, ky };
    q.options = { en: opts.map(o => first(o.en)), ru: opts.map(o => first(o.ru)) };
    q.time_limit = 30;
  }
  return q;
}

export function topicQuestions(id) {
  const t = TOPICS[id]; if (!t) return [];
  const u = topicUnit(id);
  const words = t.words.map((w, i) => ({ ky: w[0], en: w[1], ru: w[2], i }));
  const sents = t.sentences.map((s, i) => ({ ky: s[0], en: s[1], ru: s[2], i }));
  const unitWords = (u ? u.topics : [id]).flatMap(tid => TOPICS[tid].words.map(w => ({ ky: w[0], en: w[1], ru: w[2] })));
  const allSents = TOPIC_ORDER.flatMap(tid => TOPICS[tid].sentences.map(s => ({ ky: s[0], en: s[1], ru: s[2] })));
  const wpool = words.length >= 6 ? words : unitWords;
  const out = [];
  for (const w of words) {
    const r = rng(`${id}:w${w.i}`);
    out.push(mc(`${id}:w${w.i}:meaning`, "meaning", w, distractors(w, wpool, "en", 3, r), r));
    out.push(mc(`${id}:w${w.i}:say`, "say", w, distractors(w, wpool, "ky", 3, r), r));
  }
  for (const s of sents) {
    const r = rng(`${id}:s${s.i}`);
    out.push(mc(`${id}:s${s.i}:sentence`, "sentence", s, distractors(s, sents.length >= 4 ? sents : allSents, "en", 3, r), r));
  }
  return out;
}

export function topicMeta(id) {
  const t = TOPICS[id]; const u = topicUnit(id);
  return { id, title: { en: t.en, ru: t.ru, ky: t.ky }, unit: u ? { index: UNITS.indexOf(u) + 1, title: { en: u.en, ru: u.ru, ky: u.ky }, level: u.level } : null,
    level: u?.level || null, words: t.words.length, sentences: t.sentences.length, questions: t.words.length * 2 + t.sentences.length };
}

// Kahoot-style CSV (question, 4 answers, time limit, correct answer 1-4) for any quiz game.
export function toCSV(questions, lang = "en") {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = [["Question", "Answer 1", "Answer 2", "Answer 3", "Answer 4", "Time limit (sec)", "Correct answer (1-4)"]];
  for (const q of questions) { const o = q.options[lang]; rows.push([q.question[lang], o[0], o[1], o[2] ?? "", o[3] ?? "", q.time_limit, q.answer + 1]); }
  return "﻿" + rows.map(r => r.map(esc).join(",")).join("\n");
}

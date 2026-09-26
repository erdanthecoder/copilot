// Publishes the LearnKyrgyz game question bank as static JSON for quiz games (Quoldek etc.):
//   api/quoldek/v1/index.json            — every topic with its question count
//   api/quoldek/v1/topics/<topic>.json   — the questions of one topic
//   api/quoldek/v1/all.json              — everything in one file
// Run: node scripts/quoldek-feed.mjs  (the Firebase build runs it too)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TOPIC_ORDER, UNITS } from "../assets/js/curriculum.js";
import { topicQuestions, topicMeta, BANK_VERSION } from "../assets/js/gamebank.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "api/quoldek/v1");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, "topics"), { recursive: true });
const base = "https://learnkyrgyz.web.app/api/quoldek/v1";
const about = {
  name: "LearnKyrgyz question bank",
  version: BANK_VERSION,
  source: "https://learnkyrgyz.web.app",
  partner: "https://quoldek.web.app",
  languages: ["en", "ru"],
  format: "Each question: question.{en,ru}, options.{en,ru} (same order in both), answer = index of the correct option, time_limit in seconds, kyrgyz + translit + audio_text for the Kyrgyz word or sentence.",
};
const all = [];
const index = { ...about, units: UNITS.map((u, i) => ({ index: i + 1, id: u.id, level: u.level, title: { en: u.en, ru: u.ru, ky: u.ky }, topics: u.topics })), topics: [] };
for (const id of TOPIC_ORDER) {
  const meta = topicMeta(id);
  const questions = topicQuestions(id);
  fs.writeFileSync(path.join(out, "topics", `${id}.json`), JSON.stringify({ ...about, topic: meta, questions }));
  index.topics.push({ ...meta, url: `${base}/topics/${id}.json` });
  all.push({ topic: meta, questions });
}
fs.writeFileSync(path.join(out, "index.json"), JSON.stringify(index, null, 1));
fs.writeFileSync(path.join(out, "all.json"), JSON.stringify({ ...about, topics: all }));
console.log(`Quoldek feed: ${TOPIC_ORDER.length} topics, ${all.reduce((a, t) => a + t.questions.length, 0)} questions`);

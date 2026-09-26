// LearnKyrgyz version and "What's new" notes.
import { h, icon, mascot, modal } from "./ui.js";

export const VERSION = "2.0";
export const RELEASE = { date: "2026-09-26", label: { en: "26 September 2026", ru: "26 сентября 2026" } };

const NOTES = {
  student: {
    en: [
      ["speaker", "Real Kyrgyz pronunciation", "Words, sentences and dialogues are now spoken with a Kyrgyz voice that gets the deep к and г, ң, ө, ү, ы and stress right."],
      ["chat", "Better dialogues", "16 dialogues (6 new: bazaar, doctor, minibus…) and role-play: you speak one part, the app plays the other."],
      ["book", "Made to remember", "Tip cards, word recaps after every lesson and spaced review that brings words back before you forget them."],
      ["clock", "Unit tests & fair exams", "A timed test for every unit. Exams from your teacher are sealed: nobody sees the answers."],
      ["star", "Play on Quoldek", "Quiz games with friends on every topic, together with our partner Quoldek."],
    ],
    ru: [
      ["speaker", "Настоящее кыргызское произношение", "Слова, предложения и диалоги озвучивает кыргызский голос — с правильными к и г, ң, ө, ү, ы и ударением."],
      ["chat", "Диалоги стали лучше", "16 диалогов (6 новых: базар, врач, маршрутка…) и ролевая игра: вы говорите за одного, приложение — за другого."],
      ["book", "Чтобы запоминалось", "Подсказки перед темой, повтор слов после урока и интервальное повторение."],
      ["clock", "Тесты и честные экзамены", "Тест с таймером по каждому разделу. Экзамены учителя защищены — ответы никто не видит."],
      ["star", "Играйте на Quoldek", "Викторины с друзьями по всем темам вместе с нашим партнёром Quoldek."],
    ],
  },
  teacher: {
    en: [
      ["lock", "Sealed exams", "Each student gets their own paper; answers never reach their device and are marked on the server. One attempt, no answer leaks."],
      ["screen", "Full-screen exams", "Optional: leaving full screen, switching tab or app, or closing the page ends the exam with a 0. You can allow a retake."],
      ["list", "A4 worksheets & tests", "Printable sheets for any topic with an answer key, plus a ready test for every unit."],
      ["star", "Quiz games with Quoldek", "Turn any topic into a quiz game: download for Quoldek or as Kahoot-style CSV."],
      ["speaker", "Accurate Kyrgyz audio", "A built-in Kyrgyz voice replaces the old Turkish/Russian stand-ins; dialogues were proofread and extended."],
    ],
  },
};

// Show the notes once per version (per browser).
export function showWhatsNew(app, lang = "en", { force = false } = {}) {
  const key = `lk.seen.${app}`;
  try { if (!force && localStorage.getItem(key) === VERSION) return; localStorage.setItem(key, VERSION); } catch { if (!force) return; }
  const ru = lang === "ru" && NOTES[app].ru;
  const list = NOTES[app][ru ? "ru" : "en"];
  modal({ title: `LearnKyrgyz ${VERSION}`, wide: true, body: h("div", { class: "whats-new" },
    h("div", { class: "wn-head" }, mascot("cheer", 90), h("div", {}, h("div", { class: "wn-kicker" }, ru ? "Обновление" : "Update"), h("h2", {}, ru ? `Что нового в ${VERSION}` : `What's new in ${VERSION}`), h("p", { class: "muted small" }, RELEASE.label[ru ? "ru" : "en"]))),
    h("div", { class: "wn-list" }, list.map(([ic, t, d]) => h("div", { class: "wn-item" }, h("span", { class: "wn-ic" }, icon(ic)), h("div", {}, h("b", {}, t), h("p", {}, d)))))),
    actions: [{ label: ru ? "Отлично!" : "Let's go!", kind: app === "teacher" ? "purple" : "primary" }] });
}
export function versionBadge(app, lang) {
  return h("button", { class: "version-badge", title: lang === "ru" ? "Что нового" : "What's new", onClick: () => showWhatsNew(app, lang, { force: true }) }, `v${VERSION}`);
}

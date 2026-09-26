// LearnKyrgyz version and "What's new" notes.
import { h, icon, mascot, modal } from "./ui.js";
/* The collaboration animation. Imported for what it does rather than for what
   it returns: it is the same file, byte for byte, as the one Quoldek plays, so
   the two sites show the same thing rather than two takes on it. */
import "./duet.js";

export const VERSION = "2.0";
export const RELEASE = { date: "2026-09-26", label: { en: "26 September 2026", ru: "26 сентября 2026" } };

const NOTES = {
  student: {
    en: [
      ["speaker", "Real Kyrgyz pronunciation", "Words, sentences and dialogues are now spoken with a Kyrgyz voice that gets the deep к and г, ң, ө, ү, ы and stress right."],
      ["chat", "Better dialogues", "16 dialogues (6 new: bazaar, doctor, minibus…) and role-play: you speak one part, the app plays the other."],
      ["book", "Made to remember", "Tip cards, word recaps after every lesson and spaced review that brings words back before you forget them."],
      ["clock", "Unit tests & fair exams", "A timed test for every unit. Exams from your teacher are sealed: nobody sees the answers."],
      ["star", "Play your words as a game", "One press turns the topics you have just done into a quiz game for the class."],
      ["flag", "Eagle Hunt — limited edition", "A canyon in real 3D with a bird in it for everyone, made for this. Here until the end of December."],
    ],
    ru: [
      ["speaker", "Настоящее кыргызское произношение", "Слова, предложения и диалоги озвучивает кыргызский голос — с правильными к и г, ң, ө, ү, ы и ударением."],
      ["chat", "Диалоги стали лучше", "16 диалогов (6 новых: базар, врач, маршрутка…) и ролевая игра: вы говорите за одного, приложение — за другого."],
      ["book", "Чтобы запоминалось", "Подсказки перед темой, повтор слов после урока и интервальное повторение."],
      ["clock", "Тесты и честные экзамены", "Тест с таймером по каждому разделу. Экзамены учителя защищены — ответы никто не видит."],
      ["star", "Играйте своими словами", "Одно нажатие — и пройденные темы становятся викториной для класса."],
      ["flag", "Eagle Hunt — ограниченный выпуск", "Ущелье в настоящем 3D, и у каждого своя птица. До конца декабря."],
    ],
  },
  teacher: {
    en: [
      ["lock", "Sealed exams", "Each student gets their own paper; answers never reach their device and are marked on the server. One attempt, no answer leaks."],
      ["screen", "Full-screen exams", "Optional: leaving full screen, switching tab or app, or closing the page ends the exam with a 0. You can allow a retake."],
      ["list", "A4 worksheets & tests", "Printable sheets for any topic with an answer key, plus a ready test for every unit."],
      ["star", "Turn a topic into a game", "One press puts it on the board as a class quiz — or take it as a file."],
      ["flag", "Eagle Hunt — limited edition", "A canyon in real 3D with a bird in it for every child, made for this. Here until the end of December."],
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

  /* The two marks meeting, at the top of the notes.
   *
   * This release is the first time LearnKyrgyz and Quoldek have worked on the
   * same thing, and that is the sort of news that arrives as the fifth bullet
   * in a list and is read by nobody. It gets ten seconds and the top of the
   * page instead. If the animation cannot run — an old browser, a canvas that
   * will not start — the strip takes itself out and the notes are exactly what
   * they were. */
  const stage = h("canvas", { class: "wn-duet" });
  let stopDuet = null;

  modal({ title: `LearnKyrgyz ${VERSION}`, wide: true, body: h("div", { class: "whats-new" },
    stage,
    h("div", { class: "wn-head" }, mascot("cheer", 90), h("div", {}, h("div", { class: "wn-kicker" }, ru ? "Обновление" : "Update"), h("h2", {}, ru ? `Что нового в ${VERSION}` : `What's new in ${VERSION}`), h("p", { class: "muted small" }, RELEASE.label[ru ? "ru" : "en"]))),
    h("div", { class: "wn-list" }, list.map(([ic, t, d]) => h("div", { class: "wn-item" }, h("span", { class: "wn-ic" }, icon(ic)), h("div", {}, h("b", {}, t), h("p", {}, d)))))),
    actions: [{ label: ru ? "Отлично!" : "Let's go!", kind: app === "teacher" ? "purple" : "primary",
                onClick: () => { if (stopDuet) stopDuet(); return true; } }] });

  /* After the modal is in the document, so the canvas has a size to measure. */
  requestAnimationFrame(() => {
    if (!window.NovaDuet || !stage.isConnected) { stage.remove(); return; }
    try {
      stopDuet = window.NovaDuet.play(stage, {
        dark: document.documentElement.dataset.theme === "dark",
        line: ru ? "Первое сотрудничество" : "The first collaboration",
      });
    } catch { stage.remove(); }
  });
}
export function versionBadge(app, lang) {
  return h("button", { class: "version-badge", title: lang === "ru" ? "Что нового" : "What's new", onClick: () => showWhatsNew(app, lang, { force: true }) }, `v${VERSION}`);
}

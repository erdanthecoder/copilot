// Zamyatkin-style "matrix" dialogues: one short, natural dialogue listened to
// many times — first reading along with the translation, then shadowing line by
// line, then by ear only, and finally saying it yourself.
import { h, icon, mascot, sound, toast } from "./ui.js";
import { sayKy, sayKyAsync, stopSpeaking, voice } from "./speech.js";
import { translit, glossKy } from "./engine.js";
import { getLang } from "./i18n.js";

// Each line: [speaker, Kyrgyz, English, Russian]
export const DIALOGUES = [
  { id: "d1", level: "A1", en: "Getting to know each other", ru: "Знакомство", ky: "Таанышуу", speakers: ["Айбек", "Айжан"], lines: [
    ["А", "Салам!", "Hi!", "Привет!"],
    ["Б", "Салам! Кандайсың?", "Hi! How are you?", "Привет! Как дела?"],
    ["А", "Жакшы, рахмат. Сен кандайсың?", "Fine, thanks. How are you?", "Хорошо, спасибо. А ты как?"],
    ["Б", "Мен да жакшымын.", "I'm fine too.", "У меня тоже всё хорошо."],
    ["А", "Атың ким?", "What's your name?", "Как тебя зовут?"],
    ["Б", "Менин атым Айжан. Сенин атың ким?", "My name is Aizhan. What's your name?", "Меня зовут Айжан. А тебя как зовут?"],
    ["А", "Менин атым Айбек.", "My name is Aibek.", "Меня зовут Айбек."],
    ["Б", "Таанышканыма кубанычтамын!", "Nice to meet you!", "Приятно познакомиться!"],
  ] },
  { id: "d2", level: "A1", en: "Where are you from?", ru: "Откуда ты?", ky: "Кайдансың?", speakers: ["Айбек", "Айжан"], lines: [
    ["Б", "Сен кайдансың?", "Where are you from?", "Откуда ты?"],
    ["А", "Мен Оштонмун. Сенчи?", "I'm from Osh. And you?", "Я из Оша. А ты?"],
    ["Б", "Мен Бишкектенмин.", "I'm from Bishkek.", "Я из Бишкека."],
    ["А", "Бишкек чоң шаарбы?", "Is Bishkek a big city?", "Бишкек большой город?"],
    ["Б", "Ооба, Бишкек — чоң жана сулуу шаар.", "Yes, Bishkek is a big and beautiful city.", "Да, Бишкек — большой и красивый город."],
    ["А", "Мен Бишкекке баргым келет.", "I want to go to Bishkek.", "Я хочу поехать в Бишкек."],
    ["Б", "Кел, мейман бол!", "Come, be my guest!", "Приезжай, будь гостем!"],
  ] },
  { id: "d3", level: "A1", en: "At the shop", ru: "В магазине", ky: "Дүкөндө", speakers: ["Сатуучу", "Кардар"], lines: [
    ["А", "Кош келиңиз! Эмне керек?", "Welcome! What do you need?", "Добро пожаловать! Что вам нужно?"],
    ["Б", "Нан барбы?", "Do you have bread?", "Хлеб есть?"],
    ["А", "Ооба, бар. Канча керек?", "Yes, we do. How many do you need?", "Да, есть. Сколько нужно?"],
    ["Б", "Эки нан бериңизчи. Канча турат?", "Two loaves, please. How much is it?", "Дайте, пожалуйста, две булки. Сколько стоит?"],
    ["А", "Алтымыш сом.", "Sixty som.", "Шестьдесят сомов."],
    ["Б", "Мына, алыңыз.", "Here you are.", "Вот, возьмите."],
    ["А", "Рахмат! Дагы келиңиз.", "Thank you! Come again.", "Спасибо! Приходите ещё."],
  ] },
  { id: "d4", level: "A1", en: "My family", ru: "Моя семья", ky: "Үй-бүлө", speakers: ["Айбек", "Айжан"], lines: [
    ["А", "Сенин үй-бүлөң чоңбу?", "Is your family big?", "У тебя большая семья?"],
    ["Б", "Ооба. Атам, апам, эки агам жана бир сиңдим бар.", "Yes. I have my dad, my mom, two older brothers and one younger sister.", "Да. У меня есть папа, мама, два старших брата и одна младшая сестра."],
    ["А", "Атаң ким болуп иштейт?", "What does your dad do?", "Кем работает твой папа?"],
    ["Б", "Атам айдоочу. Апам мугалим.", "My dad is a driver. My mom is a teacher.", "Папа — водитель. Мама — учитель."],
    ["А", "Сенин итиң барбы?", "Do you have a dog?", "У тебя есть собака?"],
    ["Б", "Жок, бирок мышыгым бар.", "No, but I have a cat.", "Нет, но у меня есть кошка."],
  ] },
  { id: "d5", level: "A1", en: "At school", ru: "В школе", ky: "Мектепте", speakers: ["Мугалим", "Окуучу"], lines: [
    ["А", "Саламатсыздарбы, балдар!", "Hello, children!", "Здравствуйте, дети!"],
    ["Б", "Саламатсызбы, эже!", "Hello, teacher!", "Здравствуйте, учитель!"],
    ["А", "Бүгүн биз жаңы сөздөрдү үйрөнөбүз.", "Today we will learn new words.", "Сегодня мы будем учить новые слова."],
    ["Б", "Эже, кирсем болобу?", "Teacher, may I come in?", "Учитель, можно войти?"],
    ["А", "Кир, отур. Эмне үчүн кечиктиң?", "Come in, sit down. Why are you late?", "Входи, садись. Почему ты опоздал?"],
    ["Б", "Кечиресиз, автобус кечикти.", "Sorry, the bus was late.", "Извините, автобус опоздал."],
    ["А", "Макул. Китептерди ачкыла.", "All right. Open your books.", "Ладно. Откройте книги."],
  ] },
  { id: "d6", level: "A2", en: "At a café", ru: "В кафе", ky: "Кафеде", speakers: ["Официант", "Мейман"], lines: [
    ["А", "Кош келиңиздер! Эмне ичесиздер?", "Welcome! What would you like to drink?", "Добро пожаловать! Что будете пить?"],
    ["Б", "Эки чай бериңизчи.", "Two teas, please.", "Два чая, пожалуйста."],
    ["А", "Тамактан эмне аласыздар?", "What would you like to eat?", "Что будете есть?"],
    ["Б", "Бешбармак барбы?", "Do you have beshbarmak?", "Бешбармак есть?"],
    ["А", "Ооба, бар. Абдан даамдуу!", "Yes, we do. It's very tasty!", "Да, есть. Очень вкусный!"],
    ["Б", "Анда эки бешбармак.", "Then two beshbarmaks.", "Тогда два бешбармака."],
    ["А", "Тамагыңыздар таттуу болсун!", "Enjoy your meal!", "Приятного аппетита!"],
  ] },
  { id: "d7", level: "A2", en: "Asking the way", ru: "Как пройти?", ky: "Жол суроо", speakers: ["Айбек", "Аксакал"], lines: [
    ["А", "Кечиресиз, базар кайда?", "Excuse me, where is the market?", "Извините, где базар?"],
    ["Б", "Түз барыңыз, анан оңго бурулуңуз.", "Go straight, then turn right.", "Идите прямо, потом поверните направо."],
    ["А", "Алыспы?", "Is it far?", "Далеко?"],
    ["Б", "Жок, жакын. Беш мүнөт.", "No, it's close. Five minutes.", "Нет, близко. Пять минут."],
    ["А", "Чоң рахмат!", "Thank you very much!", "Большое спасибо!"],
    ["Б", "Эч нерсе эмес. Ак жол!", "You're welcome. Have a good trip!", "Не за что. Счастливого пути!"],
  ] },
  { id: "d8", level: "A2", en: "The weather", ru: "Погода", ky: "Аба ырайы", speakers: ["Айжан", "Апа"], lines: [
    ["А", "Бүгүн аба ырайы кандай?", "What's the weather like today?", "Какая сегодня погода?"],
    ["Б", "Суук. Кар жаап жатат.", "It's cold. It's snowing.", "Холодно. Идёт снег."],
    ["А", "Эртең кандай болот?", "What will it be like tomorrow?", "А завтра какая будет?"],
    ["Б", "Эртең күн ачык болот.", "Tomorrow it will be sunny.", "Завтра будет ясно."],
    ["А", "Жакшы! Анда тоого барабыз.", "Great! Then we'll go to the mountains.", "Отлично! Тогда поедем в горы."],
    ["Б", "Жылуу кийин!", "Dress warmly!", "Одевайся теплее!"],
  ] },
  { id: "d9", level: "A2", en: "A birthday", ru: "День рождения", ky: "Туулган күн", speakers: ["Айбек", "Айжан"], lines: [
    ["А", "Туулган күнүң менен!", "Happy birthday!", "С днём рождения!"],
    ["Б", "Чоң рахмат!", "Thank you very much!", "Большое спасибо!"],
    ["А", "Бул сага белек.", "This is a present for you.", "Это тебе подарок."],
    ["Б", "Кандай сулуу! Рахмат!", "How beautiful! Thank you!", "Какой красивый! Спасибо!"],
    ["А", "Канча жашка чыктың?", "How old are you now?", "Сколько тебе исполнилось?"],
    ["Б", "Он экиге чыктым.", "I turned twelve.", "Мне исполнилось двенадцать."],
    ["А", "Бактылуу бол!", "Be happy!", "Будь счастлива!"],
  ] },
  { id: "d10", level: "A2", en: "On the phone", ru: "По телефону", ky: "Телефондо", speakers: ["Айбек", "Айжан"], lines: [
    ["А", "Алло, Айжан! Саламатсыңбы?", "Hello, Aizhan! How are you?", "Алло, Айжан! Как ты?"],
    ["Б", "Салам, Айбек! Жакшы, сенчи?", "Hi, Aibek! Fine, and you?", "Привет, Айбек! Хорошо, а ты?"],
    ["А", "Мен да жакшы. Эртең эмне кыласың?", "I'm fine too. What are you doing tomorrow?", "Я тоже хорошо. Что ты делаешь завтра?"],
    ["Б", "Эртең бошмун.", "I'm free tomorrow.", "Завтра я свободна."],
    ["А", "Кинотеатрга баралыбы?", "Shall we go to the cinema?", "Пойдём в кинотеатр?"],
    ["Б", "Макул! Саат канчада?", "Okay! At what time?", "Давай! Во сколько?"],
    ["А", "Саат беште.", "At five o'clock.", "В пять часов."],
    ["Б", "Макул, көрүшкөнчө!", "Okay, see you!", "Хорошо, до встречи!"],
  ] },
];

export const LISTEN_GOAL = 30;
const STAGES = [
  { en: "Listen & read", ru: "Слушать и читать" },
  { en: "Shadowing", ru: "Повторять за диктором" },
  { en: "Ears only", ru: "Только на слух" },
  { en: "Say it", ru: "Сказать самому" },
];

function hintText(text, lang) {
  return text.split(/(\s+)/).map(part => {
    if (/^\s+$/.test(part) || !/[а-яёңөү]/i.test(part)) return part;
    const w = h("span", { class: "hint-word", onClick: (e) => {
      e.stopPropagation();
      document.querySelectorAll(".hint-pop").forEach(x => x.remove());
      const clean = part.replace(/[.,!?;:«»"“”—()]/g, "");
      sayKy(clean, { force: true });
      const g = glossKy(clean, lang);
      w.append(h("span", { class: "hint-pop" }, g ? [h("b", {}, g.meaning), g.ending ? h("span", { class: "hint-end" }, ` + -${g.ending}${g.endingMeaning ? " (" + g.endingMeaning + ")" : ""}`) : null] : translit(clean)));
    } }, part);
    return w;
  });
}

// opts: { dialogue, progress: { listens, stage }, onProgress(progress) }
export function openDialogue({ dialogue: d, progress = {}, onProgress }) {
  const lang = getLang(); const ru = lang === "ru"; const li = ru ? 3 : 2;
  const prog = { listens: progress.listens || 0, stage: progress.stage || 0 };
  let stage = prog.stage, playing = false, loop = false, speed = 0.82, stopFlag = false, current = -1;
  const revealed = new Set();

  const counter = h("span", { class: "dlg-count" });
  const stageBar = h("div", { class: "seg dlg-stages" });
  const linesEl = h("div", { class: "dlg-lines" });
  const playBtn = h("button", { class: "btn primary dlg-play", onClick: () => playing ? stop() : play() });
  const loopBtn = h("button", { class: "btn ghost sm", onClick: () => { loop = !loop; loopBtn.classList.toggle("on", loop); } }, icon("refresh"), ru ? "По кругу" : "Loop");
  const speedSeg = h("div", { class: "seg" }, [[0.7, "0.7×"], [0.82, "1×"], [0.95, "1.2×"]].map(([v, l]) => h("button", { class: v === speed ? "on" : "", onClick: (e) => { speed = v; [...speedSeg.children].forEach(b => b.classList.toggle("on", b === e.currentTarget)); } }, l)));
  const tip = h("div", { class: "dlg-tip" });
  const root = h("div", { class: "lesson dlg" },
    h("div", { class: "lesson-top" }, h("button", { class: "icon-btn", "aria-label": "Close", onClick: close }, icon("x")),
      h("div", { class: "grow" }, h("div", { class: "dlg-title" }, d.ky, h("span", { class: "muted" }, " · ", ru ? d.ru : d.en)), counter)),
    h("div", { class: "lesson-body" }, h("div", { class: "lesson-inner dlg-inner" }, stageBar, tip, linesEl)),
    h("div", { class: "lesson-foot" }, h("div", { class: "inner dlg-controls" }, h("div", { class: "row wrap" }, loopBtn, speedSeg), playBtn)));
  document.body.append(root);
  document.body.style.overflow = "hidden";
  root.addEventListener("click", (e) => { if (!e.target.closest(".hint-word")) root.querySelectorAll(".hint-pop").forEach(x => x.remove()); });

  function save() { onProgress && onProgress({ ...prog }); }
  function drawCounter() {
    const pct = Math.min(100, Math.round(100 * prog.listens / LISTEN_GOAL));
    counter.replaceChildren(h("span", { class: "mini-bar" }, h("i", { style: { width: pct + "%" } })), `${prog.listens}/${LISTEN_GOAL} ${ru ? "прослушиваний" : "listens"}`);
  }
  function drawStages() {
    stageBar.replaceChildren(...STAGES.map((s, i) => h("button", { class: stage === i ? "on" : "", onClick: () => { stop(); stage = i; prog.stage = Math.max(prog.stage, i); save(); revealed.clear(); draw(); } }, `${i + 1}. ${ru ? s.ru : s.en}`)));
    const tips = ru ? [
      "Слушайте диалог и читайте вместе с переводом. Нажмите на любое слово, чтобы узнать его значение. Слушайте много раз — по методу Замяткина цель в десятки повторений.",
      "После каждой фразы есть пауза — повторите фразу вслух, копируя интонацию.",
      "Текст скрыт. Слушайте и понимайте на слух. Нажмите на строку, чтобы подсмотреть.",
      "Смотрите на перевод и скажите фразу по-кыргызски. Затем нажмите, чтобы проверить.",
    ] : [
      "Listen to the dialogue and read along with the translation. Tap any word to see what it means. Listen many times — the Zamyatkin method aims for dozens of repeats.",
      "After each line there's a pause — say the line out loud, copying the rhythm and tone.",
      "The text is hidden. Listen and understand by ear. Tap a line to peek.",
      "Look at the translation and say the line in Kyrgyz. Then tap to check.",
    ];
    tip.replaceChildren(mascot(["happy", "wave", "think", "cheer"][stage], 64), h("p", {}, tips[stage]));
  }
  function draw() {
    drawStages(); drawCounter();
    playBtn.replaceChildren(icon(playing ? "x" : "play"), playing ? (ru ? "Стоп" : "Stop") : stage === 1 ? (ru ? "Начать повтор" : "Start shadowing") : stage === 3 ? (ru ? "Проверить всё" : "Play all") : (ru ? "Слушать диалог" : "Play dialogue"));
    linesEl.replaceChildren(...d.lines.map((ln, i) => {
      const who = ln[0] === "А" ? 0 : 1;
      const showKy = stage <= 1 || revealed.has(i);
      const showTr = stage === 0 || stage === 3 || revealed.has(i);
      const row = h("div", { class: "dlg-line s" + who + (current === i ? " now" : "") + (stage === 2 && !revealed.has(i) ? " hidden-text" : ""), onClick: () => {
        if (stage >= 2 && !revealed.has(i)) { revealed.add(i); draw(); sayKy(ln[1], { force: true }); }
      } },
        h("span", { class: "dlg-who" }, d.speakers[0][0] === d.speakers[1][0] ? d.speakers[who].slice(0, 2) : d.speakers[who][0]),
        h("div", { class: "dlg-bubble" },
          h("div", { class: "dlg-name" }, d.speakers[who]),
          showKy ? h("div", { class: "dlg-ky" }, hintText(ln[1], lang)) : h("div", { class: "dlg-ky blurred" }, stage === 3 ? (ru ? "Скажите по-кыргызски…" : "Say it in Kyrgyz…") : ln[1]),
          showKy ? h("div", { class: "dlg-tl" }, translit(ln[1])) : null,
          showTr ? h("div", { class: "dlg-tr" }, ln[li]) : null),
        h("button", { class: "icon-btn speak-btn", "aria-label": "Listen", onClick: (e) => { e.stopPropagation(); sayKy(ln[1], { force: true }); } }, icon("speaker")));
      return row;
    }));
  }

  async function play() {
    if (!voice.available()) toast(ru ? "На устройстве нет голоса — будет подсветка без звука" : "No voice on this device — lines will highlight silently");
    playing = true; stopFlag = false; draw();
    do {
      for (let i = 0; i < d.lines.length && !stopFlag; i++) {
        current = i; draw();
        const el = linesEl.children[i]; if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
        if (stage === 3) revealed.add(i);
        await sayKyAsync(d.lines[i][1], { rate: speed, pitch: d.lines[i][0] === "А" ? 0.95 : 1.2 });
        if (stopFlag) break;
        if (stage === 1) { // shadowing pause: time to repeat
          el && el.classList.add("your-turn");
          await wait(Math.max(1500, d.lines[i][1].length * 110 / speed));
          el && el.classList.remove("your-turn");
        } else await wait(350);
      }
      if (!stopFlag) { prog.listens++; save(); drawCounter(); if (prog.listens === LISTEN_GOAL) { sound.done(); toast(ru ? "Цель достигнута! Диалог освоен." : "Goal reached! Dialogue mastered.", "good"); } }
    } while (loop && !stopFlag);
    playing = false; current = -1; draw();
  }
  function stop() { stopFlag = true; playing = false; stopSpeaking(); current = -1; draw(); }
  const wait = (ms) => new Promise(r => { const t0 = Date.now(); const tick = () => (stopFlag || Date.now() - t0 >= ms) ? r() : setTimeout(tick, 50); tick(); });
  function close() { stop(); root.remove(); document.body.style.overflow = ""; }
  draw();
}

export function dialogueExplainer(ru) {
  return ru
    ? "Метод Замяткина («матрица»): берёте один короткий диалог и слушаете его много раз — сначала с текстом и переводом, потом повторяете за диктором, потом только на слух, и наконец говорите сами. Звук — синтезированный голос, близкий к кыргызскому произношению."
    : "The Zamyatkin “matrix” method: take one short dialogue and listen to it many times — first reading along with the translation, then repeating after the speaker, then by ear only, and finally saying it yourself. Audio uses a computer voice close to Kyrgyz pronunciation.";
}

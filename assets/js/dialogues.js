// Zamyatkin-style "matrix" dialogues: one short, natural dialogue listened to
// many times — first reading along with the translation, then shadowing line by
// line, then by ear only, and finally saying it yourself.
import { h, icon, mascot, sound, toast } from "./ui.js";
import { sayKy, sayKyAsync, stopSpeaking, voice, voiceInfo, ensureVoices } from "./speech.js";
import { runLesson } from "./lesson.js";
import { translit, glossKy, shuffle } from "./engine.js";
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
    ["Б", "Кел, сени конокко чакырам!", "Come — I invite you to be my guest!", "Приезжай, приглашаю тебя в гости!"],
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
    ["А", "Саламатсыңарбы, балдар!", "Hello, children!", "Здравствуйте, дети!"],
    ["Б", "Саламатсызбы, эжеке!", "Hello, teacher!", "Здравствуйте, учительница!"],
    ["А", "Отургула. Бүгүн жаңы сөздөрдү үйрөнөбүз.", "Sit down. Today we'll learn new words.", "Садитесь. Сегодня будем учить новые слова."],
    ["Б", "Эжеке, кечиресиз, дептеримди унутуп калдым.", "Teacher, sorry, I forgot my exercise book.", "Извините, я забыл тетрадь."],
    ["А", "Эч нерсе эмес. Мына, бул барак сага.", "Never mind. Here, this sheet is for you.", "Ничего страшного. Вот, этот лист тебе."],
    ["Б", "Рахмат, эжеке!", "Thank you, teacher!", "Спасибо!"],
    ["А", "Китептерди ачкыла. Он экинчи бет.", "Open your books. Page twelve.", "Откройте книги. Двенадцатая страница."],
  ] },
  { id: "d6", level: "A2", en: "At a café", ru: "В кафе", ky: "Кафеде", speakers: ["Официант", "Мейман"], lines: [
    ["А", "Кош келиңиздер! Эмне ичесиздер?", "Welcome! What would you like to drink?", "Добро пожаловать! Что будете пить?"],
    ["Б", "Эки чай бериңизчи.", "Two teas, please.", "Два чая, пожалуйста."],
    ["А", "Тамактан эмне аласыздар?", "What would you like to eat?", "Что будете есть?"],
    ["Б", "Бешбармак барбы?", "Do you have beshbarmak?", "Бешбармак есть?"],
    ["А", "Ооба, бар. Абдан даамдуу!", "Yes, we do. It's very tasty!", "Да, есть. Очень вкусный!"],
    ["Б", "Анда эки бешбармак бериңизчи.", "Then two beshbarmaks, please.", "Тогда два бешбармака, пожалуйста."],
    ["А", "Тамагыңыздар таттуу болсун!", "Enjoy your meal!", "Приятного аппетита!"],
  ] },
  { id: "d7", level: "A2", en: "Asking the way", ru: "Как пройти?", ky: "Жол суроо", speakers: ["Айбек", "Аксакал"], lines: [
    ["А", "Кечиресиз, базар кайда?", "Excuse me, where is the market?", "Извините, где базар?"],
    ["Б", "Түз барыңыз, анан оңго бурулуңуз.", "Go straight, then turn right.", "Идите прямо, потом поверните направо."],
    ["А", "Алыспы?", "Is it far?", "Далеко?"],
    ["Б", "Жок, жакын. Жөө беш мүнөт.", "No, it's close. Five minutes on foot.", "Нет, близко. Пять минут пешком."],
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
    ["А", "Мен да жакшымын. Эртең эмне кыласың?", "I'm fine too. What are you doing tomorrow?", "Я тоже хорошо. Что ты делаешь завтра?"],
    ["Б", "Эртең бошмун.", "I'm free tomorrow.", "Завтра я свободна."],
    ["А", "Кинотеатрга баралыбы?", "Shall we go to the cinema?", "Пойдём в кинотеатр?"],
    ["Б", "Макул! Саат канчада?", "Okay! At what time?", "Давай! Во сколько?"],
    ["А", "Саат беште.", "At five o'clock.", "В пять часов."],
    ["Б", "Макул, көрүшкөнчө!", "Okay, see you!", "Хорошо, до встречи!"],
  ] },
  { id: "d11", level: "A2", en: "At the bazaar", ru: "На базаре", ky: "Базарда", speakers: ["Сатуучу", "Айжан"], lines: [
    ["А", "Кел, карындашым! Эмне керек?", "Come over, sister! What do you need?", "Подходи, сестрёнка! Что нужно?"],
    ["Б", "Алма канча турат?", "How much are the apples?", "Сколько стоят яблоки?"],
    ["А", "Килосу жүз сом.", "A hundred som a kilo.", "Сто сомов за килограмм."],
    ["Б", "Кымбат экен. Сексенге бересизби?", "That's expensive. Will you sell for eighty?", "Дорого. Отдадите за восемьдесят?"],
    ["А", "Макул, сага сексенге берем. Канча кило?", "All right, eighty for you. How many kilos?", "Ладно, тебе за восемьдесят. Сколько килограммов?"],
    ["Б", "Эки кило бериңизчи.", "Two kilos, please.", "Дайте, пожалуйста, два килограмма."],
    ["А", "Мына. Дагы эмне керек?", "Here you go. Anything else?", "Вот. Что-нибудь ещё?"],
    ["Б", "Болду, рахмат!", "That's all, thank you!", "Всё, спасибо!"],
  ] },
  { id: "d12", level: "A2", en: "At the doctor", ru: "У врача", ky: "Доктурда", speakers: ["Доктур", "Бакыт"], lines: [
    ["А", "Саламатсызбы! Эмне болду?", "Hello! What's the matter?", "Здравствуйте! Что случилось?"],
    ["Б", "Башым ооруп жатат.", "I have a headache.", "У меня болит голова."],
    ["А", "Температураңыз барбы?", "Do you have a temperature?", "У вас есть температура?"],
    ["Б", "Ооба, кечээ кечинде температурам көтөрүлдү.", "Yes, my temperature went up last night.", "Да, вчера вечером поднялась температура."],
    ["А", "Тамагыңыз ооруйбу?", "Does your throat hurt?", "Горло болит?"],
    ["Б", "Бир аз ооруйт.", "A little.", "Немного болит."],
    ["А", "Сизге суук тийиптир. Көп чай ичип, эс алыңыз.", "You've caught a cold. Drink lots of tea and rest.", "Вы простыли. Пейте много чая и отдыхайте."],
    ["Б", "Рахмат, доктур!", "Thank you, doctor!", "Спасибо, доктор!"],
    ["А", "Тезирээк сакайып кетиңиз!", "Get well soon!", "Выздоравливайте скорее!"],
  ] },
  { id: "d13", level: "A2", en: "Free time", ru: "Свободное время", ky: "Бош убакыт", speakers: ["Айбек", "Айжан"], lines: [
    ["А", "Бош убактыңда эмне кыласың?", "What do you do in your free time?", "Что ты делаешь в свободное время?"],
    ["Б", "Китеп окуганды жакшы көрөм. Сенчи?", "I like reading books. And you?", "Люблю читать книги. А ты?"],
    ["А", "Мен футбол ойногонду жакшы көрөм.", "I like playing football.", "Я люблю играть в футбол."],
    ["Б", "Сен музыканы жакшы көрөсүңбү?", "Do you like music?", "Ты любишь музыку?"],
    ["А", "Ооба, абдан! Сен музыкалык аспапта ойной аласыңбы?", "Yes, very much! Can you play an instrument?", "Да, очень! Ты умеешь играть на музыкальном инструменте?"],
    ["Б", "Ооба, мен комуз чертем.", "Yes, I play the komuz.", "Да, я играю на комузе."],
    ["А", "Кандай сонун! Мага да үйрөтөсүңбү?", "How wonderful! Will you teach me too?", "Как здорово! Научишь и меня?"],
    ["Б", "Албетте!", "Of course!", "Конечно!"],
  ] },
  { id: "d14", level: "A2", en: "Visiting a family", ru: "В гостях", ky: "Конокто", speakers: ["Апа", "Айбек"], lines: [
    ["А", "Кош келдиң, балам! Төргө өт.", "Welcome, dear! Come and sit in the place of honour.", "Добро пожаловать, сынок! Проходи на почётное место."],
    ["Б", "Рахмат, апа. Кандайсыз?", "Thank you. How are you?", "Спасибо, апа. Как вы?"],
    ["А", "Жакшы, шүгүр. Чай ичесиңби?", "Fine, thank God. Will you have some tea?", "Хорошо, слава богу. Чай будешь?"],
    ["Б", "Ооба, ичем.", "Yes, I will.", "Да, буду."],
    ["А", "Мына, боорсок менен каймак ал.", "Here, have some boorsok with cream.", "Вот, бери боорсоки со сливками."],
    ["Б", "Абдан даамдуу экен!", "It's really delicious!", "Очень вкусно!"],
    ["А", "Тоюп ал, балам.", "Eat your fill, dear.", "Ешь досыта, сынок."],
    ["Б", "Рахмат, тойдум. Дасторконуңузга береке!", "Thank you, I'm full. Blessings on your table!", "Спасибо, я сыт. Пусть ваш стол будет щедрым!"],
  ] },
  { id: "d15", level: "A2", en: "On the minibus", ru: "В маршрутке", ky: "Маршруткада", speakers: ["Айжан", "Айдоочу"], lines: [
    ["А", "Бул маршрутка Ала-Тоо аянтына барабы?", "Does this minibus go to Ala-Too Square?", "Эта маршрутка идёт до площади Ала-Тоо?"],
    ["Б", "Ооба, барат. Отуруңуз.", "Yes, it does. Have a seat.", "Да, идёт. Садитесь."],
    ["А", "Жол кире канча?", "How much is the fare?", "Сколько стоит проезд?"],
    ["Б", "Жыйырма сом.", "Twenty som.", "Двадцать сомов."],
    ["А", "Мына, алыңыз. Аянтка жеткенде айтып коёсузбу?", "Here you are. Could you tell me when we reach the square?", "Вот, возьмите. Скажете, когда доедем до площади?"],
    ["Б", "Макул. … Аянтка келдик!", "Sure. … Here's the square!", "Хорошо. … Приехали, площадь!"],
    ["А", "Ушул жерден токтотуп коюңузчу. Рахмат!", "Please stop here. Thank you!", "Остановите здесь, пожалуйста. Спасибо!"],
  ] },
  { id: "d16", level: "A2", en: "My day", ru: "Мой день", ky: "Менин күнүм", speakers: ["Айбек", "Айжан"], lines: [
    ["А", "Эртең менен саат канчада турасың?", "What time do you get up in the morning?", "Во сколько ты встаёшь утром?"],
    ["Б", "Саат жетиде турам.", "I get up at seven.", "Я встаю в семь."],
    ["А", "Анан эмне кыласың?", "Then what do you do?", "А потом что делаешь?"],
    ["Б", "Жуунам, эртең мененки тамакты ичем, анан мектепке барам.", "I wash, have breakfast, then go to school.", "Умываюсь, завтракаю, потом иду в школу."],
    ["А", "Сабак саат канчада бүтөт?", "What time do lessons finish?", "Во сколько заканчиваются уроки?"],
    ["Б", "Саат экиде. Андан кийин үй тапшырмасын аткарам.", "At two. After that I do my homework.", "В два. После этого делаю домашнее задание."],
    ["А", "Кечинде эмне кыласың?", "What do you do in the evening?", "А вечером что делаешь?"],
    ["Б", "Үй-бүлөм менен кечки тамак ичем, анан уктайм.", "I have dinner with my family, then I sleep.", "Ужинаю с семьёй, потом ложусь спать."],
  ] },
];

export const LISTEN_GOAL = 30;
const STAGES = [
  { en: "Listen & read", ru: "Слушать и читать" },
  { en: "Shadowing", ru: "Повторять за диктором" },
  { en: "Ears only", ru: "Только на слух" },
  { en: "Say it", ru: "Сказать самому" },
  { en: "Check yourself", ru: "Проверь себя" },
];

// Quiz built from the dialogue: meanings of lines and "which reply fits?".
function dialogueQuiz(d, lang) {
  const li = lang === "ru" ? 3 : 2; const ru = lang === "ru";
  const L = d.lines; const out = [];
  const others = (i, col) => shuffle(L.map((x, j) => j).filter(j => j !== i && L[j][col] !== L[i][col])).slice(0, 3).map(j => L[j][col]);
  for (const i of shuffle(L.map((_, i) => i)).slice(0, 4)) {
    const opts = shuffle([L[i][li], ...others(i, li)]);
    out.push({ type: "choose", prompt: L[i][1], promptLang: "ky", options: opts, answer: opts.indexOf(L[i][li]), item: { id: `${d.id}:l${i}`, custom: true } });
  }
  for (const i of shuffle(L.map((_, i) => i).slice(0, -1)).slice(0, 3)) {
    const opts = shuffle([L[i + 1][1], ...others(i + 1, 1)]);
    out.push({ type: "choose", title: ru ? "Какой ответ подходит?" : "Which reply fits?", prompt: L[i][1], promptLang: "ky", options: opts, optionLang: "ky", answer: opts.indexOf(L[i + 1][1]), item: { id: `${d.id}:r${i}`, custom: true } });
  }
  for (const i of shuffle(L.map((_, i) => i)).slice(0, 3)) {
    const opts = shuffle([L[i][1], ...others(i, 1)]);
    out.push({ type: "choose", prompt: L[i][li], promptLang: lang, options: opts, optionLang: "ky", answer: opts.indexOf(L[i][1]), item: { id: `${d.id}:k${i}`, custom: true } });
  }
  return shuffle(out);
}

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
  let role = null; // stage 4 role-play: 0 or 1 = the learner says that person's lines
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
    stageBar.replaceChildren(...STAGES.map((s, i) => h("button", { class: stage === i ? "on" : "", onClick: () => {
      stop();
      if (i === 4) { runLesson({ exercises: dialogueQuiz(d, lang), mode: "practice", hearts: null, onDone: (res) => { if (res.acc >= 80) { prog.quiz = Math.max(prog.quiz || 0, res.acc); save(); } }, onQuit: () => {} }); return; }
      stage = i; prog.stage = Math.max(prog.stage, i); save(); revealed.clear(); draw();
    } }, `${i + 1}. ${ru ? s.ru : s.en}`)));
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
    const vi = voiceInfo();
    const roleRow = stage === 3 ? h("div", { class: "row wrap dlg-roles" }, h("b", { class: "small" }, ru ? "Ролевая игра — я говорю за:" : "Role-play — I speak as:"),
      [[null, ru ? "Никого (проверка)" : "Nobody (just check)"], [0, d.speakers[0]], [1, d.speakers[1]]].map(([r, l]) => h("button", { class: "btn sm " + (role === r ? "primary" : "ghost"), onClick: () => { role = r; stop(); draw(); } }, l))) : null;
    tip.replaceChildren(mascot(["happy", "wave", "think", "cheer"][stage], 64), h("div", {}, h("p", {}, tips[stage]),
      h("div", { class: "dlg-voice" }, icon("speaker"), vi ? `${ru ? "Голос" : "Voice"}: ${vi.label}` : (ru ? "На этом устройстве нет голосов для озвучки" : "This device has no speech voices")), roleRow));
    return;
  }
  function draw() {
    drawStages(); drawCounter();
    playBtn.replaceChildren(icon(playing ? "x" : "play"), playing ? (ru ? "Стоп" : "Stop") : stage === 1 ? (ru ? "Начать повтор" : "Start shadowing") : stage === 3 ? (role != null ? (ru ? "Начать ролевую игру" : "Start role-play") : (ru ? "Проверить всё" : "Play all")) : (ru ? "Слушать диалог" : "Play dialogue"));
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
    if (!voice.enabled) { voice.set(true); toast(ru ? "Озвучка включена" : "Voice turned on"); }
    playBtn.classList.add("loading");
    await ensureVoices();
    playBtn.classList.remove("loading");
    if (!voice.enabled) { voice.set(true); toast(ru ? "Озвучка включена" : "Voice turned on"); }
    if (!voice.available()) toast(ru ? "На устройстве нет голоса — будет подсветка без звука" : "No voice on this device — lines will highlight silently");
    playing = true; stopFlag = false; draw();
    do {
      for (let i = 0; i < d.lines.length && !stopFlag; i++) {
        current = i; draw();
        const el = linesEl.children[i]; if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
        const who = d.lines[i][0] === "А" ? 0 : 1;
        if (stage === 3 && role === who) { // your line: say it first, then hear the right version
          el && el.classList.add("your-turn");
          await wait(Math.max(2500, d.lines[i][1].length * 140 / speed));
          el && el.classList.remove("your-turn");
          if (stopFlag) break;
        }
        if (stage === 3) { revealed.add(i); draw(); }
        await sayKyAsync(d.lines[i][1], { rate: speed, speaker: d.lines[i][0] === "А" ? "A" : "B" });
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
    ? "Метод Замяткина («матрица»): берёте один короткий диалог и слушаете его много раз — сначала с текстом и переводом, потом повторяете за диктором, потом только на слух, и наконец говорите сами. Звук — синтезированный кыргызский голос (eSpeak NG) с правильным кыргызским произношением."
    : "The Zamyatkin “matrix” method: take one short dialogue and listen to it many times — first reading along with the translation, then repeating after the speaker, then by ear only, and finally saying it yourself. Audio is a computer-generated Kyrgyz voice (eSpeak NG) that follows real Kyrgyz pronunciation.";
}

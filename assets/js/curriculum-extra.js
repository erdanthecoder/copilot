// More LearnKyrgyz topics. Same format as curriculum.js.
// Reading topics also carry `passages`: a short Kyrgyz text with
// comprehension questions ([en, ru] pairs) for reading exercises.

export const EXTRA_UNITS = [
  { id: "u10", level: "A1", en: "Food & table", ru: "Еда и стол", ky: "Дасторкон", color: "#ff9600",
    topics: ["fruitveg", "kitchen", "restaurant"] },
  { id: "u11", level: "A1", en: "My day", ru: "Мой день", ky: "Менин күнүм", color: "#1cb0f6",
    topics: ["routine", "subjects", "ordinals", "dates", "math"] },
  { id: "u12", level: "A2", en: "Nature & space", ru: "Природа и космос", ky: "Жаратылыш жана аалам", color: "#58cc02",
    topics: ["birds", "landscape", "space"] },
  { id: "u13", level: "A2", en: "Describing people", ru: "Описание людей", ky: "Адамдар", color: "#ce82ff",
    topics: ["appearance", "character", "nations"] },
  { id: "u14", level: "A2", en: "Travel & talk", ru: "Путешествия и общение", ky: "Саякат жана баарлашуу", color: "#ff4b4b",
    topics: ["travel", "phone", "celebrate", "sports", "motion"] },
  { id: "u15", level: "A2", en: "Grammar toolkit", ru: "Грамматика", ky: "Грамматика", color: "#2b70c9",
    topics: ["imperative", "postpositions", "conjunctions", "adverbs", "need"] },
  { id: "u16", level: "B1", en: "Advanced grammar", ru: "Сложная грамматика", ky: "Татаал грамматика", color: "#a560e8",
    topics: ["conditional", "experience"] },
  { id: "u17", level: "B1", en: "Heritage", ru: "Наследие", ky: "Мурас", color: "#e5a000",
    topics: ["music", "holidays", "people"] },
  { id: "u18", level: "A1", en: "Reading room", ru: "Чтение", ky: "Окуу залы", color: "#00a36c",
    topics: ["read1", "read2", "read3", "read4", "read5", "read6"] },
];

export const EXTRA_TOPICS = {
  fruitveg: {
    en: "Fruit & vegetables", ru: "Фрукты и овощи", ky: "Жемиштер жана жашылчалар",
    tip: { en: "Kyrgyzstan is famous for its apricots (өрүк) and the walnut forests of Arslanbob.", ru: "Кыргызстан славится урюком (өрүк) и ореховыми лесами Арсланбапа." },
    words: [
      ["алма", "apple", "яблоко"], ["алмурут", "pear", "груша"], ["өрүк", "apricot", "абрикос|урюк"],
      ["жүзүм", "grapes|grape", "виноград"], ["дарбыз", "watermelon", "арбуз"], ["коон", "melon", "дыня"],
      ["чие", "cherry", "вишня"], ["кулпунай", "strawberry", "клубника"], ["жаңгак", "walnut|nut", "орех|грецкий орех"],
      ["лимон", "lemon", "лимон"], ["помидор", "tomato", "помидор"], ["бадыраң", "cucumber", "огурец"],
      ["капуста", "cabbage", "капуста"], ["картошка", "potato", "картофель|картошка"], ["сарымсак", "garlic", "чеснок"],
      ["калемпир", "pepper", "перец"],
    ],
    sentences: [
      ["Мен алманы жакшы көрөм.", "I love apples.|I like apples.", "Я люблю яблоки."],
      ["Базардан жүзүм сатып алдым.", "I bought grapes at the market.", "Я купил виноград на рынке.|Я купила виноград на рынке."],
      ["Дарбыз абдан таттуу.", "The watermelon is very sweet.", "Арбуз очень сладкий."],
      ["Арсланбапта жаңгак токою бар.", "There is a walnut forest in Arslanbob.", "В Арсланбапе есть ореховый лес."],
      ["Салатка помидор жана бадыраң салабыз.", "We put tomatoes and cucumbers in the salad.", "Мы кладём в салат помидоры и огурцы."],
    ],
  },

  kitchen: {
    en: "Kitchen & drinks", ru: "Кухня и напитки", ky: "Ашкана жана суусундуктар",
    tip: { en: "The дасторкон is the tablecloth spread for guests — “sitting at the дасторкон” means sharing a meal. Tea is served in a чыны (bowl-cup).", ru: "Дасторкон — скатерть, которую накрывают для гостей; «сесть за дасторкон» — разделить трапезу. Чай подают в чыны (пиала)." },
    words: [
      ["кофе", "coffee", "кофе"], ["шире", "juice", "сок"], ["айран", "ayran|yogurt drink", "айран"],
      ["чыны", "cup|bowl|piala", "пиала|чашка"], ["табак", "plate|dish", "тарелка|блюдо"], ["кашык", "spoon", "ложка"],
      ["бычак", "knife", "нож"], ["айры", "fork", "вилка"], ["казан", "cauldron|kazan|pot", "казан|котёл"],
      ["чайнек", "teapot|kettle", "чайник"], ["дасторкон", "tablecloth|dastorkon", "дастархан|скатерть"], ["бал", "honey", "мёд"],
    ],
    sentences: [
      ["Мага бир чыны чай куюп бериңизчи.", "Please pour me a cup of tea.", "Налейте мне, пожалуйста, пиалу чая."],
      ["Дасторконго отургула.", "Sit at the table.|Please sit at the table.", "Садитесь за стол."],
      ["Нанды бычак менен кес.", "Cut the bread with a knife.", "Режь хлеб ножом."],
      ["Казанда палоо бышып жатат.", "Plov is cooking in the kazan.", "В казане готовится плов."],
    ],
  },

  restaurant: {
    en: "At a café", ru: "В кафе", ky: "Кафеде",
    tip: { en: "Before a meal Kyrgyz people say Тамагыңыз таттуу болсун — “may your food be sweet”, like “bon appétit”.", ru: "Перед едой говорят Тамагыңыз таттуу болсун — «пусть еда будет сладкой», то есть «приятного аппетита»." },
    words: [
      ["кафе", "café|cafe", "кафе"], ["меню", "menu", "меню"], ["эсеп", "bill|check|account", "счёт"],
      ["буйрутма", "order", "заказ"], ["ачка", "hungry", "голодный"], ["тойдум", "I'm full|I am full", "я наелся|я сыт"],
      ["даамдуу", "tasty|delicious", "вкусный"], ["ачуу", "spicy|bitter", "острый|горький"], ["туздуу", "salty", "солёный"],
      ["таттуу", "sweet", "сладкий"],
    ],
    sentences: [
      ["Менюну бериңизчи.", "Please give me the menu.|The menu, please.", "Дайте, пожалуйста, меню."],
      ["Эсепти алып келиңизчи.", "Please bring the bill.|The bill, please.", "Принесите, пожалуйста, счёт."],
      ["Мен тойдум, рахмат.", "I'm full, thank you.|I am full, thanks.", "Я наелся, спасибо.|Я сыт, спасибо."],
      ["Эмне сунуштайсыз?", "What do you recommend?", "Что вы посоветуете?|Что вы рекомендуете?"],
      ["Тамагыңыз таттуу болсун!", "Enjoy your meal!|Bon appetit!", "Приятного аппетита!"],
    ],
  },

  routine: {
    en: "Daily routine", ru: "Распорядок дня", ky: "Күн тартиби",
    tip: { en: "In everyday Kyrgyz you “drink” a meal: тамак ичүү — to have a meal. Time: саат жетиде — at seven o'clock.", ru: "В разговорной речи еду «пьют»: тамак ичүү — поесть. Время: саат жетиде — в семь часов." },
    words: [
      ["ойгонуу", "to wake up|wake up", "просыпаться"], ["туруу", "to get up|get up|to stand", "вставать"],
      ["жуунуу", "to wash (oneself)|to wash", "умываться"], ["тиш жуу", "to brush teeth|brush teeth", "чистить зубы"],
      ["кийинүү", "to get dressed|get dressed", "одеваться"], ["эртең мененки тамак", "breakfast", "завтрак"],
      ["түшкү тамак", "lunch", "обед"], ["кечки тамак", "dinner|supper", "ужин"], ["эс алуу", "to rest|rest", "отдыхать"],
    ],
    sentences: [
      ["Мен саат жетиде турам.", "I get up at seven o'clock.|I get up at seven.", "Я встаю в семь часов."],
      ["Мен тишимди жууйм.", "I brush my teeth.", "Я чищу зубы."],
      ["Сабактан кийин мен эс алам.", "After lessons I rest.|I rest after school.", "После уроков я отдыхаю."],
      ["Кечинде үй тапшырманы аткарам.", "In the evening I do my homework.", "Вечером я делаю домашнее задание."],
      ["Мен саат ондо уктайм.", "I go to sleep at ten.|I sleep at ten o'clock.", "Я ложусь спать в десять."],
    ],
  },

  subjects: {
    en: "School subjects", ru: "Школьные предметы", ky: "Сабактар",
    tip: { en: "Language names: кыргыз тили, орус тили, англис тили. “In Kyrgyz” = кыргызча.", ru: "Названия языков: кыргыз тили, орус тили, англис тили. «По-кыргызски» — кыргызча." },
    words: [
      ["математика", "mathematics|maths|math", "математика"], ["кыргыз тили", "Kyrgyz language|Kyrgyz", "кыргызский язык"],
      ["орус тили", "Russian language|Russian", "русский язык"], ["англис тили", "English language|English", "английский язык"],
      ["тарых", "history", "история"], ["география", "geography", "география"], ["биология", "biology", "биология"],
      ["физика", "physics", "физика"], ["химия", "chemistry", "химия"], ["адабият", "literature", "литература"],
      ["дене тарбия", "physical education|PE", "физкультура"], ["музыка", "music", "музыка"],
    ],
    sentences: [
      ["Менин сүйүктүү сабагым — тарых.", "My favourite subject is history.|My favorite subject is history.", "Мой любимый предмет — история."],
      ["Бүгүн бизде математика бар.", "Today we have maths.|We have math today.", "Сегодня у нас математика."],
      ["Адабият сабагында биз Айтматовду окуйбуз.", "In literature class we read Aitmatov.", "На уроке литературы мы читаем Айтматова."],
    ],
  },

  ordinals: {
    en: "First, second, third", ru: "Первый, второй, третий", ky: "Иреттик сандар",
    tip: { en: "Add -нчы/-нчи/-нчу/-нчү (or -ынчы/-инчи/-унчу/-үнчү after a consonant): бир → биринчи, эки → экинчи, беш → бешинчи.", ru: "Порядковые числа: -нчы/-нчи/-нчу/-нчү (после согласной -ынчы/-инчи/-унчу/-үнчү): бир → биринчи, эки → экинчи, беш → бешинчи." },
    words: [
      ["биринчи", "first", "первый"], ["экинчи", "second", "второй"], ["үчүнчү", "third", "третий"],
      ["төртүнчү", "fourth", "четвёртый"], ["бешинчи", "fifth", "пятый"], ["алтынчы", "sixth", "шестой"],
      ["жетинчи", "seventh", "седьмой"], ["сегизинчи", "eighth", "восьмой"], ["тогузунчу", "ninth", "девятый"],
      ["онунчу", "tenth", "десятый"], ["акыркы", "last", "последний"], ["кабат", "floor|storey", "этаж"],
    ],
    sentences: [
      ["Мен бешинчи класста окуйм.", "I study in the fifth grade.|I am in fifth grade.", "Я учусь в пятом классе."],
      ["Бул менин биринчи сабагым.", "This is my first lesson.", "Это мой первый урок."],
      ["Биз үчүнчү кабатта жашайбыз.", "We live on the third floor.", "Мы живём на третьем этаже."],
      ["Ал жарышта биринчи болду.", "He came first in the race.|She came first in the race.", "Он занял первое место в соревновании.|Она пришла первой."],
    ],
  },

  dates: {
    en: "Dates & birthdays", ru: "Даты и дни рождения", ky: "Даталар",
    tip: { en: "Быйыл — this year, өткөн жылы — last year, келерки жылы — next year. Туулган күн — birthday (lit. “the day you were born”).", ru: "Быйыл — в этом году, өткөн жылы — в прошлом году, келерки жылы — в следующем году. Туулган күн — день рождения." },
    words: [
      ["туулган күн", "birthday", "день рождения"], ["быйыл", "this year", "в этом году"],
      ["өткөн жылы", "last year", "в прошлом году"], ["келерки жылы", "next year", "в следующем году"],
      ["жыл сайын", "every year", "каждый год"], ["ай сайын", "every month", "каждый месяц"],
      ["календарь", "calendar", "календарь"], ["жаш", "age|years old|young", "возраст|лет"],
    ],
    sentences: [
      ["Менин туулган күнүм мартта.", "My birthday is in March.", "Мой день рождения в марте."],
      ["Сен качан туулгансың?", "When were you born?", "Когда ты родился?|Когда ты родилась?"],
      ["Бүгүн кайсы күн?", "What day is it today?|What is the date today?", "Какой сегодня день?"],
      ["Быйыл биз Ошко барабыз.", "This year we will go to Osh.", "В этом году мы поедем в Ош."],
    ],
  },

  math: {
    en: "Maths in Kyrgyz", ru: "Математика по-кыргызски", ky: "Математика",
    tip: { en: "Эки кошуу үч барабар беш — two plus three equals five. Жарым — half, чейрек — quarter.", ru: "Эки кошуу үч барабар беш — два плюс три равно пять. Жарым — половина, чейрек — четверть." },
    words: [
      ["сан", "number", "число"], ["кошуу", "plus|to add|add", "плюс|прибавлять|сложение"],
      ["кемитүү", "minus|to subtract|subtract", "минус|вычитать|вычитание"], ["көбөйтүү", "to multiply|multiply|times", "умножать|умножение"],
      ["бөлүү", "to divide|divide", "делить|деление"], ["барабар", "equals|equal", "равно|равный"],
      ["жарым", "half", "половина"], ["чейрек", "quarter", "четверть"], ["эсеп", "sum|count|calculation", "счёт|задача"],
    ],
    sentences: [
      ["Эки кошуу үч барабар беш.", "Two plus three equals five.|Two plus three is five.", "Два плюс три равно пять."],
      ["Он кемитүү төрт барабар алты.", "Ten minus four equals six.|Ten minus four is six.", "Десять минус четыре равно шесть."],
      ["Онду экиге бөлсө, беш болот.", "Ten divided by two is five.", "Десять разделить на два — будет пять."],
      ["Жарым саат калды.", "Half an hour is left.|There is half an hour left.", "Осталось полчаса."],
    ],
  },

  birds: {
    en: "Birds & insects", ru: "Птицы и насекомые", ky: "Куштар жана курт-кумурскалар",
    tip: { en: "The шумкар (falcon) and бүркүт (golden eagle) are used in the Kyrgyz tradition of hunting with birds — саятчылык.", ru: "Шумкар (сокол) и бүркүт (беркут) используются в кыргызской соколиной охоте — саятчылык." },
    words: [
      ["торгой", "lark", "жаворонок"], ["карга", "crow", "ворона"], ["көгүчкөн", "pigeon|dove", "голубь"],
      ["үкү", "owl", "сова|филин"], ["ак куу", "swan", "лебедь"], ["шумкар", "falcon", "сокол"],
      ["чымын", "fly", "муха"], ["чиркей", "mosquito", "комар"], ["аары", "bee", "пчела"],
      ["көпөлөк", "butterfly", "бабочка"], ["кумурска", "ant", "муравей"], ["жылан", "snake", "змея"],
      ["бака", "frog", "лягушка"], ["таш бака", "turtle|tortoise", "черепаха"],
    ],
    sentences: [
      ["Аары бал жасайт.", "Bees make honey.|The bee makes honey.", "Пчела делает мёд.|Пчёлы делают мёд."],
      ["Көпөлөк гүлгө конду.", "The butterfly landed on the flower.", "Бабочка села на цветок."],
      ["Үкү түнү учат.", "The owl flies at night.", "Сова летает ночью."],
      ["Кумурскалар эмгекчил.", "Ants are hardworking.", "Муравьи трудолюбивые."],
    ],
  },

  landscape: {
    en: "Mountains & valleys", ru: "Горы и долины", ky: "Тоолор жана өрөөндөр",
    tip: { en: "A жайлоо is a high summer pasture: in summer herders take their animals and yurts up to the жайлоо.", ru: "Жайлоо — высокогорное летнее пастбище: летом чабаны поднимаются туда со скотом и юртами." },
    words: [
      ["өрөөн", "valley", "долина"], ["капчыгай", "gorge|canyon", "ущелье"], ["мөңгү", "glacier", "ледник"],
      ["шаркыратма", "waterfall", "водопад"], ["булак", "spring|stream", "родник|источник"], ["жайлоо", "summer pasture|jailoo", "джайлоо|летнее пастбище"],
      ["ашуу", "mountain pass|pass", "перевал"], ["аска", "cliff|rock", "скала"], ["адыр", "hill|hills|foothills", "холм|предгорье"],
      ["чөл", "desert", "пустыня"], ["арык", "canal|ditch", "арык|канал"],
    ],
    sentences: [
      ["Жайында малчылар жайлоого чыгышат.", "In summer herders go up to the pastures.", "Летом чабаны поднимаются на джайлоо."],
      ["Мөңгүлөр эрип жатат.", "The glaciers are melting.", "Ледники тают."],
      ["Бул булактын суусу таза.", "The water of this spring is clean.", "Вода в этом роднике чистая."],
      ["Ала-Арча капчыгайы Бишкекке жакын.", "Ala-Archa gorge is near Bishkek.", "Ущелье Ала-Арча недалеко от Бишкека."],
    ],
  },

  space: {
    en: "Sky & space", ru: "Небо и космос", ky: "Асман жана аалам",
    tip: { en: "Traditional star names: Темир казык (“iron stake”) is the North Star, Чолпон is Venus, and the Milky Way is Саманчынын жолу (“the straw-carrier's road”).", ru: "Традиционные названия: Темир казык («железный кол») — Полярная звезда, Чолпон — Венера, Млечный Путь — Саманчынын жолу («дорога соломщика»)." },
    words: [
      ["аалам", "universe", "вселенная"], ["космос", "space|cosmos", "космос"], ["планета", "planet", "планета"],
      ["Жер", "Earth", "Земля"], ["Күн", "Sun", "Солнце"], ["Ай", "Moon", "Луна"],
      ["жылдыз", "star", "звезда"], ["Темир казык", "North Star|Polaris", "Полярная звезда"], ["Чолпон", "Venus", "Венера"],
      ["Саманчынын жолу", "Milky Way", "Млечный Путь"], ["ракета", "rocket", "ракета"],
    ],
    sentences: [
      ["Жер Күндү айланат.", "The Earth goes around the Sun.|The Earth revolves around the Sun.", "Земля вращается вокруг Солнца."],
      ["Түнү асманда жылдыздар көп.", "At night there are many stars in the sky.", "Ночью на небе много звёзд."],
      ["Ай — Жердин табигый жолдошу.", "The Moon is the Earth's natural satellite.", "Луна — естественный спутник Земли."],
    ],
  },

  appearance: {
    en: "Appearance", ru: "Внешность", ky: "Келбет",
    tip: { en: "Height is described with бой (stature): узун бойлуу — tall, кыска бойлуу — short.", ru: "Рост описывают словом бой: узун бойлуу — высокий, кыска бойлуу — низкий." },
    words: [
      ["узун бойлуу", "tall", "высокий"], ["кыска бойлуу", "short (height)|short", "низкий|невысокий"],
      ["семиз", "fat|plump", "полный|толстый"], ["арык", "thin|slim", "худой"], ["сакал", "beard", "борода"],
      ["мурут", "moustache|mustache", "усы"], ["көз айнек", "glasses|spectacles", "очки"], ["келбеттүү", "handsome|good-looking", "статный|красивый"],
      ["сулуу", "beautiful|pretty", "красивый"],
    ],
    sentences: [
      ["Менин агам узун бойлуу.", "My older brother is tall.|My brother is tall.", "Мой старший брат высокий."],
      ["Ал көз айнек тагынат.", "He wears glasses.|She wears glasses.", "Он носит очки.|Она носит очки."],
      ["Анын чачы кара, көзү көк.", "Her hair is black and her eyes are blue.|His hair is black and his eyes are blue.", "У неё чёрные волосы и голубые глаза."],
      ["Чоң атамдын ак сакалы бар.", "My grandfather has a white beard.", "У моего дедушки белая борода."],
    ],
  },

  character: {
    en: "Character", ru: "Характер", ky: "Мүнөз",
    tip: { en: "Мүнөз means character. Many traits end in -луу/-дуу/-туу (“having …”): сабыр (patience) → сабырдуу (patient).", ru: "Мүнөз — характер. Многие черты оканчиваются на -луу/-дуу/-туу («обладающий …»): сабыр (терпение) → сабырдуу (терпеливый)." },
    words: [
      ["боорукер", "kind|kind-hearted", "добрый|отзывчивый"], ["адептүү", "polite|well-mannered", "воспитанный|вежливый"],
      ["чынчыл", "honest", "честный"], ["эмгекчил", "hardworking", "трудолюбивый"], ["жалкоо", "lazy", "ленивый"],
      ["тартынчаак", "shy", "застенчивый"], ["шайыр", "cheerful|merry", "весёлый"], ["кайраттуу", "brave|courageous", "смелый|мужественный"],
      ["сабырдуу", "patient", "терпеливый"], ["мүнөз", "character|personality", "характер"],
    ],
    sentences: [
      ["Менин досум абдан боорукер.", "My friend is very kind.", "Мой друг очень добрый."],
      ["Жалкоо болбо!", "Don't be lazy!", "Не ленись!|Не будь ленивым!"],
      ["Мугалимибиз сабырдуу.", "Our teacher is patient.", "Наш учитель терпеливый."],
      ["Ал чынчыл адам.", "He is an honest person.|She is an honest person.", "Он честный человек.|Она честный человек."],
    ],
  },

  nations: {
    en: "Countries & languages", ru: "Страны и языки", ky: "Өлкөлөр жана тилдер",
    tip: { en: "-ча/-че/-чо/-чө means “in (a language)”: кыргызча — in Kyrgyz, орусча — in Russian, англисче — in English.", ru: "-ча/-че/-чо/-чө — «по-…»: кыргызча — по-кыргызски, орусча — по-русски, англисче — по-английски." },
    words: [
      ["кыргыз", "Kyrgyz", "кыргыз"], ["орус", "Russian", "русский"], ["казак", "Kazakh", "казах"],
      ["өзбек", "Uzbek", "узбек"], ["тажик", "Tajik", "таджик"], ["кытай", "Chinese", "китаец|китайский"],
      ["түрк", "Turkish|Turk", "турок|турецкий"], ["немис", "German", "немец|немецкий"],
      ["кыргызча", "in Kyrgyz", "по-кыргызски"], ["орусча", "in Russian", "по-русски"], ["англисче", "in English", "по-английски"],
      ["Казакстан", "Kazakhstan", "Казахстан"], ["Өзбекстан", "Uzbekistan", "Узбекистан"], ["Кытай", "China", "Китай"],
    ],
    sentences: [
      ["Мен кыргызча жана орусча сүйлөйм.", "I speak Kyrgyz and Russian.", "Я говорю по-кыргызски и по-русски."],
      ["Сен кайсы тилде сүйлөйсүң?", "What language do you speak?|Which language do you speak?", "На каком языке ты говоришь?"],
      ["Анын досу Казакстандан.", "His friend is from Kazakhstan.|Her friend is from Kazakhstan.", "Его друг из Казахстана.|Её друг из Казахстана."],
      ["Кыргыз тили — түрк тилдеринин бири.", "Kyrgyz is one of the Turkic languages.", "Кыргызский язык — один из тюркских языков."],
    ],
  },

  travel: {
    en: "Travel & hotel", ru: "Путешествие и гостиница", ky: "Саякат жана мейманкана",
    tip: { en: "-ыңызчы makes a very polite request: Паспортуңузду көрсөтүңүзчү — could you show your passport, please.", ru: "-ыңызчы — очень вежливая просьба: Паспортуңузду көрсөтүңүзчү — покажите, пожалуйста, паспорт." },
    words: [
      ["саякат", "travel|trip|journey", "путешествие"], ["саякатчы", "traveller|traveler|tourist", "путешественник|турист"],
      ["аэропорт", "airport", "аэропорт"], ["паспорт", "passport", "паспорт"], ["чемодан", "suitcase", "чемодан"],
      ["жүк", "luggage|baggage|load", "багаж|груз"], ["чек ара", "border", "граница"], ["карта", "map|card", "карта"],
      ["бош", "free|empty|vacant", "свободный|пустой"],
    ],
    sentences: [
      ["Паспортуңузду көрсөтүңүзчү.", "Please show your passport.", "Покажите, пожалуйста, ваш паспорт."],
      ["Мейманканада бош бөлмө барбы?", "Is there a free room in the hotel?", "В гостинице есть свободный номер?"],
      ["Биз Ысык-Көлгө саякатка барабыз.", "We are going on a trip to Issyk-Kul.", "Мы едем путешествовать на Иссык-Куль."],
      ["Менин чемоданым кайда?", "Where is my suitcase?", "Где мой чемодан?"],
      ["Учак бир сааттан кийин учат.", "The plane leaves in one hour.|The plane takes off in an hour.", "Самолёт вылетает через час."],
    ],
  },

  phone: {
    en: "On the phone", ru: "По телефону", ky: "Телефон аркылуу",
    tip: { en: "Бош эмесмин — I'm busy (lit. “I am not free”). Кийинчерээк — a bit later.", ru: "Бош эмесмин — я занят (досл. «я не свободен»). Кийинчерээк — чуть позже." },
    words: [
      ["Алло", "hello (on the phone)|hello", "алло"], ["номер", "number", "номер"], ["жооп берүү", "to answer|answer", "отвечать"],
      ["бош эмес", "busy", "занят|занятой"], ["кийинчерээк", "later|a bit later", "позже|попозже"], ["угулбай жатат", "I can't hear|can't hear", "не слышно"],
    ],
    sentences: [
      ["Ким сүйлөп жатат?", "Who is speaking?|Who is this?", "Кто говорит?"],
      ["Мен азыр бош эмесмин.", "I am busy now.|I'm busy right now.", "Я сейчас занят.|Я сейчас занята."],
      ["Кийинчерээк чалам.", "I will call later.|I'll call later.", "Я позвоню позже."],
      ["Телефон номериң канча?", "What is your phone number?", "Какой у тебя номер телефона?"],
    ],
  },

  celebrate: {
    en: "Parties & gifts", ru: "Праздники и подарки", ky: "Той жана белектер",
    tip: { en: "Congratulations use “with”: Туулган күнүң менен! — Happy birthday! (lit. “with your birthday”).", ru: "Поздравления строятся с «менен» (с): Туулган күнүң менен! — С днём рождения!" },
    words: [
      ["майрам", "holiday|celebration", "праздник"], ["той", "feast|party|celebration", "той|праздник"],
      ["белек", "gift|present", "подарок"], ["куттуктоо", "to congratulate|congratulation", "поздравлять|поздравление"],
      ["чакыруу", "to invite|invitation", "приглашать|приглашение"], ["торт", "cake", "торт"], ["мейман", "guest", "гость"],
    ],
    sentences: [
      ["Туулган күнүң менен!", "Happy birthday!", "С днём рождения!"],
      ["Майрамыңыз менен!", "Happy holiday!|Happy holidays!", "С праздником!"],
      ["Мен сени тойго чакырам.", "I invite you to the party.|I invite you to the celebration.", "Я приглашаю тебя на праздник.|Я приглашаю тебя на той."],
      ["Сага белек алып келдим.", "I brought you a present.|I brought you a gift.", "Я принёс тебе подарок.|Я принесла тебе подарок."],
    ],
  },

  sports: {
    en: "Sports", ru: "Спорт", ky: "Спорт",
    tip: { en: "Күрөш is Kyrgyz wrestling; a балбан is a (strong) wrestler.", ru: "Күрөш — кыргызская борьба; балбан — борец, силач." },
    words: [
      ["спорт", "sport|sports", "спорт"], ["күрөш", "wrestling", "борьба"], ["балбан", "wrestler|strongman", "борец|силач"],
      ["жарыш", "competition|race", "соревнование|гонка"], ["жеңүү", "to win|win", "побеждать"], ["утулуу", "to lose|lose", "проигрывать"],
      ["машыгуу", "training|to train", "тренировка|тренироваться"], ["команда", "team", "команда"], ["топ", "ball|group", "мяч|группа"],
    ],
    sentences: [
      ["Биздин команда жеңди.", "Our team won.", "Наша команда победила."],
      ["Мен күн сайын машыгам.", "I train every day.", "Я тренируюсь каждый день."],
      ["Кыргыз балбандары күчтүү.", "Kyrgyz wrestlers are strong.", "Кыргызские борцы сильные."],
      ["Топту мага ыргыт.", "Throw the ball to me.", "Брось мне мяч."],
    ],
  },

  motion: {
    en: "Coming & going", ru: "Движение", ky: "Кыймыл этиштери",
    tip: { en: "Motion verbs take cases: бөлмөгө кирүү (enter the room — dative), үйдөн чыгуу (leave the house — ablative).", ru: "Глаголы движения требуют падежей: бөлмөгө кирүү (войти в комнату — дательный), үйдөн чыгуу (выйти из дома — исходный)." },
    words: [
      ["кирүү", "to enter|to come in|enter", "входить"], ["чыгуу", "to go out|to exit|to climb", "выходить|подниматься"],
      ["түшүү", "to go down|to get off", "спускаться|выходить (из транспорта)"], ["кайтуу", "to return|return", "возвращаться"],
      ["кетүү", "to leave|leave", "уходить|уезжать"], ["жетүү", "to arrive|to reach", "доходить|добираться"],
      ["учуу", "to fly|fly", "летать"], ["секирүү", "to jump|jump", "прыгать"],
    ],
    sentences: [
      ["Бөлмөгө кириңиз.", "Come into the room.|Please come in.", "Входите в комнату."],
      ["Кийинки аялдамада түшөм.", "I get off at the next stop.|I'll get off at the next stop.", "Я выхожу на следующей остановке."],
      ["Ал үйүнө кайтты.", "He returned home.|She returned home.", "Он вернулся домой.|Она вернулась домой."],
      ["Биз кечинде жеттик.", "We arrived in the evening.", "Мы добрались вечером.|Мы приехали вечером."],
    ],
  },

  imperative: {
    en: "Commands & “let's”", ru: "Повелительное наклонение", ky: "Буйрук ыңгай",
    tip: { en: "Bare stem = command to one friend (кел!), -ыңыз = polite (келиңиз), -гыла = to a group (келгиле). “Let's” = -алы/-йлу: баралы, ойнойлу. Negative: -ба/-бо: барба — don't go.", ru: "Основа — приказ другу (кел!), -ыңыз — вежливо (келиңиз), -гыла — группе (келгиле). «Давай» — -алы/-йлу: баралы, ойнойлу. Отрицание: -ба/-бо: барба — не ходи." },
    words: [
      ["кел", "come", "иди сюда|приходи"], ["келиңиз", "come (polite)|please come", "приходите|проходите"],
      ["келгиле", "come (all of you)|come, everyone", "приходите (все)|идите сюда"], ["тур", "stand up|get up", "встань"],
      ["кара", "look", "смотри"], ["ук", "listen", "слушай"], ["баралы", "let's go", "пойдём|пойдёмте"],
      ["ойнойлу", "let's play", "давай поиграем|давайте играть"], ["барба", "don't go", "не ходи"], ["коркпо", "don't be afraid", "не бойся"],
    ],
    sentences: [
      ["Бери келиңиз.", "Come here, please.|Please come here.", "Подойдите сюда, пожалуйста."],
      ["Эшикти жаппа.", "Don't close the door.", "Не закрывай дверь."],
      ["Кел, ойнойлу!", "Come on, let's play!|Come, let's play!", "Давай поиграем!"],
      ["Балдар, отургула.", "Children, sit down.|Kids, sit down.", "Дети, садитесь."],
      ["Мени ук.", "Listen to me.", "Послушай меня.|Слушай меня."],
    ],
  },

  postpositions: {
    en: "With, for, about", ru: "С, для, о", ky: "Жандоочтор",
    tip: { en: "Kyrgyz uses postpositions after the word: досум менен (with my friend), сен үчүн (for you), сабактан кийин (after class), кечке чейин (until evening).", ru: "Вместо предлогов — послелоги после слова: досум менен (с другом), сен үчүн (для тебя), сабактан кийин (после урока), кечке чейин (до вечера)." },
    words: [
      ["менен", "with|and", "с|и"], ["үчүн", "for|because of", "для|ради"], ["жөнүндө", "about", "о|про"],
      ["чейин", "until|up to|before", "до"], ["кийин", "after", "после"], ["мурун", "before", "до|перед"],
      ["аркылуу", "through|via", "через"], ["сыяктуу", "like|similar to", "как|подобно"], ["каршы", "against|opposite", "против|напротив"],
    ],
    sentences: [
      ["Мен досум менен барам.", "I am going with my friend.|I go with my friend.", "Я иду с другом."],
      ["Бул белек сен үчүн.", "This present is for you.|This gift is for you.", "Этот подарок для тебя."],
      ["Сабактан кийин жолугабыз.", "We'll meet after class.|We will meet after the lesson.", "Встретимся после урока."],
      ["Кечке чейин иштейм.", "I work until the evening.|I will work until evening.", "Я работаю до вечера."],
      ["Бул китеп Манас жөнүндө.", "This book is about Manas.", "Эта книга о Манасе."],
      ["Тамактан мурун колуңду жуу.", "Wash your hands before eating.|Wash your hands before the meal.", "Помой руки перед едой."],
    ],
  },

  conjunctions: {
    en: "And, but, because", ru: "И, но, потому что", ky: "Байламталар",
    tip: { en: "жана — and, бирок — but, же — or, анткени — because, ошондуктан — so/therefore, да/дагы — also.", ru: "жана — и, бирок — но, же — или, анткени — потому что, ошондуктан — поэтому, да/дагы — тоже." },
    words: [
      ["жана", "and", "и"], ["бирок", "but", "но"], ["же", "or", "или"], ["анткени", "because", "потому что"],
      ["ошондуктан", "so|therefore", "поэтому"], ["эгер", "if", "если"], ["да", "also|too", "тоже|и"], ["дагы", "also|again|more", "ещё|тоже"],
    ],
    sentences: [
      ["Мен чай же кофе ичем.", "I drink tea or coffee.", "Я пью чай или кофе."],
      ["Мен чарчадым, бирок иштеп жатам.", "I am tired, but I am working.|I'm tired but I'm working.", "Я устал, но работаю.|Я устала, но работаю."],
      ["Мен үйдө калдым, анткени жамгыр жаады.", "I stayed at home because it rained.", "Я остался дома, потому что шёл дождь."],
      ["Мен да барам.", "I will go too.|I'm going too.", "Я тоже пойду."],
      ["Ал акылдуу жана боорукер.", "He is smart and kind.|She is smart and kind.", "Он умный и добрый.|Она умная и добрая."],
    ],
  },

  adverbs: {
    en: "How & how often", ru: "Как и как часто", ky: "Тактоочтор",
    tip: { en: "Many adjectives work as adverbs unchanged: тез (fast) — тез чуркайт (runs fast). Frequency: дайыма, көбүнчө, кээде, сейрек, эч качан.", ru: "Многие прилагательные работают как наречия: тез (быстрый) — тез чуркайт (бегает быстро). Частота: дайыма, көбүнчө, кээде, сейрек, эч качан." },
    words: [
      ["тез", "quickly|fast", "быстро"], ["жай", "slowly", "медленно"], ["акырын", "quietly|slowly|gently", "тихо|потихоньку"],
      ["катуу", "loudly|hard|strongly", "громко|сильно"], ["абдан", "very", "очень"], ["өтө", "too|very", "слишком|очень"],
      ["көп", "a lot|many|much", "много"], ["аз", "little|few", "мало"], ["көбүнчө", "usually|mostly", "обычно|чаще всего"],
      ["сейрек", "rarely|seldom", "редко"],
    ],
    sentences: [
      ["Акырын сүйлөңүз.", "Speak quietly, please.|Speak quietly.", "Говорите тише."],
      ["Ал абдан тез чуркайт.", "He runs very fast.|She runs very fast.", "Он бегает очень быстро.|Она бегает очень быстро."],
      ["Мен сейрек кофе ичем.", "I rarely drink coffee.", "Я редко пью кофе."],
      ["Көбүнчө мен жөө барам.", "Usually I walk.|I usually go on foot.", "Обычно я хожу пешком."],
    ],
  },

  need: {
    en: "Must & need", ru: "Нужно и должен", ky: "Керек",
    tip: { en: "Керек = need/must. “I must go” = Мен барышым керек (verb + -ыш + possessive + керек). Болот — allowed; болбойт — not allowed.", ru: "Керек — нужно/надо. «Мне нужно идти» — Мен барышым керек. Болот — можно; болбойт — нельзя." },
    words: [
      ["керек", "need|must|necessary", "нужно|надо"], ["керек эмес", "not needed|no need", "не нужно|не надо"],
      ["зарыл", "necessary|essential", "необходимо|необходимый"], ["болот", "allowed|it's okay|possible", "можно"],
      ["болбойт", "not allowed|forbidden", "нельзя"], ["барышым керек", "I must go|I have to go", "мне нужно идти"],
    ],
    sentences: [
      ["Мен барышым керек.", "I have to go.|I must go.", "Мне нужно идти."],
      ["Сен окушуң керек.", "You need to study.|You must study.", "Тебе нужно учиться."],
      ["Бизге убакыт керек.", "We need time.", "Нам нужно время."],
      ["Мага жаңы дептер керек.", "I need a new notebook.", "Мне нужна новая тетрадь."],
      ["Бул жерде тамеки чегүүгө болбойт.", "Smoking is not allowed here.|No smoking here.", "Здесь нельзя курить."],
    ],
  },

  conditional: {
    en: "If… (-са)", ru: "Если… (-са)", ky: "Шарттуу ыңгай",
    tip: { en: "Add -са/-се/-со/-сө for “if”: барсам (if I go), келсең (if you come), болсо (if it is). Эгер at the start is optional.", ru: "Условие: -са/-се/-со/-сө: барсам (если я пойду), келсең (если ты придёшь), болсо (если будет). Эгер в начале необязательно." },
    words: [
      ["барсам", "if I go", "если я пойду"], ["келсең", "if you come", "если ты придёшь"], ["болсо", "if it is|if there is", "если будет|если есть"],
      ["жааса", "if it rains|if it falls", "если пойдёт (дождь, снег)"], ["билсем", "if I knew|if I know", "если бы я знал|если я узнаю"],
    ],
    sentences: [
      ["Эгер убактым болсо, келем.", "If I have time, I will come.", "Если у меня будет время, я приду."],
      ["Жамгыр жааса, үйдө калабыз.", "If it rains, we will stay at home.", "Если пойдёт дождь, мы останемся дома."],
      ["Сен келсең, мен кубанам.", "If you come, I will be happy.", "Если ты придёшь, я обрадуюсь."],
      ["Мүмкүн болсо, жардам бериңиз.", "If possible, please help.|Please help if possible.", "Если можно, помогите."],
    ],
  },

  experience: {
    en: "Have you ever…? (-ган)", ru: "Бывал ли ты…? (-ган)", ky: "Өткөн чактын -ган формасы",
    tip: { en: "-ган/-ген/-гон/-гөн describes experience or completed events: Мен Ошто болгонмун — I have been to Osh. Negative: жеген эмесмин — I have never eaten.", ru: "-ган/-ген/-гон/-гөн выражает опыт или совершённое действие: Мен Ошто болгонмун — я бывал в Оше. Отрицание: жеген эмесмин — я никогда не ел." },
    words: [
      ["болгонмун", "I have been", "я бывал|я был"], ["көргөнмүн", "I have seen", "я видел"], ["жеген эмесмин", "I have never eaten|I haven't eaten", "я не ел|я никогда не ел"],
      ["окуган китеп", "a book that was read|the book I read", "прочитанная книга"], ["барган", "gone|went|who went", "ходивший|побывавший"],
    ],
    sentences: [
      ["Мен Ошто болгонмун.", "I have been to Osh.", "Я бывал в Оше.|Я была в Оше."],
      ["Сен Ысык-Көлдө болгонсуңбу?", "Have you been to Issyk-Kul?|Have you ever been to Issyk-Kul?", "Ты бывал на Иссык-Куле?"],
      ["Мен бешбармак жеген эмесмин.", "I have never eaten beshbarmak.|I haven't eaten beshbarmak.", "Я никогда не ел бешбармак."],
      ["Бул мен окуган китеп.", "This is the book I read.", "Это книга, которую я читал.|Это книга, которую я прочитала."],
    ],
  },

  music: {
    en: "Music & instruments", ru: "Музыка и инструменты", ky: "Музыка жана аспаптар",
    tip: { en: "Stringed instruments are “plucked”: комуз чертүү — to play the komuz. A күү is an instrumental piece; an акын is an improvising poet-singer.", ru: "На струнных «щиплют»: комуз чертүү — играть на комузе. Күү — инструментальная пьеса; акын — поэт-импровизатор." },
    words: [
      ["аспап", "instrument", "инструмент"], ["комуз", "komuz", "комуз"], ["кыл кыяк", "kyl kyyak|bowed fiddle", "кыл кыяк"],
      ["темир комуз", "jaw harp|temir komuz", "темир комуз|варган"], ["чоор", "flute|choor", "чоор|флейта"], ["добулбас", "drum|dobulbas", "добулбас|барабан"],
      ["күү", "instrumental piece|melody", "кюй|инструментальная пьеса"], ["обон", "melody|tune", "мелодия"], ["акын", "akyn|poet-singer", "акын"],
    ],
    sentences: [
      ["Ал комузда күү чертет.", "He plays a tune on the komuz.|She plays a tune on the komuz.", "Он играет кюй на комузе.|Она играет кюй на комузе."],
      ["Темир комуз кичинекей аспап.", "The temir komuz is a small instrument.", "Темир комуз — маленький инструмент."],
      ["Мен ыр ырдаганды жакшы көрөм.", "I love singing songs.|I like to sing songs.", "Я люблю петь песни."],
    ],
  },

  holidays: {
    en: "National holidays", ru: "Государственные праздники", ky: "Улуттук майрамдар",
    tip: { en: "Independence Day (Эгемендүүлүк күнү) is on 31 August; Нооруз is on 21 March; Жеңиш күнү (Victory Day) is on 9 May.", ru: "День независимости (Эгемендүүлүк күнү) — 31 августа; Нооруз — 21 марта; Жеңиш күнү (День Победы) — 9 мая." },
    words: [
      ["Жаңы жыл", "New Year", "Новый год"], ["Эгемендүүлүк күнү", "Independence Day", "День независимости"],
      ["Жеңиш күнү", "Victory Day", "День Победы"], ["Нооруз", "Nooruz|Nowruz", "Нооруз|Навруз"],
      ["Орозо айт", "Eid al-Fitr|Orozo ait", "Орозо айт|Ураза-байрам"], ["Курман айт", "Eid al-Adha|Kurman ait", "Курман айт|Курбан-байрам"],
      ["Мугалимдер күнү", "Teachers' Day", "День учителя"], ["сүмөлөк", "sumolok|sumalak", "сумолок|сумаляк"],
    ],
    sentences: [
      ["Эгемендүүлүк күнү 31-августта белгиленет.", "Independence Day is celebrated on 31 August.|Independence Day is celebrated on August 31.", "День независимости отмечается 31 августа."],
      ["Жаңы жылыңыз менен!", "Happy New Year!", "С Новым годом!"],
      ["Ноорузда сүмөлөк бышырабыз.", "On Nooruz we cook sumolok.", "На Нооруз мы варим сумолок."],
    ],
  },

  people: {
    en: "Famous Kyrgyz", ru: "Известные кыргызы", ky: "Белгилүү кыргыздар",
    tip: { en: "Chingiz Aitmatov (1928–2008) wrote “Jamila” and “The Day Lasts More Than a Hundred Years”. Kurmanjan Datka (1811–1907) was the ruler of Alai.", ru: "Чингиз Айтматов (1928–2008) написал «Джамилю» и «И дольше века длится день». Курманжан датка (1811–1907) — правительница Алая." },
    words: [
      ["Чыңгыз Айтматов", "Chingiz Aitmatov", "Чингиз Айтматов"], ["Токтогул Сатылганов", "Toktogul Satylganov", "Токтогул Сатылганов"],
      ["Курманжан датка", "Kurmanjan Datka", "Курманжан датка"], ["Жусуп Баласагын", "Yusuf Balasaguni", "Жусуп Баласагын|Юсуф Баласагуни"],
      ["баатыр", "hero", "богатырь|герой"], ["белгилүү", "famous|well-known", "известный"], ["улуу", "great", "великий"],
      ["ханыша", "queen", "королева|царица"],
    ],
    sentences: [
      ["Чыңгыз Айтматов — улуу кыргыз жазуучусу.", "Chingiz Aitmatov is a great Kyrgyz writer.", "Чингиз Айтматов — великий кыргызский писатель."],
      ["Токтогул — белгилүү акын жана комузчу.", "Toktogul is a famous poet and komuz player.", "Токтогул — известный акын и комузист."],
      ["Курманжан датка — Алайдын ханышасы.", "Kurmanjan Datka is the queen of Alai.", "Курманжан датка — царица Алая."],
      ["Айтматовдун китептери көп тилге которулган.", "Aitmatov's books have been translated into many languages.", "Книги Айтматова переведены на многие языки."],
    ],
  },

  // ───────── Reading room ─────────
  read1: {
    en: "Read: My family", ru: "Чтение: Моя семья", ky: "Окуу: Менин үй-бүлөм",
    tip: { en: "Read the text, then answer. Tap “Show translation” only if you're stuck!", ru: "Прочитайте текст и ответьте. Нажимайте «Показать перевод», только если совсем трудно!" },
    words: [["сиңди", "younger sister", "младшая сестра"], ["дарыгер", "doctor", "врач"], ["жашайм", "I live", "я живу"], ["да", "also|too", "тоже"]],
    sentences: [
      ["Мен Бишкекте жашайм.", "I live in Bishkek.", "Я живу в Бишкеке."],
      ["Менин итим да бар.", "I also have a dog.|I have a dog too.", "У меня есть и собака.|У меня тоже есть собака."],
    ],
    passages: [{
      ky: "Менин атым Айжан. Мен он эки жаштамын. Мен Бишкекте жашайм. Менин үй-бүлөм чоң: атам, апам, агам жана сиңдим бар. Атам дарыгер, апам мугалим. Менин итим да бар. Анын аты Барс.",
      en: "My name is Aizhan. I am twelve years old. I live in Bishkek. My family is big: I have a father, a mother, an older brother and a younger sister. My father is a doctor, my mother is a teacher. I also have a dog. Its name is Bars.",
      ru: "Меня зовут Айжан. Мне двенадцать лет. Я живу в Бишкеке. У меня большая семья: папа, мама, старший брат и младшая сестра. Папа — врач, мама — учитель. У меня есть и собака. Её зовут Барс.",
      questions: [
        { q: ["Where does Aizhan live?", "Где живёт Айжан?"], options: [["In Bishkek", "В Бишкеке"], ["In Osh", "В Оше"], ["In Naryn", "В Нарыне"], ["In Talas", "В Таласе"]], answer: 0 },
        { q: ["How old is Aizhan?", "Сколько лет Айжан?"], options: [["12", "12"], ["10", "10"], ["15", "15"], ["20", "20"]], answer: 0 },
        { q: ["What is her mother's job?", "Кем работает её мама?"], options: [["Teacher", "Учитель"], ["Doctor", "Врач"], ["Driver", "Водитель"], ["Cook", "Повар"]], answer: 0 },
        { q: ["What is the dog's name?", "Как зовут собаку?"], options: [["Bars", "Барс"], ["Aizhan", "Айжан"], ["Aibek", "Айбек"], ["Manas", "Манас"]], answer: 0 },
      ],
    }],
  },

  read2: {
    en: "Read: My day", ru: "Чтение: Мой день", ky: "Окуу: Менин күнүм",
    tip: { en: "Look for time words: саат жетиде (at seven), сабактан кийин (after lessons), кечинде (in the evening).", ru: "Ищите слова времени: саат жетиде (в семь), сабактан кийин (после уроков), кечинде (вечером)." },
    words: [["турам", "I get up", "я встаю"], ["жуунам", "I wash", "я умываюсь"], ["уктайм", "I sleep|I go to sleep", "я сплю|ложусь спать"]],
    sentences: [
      ["Саат сегизде мектепке барам.", "At eight o'clock I go to school.|I go to school at eight.", "В восемь часов я иду в школу."],
      ["Сабактан кийин футбол ойнойм.", "After lessons I play football.", "После уроков я играю в футбол."],
    ],
    passages: [{
      ky: "Мен саат жетиде турам. Жуунам, тишимди жууйм. Эртең менен чай ичем, нан жейм. Саат сегизде мектепке барам. Сабактан кийин футбол ойнойм. Кечинде үй тапшырманы аткарам. Саат ондо уктайм.",
      en: "I get up at seven o'clock. I wash and brush my teeth. In the morning I drink tea and eat bread. At eight I go to school. After lessons I play football. In the evening I do my homework. At ten I go to sleep.",
      ru: "Я встаю в семь часов. Умываюсь, чищу зубы. Утром пью чай, ем хлеб. В восемь иду в школу. После уроков играю в футбол. Вечером делаю домашнее задание. В десять ложусь спать.",
      questions: [
        { q: ["When does the writer get up?", "Во сколько встаёт автор?"], options: [["At 7", "В 7"], ["At 8", "В 8"], ["At 9", "В 9"], ["At 10", "В 10"]], answer: 0 },
        { q: ["What does the writer drink in the morning?", "Что автор пьёт утром?"], options: [["Tea", "Чай"], ["Milk", "Молоко"], ["Kymyz", "Кымыз"], ["Juice", "Сок"]], answer: 0 },
        { q: ["What happens after lessons?", "Что происходит после уроков?"], options: [["Football", "Футбол"], ["Chess", "Шахматы"], ["Homework", "Домашнее задание"], ["Sleep", "Сон"]], answer: 0 },
        { q: ["When does the writer go to sleep?", "Когда автор ложится спать?"], options: [["At 10", "В 10"], ["At 8", "В 8"], ["At 7", "В 7"], ["At 12", "В 12"]], answer: 0 },
      ],
    }],
  },

  read3: {
    en: "Read: Issyk-Kul", ru: "Чтение: Иссык-Куль", ky: "Окуу: Ысык-Көл",
    tip: { en: "Ысык means “warm/hot”: the lake's name means “warm lake” because it does not freeze in winter.", ru: "Ысык — «тёплый, горячий»: название значит «тёплое озеро», потому что зимой оно не замерзает." },
    words: [["жайгашкан", "located|situated", "расположен"], ["тоңбойт", "does not freeze", "не замерзает"], ["жээк", "shore|coast", "берег"], ["ошондуктан", "therefore|so", "поэтому"]],
    sentences: [
      ["Кышында да көл тоңбойт.", "Even in winter the lake does not freeze.", "Даже зимой озеро не замерзает."],
      ["Жайында бул жакка көп саякатчылар келишет.", "In summer many travellers come here.|In summer many tourists come here.", "Летом сюда приезжает много туристов."],
    ],
    passages: [{
      ky: "Ысык-Көл — Кыргызстандагы эң чоң көл. Ал тоолордун арасында жайгашкан. Кышында да көл тоңбойт. Ошондуктан анын аты «Ысык-Көл». Жайында бул жакка көп саякатчылар келишет. Көлдүн жээгинде Чолпон-Ата шаары бар.",
      en: "Issyk-Kul is the biggest lake in Kyrgyzstan. It is located among the mountains. Even in winter the lake does not freeze. That is why its name is “Issyk-Kul” (warm lake). In summer many travellers come here. The town of Cholpon-Ata is on the shore of the lake.",
      ru: "Иссык-Куль — самое большое озеро в Кыргызстане. Оно расположено среди гор. Даже зимой озеро не замерзает. Поэтому его называют «Иссык-Куль» (тёплое озеро). Летом сюда приезжает много туристов. На берегу озера находится город Чолпон-Ата.",
      questions: [
        { q: ["Why is the lake called “Issyk-Kul”?", "Почему озеро называется «Иссык-Куль»?"], options: [["It does not freeze in winter", "Оно не замерзает зимой"], ["It is very deep", "Оно очень глубокое"], ["It is salty", "Оно солёное"], ["It is in a desert", "Оно в пустыне"]], answer: 0 },
        { q: ["Where is the lake located?", "Где находится озеро?"], options: [["Among the mountains", "Среди гор"], ["In a desert", "В пустыне"], ["Near the sea", "У моря"], ["In a city", "В городе"]], answer: 0 },
        { q: ["Which town is on the shore?", "Какой город на берегу?"], options: [["Cholpon-Ata", "Чолпон-Ата"], ["Osh", "Ош"], ["Talas", "Талас"], ["Batken", "Баткен"]], answer: 0 },
      ],
    }],
  },

  read4: {
    en: "Read: The yurt", ru: "Чтение: Юрта", ky: "Окуу: Боз үй",
    tip: { en: "Боз үй тигүү — to put up a yurt; жыюу — to take it down.", ru: "Боз үй тигүү — ставить юрту; жыюу — разбирать её." },
    words: [["салттуу", "traditional", "традиционный"], ["ыңгайлуу", "convenient|comfortable", "удобный"], ["тигүү", "to put up (a yurt)|to sew", "ставить (юрту)|шить"]],
    sentences: [
      ["Боз үй — кыргыздардын салттуу үйү.", "The yurt is the traditional home of the Kyrgyz.", "Юрта — традиционное жилище кыргызов."],
      ["Боз үйдүн үстүндө түндүк бар.", "There is a tunduk on top of the yurt.", "Наверху юрты есть тундук."],
    ],
    passages: [{
      ky: "Боз үй — кыргыздардын салттуу үйү. Аны тез тигип, тез жыйса болот. Ошондуктан ал көчмөндөр үчүн ыңгайлуу болгон. Боз үйдүн үстүндө түндүк бар. Түндүк Кыргызстандын желегинде да бар. Боз үйдүн ичинде шырдак жана тушкийиз болот.",
      en: "The yurt is the traditional home of the Kyrgyz. It can be put up and taken down quickly. That is why it was convenient for nomads. At the top of the yurt there is a tunduk. The tunduk is also on the flag of Kyrgyzstan. Inside the yurt there are shyrdaks and tush kiyiz.",
      ru: "Юрта — традиционное жилище кыргызов. Её можно быстро поставить и быстро разобрать. Поэтому она была удобна для кочевников. Наверху юрты есть тундук. Тундук изображён и на флаге Кыргызстана. Внутри юрты — шырдаки и тушкийизы.",
      questions: [
        { q: ["Why was the yurt convenient for nomads?", "Почему юрта была удобна кочевникам?"], options: [["It is quick to put up and take down", "Её быстро ставить и разбирать"], ["It is made of stone", "Она из камня"], ["It is very big", "Она очень большая"], ["It has many windows", "В ней много окон"]], answer: 0 },
        { q: ["What is at the top of the yurt?", "Что находится наверху юрты?"], options: [["The tunduk", "Тундук"], ["A flag", "Флаг"], ["A shyrdak", "Шырдак"], ["A komuz", "Комуз"]], answer: 0 },
        { q: ["Where else can you see the tunduk?", "Где ещё можно увидеть тундук?"], options: [["On the flag of Kyrgyzstan", "На флаге Кыргызстана"], ["On money only", "Только на деньгах"], ["On a kalpak", "На калпаке"], ["Nowhere", "Нигде"]], answer: 0 },
      ],
    }],
  },

  read5: {
    en: "Read: Nooruz", ru: "Чтение: Нооруз", ky: "Окуу: Нооруз",
    tip: { en: "Бири-бирин — each other. Теңелет — becomes equal.", ru: "Бири-бирин — друг друга. Теңелет — становится равным." },
    words: [["бири-бирин", "each other|one another", "друг друга"], ["теңелет", "becomes equal", "становится равным|уравнивается"], ["сүмөлөк", "sumolok", "сумолок"]],
    sentences: [
      ["Нооруз жазда белгиленет.", "Nooruz is celebrated in spring.", "Нооруз празднуют весной."],
      ["Адамдар бири-бирин куттукташат.", "People congratulate each other.", "Люди поздравляют друг друга."],
    ],
    passages: [{
      ky: "Нооруз — жаңы жылдын майрамы. Ал ар жылы 21-мартта белгиленет. Бул күнү күн менен түн теңелет. Адамдар сүмөлөк бышырып, бири-бирин куттукташат. Балдар ойношот, чоңдор той беришет.",
      en: "Nooruz is the holiday of the new year. It is celebrated every year on 21 March. On this day day and night become equal. People cook sumolok and congratulate each other. Children play, adults hold feasts.",
      ru: "Нооруз — праздник нового года. Его отмечают каждый год 21 марта. В этот день день и ночь становятся равными. Люди варят сумолок и поздравляют друг друга. Дети играют, взрослые устраивают той.",
      questions: [
        { q: ["When is Nooruz celebrated?", "Когда празднуют Нооруз?"], options: [["21 March", "21 марта"], ["1 January", "1 января"], ["31 August", "31 августа"], ["9 May", "9 мая"]], answer: 0 },
        { q: ["What happens to day and night?", "Что происходит с днём и ночью?"], options: [["They become equal", "Они становятся равными"], ["Night is longest", "Ночь самая длинная"], ["Day is longest", "День самый длинный"], ["Nothing", "Ничего"]], answer: 0 },
        { q: ["What do people cook?", "Что готовят люди?"], options: [["Sumolok", "Сумолок"], ["Plov", "Плов"], ["Boorsok", "Боорсоки"], ["Manty", "Манты"]], answer: 0 },
      ],
    }],
  },

  read6: {
    en: "Read: Manas", ru: "Чтение: Манас", ky: "Окуу: Манас",
    tip: { en: "Жатка айтуу — to recite from memory. The Manas trilogy is Манас → Семетей (his son) → Сейтек (his grandson).", ru: "Жатка айтуу — рассказывать наизусть. Трилогия: Манас → Семетей (сын) → Сейтек (внук)." },
    words: [["эпос", "epic", "эпос"], ["жатка", "by heart|from memory", "наизусть"], ["тизме", "list", "список"], ["небере", "grandson|grandchild", "внук"]],
    sentences: [
      ["«Манас» — кыргыз элинин улуу эпосу.", "“Manas” is the great epic of the Kyrgyz people.|Manas is the great epic of the Kyrgyz people.", "«Манас» — великий эпос кыргызского народа."],
      ["Эпосту манасчылар жатка айтышат.", "Manaschis recite the epic from memory.", "Манасчи рассказывают эпос наизусть."],
    ],
    passages: [{
      ky: "«Манас» — кыргыз элинин улуу эпосу. Ал Манас баатыр, анын уулу Семетей жана небереси Сейтек жөнүндө айтат. Эпосту манасчылар жатка айтышат. Эң белгилүү манасчылардын бири — Сагымбай Орозбаков. «Манас» ЮНЕСКОнун тизмесине кирген.",
      en: "“Manas” is the great epic of the Kyrgyz people. It tells about the hero Manas, his son Semetei and his grandson Seitek. Manaschis recite the epic from memory. One of the most famous manaschis is Sagymbai Orozbakov. “Manas” is included in UNESCO's list.",
      ru: "«Манас» — великий эпос кыргызского народа. Он рассказывает о богатыре Манасе, его сыне Семетее и внуке Сейтеке. Манасчи рассказывают эпос наизусть. Один из самых известных манасчи — Сагымбай Орозбаков. «Манас» внесён в список ЮНЕСКО.",
      questions: [
        { q: ["Who is Semetei?", "Кто такой Семетей?"], options: [["Manas's son", "Сын Манаса"], ["Manas's father", "Отец Манаса"], ["A manaschi", "Манасчи"], ["A city", "Город"]], answer: 0 },
        { q: ["How do manaschis tell the epic?", "Как манасчи рассказывают эпос?"], options: [["From memory", "Наизусть"], ["From a book", "По книге"], ["With pictures", "С картинками"], ["By singing only in English", "Только по-английски"]], answer: 0 },
        { q: ["Who is a famous manaschi?", "Кто известный манасчи?"], options: [["Sagymbai Orozbakov", "Сагымбай Орозбаков"], ["Chingiz Aitmatov", "Чингиз Айтматов"], ["Kurmanjan Datka", "Курманжан датка"], ["Seitek", "Сейтек"]], answer: 0 },
      ],
    }],
  },
};

// Dr Frost–style tree: every topic sits in one learning area.
export const AREAS = {
  vocab: { en: "Vocabulary", ru: "Лексика" },
  grammar: { en: "Grammar", ru: "Грамматика" },
  talk: { en: "Speaking & phrases", ru: "Речь и фразы" },
  culture: { en: "Culture & country", ru: "Культура и страна" },
  reading: { en: "Reading", ru: "Чтение" },
};
export const TOPIC_AREA = {
  alphabet: "vocab", greetings: "talk", pronouns: "grammar", polite: "talk", numbers1: "vocab", family: "vocab", body: "vocab",
  emotions: "vocab", professions: "vocab", have: "grammar", colors: "vocab", animals: "vocab", food: "vocab", home: "vocab",
  clothes: "vocab", numbers2: "vocab", days: "vocab", seasons: "vocab", time: "vocab", weather: "vocab", school: "vocab",
  places: "vocab", directions: "talk", transport: "vocab", shopping: "talk", verbs: "grammar", present: "grammar",
  continuous: "grammar", past: "grammar", future: "grammar", negation: "grammar", questions: "grammar", adjectives: "vocab",
  plurals: "grammar", possessive: "grammar", cases: "grammar", wantcan: "grammar", compare: "grammar", health: "talk",
  tech: "vocab", hobbies: "vocab", culture: "culture", geography: "culture", proverbs: "culture",
  fruitveg: "vocab", kitchen: "vocab", restaurant: "talk", routine: "vocab", subjects: "vocab", ordinals: "grammar",
  dates: "talk", math: "vocab", birds: "vocab", landscape: "vocab", space: "vocab", appearance: "vocab", character: "vocab",
  nations: "vocab", travel: "talk", phone: "talk", celebrate: "talk", sports: "vocab", motion: "grammar",
  imperative: "grammar", postpositions: "grammar", conjunctions: "grammar", adverbs: "grammar", need: "grammar",
  conditional: "grammar", experience: "grammar", music: "culture", holidays: "culture", people: "culture",
  read1: "reading", read2: "reading", read3: "reading", read4: "reading", read5: "reading", read6: "reading",
};

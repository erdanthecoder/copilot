// Third batch of LearnKyrgyz topics: home life, village & nomad life,
// traditions, real-life situations, classroom Kyrgyz, the map, more reading.

export const MORE_UNITS = [
  { id: "u23", level: "A1", en: "Classroom Kyrgyz", ru: "Кыргызский на уроке", ky: "Класстагы кыргыз тили", color: "#1cb0f6",
    topics: ["classroom", "permission", "pronouncases"] },
  { id: "u19", level: "A1", en: "Around the house", ru: "Дома", ky: "Үйдө", color: "#ff9600",
    topics: ["chores", "shapes", "opposites"] },
  { id: "u20", level: "A2", en: "Village & nomad life", ru: "Село и кочевая жизнь", ky: "Айыл жана көчмөн турмуш", color: "#58cc02",
    topics: ["plants", "farm", "nomad"] },
  { id: "u22", level: "A2", en: "Real life", ru: "Реальная жизнь", ky: "Турмуш", color: "#ff4b4b",
    topics: ["bazaar", "money", "work", "emergency"] },
  { id: "u21", level: "A2", en: "Kitchen & traditions", ru: "Кухня и традиции", ky: "Ашкана жана салт", color: "#ce82ff",
    topics: ["kgfood", "traditions", "friendship"] },
  { id: "u24", level: "B1", en: "Kyrgyzstan on the map", ru: "Кыргызстан на карте", ky: "Картадагы Кыргызстан", color: "#2b70c9",
    topics: ["compass", "bignumbers", "read7", "read8"] },
];

export const MORE_TOPICS = {
  classroom: {
    en: "Classroom phrases", ru: "Фразы на уроке", ky: "Класстагы сөздөр",
    tip: { en: "Teachers speak to the whole class with -гыла/-гүлө/-кыла: ачкыла (open), жазгыла (write), отургула (sit). Азамат! means “Well done!”.", ru: "К классу обращаются с -гыла/-гүлө/-кыла: ачкыла (откройте), жазгыла (пишите), отургула (садитесь). Азамат! — «Молодец!»." },
    words: [
      ["такта", "board|blackboard", "доска"], ["бор", "chalk", "мел"], ["өчүргүч", "eraser|rubber", "ластик|стёрка"],
      ["сызгыч", "ruler", "линейка"], ["барак", "page|sheet", "страница|лист"], ["көнүгүү", "exercise", "упражнение"],
      ["тапшырма", "task|assignment", "задание"], ["туура", "correct|right", "правильно|верно"], ["туура эмес", "incorrect|wrong", "неправильно|неверно"],
      ["Азамат!", "Well done!|Bravo!", "Молодец!"], ["даяр", "ready", "готов|готовый"],
    ],
    sentences: [
      ["Китептерди ачкыла.", "Open your books.|Open the books.", "Откройте книги."],
      ["Дептерге жазгыла.", "Write in your notebooks.", "Пишите в тетрадях."],
      ["Тактага чык.", "Come to the board.|Go to the board.", "Выйди к доске."],
      ["Ким даяр?", "Who is ready?", "Кто готов?"],
      ["Колуңарды көтөргүлө.", "Raise your hands.", "Поднимите руки."],
      ["Тынч отургула.", "Sit quietly.", "Сидите тихо."],
      ["Суроо барбы?", "Are there any questions?|Any questions?", "Есть вопросы?"],
      ["Сабак бүттү.", "The lesson is over.|The lesson has finished.", "Урок окончен."],
    ],
  },

  permission: {
    en: "May I…?", ru: "Можно…?", ky: "Уруксат суроо",
    tip: { en: "To ask permission: verb + -сам/-сем/-сом/-сөм + болобу? — Кирсем болобу? (May I come in?). Answers: Болот (yes, you may) / Болбойт (no, you may not).", ru: "Просьба о разрешении: глагол + -сам/-сем/-сом/-сөм + болобу? — Кирсем болобу? (Можно войти?). Ответы: Болот (можно) / Болбойт (нельзя)." },
    words: [
      ["уруксат", "permission", "разрешение"], ["болобу?", "is it allowed?|may I?|is it okay?", "можно?"],
      ["болот", "you may|it's allowed|okay", "можно"], ["болбойт", "you may not|not allowed", "нельзя"],
      ["кирсем", "if I come in", "если я войду"],
    ],
    sentences: [
      ["Кирсем болобу?", "May I come in?", "Можно войти?"],
      ["Отурсам болобу?", "May I sit down?", "Можно сесть?"],
      ["Суроо берсем болобу?", "May I ask a question?", "Можно задать вопрос?"],
      ["Суу ичсем болобу?", "May I drink some water?|May I drink water?", "Можно попить воды?"],
      ["Эртерээк кетсем болобу?", "May I leave early?|May I leave a bit early?", "Можно уйти пораньше?"],
      ["Албетте, болот.", "Of course, you may.|Of course.", "Конечно, можно."],
      ["Жок, болбойт.", "No, you may not.|No, it's not allowed.", "Нет, нельзя."],
    ],
  },

  pronouncases: {
    en: "Me, to me, from me", ru: "Меня, мне, от меня", ky: "Ат атоочтордун жөндөлүшү",
    tip: { en: "Pronouns take case endings too: мен → мага (to me), мени (me), менден (from me), менде (on me). сен → сага, сени, сенден. ал → ага, аны, андан.", ru: "Местоимения тоже склоняются: мен → мага (мне), мени (меня), менден (от меня), менде (у меня). сен → сага, сени, сенден. ал → ага, аны, андан." },
    words: [
      ["мага", "to me|me", "мне"], ["сага", "to you|you", "тебе"], ["ага", "to him|to her", "ему|ей"],
      ["бизге", "to us|us", "нам"], ["мени", "me", "меня"], ["сени", "you", "тебя"],
      ["аны", "him|her|it", "его|её"], ["менден", "from me", "от меня|у меня"], ["сенден", "from you", "от тебя|у тебя"],
    ],
    sentences: [
      ["Мага кара.", "Look at me.", "Посмотри на меня."],
      ["Мен сени күттүм.", "I waited for you.", "Я тебя ждал.|Я тебя ждала."],
      ["Ага айт.", "Tell him.|Tell her.", "Скажи ему.|Скажи ей."],
      ["Бизге жардам бериңиз.", "Please help us.|Help us, please.", "Помогите нам, пожалуйста."],
      ["Аны тааныйсыңбы?", "Do you know him?|Do you know her?", "Ты его знаешь?|Ты её знаешь?"],
      ["Менден эмне керек?", "What do you need from me?|What do you want from me?", "Что тебе от меня нужно?"],
    ],
  },

  chores: {
    en: "Housework", ru: "Домашние дела", ky: "Үй жумуштары",
    tip: { en: "-ып/-ип кой adds “go ahead and do it” to a request: Таштандыны чыгарып кой — take the rubbish out (please).", ru: "-ып/-ип кой придаёт просьбе оттенок «сделай уж»: Таштандыны чыгарып кой — вынеси мусор." },
    words: [
      ["тазалоо", "to clean|clean", "убирать|чистить"], ["шыпыруу", "to sweep|sweep", "подметать"],
      ["идиш жуу", "to wash the dishes|wash dishes", "мыть посуду"], ["кир жуу", "to do the laundry|do laundry", "стирать бельё|стирать"],
      ["үтүктөө", "to iron|iron", "гладить"], ["тамак бышыруу", "to cook|cook", "готовить еду|готовить"],
      ["жыйноо", "to tidy up|tidy", "прибирать|убирать"], ["таштанды", "rubbish|trash|garbage", "мусор"],
    ],
    sentences: [
      ["Мен бөлмөмдү жыйнадым.", "I tidied my room.", "Я убрал свою комнату.|Я убрала свою комнату."],
      ["Апам тамак бышырып жатат.", "My mom is cooking.|My mother is cooking.", "Мама готовит еду.|Мама готовит."],
      ["Таштандыны чыгарып кой.", "Take out the rubbish.|Take out the trash.", "Вынеси мусор."],
      ["Мен идиш жууйм.", "I wash the dishes.|I'll wash the dishes.", "Я мою посуду.|Я помою посуду."],
      ["Биз ишембиде үйдү тазалайбыз.", "We clean the house on Saturday.", "Мы убираем дом в субботу."],
    ],
  },

  shapes: {
    en: "Shapes & materials", ru: "Формы и материалы", ky: "Формалар жана материалдар",
    tip: { en: "“Made of” uses the ablative: жыгачтан жасалган — made of wood, кийизден — of felt.", ru: "«Сделан из» — исходный падеж: жыгачтан жасалган — сделан из дерева, кийизден — из войлока." },
    words: [
      ["тегерек", "circle|round", "круг|круглый"], ["төрт бурчтук", "rectangle|square|quadrilateral", "прямоугольник|четырёхугольник|квадрат"],
      ["үч бурчтук", "triangle", "треугольник"], ["темир", "iron|metal", "железо|металл"], ["жыгач", "wood|wooden", "дерево|деревянный"],
      ["айнек", "glass", "стекло"], ["кагаз", "paper", "бумага"], ["алтын", "gold", "золото"], ["күмүш", "silver", "серебро"],
      ["жибек", "silk", "шёлк"], ["кийиз", "felt", "войлок"], ["тери", "leather|skin", "кожа"],
    ],
    sentences: [
      ["Бул үстөл жыгачтан жасалган.", "This table is made of wood.", "Этот стол сделан из дерева."],
      ["Шырдак кийизден жасалат.", "A shyrdak is made of felt.", "Шырдак делают из войлока."],
      ["Айдын формасы тегерек.", "The shape of the moon is round.|The moon is round.", "Луна круглой формы.|Форма луны круглая."],
      ["Анын алтын шакеги бар.", "She has a gold ring.|He has a gold ring.", "У неё есть золотое кольцо."],
    ],
  },

  opposites: {
    en: "Opposites", ru: "Противоположности", ky: "Карама-каршы сөздөр",
    tip: { en: "Learn words in pairs: ачык / жабык (open / closed), эрте / кеч (early / late), толук / бош (full / empty).", ru: "Учите слова парами: ачык / жабык (открытый / закрытый), эрте / кеч (рано / поздно), толук / бош (полный / пустой)." },
    words: [
      ["ачык", "open", "открытый|открыто"], ["жабык", "closed|shut", "закрытый|закрыто"], ["эрте", "early", "рано"],
      ["кеч", "late", "поздно"], ["бай", "rich", "богатый"], ["кедей", "poor", "бедный"], ["кары", "old (person)|elderly", "старый|пожилой"],
      ["толук", "full", "полный"], ["бош", "empty|free", "пустой|свободный"], ["жумшак", "soft", "мягкий"],
      ["катуу", "hard|loud", "твёрдый|громкий"], ["кенен", "wide|spacious", "широкий|просторный"], ["тар", "narrow|tight", "узкий|тесный"],
    ],
    sentences: [
      ["Дүкөн ачык.", "The shop is open.|The store is open.", "Магазин открыт."],
      ["Банк жабык.", "The bank is closed.", "Банк закрыт."],
      ["Мен эрте турам, бирок кеч уктайм.", "I get up early, but I go to bed late.", "Я рано встаю, но поздно ложусь спать."],
      ["Бул жол тар.", "This road is narrow.", "Эта дорога узкая."],
      ["Стакан бош.", "The glass is empty.", "Стакан пустой."],
    ],
  },

  plants: {
    en: "Trees & plants", ru: "Деревья и растения", ky: "Дарактар жана өсүмдүктөр",
    tip: { en: "The Tian Shan spruce (карагай) and juniper (арча) cover Kyrgyzstan's mountain slopes; Ala-Archa gorge is named after the juniper.", ru: "Тянь-шаньская ель (карагай) и арча покрывают горные склоны; ущелье Ала-Арча названо в честь арчи." },
    words: [
      ["арча", "juniper", "арча|можжевельник"], ["карагай", "spruce|fir", "ель"], ["терек", "poplar", "тополь"],
      ["тал", "willow", "ива"], ["кайың", "birch", "берёза"], ["чөп", "grass|hay", "трава|сено"], ["жалбырак", "leaf", "лист"],
      ["тамыр", "root", "корень"], ["бутак", "branch", "ветка"], ["үрөн", "seed", "семя"], ["бак", "garden|orchard", "сад"],
      ["өсүмдүк", "plant", "растение"],
    ],
    sentences: [
      ["Тоодо карагайлар өсөт.", "Spruces grow in the mountains.", "В горах растут ели."],
      ["Күзүндө жалбырактар саргаят.", "In autumn the leaves turn yellow.", "Осенью листья желтеют."],
      ["Бакта алма дарактары көп.", "There are many apple trees in the garden.", "В саду много яблонь."],
      ["Гүлдөргө суу куй.", "Water the flowers.", "Полей цветы."],
    ],
  },

  farm: {
    en: "Village & farm", ru: "Село и хозяйство", ky: "Айыл чарба",
    tip: { en: "Kyrgyz has words for every young animal: козу (lamb), улак (kid), музоо (calf), кулун (foal), торпок (yearling calf).", ru: "Для каждого детёныша есть своё слово: козу (ягнёнок), улак (козлёнок), музоо (телёнок), кулун (жеребёнок), торпок (годовалый телёнок)." },
    words: [
      ["мал", "livestock|cattle", "скот"], ["короо", "yard|pen|courtyard", "двор|загон"], ["бакча", "vegetable garden|garden", "огород"],
      ["эгин", "crops|grain", "посевы|зерно"], ["буудай", "wheat", "пшеница"], ["арпа", "barley", "ячмень"], ["жүн", "wool", "шерсть"],
      ["козу", "lamb", "ягнёнок"], ["улак", "young goat|kid", "козлёнок"], ["музоо", "calf", "телёнок"], ["кулун", "foal", "жеребёнок"],
      ["жылкы", "horses|horse", "лошади|лошадь"],
    ],
    sentences: [
      ["Чоң атам мал багат.", "My grandfather keeps livestock.", "Мой дедушка держит скот."],
      ["Жазында козулар төрөлөт.", "Lambs are born in spring.", "Весной рождаются ягнята."],
      ["Бакчада картошка өстүрөбүз.", "We grow potatoes in the garden.", "Мы выращиваем картошку в огороде."],
      ["Кулун энесинин жанында.", "The foal is next to its mother.", "Жеребёнок рядом со своей матерью."],
    ],
  },

  nomad: {
    en: "Nomad life", ru: "Кочевая жизнь", ky: "Көчмөн турмуш",
    tip: { en: "A yurt is built from the кереге (lattice walls), уук (roof poles) and the түндүк (crown), covered with felt. Nomads moved between the кыштоо (winter camp) and the жайлоо (summer pasture).", ru: "Юрта собирается из кереге (решётчатые стены), уук (жерди купола) и тундука (венец), покрытых войлоком. Кочевники перекочёвывали между кыштоо (зимовкой) и жайлоо (летним пастбищем)." },
    words: [
      ["көч", "migration|move", "кочёвка|переезд"], ["кыштоо", "winter camp", "зимовка"], ["күздөө", "autumn pasture|autumn camp", "осеннее пастбище"],
      ["чабан", "shepherd", "чабан|пастух"], ["ээр", "saddle", "седло"], ["үзөңгү", "stirrup", "стремя"], ["камчы", "whip", "камча|плеть"],
      ["тизгин", "reins", "поводья"], ["аркан", "rope", "аркан|верёвка"], ["кереге", "yurt lattice wall|kerege", "кереге|решётка юрты"],
      ["уук", "yurt roof pole|uuk", "уук|жердь купола"],
    ],
    sentences: [
      ["Көчмөндөр жайында жайлоого көчүшкөн.", "In summer the nomads moved to the summer pastures.", "Летом кочевники откочёвывали на джайлоо."],
      ["Чабан койлорду жайып жүрөт.", "The shepherd is grazing the sheep.", "Чабан пасёт овец."],
      ["Боз үйдүн керегеси жыгачтан жасалат.", "The yurt's lattice wall is made of wood.", "Решётка юрты делается из дерева."],
      ["Жигит атка минди.", "The young man got on the horse.|The young man mounted the horse.", "Парень сел на коня."],
    ],
  },

  bazaar: {
    en: "At the bazaar", ru: "На базаре", ky: "Базарда",
    tip: { en: "Канчадан? asks the price per item or per kilo. Bargaining (соодалашуу) is normal at a Kyrgyz bazaar!", ru: "Канчадан? — «почём?» (за штуку или килограмм). Торговаться (соодалашуу) на кыргызском базаре — нормально!" },
    words: [
      ["канчадан", "how much each|how much per", "почём"], ["кило", "kilo|kilogram", "кило|килограмм"], ["тараза", "scales", "весы"],
      ["соодалашуу", "to bargain|bargaining", "торговаться"], ["кардар", "customer|buyer", "покупатель|клиент"], ["бышкан", "ripe|cooked", "спелый|готовый"],
      ["жаңы", "fresh|new", "свежий|новый"],
    ],
    sentences: [
      ["Бул алма канчадан?", "How much are these apples?|How much is this apple?", "Почём эти яблоки?"],
      ["Бир килосу жүз сом.", "One kilo is a hundred som.|It's a hundred som per kilo.", "Сто сомов за килограмм."],
      ["Арзандатып бериңизчи.", "Please give me a discount.|Could you make it cheaper?", "Уступите, пожалуйста.|Сделайте подешевле."],
      ["Эки кило бериңиз.", "Give me two kilos.|Two kilos, please.", "Дайте два килограмма."],
      ["Бул помидорлор жаңыбы?", "Are these tomatoes fresh?", "Эти помидоры свежие?"],
      ["Ош базары абдан чоң.", "Osh Bazaar is very big.", "Ошский базар очень большой."],
    ],
  },

  money: {
    en: "Money & bank", ru: "Деньги и банк", ky: "Акча жана банк",
    tip: { en: "The Kyrgyz som is divided into 100 тыйын. Айлык is a monthly salary.", ru: "Кыргызский сом делится на 100 тыйынов. Айлык — месячная зарплата." },
    words: [
      ["банк", "bank", "банк"], ["накталай акча", "cash", "наличные"], ["карыз", "debt|loan", "долг"],
      ["пайыз", "percent|interest", "процент"], ["үнөмдөө", "to save|save", "экономить|копить"], ["айлык", "salary|monthly pay", "зарплата"],
      ["тыйын", "tyiyn|coin", "тыйын|монета"], ["капчык", "wallet|purse", "кошелёк"], ["банкомат", "ATM|cash machine", "банкомат"],
    ],
    sentences: [
      ["Мен акча үнөмдөп жатам.", "I am saving money.", "Я коплю деньги."],
      ["Банкомат кайда?", "Where is the ATM?|Where is the cash machine?", "Где банкомат?"],
      ["Капчыгым үйдө калды.", "I left my wallet at home.|My wallet was left at home.", "Мой кошелёк остался дома."],
      ["Бир сом жүз тыйын.", "One som is one hundred tyiyn.", "Один сом — сто тыйынов."],
    ],
  },

  work: {
    en: "At work", ru: "На работе", ky: "Жумушта",
    tip: { en: "Иш and жумуш both mean “work/job”. Дем алыш is a day off or the weekend; өргүү is a holiday from work.", ru: "Иш и жумуш — «работа». Дем алыш — выходной; өргүү — отпуск." },
    words: [
      ["жумуш", "job|work", "работа"], ["кеңсе", "office", "офис|контора"], ["кызматкер", "employee|staff member", "сотрудник|работник"],
      ["жетекчи", "manager|boss|leader", "руководитель|начальник"], ["жолугушуу", "meeting", "встреча|совещание"], ["өргүү", "vacation|leave|holiday", "отпуск"],
      ["дем алыш", "day off|weekend", "выходной|выходные"], ["тажрыйба", "experience", "опыт"],
    ],
    sentences: [
      ["Мен кеңседе иштейм.", "I work in an office.", "Я работаю в офисе."],
      ["Эртең менин дем алышым.", "Tomorrow is my day off.", "Завтра у меня выходной."],
      ["Жетекчи жолугушууда.", "The manager is in a meeting.|The boss is in a meeting.", "Руководитель на совещании."],
      ["Мен жаңы жумуш издеп жатам.", "I am looking for a new job.", "Я ищу новую работу."],
      ["Жайында өргүүгө чыгам.", "I go on holiday in summer.|I will go on vacation in summer.", "Летом я иду в отпуск."],
    ],
  },

  emergency: {
    en: "Emergencies", ru: "Экстренные случаи", ky: "Өзгөчө кырдаал",
    tip: { en: "Абайла! — Watch out! / Be careful! Тез жардам (lit. “quick help”) is an ambulance.", ru: "Абайла! — Осторожно! Тез жардам (досл. «быстрая помощь») — скорая помощь." },
    words: [
      ["Жардам!", "Help!", "Помогите!"], ["өрт", "fire", "пожар"], ["милиция", "police", "милиция|полиция"],
      ["тез жардам", "ambulance", "скорая помощь"], ["коркунуч", "danger", "опасность"], ["кырсык", "accident", "авария|несчастный случай"],
      ["адашуу", "to get lost|get lost", "заблудиться"], ["жарадар", "injured|wounded", "раненый"], ["Абайла!", "Watch out!|Be careful!|Careful!", "Осторожно!|Берегись!"],
    ],
    sentences: [
      ["Тез жардам чакырыңыз!", "Call an ambulance!", "Вызовите скорую помощь!"],
      ["Мен адашып калдым.", "I am lost.|I got lost.", "Я заблудился.|Я заблудилась."],
      ["Менин телефонумду уурдап кетишти.", "My phone was stolen.|Someone stole my phone.", "У меня украли телефон."],
      ["Абайла, машина!", "Watch out, a car!|Careful, a car!", "Осторожно, машина!"],
      ["Жакын жерде оорукана барбы?", "Is there a hospital nearby?", "Поблизости есть больница?"],
    ],
  },

  kgfood: {
    en: "Kyrgyz dishes", ru: "Кыргызские блюда", ky: "Кыргыз тамактары",
    tip: { en: "Karakol is famous for ашлянфу (cold noodle soup); курут are dried salty yoghurt balls; максым and чалап are traditional drinks.", ru: "Каракол славится ашлянфу (холодный суп с лапшой); курут — сушёные солёные шарики из кисломолочного продукта; максым и чалап — традиционные напитки." },
    words: [
      ["манты", "manty|dumplings", "манты"], ["самса", "samsa", "самса"], ["лагман", "lagman", "лагман"], ["ашлянфу", "ashlyanfu", "ашлянфу"],
      ["куурдак", "kuurdak|fried meat", "куурдак"], ["чучук", "chuchuk|horse sausage", "чучук|конская колбаса"], ["курут", "kurut|dried yogurt balls", "курут"],
      ["максым", "maksym", "максым"], ["чалап", "chalap", "чалап"], ["каймак", "cream|sour cream", "сливки|сметана|каймак"],
      ["кесме", "noodles", "лапша"], ["талкан", "talkan|roasted flour", "талкан"],
    ],
    sentences: [
      ["Каракол ашлянфусу менен белгилүү.", "Karakol is famous for ashlyanfu.", "Каракол известен своим ашлянфу."],
      ["Курут — кургатылган сүт азыгы.", "Kurut is a dried dairy food.", "Курут — сушёный молочный продукт."],
      ["Жайында максым ичкенди жакшы көрөм.", "In summer I like drinking maksym.", "Летом я люблю пить максым."],
      ["Апам куурдак бышырды.", "My mom cooked kuurdak.", "Мама приготовила куурдак."],
    ],
  },

  traditions: {
    en: "Customs & celebrations", ru: "Обычаи и праздники", ky: "Каада-салттар",
    tip: { en: "Тушоо кесүү celebrates a child's first steps; бешик той celebrates a newborn's cradle; ашар is the whole village helping one family.", ru: "Тушоо кесүү — праздник первых шагов ребёнка; бешик той — праздник колыбели новорождённого; ашар — помощь всего села одной семье." },
    words: [
      ["үйлөнүү той", "wedding", "свадьба"], ["күйөө бала", "groom|son-in-law", "жених|зять"], ["келин", "bride|daughter-in-law", "невеста|невестка"],
      ["куда", "in-law (parent of spouse)|in-law", "сват"], ["бешик той", "cradle celebration", "бешик той|праздник колыбели"], ["тушоо кесүү", "first steps ceremony", "тушоо кесуу|праздник первых шагов"],
      ["ашар", "community help|ashar", "ашар|коллективная помощь"], ["салт", "tradition|custom", "традиция|обычай"], ["бата", "blessing", "благословение"],
    ],
    sentences: [
      ["Куттуу болсун!", "Congratulations!", "Поздравляю!|Поздравляем!"],
      ["Ак жол!", "Have a good journey!|Bon voyage!", "Счастливого пути!"],
      ["Аксакал бата берди.", "The elder gave a blessing.", "Аксакал дал благословение."],
      ["Ашарда айыл эли бирге иштейт.", "At an ashar the villagers work together.", "На ашаре жители села работают вместе."],
    ],
  },

  friendship: {
    en: "Friendship", ru: "Дружба", ky: "Достук",
    tip: { en: "A famous saying: Дос башка күн түшкөндө билинет — a friend is known when trouble comes.", ru: "Известная пословица: Дос башка күн түшкөндө билинет — друг познаётся в беде." },
    words: [
      ["дос", "friend", "друг"], ["достук", "friendship", "дружба"], ["ишеним", "trust", "доверие"], ["урмат", "respect", "уважение"],
      ["кечирим", "forgiveness", "прощение"], ["сыр", "secret", "секрет|тайна"], ["убада", "promise", "обещание"],
    ],
    sentences: [
      ["Ал менин эң жакын досум.", "He is my closest friend.|She is my closest friend.|He is my best friend.", "Он мой самый близкий друг."],
      ["Досуңа жардам бер.", "Help your friend.", "Помоги своему другу."],
      ["Мен убада берем.", "I promise.|I give my word.", "Я обещаю."],
      ["Кечирип кой.", "Forgive me.|Sorry.", "Прости меня.|Извини."],
      ["Дос башка күн түшкөндө билинет.", "A friend is known when trouble comes.|A friend in need is a friend indeed.", "Друг познаётся в беде."],
    ],
  },

  compass: {
    en: "North, south, east, west", ru: "Север, юг, восток, запад", ky: "Дүйнөнүн тараптары",
    tip: { en: "Түндүк means both “north” and the crown of the yurt. Kyrgyzstan borders Kazakhstan (north), China (east), Tajikistan (south) and Uzbekistan (west).", ru: "Түндүк — и «север», и венец юрты. Кыргызстан граничит с Казахстаном (север), Китаем (восток), Таджикистаном (юг) и Узбекистаном (запад)." },
    words: [
      ["түндүк", "north", "север"], ["түштүк", "south", "юг"], ["чыгыш", "east", "восток"], ["батыш", "west", "запад"],
      ["дүйнө", "world", "мир"], ["деңиз", "sea", "море"], ["океан", "ocean", "океан"], ["арал", "island", "остров"],
      ["материк", "continent|mainland", "материк|континент"], ["коңшу", "neighbour|neighbor", "сосед"],
    ],
    sentences: [
      ["Кыргызстандын түндүгүндө Казакстан жайгашкан.", "Kazakhstan lies to the north of Kyrgyzstan.", "На севере от Кыргызстана находится Казахстан."],
      ["Кытай чыгышта.", "China is in the east.|China is to the east.", "Китай на востоке."],
      ["Тажикстан түштүктө, Өзбекстан батышта.", "Tajikistan is in the south, Uzbekistan is in the west.", "Таджикистан на юге, Узбекистан на западе."],
      ["Кыргызстандын деңизи жок.", "Kyrgyzstan has no sea.", "У Кыргызстана нет моря."],
      ["Күн чыгыштан чыгат.", "The sun rises in the east.", "Солнце встаёт на востоке."],
    ],
  },

  bignumbers: {
    en: "Big numbers & years", ru: "Большие числа и годы", ky: "Чоң сандар жана жылдар",
    tip: { en: "Years are ordinal: 1991-жылы — in 1991 (lit. “in the 1991st year”). Say it: бир миң тогуз жүз токсон биринчи жылы.", ru: "Годы — порядковые: 1991-жылы — в 1991 году. Читается: бир миң тогуз жүз токсон биринчи жылы." },
    words: [
      ["он миң", "ten thousand", "десять тысяч"], ["жүз миң", "hundred thousand|one hundred thousand", "сто тысяч"],
      ["миллион", "million", "миллион"], ["миллиард", "billion", "миллиард"], ["эки миң", "two thousand", "две тысячи"],
      ["жылы", "in the year", "в году|году"], ["кылым", "century", "век"],
    ],
    sentences: [
      ["Кыргызстанда жети миллиондон ашык адам жашайт.", "More than seven million people live in Kyrgyzstan.", "В Кыргызстане живёт более семи миллионов человек."],
      ["Кыргызстан 1991-жылы эгемендүүлүккө ээ болгон.", "Kyrgyzstan became independent in 1991.", "Кыргызстан обрёл независимость в 1991 году."],
      ["Бул китеп жүз жыл мурун жазылган.", "This book was written a hundred years ago.", "Эта книга была написана сто лет назад."],
    ],
  },

  read7: {
    en: "Read: Bishkek", ru: "Чтение: Бишкек", ky: "Окуу: Бишкек",
    tip: { en: "Ашык means “more than”: бир миллиондон ашык — more than a million. Көрүнүп турат — can be seen.", ru: "Ашык — «более»: бир миллиондон ашык — более миллиона. Көрүнүп турат — виднеется." },
    words: [["ашык", "more than|over", "более|свыше"], ["көрүнүп турат", "can be seen|is visible", "виднеется|видно"], ["бак-дарак", "trees|greenery", "деревья|зелень"]],
    sentences: [
      ["Шаарда көп парктар бар.", "There are many parks in the city.", "В городе много парков."],
      ["Ала-Тоо аянты — шаардын борбордук аянты.", "Ala-Too Square is the city's central square.", "Площадь Ала-Тоо — центральная площадь города."],
    ],
    passages: [{
      ky: "Бишкек — Кыргызстандын борбору. Шаарда бир миллиондон ашык адам жашайт. Бишкектин түштүгүндө Ала-Тоо тоолору көрүнүп турат. Шаарда көп парктар жана бак-дарактар бар. Ала-Тоо аянты — шаардын борбордук аянты.",
      en: "Bishkek is the capital of Kyrgyzstan. More than a million people live in the city. To the south of Bishkek you can see the Ala-Too mountains. The city has many parks and trees. Ala-Too Square is the city's central square.",
      ru: "Бишкек — столица Кыргызстана. В городе живёт более миллиона человек. К югу от Бишкека виднеются горы Ала-Тоо. В городе много парков и деревьев. Площадь Ала-Тоо — центральная площадь города.",
      questions: [
        { q: ["How many people live in Bishkek?", "Сколько людей живёт в Бишкеке?"], options: [["More than a million", "Более миллиона"], ["About ten thousand", "Около десяти тысяч"], ["Seven million", "Семь миллионов"], ["A hundred thousand", "Сто тысяч"]], answer: 0 },
        { q: ["Which mountains can be seen to the south?", "Какие горы видны на юге?"], options: [["Ala-Too", "Ала-Тоо"], ["The Alps", "Альпы"], ["Pamir", "Памир"], ["None", "Никакие"]], answer: 0 },
        { q: ["What is Ala-Too Square?", "Что такое площадь Ала-Тоо?"], options: [["The central square", "Центральная площадь"], ["A park", "Парк"], ["A mountain", "Гора"], ["A market", "Рынок"]], answer: 0 },
      ],
    }],
  },

  read8: {
    en: "Read: Kok-boru", ru: "Чтение: Кок-бору", ky: "Окуу: Көк бөрү",
    tip: { en: "Улак here is the goat carcass the riders fight over; упай is a point. Эпчилдик means agility.", ru: "Улак здесь — туша козла, за которую борются всадники; упай — очко. Эпчилдик — ловкость." },
    words: [["атчан", "on horseback|mounted", "верхом"], ["упай", "point|score", "очко"], ["эпчилдик", "agility|dexterity", "ловкость"], ["талашуу", "to fight over|to compete for", "бороться за|оспаривать"]],
    sentences: [
      ["Эки команда улакты талашат.", "Two teams fight over the ulak.", "Две команды борются за улак."],
      ["Бул оюн кайраттуулукту талап кылат.", "This game requires courage.", "Эта игра требует смелости."],
    ],
    passages: [{
      ky: "Көк бөрү — кыргыздардын байыркы оюну. Аны атчан ойношот. Эки команда улакты талашат. Улакты каршы жактын казанына таштаган команда упай алат. Бул оюн күчтү, эпчилдикти жана кайраттуулукту талап кылат.",
      en: "Kok-boru is an ancient game of the Kyrgyz. It is played on horseback. Two teams fight over the ulak. The team that throws the ulak into the other side's kazan (goal) gets a point. This game requires strength, agility and courage.",
      ru: "Кок-бору — древняя игра кыргызов. В неё играют верхом. Две команды борются за улак. Команда, забросившая улак в казан (ворота) соперника, получает очко. Эта игра требует силы, ловкости и смелости.",
      questions: [
        { q: ["How is kok-boru played?", "Как играют в кок-бору?"], options: [["On horseback", "Верхом"], ["On foot", "Пешком"], ["On a board", "На доске"], ["In water", "В воде"]], answer: 0 },
        { q: ["How does a team get a point?", "Как команда получает очко?"], options: [["By throwing the ulak into the other side's kazan", "Забросив улак в казан соперника"], ["By running fastest", "Прибежав первой"], ["By singing", "Спев песню"], ["By catching a girl", "Догнав девушку"]], answer: 0 },
        { q: ["What does the game require?", "Что требует эта игра?"], options: [["Strength, agility and courage", "Силы, ловкости и смелости"], ["Only luck", "Только удачи"], ["Good cooking", "Умения готовить"], ["Silence", "Тишины"]], answer: 0 },
      ],
    }],
  },
};

export const MORE_AREAS = {
  classroom: "talk", permission: "talk", pronouncases: "grammar", chores: "vocab", shapes: "vocab", opposites: "vocab",
  plants: "vocab", farm: "vocab", nomad: "culture", bazaar: "talk", money: "vocab", work: "vocab", emergency: "talk",
  kgfood: "culture", traditions: "culture", friendship: "vocab", compass: "vocab", bignumbers: "grammar", read7: "reading", read8: "reading",
};

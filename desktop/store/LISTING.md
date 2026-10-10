# World Islands — Microsoft Store listing

Use this when you fill in the submission in Partner Center (partner.microsoft.com → Apps and games).

## Product identity (from Partner Center → your app → Product identity)
Copy these three values to Claude so they go into `desktop/package.json` → `build.appx`:
- **Package/Identity/Name** → `identityName` (now a placeholder: `WorldIslands.WorldIslands`)
- **Package/Identity/Publisher** → `publisher` (now a placeholder: `CN=WorldIslands`)
- **Package/Properties/PublisherDisplayName** → `publisherDisplayName` (now: `World Islands`)

The Store package is built automatically: `WorldIslands-Store.appx` in the GitHub release
https://github.com/erdanthecoder/copilot/releases/tag/windows-app — upload that file in **Packages**.
Microsoft signs it for the Store, so no paid certificate is needed.

## Properties
- **Category:** Games → Educational (subcategory: Kids & family is optional)
- **Privacy policy URL:** https://world-islands.web.app/privacy.html
- **Website:** https://world-islands.web.app/
- **Support contact:** https://flexihub.web.app/
- **Uses camera and microphone:** yes (Mood camera reads faces on the device only; voice calls are peer-to-peer, not recorded)
- **Requires an account:** yes (free FlexiHub account)
- **In-app purchases / ads:** none (game money only, no real payments)
- **Age rating:** answer the IARC questions honestly — no violence, no real gambling, users can chat and talk to each other (voice calls, text chat), no purchases.

## Store listing — English
**Name:** World Islands

**Short description:** A 3D island world for students: learning games, jobs, shops, sports, shows and friends.

**Description:**
World Islands is a free 3D island world made for students and their teachers.

Learn and play: math, English, Russian, geography, science and logic games pay you stars and game money.
Work real jobs on the island — cashier at mBank, waiter, barista, fisher, cleaner or helper — and spend what you earn at World Market, the Pentagon Mall, the restaurant and Island Coffee.
Play together: football, 3 vs 3 basketball, dodgeball, hide and seek, star hunt, quiz battle and more, with friendly bots when your friends are away.
Explore the round World Tower with glass lifts, a hotel, cinema cartoons, a pool and an arcade. Go fishing on the pier, ride a hoverboard and dance with new emotes.
Call friends on your in-game phone, send messages, and let the Mood camera copy your face onto your avatar (it never sends video).
Teachers can join, run quizzes and start events. Play in English or Russian.

**Features (one per line):**
- Learning games that reward stars and game money
- Real jobs: barista, waiter, cashier, fisher, helper, cleaner
- Pentagon Mall, World Market, Island Restaurant and Island Coffee
- Football, basketball and other multiplayer games, with smart bots
- Phone calls, messages and a face-reading Mood camera (on-device)
- Shows: disco, concert, UFO invasion, foam party
- English and Russian

**Keywords:** learning game, kids, students, school, 3D world, multiplayer, math, English, Russian

## Описание в Store — русский
**Название:** World Islands

**Краткое описание:** 3D-мир островов для школьников: обучающие игры, работа, магазины, спорт, шоу и друзья.

**Описание:**
World Islands — бесплатный 3D-мир островов для школьников и учителей.
Учись и играй: математика, английский, русский, география, наука и логика приносят звёзды и игровые деньги.
Работай на острове — кассир в mBank, официант, бариста, рыбак, уборщик или помощник — и трать заработанное в World Market, Пентагон Молле, ресторане и Island Coffee.
Играйте вместе: футбол, баскетбол 3 на 3, вышибалы, прятки, охота за звёздами, квиз-битва — с умными ботами, если друзей нет онлайн.
Исследуй круглую Башню Мира с лифтами, отелем, мультиками в кинотеатре, бассейном и аркадой. Рыбачь на пирсе, катайся на ховерборде и танцуй.
Звони друзьям по игровому телефону, пиши сообщения, а камера настроения повторит твоё лицо на аватаре (видео никуда не отправляется).
Учителя могут заходить в игру, проводить квизы и запускать события. Английский и русский языки.

## Screenshots
`desktop/store/screenshots/` — five 1920×1080 PNGs (plaza, Pentagon Mall, UFO show, restaurant, basketball).

## App icon / tiles
Generated from the World Islands logo in `desktop/build/appx/` (Store logo, tiles, splash screen).

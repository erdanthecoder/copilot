# LearnKyrgyz

A Duolingo-style app for learning Kyrgyz, with a teacher side for classrooms, homework, grades, live lessons and presentations.

| Site | What it is | Folder |
|---|---|---|
| **learnkyrgyz.web.app** | Landing page and full topic list | `index.html` |
| **studentlrnkyrgyz.web.app** | The student game: learning path, lessons, XP, streaks, hearts, practice, classroom and homework | `student/` |
| **teachlrnkyrgyz.web.app** | The teacher app: classes, invites, topic catalogue, own questions, homework, gradebook, live calls, presentations | `teacher/` |

Preview (GitHub Pages): https://erdanthecoder.github.io/copilot/ · `/student/` · `/teacher/`

## LearnKyrgyz 2.0 (26 September 2026, 00:00 Amman time)

- **Real Kyrgyz pronunciation.** A built-in Kyrgyz speech engine (eSpeak NG, WebAssembly) replaces the Turkish/Russian stand-in voices.
- **Sealed exams.** The teacher's app writes several random versions of each paper. Students receive only questions, answers are marked on the server, there's one attempt, and no hints or answer review. Teachers can allow a retake.
- **Full-screen exams (optional).** Leaving full screen, switching tab or app, or closing the page ends the exam with a **0**.
- **Dialogues.** 16 dialogues (6 new), proofread, with a role-play mode.
- **Made to remember.** Tip cards, word recaps, spaced review and unit tests. The mascot reacts in Kyrgyz.
- **Printable A4 worksheets and tests** with answer keys, for every topic and unit.
- **Quoldek partnership.** 2,400+ quiz questions (99 topics, English and Russian) at `https://learnkyrgyz.web.app/api/quoldek/v1/index.json`. There's an export in the teacher app (JSON for Quoldek, Kahoot-style CSV) and a "Play on Quoldek" link for students.

## Features

**Students**
- A learning path of 24 units and 99 topics (A1 → B1), with 1,005 words, 437 sentences and 8 reading passages. Each topic has easy, medium and hard levels and earns crowns.
- Randomised exercises: pick the meaning, pick the Kyrgyz, match pairs, build sentences from tiles, fill in the blank, reading comprehension, and typing whole sentences in Kyrgyz. There's an on-screen ң ө ү keyboard. Small typos are forgiven, and a missing special letter is flagged.
- XP, daily goal, streaks, hearts (they refill over time or through practice), combo counters, achievements, confetti, sounds, and Ilbirs the snow-leopard mascot.
- Practice modes: mixed review, mistakes review, flashcards, and a searchable word list with transliteration.
- **Made to remember:** a quick tip card before each new topic, a word recap at the end of every lesson (tap to hear), and **spaced review**. Every word you learn comes back after 1, 2, 4, 7, 14 and 30 days, and a mistake sends it back to the start.
- Ilbirs reacts to every answer in Kyrgyz ("Азамат!", "Кабатыр болбо!", "Ураа! 5 катары менен!"), with the translation underneath.
- **Unit tests:** a timed test for every unit (20 questions, 15 minutes, no hints) that shows a 5-point grade and lets you review your answers.
- Optional **Zamyatkin dialogues** (turn on in Profile): 10 short Kyrgyz dialogues in four stages (listen & read → shadowing → ears only → say it), with a listen counter (goal 30) and tap-for-meaning on every word.
- Kyrgyz is spoken aloud when shown or tapped, with **real Kyrgyz pronunciation**. Almost no device has a Kyrgyz voice, so the app includes the eSpeak NG Kyrgyz synthesiser compiled to WebAssembly (`assets/vendor/espeak`, about 1.5 MB, loaded on first tap). It gets Kyrgyz sounds right: the deep к and г next to back vowels, ң, ө, ү, ы, long vowels and final-syllable stress. A device's own Kyrgyz voice is used if there is one.
- Explanations in English or Russian, plus light and dark themes.
- Classroom: join by code, invite link or email invite. Homework shows its due date and grade. There's a class leaderboard, shared presentations, a "Join" banner when the teacher starts a live lesson, and "Follow" for live slides.
- Guest mode, so people can try it without an account. Guest progress moves into the account on sign-up.

**Teachers**
- Classrooms with a join code, an invite link and email invites. You can see each student's XP, streak and topics done, and remove students.
- Topic catalogue organised Dr Frost–style (Level → Area → Topic): Vocabulary, Grammar, Speaking & phrases, Culture & country, Reading. You can view, try or assign any topic.
- **My questions**: write your own multiple-choice, true/false, typed-answer and sentence-building questions, or auto-generate editable questions from a topic.
- Homework: pick topics, set the number of questions and difficulty, attach question sets, add writing tasks (students write sentences and you read them), and **choose the due date and time**.
- Gradebook on the Russian 5-point scale: ≥90% → 5, ≥75% → 4, ≥50% → 3, otherwise 2. **Homework not submitted by the due date counts as 2.** You can override any grade and add a comment. Per-homework reports show the grade spread and the hardest questions. Exports to CSV.
- Live lessons: **video or voice calls** with the whole class, including screen sharing, raise hand and chat.
- **Exams:** set a timed exam for any unit or any mix of topics. There are no hints during the exam, and it submits itself when time runs out. It's graded in the gradebook like homework.
- **Printable A4 worksheets and tests** for every topic: matching, translation, gap-fill, word order, multiple choice, reading and writing. Tests have a name/class/date header, a score box and the 5/4/3/2 scale. There's an optional answer key page, and **New version** reshuffles the questions. Print or save as PDF.
- Presentations: **upload your PowerPoint (.pptx)**. Share it with a class, or present it live and students' screens follow yours. "Original" opens the exact file in Microsoft's online viewer. (Presentations come only from PowerPoint; there is no in-app slide builder.)

## How it works

- Plain HTML, CSS and ES modules with no build step. `assets/vendor/supabase.js` is the vendored supabase-js (v2.117.2).
- Backend: Supabase project `lzamxwqxnzcrazyuipjx` (Postgres, Auth, Realtime). The schema is in `supabase/migrations/`.
  - Row-level security on every table. Students only see their own classes, homework and submissions, and only classmates' names and XP.
  - Grades are calculated by a database trigger. Students can't edit a submission after sending it, and can't submit after the due date. Teachers can only change `teacher_grade` and `teacher_comment`.
  - Live calls and slides run on **private** Realtime channels (`class:<id>:…`) that only members of that class can join.
- Calls are peer-to-peer WebRTC with public STUN servers. They work well for up to about 8 people. Some school or mobile networks block direct connections; adding a TURN server in `assets/js/call.js` fixes that.

## Setup still needed (one-time)

1. **Sign-up needs no email confirmation.** Accounts are created by the `auth-bridge` edge function (`supabase/functions/auth-bridge`), which makes confirmed users. So you don't need to change Supabase's email settings.
2. **Supabase URL configuration** (Authentication → URL Configuration): set the Site URL to `https://studentlrnkyrgyz.web.app`. Add these redirect URLs: `https://learnkyrgyz.web.app/**`, `https://studentlrnkyrgyz.web.app/**`, `https://teachlrnkyrgyz.web.app/**`, `https://erdanthecoder.github.io/**`.
3. **Firebase Hosting (the three `.web.app` addresses):** create a Firebase project and its first site, `learnkyrgyz`. Then add a GitHub secret `FIREBASE_SERVICE_ACCOUNT` containing a service-account JSON key with the *Firebase Admin* role (Firebase console → Project settings → Service accounts → Generate new private key). On every push, the `firebase.yml` workflow reads the project ID from the key, creates `studentlrnkyrgyz` and `teachlrnkyrgyz` if they are missing, and deploys all three sites.

## Google sign-in

"Continue with Google" uses **Firebase Authentication**, and the `auth-bridge` edge function turns it into a Supabase session. To turn it on, open the Firebase console → Authentication → Sign-in method → enable **Google**. The deploy workflow registers the web app and adds all three `.web.app` domains to Firebase's authorized domains. The button only appears on the Firebase-hosted sites, not on the GitHub Pages preview.

## Third-party code

- `assets/vendor/supabase.js`: supabase-js (MIT).
- `assets/vendor/espeak/`: eSpeak NG (GPL-3.0; see `assets/vendor/espeak/COPYING`). This is the Emscripten build from `@echogarden/espeak-ng-emscripten` 0.3.5, with its data package cut down to the Kyrgyz voice. Source: https://github.com/espeak-ng/espeak-ng.

## The4Workspace: one account for all four apps

**the4workspace.web.app** (folder `oneinfour/`, deployed by the same Firebase workflow; the old addresses oneintwo.web.app and oneinfour.web.app forward to it) is the account hub. It has a product landing page (single sign-on diagram, features, security, FAQ), sign-in with Google or email (as a student or a teacher), and a dashboard.
- **One account:** the The4Workspace account *is* the LearnKyrgyz account (Supabase).
- **Getting there from any app:** every app has a The4Workspace button (the LearnKyrgyz apps' side menu, Quoldek, Kadam and AkylduuKodo). From LearnKyrgyz it opens the hub already signed in.
- **Opening an app:** all four apps open already signed in. Apps opened directly check The4Workspace once per tab (`?return=…&silent=1`): the hub answers at once with the session, or with `#oit=none` when nobody is signed in, and the app comes straight back. The session is handed over in the URL fragment (`#oit=…`), and only to trusted addresses (`assets/js/oneintwo-core.js`). The receiving app stores it and removes it from the address bar.
- **Per-app data:** apps keep small data blobs in the account, such as Quoldek's quizzes. These are stored in `app_data` (migration `0008`), with row-level security so each person only sees their own rows.
- **LearnKyrgyz → Quoldek:** pick topics in the teacher app, the student app or the dashboard and press *Play in Quoldek*. Quoldek opens (`?learnkyrgyz=…&go=host|studio|take`), makes the quiz, and goes straight to the game picker. There's nothing to download.
- **Kadam** (kadam.web.app, the university-application suite) and **AkylduuKodo** (akylduukodo.web.app) use Firebase Auth. On arrival they swap the hand-off for a Firebase custom token from the `oit-firebase-token` edge function, then call `signInWithCustomToken`. Each app registered its own Firebase key once, through a workflow in its own repository. A Google-verified OneInFour account links to the same email's Firebase user; an email/password account gets its own user.

## Quiz game question bank (Quoldek)

`scripts/quoldek-feed.mjs` generates `api/quoldek/v1/`:
- `index.json`: units and topics, with question counts.
- `topics/<id>.json`: one topic's questions.
- `all.json`: everything.

Each question has `question.{en,ru}`, `options.{en,ru}` (the same order in both), `answer` (the index of the correct option), `time_limit`, and `kyrgyz`/`translit`/`audio_text`. Wrong options never share a meaning with the answer. The Firebase build regenerates the bank and serves `/api/**` with `Access-Control-Allow-Origin: *`.

## Kyrgyz content

All curriculum data is in `assets/js/curriculum.js` and `assets/js/curriculum-extra.js`. Each entry is `[Kyrgyz, English, Russian]`, and `|` separates accepted alternative answers. The content follows standard literary Kyrgyz. A native-speaker teacher should still review it before classroom use. Students can press **Report a mistake**, and reports go to the `vocab_reports` table.

## Database migrations

`supabase/migrations/0001_init.sql` … `0006_homework_exams.sql` are already applied to the live project. To rebuild elsewhere, run them in order.

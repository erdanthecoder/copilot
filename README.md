# LearnKyrgyz

A Duolingo-style app for learning Kyrgyz, with a teacher side for classrooms, homework, grades, live lessons and presentations.

| Site | What it is | Folder |
|---|---|---|
| **learnkyrgyz.web.app** | Landing page and full topic list | `index.html` |
| **studentlrnkyrgyz.web.app** | The student game: learning path, lessons, XP, streaks, hearts, practice, classroom and homework | `student/` |
| **teachlrnkyrgyz.web.app** | The teacher app: classes, invites, topic catalogue, own questions, homework, gradebook, live calls, presentations | `teacher/` |

Preview (GitHub Pages): https://erdanthecoder.github.io/copilot/ · `/student/` · `/teacher/`

## Features

**Students**
- A learning path of 24 units and 99 topics (A1 → B1), with 1,005 words, 437 sentences and 8 reading passages. Each topic has easy, medium and hard levels and earns crowns.
- Randomised exercises: pick the meaning, pick the Kyrgyz, match pairs, build sentences from tiles, fill in the blank, reading comprehension, and typing whole sentences in Kyrgyz. There's an on-screen ң ө ү keyboard. Small typos are forgiven, and a missing special letter is flagged.
- XP, daily goal, streaks, hearts (they refill over time or through practice), combo counters, achievements, confetti, sounds, and Ilbirs the snow-leopard mascot.
- Practice modes: mixed review, mistakes review, flashcards, and a searchable word list with transliteration.
- Optional **Zamyatkin dialogues** (turn on in Profile): 10 short Kyrgyz dialogues in four stages (listen & read → shadowing → ears only → say it), with a listen counter (goal 30) and tap-for-meaning on every word.
- Kyrgyz is spoken aloud when shown or tapped. It uses a Kyrgyz voice if the device has one, otherwise a Turkish voice reading Turkish spelling as a close approximation.
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
- Presentations: **upload your PowerPoint (.pptx)**, and each slide appears in the app. You can mix in quiz and word-card slides, share the deck, or present it live. "Original" opens the exact file in Microsoft's online viewer. You can also build slides in the app: title, text, Kyrgyz word-card, image and quiz slides. Share them with a class, or **present live** so students' screens follow yours and they can answer quiz slides in real time.

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

## Kyrgyz content

All curriculum data is in `assets/js/curriculum.js` and `assets/js/curriculum-extra.js`. Each entry is `[Kyrgyz, English, Russian]`, and `|` separates accepted alternative answers. The content follows standard literary Kyrgyz. A native-speaker teacher should still review it before classroom use. Students can press **Report a mistake**, and reports go to the `vocab_reports` table.

## Database migrations

`supabase/migrations/0001_init.sql` … `0004_homework_difficulty.sql` are already applied to the live project. To rebuild elsewhere, run them in order.

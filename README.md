
# KidLearn Classroom

A Google-Classroom-inspired modern learning app for Year 1 and Year 2 learners.

## Features

- Student onboarding: choose English or Russian, name, Year 1/2, background, and editable avatar.
- Bilingual UI: English and Russian pages are translated through the app language state.
- Student dashboard: stars, house points, announcements, courses, quizzes, games, homework, and settings.
- Teacher dashboard: announcements, homework, Google-Forms-style manual form creation, point awards, and live classroom effects.
- Points: 30 stars automatically converts into 1 House point. No houses/groups are used.
- World Islands: shared Socket.IO real-time islands with drawn human characters, movement, multiplayer presence, and animation.
- Music: original browser-synth tracks only. Replace with licensed files if you own rights to specific songs.
- Railway-ready Node/Express/Socket.IO backend.

## Important safety note

This starter does not include public chat or private messaging. For a real children’s worldwide deployment, add moderation, school-managed accounts, parental/school consent flows, audit logs, rate limits, and a real database before production use.

## Run locally

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:3000`.

Teacher PIN defaults to `2468`; admin PIN defaults to `9876`. Change these in Railway variables.

## Test

```bash
npm test
```

The smoke test checks repository organization, key routes, bilingual strings, teacher dashboard, points conversion, Socket.IO world-island code, and UI controls.

## Deploy to Railway

This app has a `package.json` start script and Railway can run Node apps from a repository. Create a Railway project from your code repository, set environment variables from `.env.example`, and deploy.

## Suggested production upgrades

- Replace JSON storage with PostgreSQL.
- Add real login, class codes, teacher approval, and school domains.
- Add automatic content moderation and report/ban flows.
- Add separate staging and production environments.
- Add browser-based Playwright tests after deployment.

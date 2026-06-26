
import fs from 'fs';
import assert from 'assert';
const files=['server.js','public/index.html','public/app.js','public/styles.css','README.md','SUMMARY_SHEET.md','package.json','railway.json'];
for(const f of files) assert.ok(fs.existsSync(new URL('../'+f, import.meta.url)), `Missing ${f}`);
const server=fs.readFileSync(new URL('../server.js', import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../public/app.js', import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../public/index.html', import.meta.url),'utf8');
const readme=fs.readFileSync(new URL('../README.md', import.meta.url),'utf8');
const summary=fs.readFileSync(new URL('../SUMMARY_SHEET.md', import.meta.url),'utf8');
const requiredServer=['/api/register','/api/teacher/points','/api/teacher/homework','/api/teacher/form','/api/teacher/effect','Socket.IO','joinWorld'];
for(const k of requiredServer) assert.ok(server.includes(k), `Server missing ${k}`);
const requiredClient=['World Islands','drawPerson','teacher','settings','saveSettings','submitQuiz','30 stars = 1 House point','rickroll','crab-rave','disco','grow-garden'];
for(const k of requiredClient) assert.ok(app.includes(k)||html.includes(k), `Client missing ${k}`);
assert.ok(app.includes('ru:{') && app.includes('English') && app.includes('Русский'), 'Bilingual UI missing');
assert.ok(summary.includes('One-Page Summary Sheet') && summary.includes('Russian'), 'Summary sheet missing expected content');
assert.ok(readme.includes('Railway') && readme.includes('PostgreSQL'), 'Deployment/production notes missing');
console.log('Smoke test passed: repository structure, dashboards, bilingual UI, worlds, quizzes, points, effects, and summary sheet are present.');

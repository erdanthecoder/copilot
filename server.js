
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const TEACHER_PIN = process.env.TEACHER_PIN || '2468';
const ADMIN_PIN = process.env.ADMIN_PIN || '9876';
const storeFile = path.join(__dirname, 'data', 'store.json');
const seedFile = path.join(__dirname, 'data', 'seed.json');

function loadStore(){
  if(!fs.existsSync(storeFile)) fs.copyFileSync(seedFile, storeFile);
  return JSON.parse(fs.readFileSync(storeFile, 'utf-8'));
}
function saveStore(data){ fs.writeFileSync(storeFile, JSON.stringify(data, null, 2)); }
let db = loadStore();
const sessions = new Map();
const publicProfiles = () => db.users.map(u => ({id:u.id, name:u.name, role:u.role, year:u.year, lang:u.lang, avatar:u.avatar, stars:u.stars||0, housePoints:u.housePoints||0, background:u.background}));
const auth = (req,res,next)=>{ const t=req.headers.authorization?.replace('Bearer ',''); if(t && sessions.has(t)){ req.user=sessions.get(t); return next(); } res.status(401).json({error:'not_authenticated'}); };
const isTeacher = (req,res,next)=>{ if(req.user?.role==='teacher' || req.user?.role==='admin') return next(); res.status(403).json({error:'teacher_only'}); };
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' }});
app.use(express.json({limit:'2mb'}));
app.use(express.static(path.join(__dirname,'public')));

const courses = {
  maths: {
    en: { name:'Maths', y1:['Count to 20','Add within 10','Shapes','Compare numbers'], y2:['Add within 100','Subtract within 100','Times tables 2/5/10','Money and time'] },
    ru: { name:'Математика', y1:['Счёт до 20','Сложение до 10','Фигуры','Сравнение чисел'], y2:['Сложение до 100','Вычитание до 100','Таблицы 2/5/10','Деньги и время'] }
  },
  english: {
    en: { name:'English', y1:['Phonics','Sight words','Capital letters','Simple sentences'], y2:['Reading fluency','Adjectives','Punctuation','Story order'] },
    ru: { name:'Английский', y1:['Звуки','Частые слова','Заглавные буквы','Простые предложения'], y2:['Чтение','Прилагательные','Пунктуация','Порядок рассказа'] }
  },
  russian: {
    en: { name:'Russian', y1:['Alphabet','Syllables','Simple words','Greetings'], y2:['Reading words','Nouns','Short sentences','Small stories'] },
    ru: { name:'Русский язык', y1:['Алфавит','Слоги','Простые слова','Приветствия'], y2:['Чтение слов','Существительные','Короткие предложения','Маленькие рассказы'] }
  }
};
const quizzes = [
  {id:'m-y1-1', subject:'maths', year:1, lang:'en', title:'Year 1 Maths: Number heroes', q:[{p:'4 + 3 = ?',a:['6','7','8'],c:1},{p:'Which shape has 3 sides?',a:['Circle','Triangle','Square'],c:1},{p:'What number comes after 12?',a:['11','13','20'],c:1},{p:'Which is bigger?',a:['9','5','2'],c:0}]},
  {id:'m-y2-1', subject:'maths', year:2, lang:'en', title:'Year 2 Maths: Space sums', q:[{p:'25 + 10 = ?',a:['30','35','45'],c:1},{p:'50 - 8 = ?',a:['42','48','58'],c:0},{p:'5 × 2 = ?',a:['7','10','12'],c:1},{p:'60 minutes = ?',a:['1 hour','1 day','1 week'],c:0}]},
  {id:'e-y1-1', subject:'english', year:1, lang:'en', title:'Year 1 English: Word garden', q:[{p:'Choose the capital letter.',a:['b','B','d'],c:1},{p:'Cat starts with…',a:['c','m','s'],c:0},{p:'Finish: I can ___ .',a:['run','blue','the'],c:0},{p:'Which is a sentence?',a:['The dog runs.','dog the','runs'],c:0}]},
  {id:'e-y2-1', subject:'english', year:2, lang:'en', title:'Year 2 English: Story builders', q:[{p:'Pick the adjective.',a:['jump','happy','and'],c:1},{p:'Which needs a full stop?',a:['wow!','I like apples','Where?'],c:1},{p:'Past tense of play?',a:['played','playing','plays'],c:0},{p:'First, next, finally are…',a:['order words','animals','numbers'],c:0}]},
  {id:'r-y1-1', subject:'russian', year:1, lang:'en', title:'Year 1 Russian: Alphabet lights', q:[{p:'Which is a Russian letter?',a:['Б','B','R'],c:0},{p:'Привет means…',a:['Hello','Goodbye','Apple'],c:0},{p:'What sound can М make?',a:['m','s','t'],c:0},{p:'Which word means мама?',a:['mother','school','sun'],c:0}]},
  {id:'r-y2-1', subject:'russian', year:2, lang:'en', title:'Year 2 Russian: Reading bridge', q:[{p:'кот means…',a:['cat','dog','book'],c:0},{p:'дом means…',a:['house','water','tree'],c:0},{p:'Choose a short sentence.',a:['Я читаю.','книга','и'],c:0},{p:'Спасибо means…',a:['Thank you','Please','Good night'],c:0}]},
  {id:'m-y1-ru', subject:'maths', year:1, lang:'ru', title:'1 класс математика: Герои чисел', q:[{p:'4 + 3 = ?',a:['6','7','8'],c:1},{p:'У какой фигуры 3 стороны?',a:['Круг','Треугольник','Квадрат'],c:1},{p:'Какое число после 12?',a:['11','13','20'],c:1},{p:'Что больше?',a:['9','5','2'],c:0}]},
  {id:'m-y2-ru', subject:'maths', year:2, lang:'ru', title:'2 класс математика: Космические примеры', q:[{p:'25 + 10 = ?',a:['30','35','45'],c:1},{p:'50 - 8 = ?',a:['42','48','58'],c:0},{p:'5 × 2 = ?',a:['7','10','12'],c:1},{p:'60 минут = ?',a:['1 час','1 день','1 неделя'],c:0}]},
  {id:'e-y1-ru', subject:'english', year:1, lang:'ru', title:'1 класс английский: Сад слов', q:[{p:'Выбери заглавную букву.',a:['b','B','d'],c:1},{p:'Cat начинается с…',a:['c','m','s'],c:0},{p:'Закончи: I can ___ .',a:['run','blue','the'],c:0},{p:'Где предложение?',a:['The dog runs.','dog the','runs'],c:0}]},
  {id:'e-y2-ru', subject:'english', year:2, lang:'ru', title:'2 класс английский: Строители историй', q:[{p:'Выбери прилагательное.',a:['jump','happy','and'],c:1},{p:'Где нужна точка?',a:['wow!','I like apples','Where?'],c:1},{p:'Прошедшее время play?',a:['played','playing','plays'],c:0},{p:'First, next, finally — это…',a:['слова порядка','животные','числа'],c:0}]},
  {id:'r-y1-ru', subject:'russian', year:1, lang:'ru', title:'1 класс русский: Огни алфавита', q:[{p:'Какая буква русская?',a:['Б','B','R'],c:0},{p:'Привет значит…',a:['Hello','Goodbye','Apple'],c:0},{p:'Какой звук у М?',a:['м','с','т'],c:0},{p:'Какое слово: мама?',a:['mother','school','sun'],c:0}]},
  {id:'r-y2-ru', subject:'russian', year:2, lang:'ru', title:'2 класс русский: Мост чтения', q:[{p:'кот значит…',a:['cat','dog','book'],c:0},{p:'дом значит…',a:['house','water','tree'],c:0},{p:'Выбери короткое предложение.',a:['Я читаю.','книга','и'],c:0},{p:'Спасибо значит…',a:['Thank you','Please','Good night'],c:0}]}
];

app.get('/api/health', (_,res)=>res.json({ok:true, service:'kidlearn-classroom'}));
app.get('/api/bootstrap', (req,res)=>res.json({courses, quizzes, announcements:db.announcements, homework:db.homework, forms:db.forms, users:publicProfiles()}));
app.post('/api/register', async (req,res)=>{
  const {name, role='student', year=1, lang='en', background='aurora', avatar={}, pin=''} = req.body;
  if(!name || !['student','teacher','admin'].includes(role)) return res.status(400).json({error:'bad_profile'});
  if(role==='teacher' && pin!==TEACHER_PIN) return res.status(403).json({error:'wrong_teacher_pin'});
  if(role==='admin' && pin!==ADMIN_PIN) return res.status(403).json({error:'wrong_admin_pin'});
  const user = {id:uuid(), name:String(name).slice(0,30), role, year:Number(year)||1, lang, background, avatar, stars:0, housePoints:0, createdAt:new Date().toISOString(), passHash: await bcrypt.hash(name+Date.now(), 4)};
  db.users.push(user); saveStore(db);
  const token = uuid(); sessions.set(token, user);
  io.emit('profiles', publicProfiles());
  res.json({token, user:{...user, passHash:undefined}});
});
app.post('/api/profile', auth, (req,res)=>{
  const {name, lang, background, avatar, year} = req.body;
  const user = db.users.find(u=>u.id===req.user.id);
  if(name) user.name=String(name).slice(0,30); if(lang) user.lang=lang; if(background) user.background=background; if(avatar) user.avatar=avatar; if(year) user.year=Number(year);
  Object.assign(req.user, user); saveStore(db); io.emit('profiles', publicProfiles()); res.json({ok:true,user:{...user, passHash:undefined}});
});
app.post('/api/quiz/submit', auth, (req,res)=>{
  const quiz = quizzes.find(q=>q.id===req.body.quizId); if(!quiz) return res.status(404).json({error:'missing_quiz'});
  const answers = req.body.answers || []; let score = quiz.q.reduce((s,x,i)=>s+(answers[i]===x.c?1:0),0);
  const stars = score * 3; const user = db.users.find(u=>u.id===req.user.id); user.stars=(user.stars||0)+stars;
  while(user.stars >= 30){ user.stars -= 30; user.housePoints=(user.housePoints||0)+1; }
  db.events.push({id:uuid(), type:'quiz', user:user.id, quiz:quiz.id, score, at:new Date().toISOString()}); saveStore(db); io.emit('profiles', publicProfiles());
  res.json({score,total:quiz.q.length,stars,housePoints:user.housePoints,remainingStars:user.stars});
});
app.post('/api/teacher/points', auth, isTeacher, (req,res)=>{
  const {studentId, stars=0, housePoints=0, reason='Teacher award'}=req.body; const student=db.users.find(u=>u.id===studentId && u.role==='student'); if(!student) return res.status(404).json({error:'student_not_found'});
  student.stars=(student.stars||0)+Number(stars); student.housePoints=(student.housePoints||0)+Number(housePoints); while(student.stars>=30){student.stars-=30;student.housePoints+=1;}
  db.events.push({id:uuid(), type:'points', teacher:req.user.id, studentId, stars, housePoints, reason, at:new Date().toISOString()}); saveStore(db); io.emit('profiles', publicProfiles()); res.json({ok:true, student});
});
app.post('/api/teacher/announcement', auth, isTeacher, (req,res)=>{ const item={id:uuid(), title:req.body.title||{en:'Announcement',ru:'Объявление'}, body:req.body.body||{en:'',ru:''}, at:new Date().toISOString()}; db.announcements.unshift(item); saveStore(db); io.emit('announcement', item); res.json(item); });
app.post('/api/teacher/homework', auth, isTeacher, (req,res)=>{ const item={id:uuid(), title:req.body.title, instructions:req.body.instructions, subject:req.body.subject, year:req.body.year, due:req.body.due, formId:req.body.formId||null, at:new Date().toISOString()}; db.homework.unshift(item); saveStore(db); io.emit('homework', item); res.json(item); });
app.post('/api/teacher/form', auth, isTeacher, (req,res)=>{ const form={id:uuid(), title:req.body.title||'Untitled form', questions:req.body.questions||[], at:new Date().toISOString()}; db.forms.unshift(form); saveStore(db); res.json(form); });
app.post('/api/teacher/effect', auth, isTeacher, (req,res)=>{ const allowed=['rickroll','crab-rave','disco','grow-garden','meteor-math','confetti','freeze-dance']; const effect=allowed.includes(req.body.effect)?req.body.effect:'confetti'; io.emit('adminEffect', {effect, message:req.body.message||'', at:Date.now()}); res.json({ok:true,effect}); });
app.get('*', (_,res)=>res.sendFile(path.join(__dirname,'public','index.html')));

io.on('connection', socket=>{
  socket.on('joinWorld', ({userId, world})=>{ socket.data.userId=userId; socket.data.world=world||'math-isle'; socket.join(socket.data.world); socket.to(socket.data.world).emit('worldMessage', {system:true, text:'A learner joined the island.'}); });
  socket.on('move', pos=>{ if(!socket.data.world) return; socket.to(socket.data.world).emit('playerMove', {id:socket.data.userId, ...pos}); });
  socket.on('gameAction', action=>{ if(!socket.data.world) return; io.to(socket.data.world).emit('gameAction', {id:socket.data.userId, ...action}); });
  socket.on('disconnect', ()=>{ if(socket.data.world) socket.to(socket.data.world).emit('playerLeave',{id:socket.data.userId}); });
});
server.listen(PORT, ()=>console.log(`KidLearn running on ${PORT}`));

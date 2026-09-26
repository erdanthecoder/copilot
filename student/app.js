// LearnKyrgyz — student app
import { sb, SITES, SUPABASE_URL, SUPABASE_KEY } from "../assets/js/config.js";
import { h, $, icon, mascot, toast, modal, confetti, sound, fmtDate, relTime, gradeChip, avatar, kyKeys, errMsg, speakKy, kyVoice, ornamentUrl, mountains, ring } from "../assets/js/ui.js";
import { t, tn, getLang, setLang } from "../assets/js/i18n.js";
import { UNITS, TOPICS, TOPIC_ORDER, topicUnit } from "../assets/js/curriculum.js";
import { buildLesson, buildExam, buildReview, srsUpdate, srsDue, customExercise, allWords, shuffle, translit } from "../assets/js/engine.js";
import { playLink } from "../assets/js/gamebank.js";
import { runLesson } from "../assets/js/lesson.js";
import { showWhatsNew, versionBadge } from "../assets/js/version.js";
import { googleBlock, signUpWithPassword } from "../assets/js/google.js";
import { voice } from "../assets/js/speech.js";
import { DIALOGUES, LISTEN_GOAL, openDialogue, dialogueExplainer } from "../assets/js/dialogues.js";
import { openMeeting } from "../assets/js/call.js";
import { watchPresentations, openLiveViewer, openSlideshow } from "../assets/js/present.js";
import { officeViewerUrl, deckUrlOf } from "../assets/js/pptx.js";

const client = sb();
const app = $("#app");
const MAX_HEARTS = 5, HEART_MS = 30 * 60 * 1000, LEVELS = 3;
const today = () => new Date().toISOString().slice(0, 10);
const COLORS = ["#58cc02", "#1cb0f6", "#ce82ff", "#ff9600", "#ff4b4b", "#2b70c9", "#00a36c"];

let user = null, profile = null, guest = false, view = "learn";
let classes = [], liveMeetings = {}, liveSlides = {}, watchers = [], meetingSub = null, pollTimer = null;
let saveTimer = null, whatsNewChecked = false;

// ───────────────────────── profile & persistence ─────────────────────────
function defaultProgress() { return { topics: {}, words: {}, mistakes: [], daily: { date: today(), xp: 0 }, goal: 30, heartsAt: Date.now(), lessons: 0, achievements: [], days: {}, chests: [] }; }
function loadGuest() {
  let p = null; try { p = JSON.parse(localStorage.getItem("lk.guest") || "null"); } catch {}
  return p || { full_name: "Guest", xp: 0, streak: 0, last_active: null, hearts: MAX_HEARTS, learn_from: getLang(), progress: defaultProgress(), avatar_color: "#58cc02" };
}
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (guest) { try { localStorage.setItem("lk.guest", JSON.stringify(profile)); } catch {} return; }
    const { xp, streak, last_active, hearts, progress, learn_from, full_name, avatar_color } = profile;
    const { error } = await client.from("profiles").update({ xp, streak, last_active, hearts, progress, learn_from, full_name, avatar_color }).eq("id", user.id);
    if (error) console.warn(error);
  }, 400);
}
// Fill in missing fields in place, so references to the progress object stay valid.
function prog() {
  const pr = profile.progress = profile.progress || {};
  const d = defaultProgress();
  for (const k of Object.keys(d)) if (!(k in pr)) pr[k] = d[k];
  return pr;
}
function regenHearts() {
  const p = prog();
  if (profile.hearts >= MAX_HEARTS) { p.heartsAt = Date.now(); return; }
  const gained = Math.floor((Date.now() - (p.heartsAt || Date.now())) / HEART_MS);
  if (gained > 0) { profile.hearts = Math.min(MAX_HEARTS, profile.hearts + gained); p.heartsAt = Date.now(); save(); }
}
function streakAlive() {
  if (!profile.last_active) return 0;
  const d = (new Date(today()) - new Date(profile.last_active)) / 86400000;
  return d <= 1 ? profile.streak : 0;
}
function dailyXp() { const p = prog(); if (p.daily.date !== today()) p.daily = { date: today(), xp: 0 }; return p.daily.xp; }
function topicCrowns(id) { return (prog().topics[id] || {}).level || 0; }
// Words a student has already been taught (via new-word cards or practice).
function seenSet() { return new Set(Object.keys(prog().seen || {})); }
function wordsLearned(id) { const seen = prog().seen || {}; return TOPICS[id].words.filter((_, i) => seen[`${id}:w${i}`]).length; }
function markSeen(exercises) {
  const p = prog(); p.seen = p.seen || {};
  for (const x of exercises) {
    if (x && x.item && x.item.id && x.item.id.includes(":w")) p.seen[x.item.id] = 1;
    if (x && x.pairs) x.pairs.forEach(pr => { if (pr.item && pr.item.id) p.seen[pr.item.id] = 1; });
  }
}
function isUnlocked(id) {
  const i = TOPIC_ORDER.indexOf(id);
  if (i <= 0) return true;
  if (topicCrowns(id) > 0) return true;
  if (topicCrowns(TOPIC_ORDER[i - 1]) > 0) return true;
  return assignedTopics().has(id);
}
function assignedTopics() { const s = new Set(); classes.forEach(c => (c.homework || []).forEach(hw => hw.topic_ids.forEach(x => s.add(x)))); return s; }
function currentTopic() { return TOPIC_ORDER.find(id => topicCrowns(id) === 0) || TOPIC_ORDER[TOPIC_ORDER.length - 1]; }

function awardLesson(res, { topicId = null, level = 0, review = false } = {}) {
  const p = prog();
  const firstToday = profile.last_active !== today();
  profile.xp += res.xp;
  dailyXp(); p.daily.xp += res.xp;
  p.days = p.days || {}; p.days[today()] = (p.days[today()] || 0) + res.xp;
  p.lessons = (p.lessons || 0) + 1;
  // streak
  const last = profile.last_active; const d = last ? Math.round((new Date(today()) - new Date(last)) / 86400000) : 99;
  if (d === 1) profile.streak += 1; else if (d > 1 || !last) profile.streak = 1;
  profile.last_active = today();
  if (topicId && !res.failed) {
    const tp = p.topics[topicId] = p.topics[topicId] || { level: 0, lessons: 0 };
    tp.lessons++;
    // "Learn words" only completes once every word in the topic has been taught.
    const allTaught = wordsLearned(topicId) >= TOPICS[topicId].words.length;
    if (level >= tp.level && (level > 0 || allTaught)) tp.level = Math.min(LEVELS, level + 1);
  }
  for (const a of res.answers) if (a && a.id && a.id.includes(":w")) p.words[a.id] = (p.words[a.id] || 0) + (a.ok ? 1 : 0);
  p.mistakes = [...new Set(res.mistakes.concat(p.mistakes || []))].slice(0, 60);
  // Spaced repetition: every practised word gets its next review date.
  if (!res.failed) { p.srs = p.srs || {}; for (const id of res.words || []) p.srs[id] = srsUpdate(p.srs[id], !res.mistakes.includes(id), today()); }
  if (review) { p.mistakes = p.mistakes.filter(m => !res.answers.some(a => a.id === m && a.ok)); profile.hearts = Math.min(MAX_HEARTS, profile.hearts + 1); }
  checkAchievements();
  save();
  return { firstToday: firstToday && !res.failed };
}

const ACHIEVEMENTS = [
  { id: "first", icon: "star", en: "First steps", ru: "Первые шаги", test: p => p.progress.lessons >= 1 },
  { id: "ten", icon: "bolt", en: "10 lessons", ru: "10 уроков", test: p => p.progress.lessons >= 10 },
  { id: "fifty", icon: "trophy", en: "50 lessons", ru: "50 уроков", test: p => p.progress.lessons >= 50 },
  { id: "streak3", icon: "flame", en: "3-day streak", ru: "3 дня подряд", test: p => p.streak >= 3 },
  { id: "streak7", icon: "flame", en: "Week streak", ru: "Неделя подряд", test: p => p.streak >= 7 },
  { id: "xp500", icon: "bolt", en: "500 XP", ru: "500 XP", test: p => p.xp >= 500 },
  { id: "unit1", icon: "crown", en: "Unit 1 done", ru: "Раздел 1 пройден", test: () => UNITS[0].topics.every(id => topicCrowns(id) > 0) },
  { id: "master", icon: "crown", en: "Topic master", ru: "Мастер темы", test: p => Object.values(p.progress.topics).some(x => x.level >= LEVELS) },
  { id: "words100", icon: "book", en: "100 words", ru: "100 слов", test: p => Object.values(p.progress.words).filter(v => v > 0).length >= 100 },
];
function checkAchievements() {
  const p = prog();
  for (const a of ACHIEVEMENTS) if (!p.achievements.includes(a.id) && a.test(profile)) { p.achievements.push(a.id); setTimeout(() => toast(`${tn(a)} unlocked!`, "good"), 800); }
}

// ───────────────────────── auth ─────────────────────────
async function boot() {
  setLang(getLang());
  applyTheme();
  const { data } = await client.auth.getSession();
  if (data.session) return signedIn(data.session.user);
  try { if (localStorage.getItem("lk.guestMode") === "1") return startGuest(); } catch {}
  renderAuth();
}
client.auth.onAuthStateChange((ev, session) => { if (ev === "SIGNED_OUT") { user = null; location.reload(); } });

function renderAuth(mode = "welcome", msg = null) {
  const err = h("div", { class: "auth-err hidden" });
  const setErr = (m) => { err.textContent = m; err.classList.remove("hidden"); };
  const langSeg = h("div", { class: "seg" }, ["en", "ru"].map(l => h("button", { class: getLang() === l ? "on" : "", onClick: () => { setLang(l); renderAuth(mode); } }, l === "en" ? "English" : "Русский")));
  let content;
  if (mode === "welcome") {
    content = [mascot("wave", 130), h("h1", {}, t("welcomeTitle")), h("p", { class: "muted" }, t("welcomeText")),
      h("p", { class: "small muted" }, t("pickLang")), langSeg,
      h("div", { class: "stack", style: { marginTop: "22px" } },
        googleBlock({ role: "student", learnFrom: getLang, label: getLang() === "ru" ? "Продолжить с Google" : "Continue with Google", orLabel: getLang() === "ru" ? "или" : "or", onSignedIn: async (u) => { await migrateGuest(u); signedIn(u); }, onError: (e) => toast(errMsg(e), "bad") }),
        h("button", { class: "btn primary block", onClick: () => renderAuth("signup") }, t("signUp")),
        h("button", { class: "btn ghost block", onClick: () => renderAuth("signin") }, t("signIn")),
        h("button", { class: "link-btn", onClick: startGuest }, t("guest")))];
  } else {
    const signup = mode === "signup";
    const name = h("input", { class: "input", required: true, maxlength: 80, autocomplete: "name" });
    const email = h("input", { class: "input", type: "email", required: true, autocomplete: "email" });
    const pw = h("input", { class: "input", type: "password", required: true, minlength: 6, autocomplete: signup ? "new-password" : "current-password" });
    const btn = h("button", { class: "btn primary block", type: "submit" }, signup ? t("signUp") : t("signIn"));
    content = [mascot(signup ? "happy" : "wave", 110), h("h1", {}, signup ? t("signUp") : t("signIn")),
      h("form", { onSubmit: async (e) => {
        e.preventDefault(); btn.disabled = true; err.classList.add("hidden");
        try {
          if (signup) {
            const u = await signUpWithPassword({ email: email.value.trim(), password: pw.value, fullName: name.value.trim(), role: "student", learnFrom: getLang() });
            await migrateGuest(u);
            signedIn(u);
          } else {
            const { data, error } = await client.auth.signInWithPassword({ email: email.value.trim(), password: pw.value });
            if (error) throw error;
            signedIn(data.user);
          }
        } catch (ex) { setErr(errMsg(ex)); btn.disabled = false; }
      } },
        msg ? h("div", { class: "auth-ok" }, msg) : null, err,
        googleBlock({ role: "student", learnFrom: getLang, label: getLang() === "ru" ? "Продолжить с Google" : "Continue with Google", orLabel: getLang() === "ru" ? "или" : "or", onSignedIn: async (u) => { await migrateGuest(u); signedIn(u); }, onError: (e) => toast(errMsg(e), "bad") }),
        signup ? h("label", { class: "field" }, h("span", {}, t("fullName")), name) : null,
        h("label", { class: "field" }, h("span", {}, t("email")), email),
        h("label", { class: "field" }, h("span", {}, t("password")), pw), btn),
      h("p", { class: "small muted" }, signup ? t("haveAccount") : t("noAccount"), " ", h("button", { class: "link-btn", onClick: () => renderAuth(signup ? "signin" : "signup") }, signup ? t("signIn") : t("signUp"))),
      h("button", { class: "link-btn", onClick: () => renderAuth("welcome") }, t("back"))];
  }
  const ru = getLang() === "ru";
  const art = h("div", { class: "auth-art" }, mountains(),
    h("div", { class: "art-copy" }, h("h2", {}, ru ? "Кыргыз тилин ойноп үйрөн!" : "Learn Kyrgyz like a game."), h("p", {}, ru ? "Короткие уроки, серии, XP и домашние задания от учителя." : "Bite-sized lessons, streaks, XP — and homework from your teacher.")),
    h("div", { class: "art-letters" }, ["Ң", "Ө", "Ү", "Ы"].map((l, i) => h("span", { class: "letter-tile", style: { left: [12, 70, 24, 80][i] + "%", top: [34, 30, 50, 47][i] + "%", animationDelay: i * .5 + "s" } }, l))),
    h("div", { class: "art-mascot" }, mascot("cheer", 220), h("span", { class: "bubble", style: { left: "-70px", top: "30px" } }, "Салам!"), h("span", { class: "bubble", style: { right: "-80px", top: "90px", animationDelay: ".7s" } }, "Кош келиңиз!")));
  const box = h("div", { class: "auth" }, h("div", { class: "auth-box" }, h("div", { style: { display: "flex", justifyContent: "center" } }, brandEl()), ...content,
    h("p", { class: "small muted", style: { marginTop: "26px" } }, "Teacher? ", h("a", { href: SITES.teacher }, "Open LearnKyrgyz for teachers"))));
  app.replaceChildren(h("div", { class: "auth-split" }, art, box));
}

async function migrateGuest(u) {
  try {
    const g = JSON.parse(localStorage.getItem("lk.guest") || "null");
    if (g && g.progress && g.progress.lessons) await client.from("profiles").update({ xp: g.xp, streak: g.streak, last_active: g.last_active, progress: g.progress, hearts: g.hearts }).eq("id", u.id);
    localStorage.removeItem("lk.guestMode");
  } catch {}
}

function startGuest() {
  guest = true; user = null; profile = loadGuest();
  try { localStorage.setItem("lk.guestMode", "1"); } catch {}
  setLang(profile.learn_from || getLang());
  regenHearts(); render();
}

async function signedIn(u) {
  user = u; guest = false;
  let { data, error } = await client.from("profiles").select("*").eq("id", u.id).single();
  if (error || !data) { toast(errMsg(error || "Profile missing"), "bad"); return renderAuth("signin"); }
  if (data.role === "teacher") {
    app.replaceChildren(h("div", { class: "auth" }, h("div", { class: "auth-box" }, mascot("think", 120), h("h1", {}, "This is a teacher account"), h("p", { class: "muted" }, "Use the teacher app to manage your classes."), h("a", { class: "btn purple block", href: SITES.teacher }, "Open teacher app"), h("button", { class: "link-btn", onClick: () => client.auth.signOut() }, t("signOut")))));
    return;
  }
  profile = data; prog();
  setLang(profile.learn_from || getLang());
  regenHearts();
  await loadClasses();
  const join = new URLSearchParams(location.search).get("join");
  render();
  if (join) { history.replaceState(null, "", location.pathname); joinFlow(join); }
  startLiveWatch();
}

// ───────────────────────── classes ─────────────────────────
async function loadClasses() {
  if (guest) { classes = []; return; }
  const { data: mem } = await client.from("classroom_members").select("classroom_id").eq("student_id", user.id);
  const ids = (mem || []).map(m => m.classroom_id);
  if (!ids.length) { classes = []; return; }
  const [{ data: cls }, { data: hws }, { data: subs }, { data: meets }, { data: pres }] = await Promise.all([
    client.from("classrooms").select("*").in("id", ids),
    client.from("homework").select("*").in("classroom_id", ids).order("due_at", { ascending: true }),
    client.from("submissions").select("*").eq("student_id", user.id),
    client.from("meetings").select("*").in("classroom_id", ids).eq("status", "live"),
    client.from("presentations").select("id,title,classroom_id,slides,updated_at").in("classroom_id", ids).eq("shared", true),
  ]);
  const teacherIds = [...new Set((cls || []).map(c => c.teacher_id))];
  const { data: teachers } = teacherIds.length ? await client.from("profiles").select("id,full_name").in("id", teacherIds) : { data: [] };
  classes = (cls || []).map(c => ({ ...c, teacher: (teachers || []).find(x => x.id === c.teacher_id)?.full_name || "",
    homework: (hws || []).filter(hw => hw.classroom_id === c.id).map(hw => ({ ...hw, submission: (subs || []).find(s => s.homework_id === hw.id) || null })),
    presentations: (pres || []).filter(p => p.classroom_id === c.id) }));
  liveMeetings = {}; (meets || []).forEach(m => { liveMeetings[m.classroom_id] = m; });
}

function startLiveWatch() {
  if (guest) return;
  watchers.forEach(w => w.stop()); watchers = [];
  for (const c of classes) {
    watchPresentations({ client, classroomId: c.id, onState: (st) => {
      if (st.ended) delete liveSlides[c.id]; else liveSlides[c.id] = { ...st, classroom: c };
      if (liveSlides[c.id]?.viewer) liveSlides[c.id].viewer.update(st);
      refreshBanners();
    } }).then(w => { w.classId = c.id; watchers.push(w); });
  }
  if (meetingSub) client.removeChannel(meetingSub);
  meetingSub = client.channel("meetings-" + user.id).on("postgres_changes", { event: "*", schema: "public", table: "meetings" }, (p) => {
    const m = p.new; if (!m || !m.classroom_id) return;
    if (m.status === "live") { if (!liveMeetings[m.classroom_id]) sound.ring(); liveMeetings[m.classroom_id] = m; } else delete liveMeetings[m.classroom_id];
    refreshBanners();
  }).subscribe();
  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    const ids = classes.map(c => c.id); if (!ids.length) return;
    const { data } = await client.from("meetings").select("*").in("classroom_id", ids).eq("status", "live");
    const next = {}; (data || []).forEach(m => next[m.classroom_id] = m);
    liveMeetings = next; refreshBanners();
  }, 30000);
}

function banners() {
  const out = [];
  for (const c of classes) {
    const m = liveMeetings[c.id];
    if (m) out.push(h("div", { class: "live-banner" }, h("span", { class: "live-dot" }), h("div", { class: "grow" }, h("b", {}, t("liveNow")), h("div", { class: "small" }, `${c.name} · ${m.title}`)),
      h("span", { class: "spacer" }), h("button", { class: "btn sm", onClick: () => openMeeting({ client, meeting: m, me: { id: user.id, name: profile.full_name, role: "student" } }) }, m.kind === "video" ? icon("cam") : icon("mic"), t("joinCall"))));
    const s = liveSlides[c.id];
    if (s) out.push(h("div", { class: "live-banner", style: { background: "var(--purple-d)", boxShadow: "0 4px 0 #7d3fc0" } }, h("span", { class: "live-dot" }), h("div", {}, h("b", {}, t("liveSlides")), h("div", { class: "small" }, `${c.name} · ${s.title}`)),
      h("span", { class: "spacer" }), h("button", { class: "btn sm", style: { color: "var(--purple-d)" }, onClick: () => {
        const w = watchers.find(x => x.classId === c.id);
        s.viewer = openLiveViewer({ state: s, watcher: w, me: { id: user.id, name: profile.full_name }, onClose: () => { if (liveSlides[c.id]) liveSlides[c.id].viewer = null; } });
      } }, icon("slides"), t("follow"))));
  }
  return out;
}
function refreshBanners() { const host = $("#banners"); if (host) host.replaceChildren(...banners()); }

// ───────────────────────── shell ─────────────────────────
export function brandEl() {
  const mark = h("span", { class: "brand-mark" }, mascot("happy", 26, { hat: false }));
  return h("div", { class: "brand" }, mark, "Learn", h("b", {}, "Kyrgyz"), versionBadge("student", getLang()));
}
function render() {
  regenHearts();
  const nav = [["learn", "home", t("learn")], ["practice", "target", t("practice")], prog().zamyatkin ? ["dialogues", "chat", getLang() === "ru" ? "Диалоги" : "Dialogues"] : null, ["class", "users", t("classroom")], ["profile", "user", t("profile")]].filter(Boolean);
  const main = h("main", { class: "main" });
  app.replaceChildren(h("div", { class: "shell student-app" },
    h("nav", { class: "side" }, brandEl(),
      nav.map(([id, ic, label]) => h("button", { class: "nav-btn" + (view === id ? " on" : ""), onClick: () => { view = id; render(); } }, icon(ic), h("span", { class: "lbl" }, label))),
      h("div", { class: "spacer" }),
      h("div", { class: "side-foot small muted", style: { padding: "0 10px" } }, getLang() === "ru" ? "Нашли ошибку в кыргызском? " : "Spotted a mistake in the Kyrgyz? ", h("button", { class: "link-btn small", onClick: () => reportDialog(null) }, t("report")))),
    main));
  main.append(topbar(), h("div", { id: "banners" }, banners()));
  if (guest) main.append(h("div", { class: "panel row", style: { background: "var(--blue-l)", borderColor: "transparent" } }, icon("user"), h("span", { class: "grow" }, t("guestNote")), h("button", { class: "btn sm", onClick: () => { try { localStorage.removeItem("lk.guestMode"); } catch {} guest = false; renderAuth("signup"); } }, t("signUp"))));
  ({ learn: viewLearn, practice: viewPractice, dialogues: viewDialogues, class: viewClass, profile: viewProfile })[view](main);
  if (!whatsNewChecked) { // returning learners see what's new in this version once
    whatsNewChecked = true;
    if ((profile?.xp || prog().xp || 0) > 0 && !document.querySelector(".modal-back")) setTimeout(() => showWhatsNew("student", getLang()), 700);
    else { try { localStorage.setItem("lk.seen.student", "2.0"); } catch {} }
  }
  window.scrollTo(0, 0);
}

const DAY_NAMES = { en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"], ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] };
function weekRow() {
  const days = prog().days || {};
  const now = new Date(); const dow = (now.getDay() + 6) % 7;
  return h("div", { class: "week" }, DAY_NAMES[getLang()].map((n, i) => {
    const d = new Date(now); d.setDate(now.getDate() - dow + i);
    const key = d.toISOString().slice(0, 10);
    const on = days[key] > 0;
    return h("div", { class: "d" + (on ? " on" : "") + (i === dow ? " today" : "") }, n, h("span", { class: "dot" }, on ? icon("flame") : null));
  }));
}
function heartsTimer() {
  if (profile.hearts >= MAX_HEARTS) return getLang() === "ru" ? "Все сердечки на месте!" : "You have full hearts!";
  const left = HEART_MS - (Date.now() - (prog().heartsAt || Date.now())) % HEART_MS;
  const m = Math.max(1, Math.ceil(left / 60000));
  return getLang() === "ru" ? `Следующее сердечко через ${m} мин` : `Next heart in ${m} min`;
}
let openStat = null;
document.addEventListener("click", () => { if (openStat) { openStat.remove(); openStat = null; } });
function statPill(cls, ic, value, title, popFn) {
  const btn = h("button", { class: "stat-pill " + cls, title, onClick: (e) => {
    e.stopPropagation();
    const had = openStat && openStat.parentNode === btn;
    if (openStat) { openStat.remove(); openStat = null; }
    if (had) return;
    openStat = h("div", { class: "stat-pop", onClick: (ev) => ev.stopPropagation() }, popFn());
    btn.append(openStat);
  } }, icon(ic), value);
  return btn;
}
function topbar() {
  const st = streakAlive(); const ru = getLang() === "ru";
  return h("div", { class: "topbar" },
    statPill("flame" + (st ? "" : " dim"), "flame", st, t("streak"), () => [h("h4", {}, `${st} ${ru ? "дн. подряд" : "day streak"}`), h("p", {}, st ? (ru ? "Занимайтесь каждый день, чтобы не потерять серию!" : "Practise every day to keep your streak alive!") : (ru ? "Пройдите урок, чтобы начать серию." : "Do a lesson to start a new streak.")), weekRow()]),
    statPill("xp", "bolt", profile.xp, "XP", () => [h("h4", {}, `${dailyXp()} / ${prog().goal} XP`), h("p", {}, t("dailyGoal")), h("div", { class: "goal-bar" }, h("i", { style: { width: Math.min(100, Math.round(100 * dailyXp() / prog().goal)) + "%" } }))]),
    statPill("heart", "heart", profile.hearts, t("hearts"), () => [h("h4", {}, `${profile.hearts} / ${MAX_HEARTS} ${t("hearts").toLowerCase()}`), h("p", {}, heartsTimer()),
      h("div", { class: "row", style: { gap: "4px", marginBottom: "14px" } }, Array.from({ length: MAX_HEARTS }, (_, i) => h("span", { style: { fontSize: "28px", color: i < profile.hearts ? "var(--red)" : "var(--line)" } }, icon("heart")))),
      profile.hearts < MAX_HEARTS ? h("button", { class: "btn primary block sm", onClick: () => startReview(false) }, ru ? "Практика +1 сердечко" : "Practise to earn a heart") : null]));
}

// ───────────────────────── Learn ─────────────────────────
const DECO = ["wave", "cheer", "happy", "wow"];
function viewLearn(main) {
  const cur = currentTopic();
  const path = h("div");
  for (const [ui, u] of UNITS.entries()) {
    const done = u.topics.filter(id => topicCrowns(id) > 0).length;
    path.append(h("div", { class: "unit-head", style: { backgroundColor: u.color, backgroundImage: ornamentUrl(), "--uc-d": shade(u.color) } },
      h("div", {},
        h("p", { style: { margin: 0, fontSize: "13px", textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 900, opacity: .9 } }, `${t("unit")} ${ui + 1} · ${u.level}`),
        h("h2", {}, tn(u)), h("p", { style: { fontWeight: 800 } }, u.ky),
        h("div", { class: "unit-prog" }, h("span", { class: "mini" }, h("i", { style: { width: Math.round(100 * done / u.topics.length) + "%" } })), `${done}/${u.topics.length}`)),
      h("button", { class: "guide-btn", onClick: () => guidebook(u) }, icon("book"), getLang() === "ru" ? "Справочник" : "Guidebook")));
    const col = h("div", { class: "path" });
    u.topics.forEach((id, i) => {
      const tp = TOPICS[id]; const crowns = topicCrowns(id); const unlocked = isUnlocked(id);
      const offset = Math.round(Math.sin((i + ui * 2) * 1.05) * 72);
      const isCur = id === cur && unlocked;
      const node = h("button", { class: "node" + (!unlocked ? " locked" : crowns >= LEVELS ? " done" : ""), style: { "--c": unlocked && crowns < LEVELS ? u.color : undefined, "--cd": unlocked && crowns < LEVELS ? shade(u.color) : undefined }, "aria-label": tn(tp) },
        icon(!unlocked ? "lock" : crowns >= LEVELS ? "crown" : tp.passages ? "book" : isCur ? "star" : crowns ? "check" : "star"));
      const wrap = h("div", { class: "node-wrap" + (isCur ? " is-current" : ""), style: { transform: `translateX(${offset}px)` } },
        unlocked && crowns < LEVELS ? ring(crowns ? crowns / LEVELS : wordsLearned(id) / tp.words.length / LEVELS, 100, "var(--yellow)") : null,
        isCur ? h("div", { class: "start-bubble" }, t("start")) : null,
        node, crowns ? h("span", { class: "node-crowns" }, icon("crown"), crowns) : null,
        h("div", { class: "node-label" }, tn(tp)));
      node.addEventListener("click", (e) => { e.stopPropagation(); sound.tap(); openNodePop(wrap, id, u, unlocked); });
      col.append(wrap);
    });
    // reward chest at the end of each unit
    const allDone = u.topics.every(id => topicCrowns(id) > 0);
    const opened = (prog().chests || []).includes(u.id);
    const chest = h("button", { class: "node chest" + (opened ? " open" : allDone ? " ready" : ""), "aria-label": "Chest" }, icon(opened ? "check" : "trophy"));
    chest.addEventListener("click", (e) => { e.stopPropagation(); openChest(u, allDone, opened); });
    col.append(h("div", { class: "node-wrap", style: { transform: `translateX(${Math.round(Math.sin((u.topics.length + ui * 2) * 1.05) * 72)}px)` } }, chest, h("div", { class: "node-label" }, opened ? "+20 XP" : getLang() === "ru" ? "Сундук" : "Treasure")));
    col.append(h("div", { class: "path-deco " + (ui % 2 ? "left" : "right") }, mascot(DECO[ui % DECO.length], 130)));
    path.append(col);
  }
  const rail = h("div", { class: "rail" }, reviewPanel(), streakPanel(), goalPanel(), wordOfDay(), classPanel(), unitsPanel());
  main.append(h("div", { class: "home-grid" }, path, rail));
  setTimeout(() => { const c = main.querySelector(".is-current"); if (c) c.scrollIntoView({ block: "center" }); }, 50);
}
function shade(hex) { const n = parseInt(hex.slice(1), 16); const f = (x) => Math.max(0, Math.round(x * .8)); return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`; }

function openChest(u, ready, opened) {
  const ru = getLang() === "ru";
  if (opened) return toast(ru ? "Этот сундук уже открыт" : "You've already opened this chest");
  if (!ready) return toast(ru ? "Пройдите все темы раздела, чтобы открыть сундук" : "Finish every topic in this unit to open the chest");
  const p = prog(); p.chests = (p.chests || []).concat(u.id); profile.xp += 20; dailyXp(); p.daily.xp += 20; save();
  sound.done(); confetti();
  modal({ title: ru ? "Сундук открыт!" : "Chest opened!", body: h("div", { class: "center" }, mascot("cheer", 130), h("h2", { style: { color: "var(--yellow-d)" } }, "+20 XP"), h("p", { class: "muted" }, `${tn(u)} — ${u.ky}`)), actions: [{ label: t("continue"), kind: "primary", onClick: () => render() }] });
}

function guidebook(u) {
  const li = getLang() === "ru" ? 2 : 1;
  modal({ title: `${tn(u)} · ${u.ky}`, wide: true, body: h("div", {}, u.topics.map(id => {
    const tp = TOPICS[id];
    return h("div", { class: "panel" }, h("div", { class: "panel-head" }, h("h3", {}, tn(tp)), h("span", { class: "muted" }, tp.ky)),
      h("p", { style: { marginTop: 0 } }, tn(tp.tip)),
      h("div", { class: "row wrap" }, tp.words.slice(0, 8).map(w => h("span", { class: "pill" }, h("span", { class: "ky" }, w[0]), " — ", w[li].split("|")[0]))),
      tp.sentences[0] ? h("p", { class: "small", style: { marginBottom: 0 } }, h("b", { class: "ky" }, tp.sentences[0][0]), " — ", tp.sentences[0][li].split("|")[0]) : null);
  })) });
}

let openPop = null;
document.addEventListener("click", () => { if (openPop) { if (openPop.parentNode) openPop.parentNode.style.zIndex = ""; openPop.remove(); openPop = null; } });
function openNodePop(wrap, id, u, unlocked) {
  if (openPop) { if (openPop.parentNode) openPop.parentNode.style.zIndex = ""; openPop.remove(); }
  const tp = TOPICS[id]; const crowns = topicCrowns(id);
  let level = Math.min(crowns, LEVELS - 1);
  const pop = h("div", { class: "pop", style: { "--c": unlocked ? u.color : "#afafaf" }, onClick: (e) => e.stopPropagation() });
  if (!unlocked) {
    pop.append(h("h3", {}, tn(tp)), h("p", {}, t("lockedText")), h("button", { class: "btn", onClick: () => startTopic(id, 0, true) }, "Jump here"));
  } else {
    const lvls = h("div", { class: "levels" });
    const drawLv = () => lvls.replaceChildren(...[t("lvLearn"), t("lvPractise"), t("lvSentences")].map((lb, i) => h("button", { class: level === i ? "on" : "", disabled: i > crowns, title: i > crowns ? t("locked") : "", onClick: () => { level = i; drawLv(); } }, i > crowns ? icon("lock") : null, lb)));
    drawLv();
    const learned = wordsLearned(id), totalW = tp.words.length;
    pop.append(h("h3", {}, tn(tp)), h("p", {}, tp.ky + ` · ${crowns}/${LEVELS} `, icon("crown")), lvls,
      crowns === 0 ? h("div", { class: "pop-words" }, h("div", { class: "mini" }, h("i", { style: { width: Math.round(100 * learned / totalW) + "%" } })), `${learned}/${totalW} ${t("words").toLowerCase()}`) : null,
      h("p", { class: "small", style: { fontWeight: 600 } }, tn(tp.tip)),
      h("button", { class: "btn", onClick: () => startTopic(id, level) }, t("startLesson")),
      h("button", { class: "link-btn", style: { color: "#fff", width: "100%", marginTop: "6px" }, onClick: () => showTopicWords(id) }, t("words")));
  }
  wrap.style.zIndex = "40"; wrap.append(pop); openPop = pop;
}

function startTopic(id, level, jump = false) {
  if (openPop) { openPop.remove(); openPop = null; }
  regenHearts();
  if (profile.hearts <= 0) return noHearts();
  const ex = buildLesson([id], { count: jump ? 14 : level === 0 ? 10 : 12, level: jump ? 1 : level, lang: getLang(), intro: !jump && level !== 1, known: seenSet() });
  // Before the very first lesson of a topic, explain it (with examples) so students understand, not just guess.
  const tpx = TOPICS[id]; const li = getLang() === "ru" ? 2 : 1;
  if (!jump && level === 0 && wordsLearned(id) === 0) ex.unshift({ type: "tip", title: tn(tpx), text: tn(tpx.tip), examples: tpx.sentences.slice(0, 2).map(x => [x[0], x[li].split("|")[0]]) });
  runLesson({
    exercises: ex, mode: "practice", hearts: profile.hearts,
    onHeart: (n) => { profile.hearts = n; if (n < MAX_HEARTS && !prog().heartsAt) prog().heartsAt = Date.now(); save(); },
    onReport: reportDialog,
    onDone: (res) => {
      if (jump && res.acc < 80 && !res.failed) toast("Almost! Score 80% to jump ahead.", "bad");
      if (!res.failed) markSeen(ex);
      afterLesson(awardLesson(res, { topicId: (jump && res.acc < 80) ? null : id, level }));
    },
    onQuit: () => render(),
  });
}

function noHearts() {
  modal({ title: t("outOfHearts"), body: h("div", { class: "center" }, mascot("sad", 110), h("p", {}, t("outOfHeartsText"))), actions: [
    { label: t("practice"), kind: "primary", onClick: () => startReview(false) },
  ] });
}

// Words whose review date has come (spaced repetition).
function dueWords() { return srsDue(prog().srs, today()); }
function startSrsReview() {
  const ids = shuffle(dueWords()).slice(0, 15);
  if (!ids.length) return toast(getLang() === "ru" ? "Сегодня повторять нечего — отлично!" : "Nothing to review today — great!", "good");
  runLesson({ exercises: buildReview(ids, { lang: getLang() }), mode: "practice", hearts: null, onReport: reportDialog, onDone: (res) => afterLesson(awardLesson(res, { review: true })), onQuit: render });
}
function reviewPanel() {
  const n = dueWords().length; if (!n) return null; const ru = getLang() === "ru";
  return h("div", { class: "panel review-card", onClick: startSrsReview }, h("div", { class: "panel-head" }, h("span", { style: { color: "var(--purple-d)" } }, icon("refresh")), h("h3", {}, ru ? "Повторение" : "Time to review")),
    h("p", { style: { margin: "0 0 10px", fontWeight: 700 } }, ru ? `${n} слов пора повторить, чтобы не забыть.` : `${n} word${n === 1 ? "" : "s"} to review so you don't forget.`),
    h("button", { class: "btn purple block sm" }, icon("play"), ru ? "Повторить" : "Review now"));
}

function streakPanel() {
  const st = streakAlive(); const ru = getLang() === "ru";
  return h("div", { class: "panel" }, h("div", { class: "panel-head" }, h("span", { style: { color: st ? "var(--orange)" : "var(--ink-3)" } }, icon("flame")), h("h3", {}, `${st} ${ru ? "дн. подряд" : "day streak"}`)), weekRow());
}
function goalPanel() {
  const p = prog(); const x = dailyXp(); const pct = Math.min(100, Math.round(100 * x / p.goal));
  return h("div", { class: "panel goal-card" }, h("div", {},
    h("h3", { style: { margin: "0 0 4px" } }, t("dailyGoal")), h("div", { class: "muted small", style: { marginBottom: "10px", fontWeight: 800 } }, `${x} / ${p.goal} XP`),
    h("div", { class: "goal-bar" }, h("i", { style: { width: pct + "%" } })),
    pct >= 100 ? h("p", { class: "small", style: { color: "var(--green-d)", fontWeight: 900, margin: "8px 0 0" } }, "Азамат! Goal reached!") : null),
    mascot(pct >= 100 ? "cheer" : "happy", 76));
}
function wordOfDay() {
  const d = today(); let hsh = 0; for (const ch of d) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
  const id = TOPIC_ORDER[hsh % TOPIC_ORDER.length]; const tp = TOPICS[id]; const w = tp.words[hsh % tp.words.length];
  const li = getLang() === "ru" ? 2 : 1;
  return h("div", { class: "panel wotd" }, h("div", { class: "ornament", style: { backgroundImage: ornamentUrl("rgba(255,255,255,.12)") } }),
    h("div", { class: "wk" }, getLang() === "ru" ? "Слово дня" : "Word of the day"),
    h("div", { class: "w" }, w[0]), h("div", { class: "tl" }, translit(w[0])), h("div", { class: "tr" }, w[li].split("|")[0]),
    kyVoice() ? h("button", { class: "icon-btn", style: { color: "#fff" }, onClick: () => speakKy(w[0]) }, icon("speaker")) : null);
}
function classPanel() {
  if (guest) return null;
  const pending = classes.flatMap(c => c.homework.filter(hw => !hw.submission && new Date(hw.due_at) > new Date()).map(hw => ({ hw, c })));
  return h("div", { class: "panel" }, h("div", { class: "panel-head" }, h("span", { style: { color: "var(--purple-d)" } }, icon("pen")), h("h3", {}, t("homework"))),
    pending.length ? h("div", { class: "list" }, pending.slice(0, 4).map(({ hw, c }) => h("div", { class: "item click", onClick: () => startHomework(hw, c) }, h("div", { class: "grow" }, h("div", { class: "title" }, hw.title), h("div", { class: "sub due-soon" }, `${t("dueIn")} ${relTime(hw.due_at, getLang())}`)), icon("right"))))
      : h("p", { class: "muted small", style: { margin: 0 } }, classes.length ? t("noHomework") : t("noClasses")),
    !classes.length ? h("button", { class: "btn sm block", style: { marginTop: "12px" }, onClick: () => { view = "class"; render(); } }, t("joinClass")) : null);
}
function unitsPanel() {
  const done = TOPIC_ORDER.filter(id => topicCrowns(id) > 0).length;
  return h("div", { class: "panel" }, h("div", { class: "panel-head" }, h("span", { style: { color: "var(--yellow-d)" } }, icon("crown")), h("h3", {}, t("topicsDone"))), h("div", { class: "row" }, h("div", { class: "bar", style: { flex: 1 } }, h("i", { style: { width: Math.round(100 * done / TOPIC_ORDER.length) + "%" } })), h("b", {}, `${done}/${TOPIC_ORDER.length}`)));
}

// Celebration screen when a lesson extends the daily streak.
function streakScreen(then) {
  const ru = getLang() === "ru";
  const root = h("div", { class: "lesson" }, h("div", { class: "lesson-body" }, h("div", { class: "lesson-inner streak-screen" },
    h("div", { class: "big-flame" }, icon("flame")), h("div", { class: "n" }, streakAlive()),
    h("h2", {}, ru ? "дней подряд!" : "day streak!"), h("p", { class: "muted" }, ru ? "Возвращайтесь завтра, чтобы продолжить серию." : "Come back tomorrow to keep it going."), weekRow())),
    h("div", { class: "lesson-foot" }, h("div", { class: "inner" }, h("span"), h("button", { class: "btn primary", onClick: () => { root.remove(); then(); } }, t("continue")))));
  document.body.append(root); sound.done();
}
function afterLesson(info) { if (info && info.firstToday) streakScreen(render); else render(); }

function showTopicWords(id) {
  if (openPop) { openPop.remove(); openPop = null; }
  const tp = TOPICS[id]; const lang = getLang(); const li = lang === "ru" ? 2 : 1;
  const row = (x) => h("div", { class: "word-row" }, h("div", {}, h("div", { class: "ky" }, x[0]), h("div", { class: "tl" }, translit(x[0]))), h("div", {}, x[li].split("|")[0]),
    kyVoice() ? h("button", { class: "icon-btn", onClick: () => speakKy(x[0]) }, icon("speaker")) : h("span"));
  modal({ title: `${tn(tp)} · ${tp.ky}`, wide: true, body: h("div", {}, h("p", { class: "muted" }, tn(tp.tip)),
    h("div", { class: "card", style: { padding: 0 } }, tp.words.map(row)), h("h3", { class: "section-title" }, "Sentences"), h("div", { class: "card", style: { padding: 0 } }, tp.sentences.map(row)),
    ...(tp.passages || []).map(p => h("div", { class: "reading", style: { marginTop: "16px" } }, h("div", { class: "ky" }, p.ky), h("div", { class: "trans" }, p[lang])))) });
}

// ───────────────────────── Practice ─────────────────────────
function viewPractice(main) {
  const learned = TOPIC_ORDER.filter(id => topicCrowns(id) > 0);
  main.append(h("h1", { class: "page-title" }, t("practice")), h("p", { class: "page-sub" }, t("practiceText")));
  main.append(h("div", { class: "grid" },
    practiceCard("refresh", getLang() === "ru" ? "Повторение слов" : "Word review", `${dueWords().length} ${getLang() === "ru" ? "к повторению" : "due today"}`, "var(--purple-d)", startSrsReview, !dueWords().length),
    practiceCard("shuffle", t("mixedReview"), `${learned.length} ${t("topicsDone").toLowerCase()}`, "var(--green)", () => startReview(false), !learned.length),
    practiceCard("target", t("mistakes"), `${(prog().mistakes || []).length}`, "var(--red)", () => startReview(true), !(prog().mistakes || []).length),
    practiceCard("grid", t("flashcards"), t("tapToFlip"), "var(--blue)", flashcards, false),
    practiceCard("chat", getLang() === "ru" ? "Диалоги Замяткина" : "Zamyatkin dialogues", getLang() === "ru" ? "Слушайте и повторяйте диалоги" : "Listen to and repeat real dialogues", "var(--purple-d)", () => { view = "dialogues"; render(); }, false)));
  const q = h("input", { class: "input", placeholder: t("searchWords"), onInput: () => draw() });
  const list = h("div", { class: "card", style: { padding: 0 } });
  const words = allWords(getLang());
  const draw = () => {
    const s = q.value.trim().toLowerCase();
    const res = (s ? words.filter(w => w.ky.toLowerCase().includes(s) || w.tr.toLowerCase().includes(s) || translit(w.ky).toLowerCase().includes(s)) : words).slice(0, 80);
    list.replaceChildren(...res.map(w => h("div", { class: "word-row" }, h("div", {}, h("div", { class: "ky" }, w.ky), h("div", { class: "tl" }, translit(w.ky))), h("div", {}, w.tr), h("span", { class: "pill" + ((prog().words[w.id] || 0) > 0 ? " green" : "") }, tn(TOPICS[w.topic])))));
  };
  draw();
  unitTests(main);
  const ru = getLang() === "ru";
  /* Your own words, as a game you can play with somebody. The link carries the
     words of the topics you have actually finished, so it is a game about this
     week rather than a game about the whole course — and it is the same link
     whether you send it to a friend or open it yourself. */
  const mine = learned.length ? learned.slice(-6) : TOPIC_ORDER.slice(0, 2);
  const gameAt = playLink(mine, getLang(), {
    title: (ru ? "Мои слова" : "My words") + " · LearnKyrgyz" }) || "https://quoldek.web.app";
  main.append(h("a", { class: "card click quoldek-card", href: gameAt, target: "_blank", rel: "noopener" },
    h("span", { class: "up-ic" }, icon("star")),
    h("div", { class: "grow" }, h("h3", { style: { margin: 0 } }, ru ? "Сыграйте своими словами" : "Play with your own words"),
      h("p", { class: "muted", style: { margin: "4px 0 0" } }, learned.length
        ? (ru ? "Викторина из слов тем, которые вы прошли — играйте с друзьями на Quoldek."
              : "A quiz made of the words from the topics you have finished — play it with friends on Quoldek.")
        : (ru ? "Пройдите первую тему, и здесь появится игра из ваших слов."
              : "Finish your first topic and a game of your own words appears here."))),
    icon("right")));
  main.append(h("h2", { class: "section-title" }, `${t("words")} (${words.length})`), q, h("div", { style: { height: "12px" } }), list);
}
// Self-check unit tests: 20 mixed questions, 15-minute timer, no hints until the end.
function unitTests(main) {
  const ru = getLang() === "ru"; const p = prog(); p.tests = p.tests || {};
  main.append(h("h2", { class: "section-title" }, ru ? "Тесты по разделам" : "Unit tests"), h("p", { class: "muted", style: { marginTop: "-6px" } }, ru ? "20 вопросов, 15 минут. Проверьте, что вы запомнили." : "20 questions, 15 minutes. Check what you've remembered."),
    h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" } }, UNITS.map((u, i) => {
      const best = p.tests[u.id];
      return h("div", { class: "card click test-card", style: { borderTop: `6px solid ${u.color}` }, onClick: () => startUnitTest(u, i) },
        h("div", { class: "row" }, h("span", { class: "lvl-tag" }, u.level), h("span", { class: "grow" }), best != null ? gradeChip(best >= 90 ? 5 : best >= 75 ? 4 : best >= 50 ? 3 : 2) : null),
        h("h3", { style: { margin: "8px 0 2px" } }, `${ru ? "Раздел" : "Unit"} ${i + 1}`), h("p", { class: "muted", style: { margin: 0 } }, tn(u)),
        best != null ? h("p", { class: "small", style: { margin: "6px 0 0", fontWeight: 800 } }, `${ru ? "Лучший результат" : "Best"}: ${best}%`) : null);
    })));
}
function startUnitTest(u, i) {
  const ru = getLang() === "ru";
  modal({ title: `${ru ? "Тест" : "Test"}: ${tn(u)}`, body: h("div", { class: "center" }, mascot("think", 100), h("p", {}, ru ? "20 вопросов · 15 минут · ответы покажем в конце." : "20 questions · 15 minutes · answers are shown at the end.")), actions: [
    { label: t("cancel"), kind: "ghost" },
    { label: t("start"), kind: "primary", onClick: () => runLesson({ exercises: buildExam(u.topics, { count: 20, lang: getLang() }), mode: "exam", timeLimit: 15 * 60, hearts: null,
      onDone: (res) => { const p = prog(); p.tests = p.tests || {}; p.tests[u.id] = Math.max(p.tests[u.id] || 0, res.acc); showExamReview(res); afterLesson(awardLesson({ ...res, xp: Math.round(res.acc / 5) })); }, onQuit: render }) },
  ] });
}
// After an exam: show which answers were right or wrong.
function showExamReview(res) {
  const ru = getLang() === "ru";
  modal({ title: ru ? "Ваши ответы" : "Your answers", wide: true, body: h("div", {},
    h("div", { class: "row", style: { justifyContent: "center", gap: "16px", marginBottom: "12px" } }, gradeChip(res.acc >= 90 ? 5 : res.acc >= 75 ? 4 : res.acc >= 50 ? 3 : 2, "big"), h("b", { style: { fontSize: "28px" } }, `${res.correct}/${res.total} · ${res.acc}%`)),
    h("div", { class: "list" }, res.answers.map((a, i) => h("div", { class: "item" }, h("span", { style: { color: a.ok ? "var(--green)" : "var(--red)" } }, icon(a.ok ? "check" : "x")), h("div", { class: "grow" }, h("div", { class: "title" }, a.prompt || `#${i + 1}`), h("div", { class: "sub" }, a.given || (ru ? "— нет ответа" : "— no answer"))))))) });
}

function practiceCard(ic, title, sub, color, onClick, disabled) {
  return h("div", { class: "card click", style: { opacity: disabled ? .55 : 1 }, onClick: disabled ? null : onClick }, h("div", { style: { color, fontSize: "34px" } }, icon(ic)), h("h3", {}, title), h("p", { class: "muted", style: { margin: 0 } }, sub));
}
function startReview(mistakesOnly) {
  const learned = TOPIC_ORDER.filter(id => topicCrowns(id) > 0);
  let topics = learned.length ? learned : [TOPIC_ORDER[0]];
  if (mistakesOnly) { const m = [...new Set((prog().mistakes || []).map(x => x.split(":")[0]))].filter(x => TOPICS[x]); if (m.length) topics = m; }
  const ex = buildLesson(shuffle(topics).slice(0, 6), { count: 12, level: 1, lang: getLang() });
  runLesson({ exercises: ex, mode: "practice", hearts: null, onReport: reportDialog, onDone: (res) => afterLesson(awardLesson(res, { review: true })), onQuit: render });
}
function flashcards() {
  const pool = shuffle(allWords(getLang()).filter(w => isUnlocked(w.topic))).slice(0, 20);
  let i = 0;
  const box = h("div");
  const draw = () => {
    if (i >= pool.length) { box.replaceChildren(h("div", { class: "center" }, mascot("happy", 100), h("h3", {}, "Азамат!"))); return; }
    const w = pool[i];
    const card = h("div", { class: "flash", onClick: () => card.classList.toggle("flip") }, h("div", { class: "flash-in" }, h("div", { class: "flash-face" }, h("div", {}, w.ky, h("div", { class: "small muted" }, translit(w.ky)))), h("div", { class: "flash-face back" }, w.tr)));
    box.replaceChildren(h("p", { class: "center muted small" }, `${i + 1} / ${pool.length} · ${t("tapToFlip")}`), card,
      h("div", { class: "row", style: { justifyContent: "center" } }, h("button", { class: "btn ghost", onClick: () => { pool.push(w); i++; draw(); } }, t("again")), h("button", { class: "btn primary", onClick: () => { prog().words[w.id] = (prog().words[w.id] || 0) + 1; save(); i++; draw(); } }, t("knew"))));
  };
  draw();
  modal({ title: t("flashcards"), body: box });
}

// ───────────────────────── Zamyatkin dialogues (optional) ─────────────────────────
function viewDialogues(main) {
  const ru = getLang() === "ru"; const p = prog(); p.dialogs = p.dialogs || {};
  main.append(h("div", { class: "hero-strip", style: { backgroundColor: "var(--purple-d)", backgroundImage: ornamentUrl() } },
    h("div", {}, h("h1", {}, ru ? "Диалоги по Замяткину" : "Zamyatkin dialogues"), h("p", {}, dialogueExplainer(ru))), mascot("cheer", 110)));
  if (!p.zamyatkin) main.append(h("div", { class: "panel row wrap" }, h("span", { class: "grow" }, ru ? "Хотите, чтобы вкладка «Диалоги» всегда была в меню?" : "Want a Dialogues tab in the menu?"), h("button", { class: "btn purple sm", onClick: () => { p.zamyatkin = true; save(); render(); } }, ru ? "Включить" : "Turn on")));
  main.append(h("div", { class: "grid" }, DIALOGUES.map(d => {
    const dp = p.dialogs[d.id] || {}; const n = dp.listens || 0; const pct = Math.min(100, Math.round(100 * n / LISTEN_GOAL));
    return h("div", { class: "card click dlg-card", onClick: () => openDialogue({ dialogue: d, progress: dp, onProgress: (np) => {
      const before = (p.dialogs[d.id] || {}).listens || 0;
      p.dialogs[d.id] = np;
      if (np.listens > before) { profile.xp += 2; dailyXp(); p.daily.xp += 2; p.days = p.days || {}; p.days[today()] = (p.days[today()] || 0) + 2; if (profile.last_active !== today()) { const dd = profile.last_active ? Math.round((new Date(today()) - new Date(profile.last_active)) / 86400000) : 99; profile.streak = dd === 1 ? profile.streak + 1 : 1; profile.last_active = today(); } }
      save();
    } }) },
      h("div", { class: "row" }, h("span", { class: "lvl-tag" }, d.level), h("span", { class: "grow" }), n >= LISTEN_GOAL ? h("span", { class: "pill green" }, icon("check"), ru ? "Освоен" : "Mastered") : null),
      h("h3", { style: { margin: "8px 0 2px" } }, d.ky), h("p", { class: "muted", style: { margin: "0 0 12px" } }, ru ? d.ru : d.en),
      h("div", { class: "row" }, h("div", { class: "bar", style: { flex: 1 } }, h("i", { style: { width: pct + "%", background: "var(--purple)" } })), h("b", { class: "small" }, `${n}/${LISTEN_GOAL}`)));
  })));
}

// ───────────────────────── Classroom ─────────────────────────
// Big "keep going" card so the way back to lessons is always obvious.
function continueCard() {
  const ru = getLang() === "ru";
  const id = currentTopic(); const tp = TOPICS[id]; const u = topicUnit(id) || UNITS[0];
  const pending = guest ? [] : classes.flatMap(c => c.homework.filter(hw => !hw.submission && new Date(hw.due_at) > new Date()).map(hw => ({ hw, c })));
  const next = pending.sort((a, b) => new Date(a.hw.due_at) - new Date(b.hw.due_at))[0];
  return h("div", { class: "continue-grid" },
    h("div", { class: "continue-card", style: { backgroundColor: u.color, backgroundImage: ornamentUrl() } },
      mascot("cheer", 96),
      h("div", { class: "grow" }, h("div", { class: "cc-kicker" }, ru ? "Продолжить учёбу" : "Continue learning"), h("h2", {}, tn(tp)), h("div", { class: "cc-sub" }, tp.ky)),
      h("button", { class: "btn cc-go", onClick: () => startTopic(id, Math.min(topicCrowns(id), LEVELS - 1)) }, icon("play"), t("start"))),
    next ? h("div", { class: "continue-card hw", onClick: () => startHomework(next.hw, next.c) },
      h("span", { class: "cc-icon" }, icon("pen")),
      h("div", { class: "grow" }, h("div", { class: "cc-kicker" }, t("homework")), h("h2", {}, next.hw.title), h("div", { class: "cc-sub" }, `${t("dueIn")} ${relTime(next.hw.due_at, getLang())}`)),
      h("button", { class: "btn cc-go" }, icon("play"), t("start"))) : null,
    h("div", { class: "quick-links" },
      h("button", { class: "ql", onClick: () => { view = "learn"; render(); } }, h("span", { class: "ql-ic", style: { background: "var(--green)" } }, icon("home")), t("learn")),
      h("button", { class: "ql", onClick: () => { view = "practice"; render(); } }, h("span", { class: "ql-ic", style: { background: "var(--blue)" } }, icon("target")), t("practice")),
      h("button", { class: "ql", onClick: () => startReview(false) }, h("span", { class: "ql-ic", style: { background: "var(--orange)" } }, icon("shuffle")), t("mixedReview")),
      h("button", { class: "ql", onClick: flashcards }, h("span", { class: "ql-ic", style: { background: "var(--purple)" } }, icon("grid")), t("flashcards"))));
}

function viewClass(main) {
  main.append(h("h1", { class: "page-title" }, t("classroom")), continueCard());
  if (guest) { main.append(h("div", { class: "empty" }, mascot("think", 110), h("p", {}, t("guestNote")), h("button", { class: "btn primary", onClick: () => { try { localStorage.removeItem("lk.guestMode"); } catch {} renderAuth("signup"); } }, t("signUp")))); return; }
  const code = h("input", { class: "input", placeholder: "ABC123", maxlength: 6, style: { textTransform: "uppercase", letterSpacing: "4px", fontWeight: 900, maxWidth: "200px" } });
  main.append(h("div", { class: "panel" }, h("h3", {}, t("joinClass")), h("form", { class: "row wrap", onSubmit: (e) => { e.preventDefault(); if (code.value.trim()) joinFlow(code.value.trim()); } }, code, h("button", { class: "btn primary" }, t("join")))));
  const inv = h("div"); main.append(inv); loadInvites(inv);
  if (!classes.length) { main.append(h("div", { class: "empty" }, mascot("think", 110), h("p", {}, t("noClasses")))); return; }
  for (const c of classes) {
    const tabs = ["homework", "leaderboard", "presentations"];
    let tab = "homework";
    const body = h("div");
    const tabBar = h("div", { class: "tabs" });
    const drawTabs = () => tabBar.replaceChildren(...tabs.map(k => h("button", { class: tab === k ? "on" : "", onClick: () => { tab = k; drawTabs(); drawBody(); } }, t(k))));
    const drawBody = () => { body.replaceChildren(); if (tab === "homework") homeworkList(c, body); else if (tab === "leaderboard") leaderboard(c, body); else presList(c, body); };
    drawTabs(); drawBody();
    main.append(h("div", { class: "card", style: { marginBottom: "18px", borderTop: `6px solid ${c.color}` } },
      h("div", { class: "row wrap" }, h("div", { class: "grow" }, h("h2", { style: { margin: 0 } }, c.name), h("div", { class: "muted" }, c.teacher, c.description ? " · " + c.description : "")),
        h("button", { class: "link-btn small", onClick: async () => { if (!confirm("Leave this class?")) return; await client.from("classroom_members").delete().eq("classroom_id", c.id).eq("student_id", user.id); await loadClasses(); render(); } }, "Leave")),
      h("div", { style: { height: "12px" } }), tabBar, body));
  }
}

async function loadInvites(host) {
  const { data } = await client.from("classroom_invites").select("id,classroom_id,created_at");
  if (!data || !data.length) return;
  host.append(h("div", { class: "panel", style: { borderColor: "var(--blue)" } }, h("h3", {}, t("invites")), h("div", { class: "list" }, data.map(inv => {
    const row = h("div", { class: "item" }, icon("mail"), h("div", { class: "grow title" }, "You're invited to a class"), h("button", { class: "btn primary sm", onClick: async () => {
      const { error } = await client.rpc("accept_invite", { invite_id: inv.id });
      if (error) return toast(errMsg(error), "bad");
      toast("Joined!", "good"); await loadClasses(); startLiveWatch(); render();
    } }, t("accept")));
    return row;
  }))));
}

async function joinFlow(code) {
  if (guest) return renderAuth("signup");
  const { data, error } = await client.rpc("classroom_preview", { code });
  if (error || !data || !data.length) return toast(error ? errMsg(error) : "No classroom has that code", "bad");
  const c = data[0];
  modal({ title: t("joinClass"), body: h("div", { class: "center" }, mascot("happy", 100), h("h2", {}, c.name), h("p", { class: "muted" }, c.teacher_name, c.description ? " · " + c.description : "")), actions: [
    { label: t("cancel"), kind: "ghost" },
    { label: t("join"), kind: "primary", onClick: async () => {
      const { error } = await client.rpc("join_classroom", { code });
      if (error) { toast(errMsg(error), "bad"); return false; }
      confetti(); sound.done(); await loadClasses(); startLiveWatch(); view = "class"; render();
    } },
  ] });
}

function hwState(hw) {
  if (hw.submission) return "done";
  return new Date(hw.due_at) < new Date() ? "missed" : "open";
}
function homeworkList(c, host) {
  if (!c.homework.length) { host.append(h("p", { class: "muted" }, t("noHomework"))); return; }
  host.append(h("p", { class: "small muted" }, t("gradeScale")));
  const list = h("div", { class: "list" });
  for (const hw of c.homework.slice().sort((a, b) => new Date(b.due_at) - new Date(a.due_at))) {
    const st = hwState(hw);
    const g = st === "done" ? (hw.submission.teacher_grade ?? hw.submission.grade) : st === "missed" ? 2 : null;
    const sub = st === "open" ? h("span", { class: "due-soon" }, `${t("due")}: ${fmtDate(hw.due_at, getLang())} (${relTime(hw.due_at, getLang())})`)
      : st === "missed" ? h("span", { class: "overdue" }, t("late")) : h("span", {}, `${t("submitted")} · ${Math.round(hw.submission.score)}%`);
    list.append(h("div", { class: "item click hw-card", style: { "--c": st === "missed" ? "var(--red)" : st === "done" ? "var(--green)" : "var(--blue)" }, onClick: () => st === "open" ? startHomework(hw, c) : showSubmission(hw, c) },
      h("div", { class: "grow" }, h("div", { class: "title" }, hw.kind === "exam" ? h("span", { class: "pill red", style: { marginRight: "6px" } }, getLang() === "ru" ? "ЭКЗАМЕН" : "EXAM") : null, hw.title), h("div", { class: "sub" }, sub), hw.topic_ids.length ? h("div", { class: "sub" }, hw.topic_ids.map(id => TOPICS[id] ? tn(TOPICS[id]) : id).join(" · ")) : null),
      g != null ? gradeChip(g, st === "missed" ? "auto" : "") : h("button", { class: "btn primary sm" }, t("start"))));
  }
  host.append(list);
}

function showSubmission(hw, c) {
  const s = hw.submission;
  if (!s) return modal({ title: hw.title, body: h("div", { class: "center" }, gradeChip(2, "big auto"), h("p", {}, t("late")), h("p", { class: "muted small" }, `${t("due")}: ${fmtDate(hw.due_at, getLang())}`)) });
  const g = s.teacher_grade ?? s.grade;
  const ru = getLang() === "ru";
  if (hw.kind === "exam") return modal({ title: hw.title, body: h("div", {},
    h("div", { class: "row", style: { justifyContent: "center", gap: "20px" } }, gradeChip(g, "big"), h("div", {}, h("div", { class: "muted small" }, t("yourScore")), h("div", { style: { fontSize: "28px", fontWeight: 900 } }, `${s.correct}/${s.total}`))),
    s.flag ? h("p", { class: "exam-note bad" }, icon("x"), s.flag === "left_fullscreen" ? (ru ? "Вы вышли из полноэкранного режима — оценка 0." : "You left full screen — grade 0.") : (ru ? "Вы покинули экзамен — оценка 0." : "You left the exam — grade 0.")) : null,
    s.teacher_comment ? h("div", { class: "panel", style: { marginTop: "14px" } }, h("b", {}, t("teacherComment")), h("p", { style: { margin: "6px 0 0" } }, s.teacher_comment)) : null,
    h("p", { class: "small muted", style: { marginTop: "14px" } }, ru ? "Правильные ответы экзамена не показываются, чтобы задания оставались честными для всех." : "Exam answers are never shown, so the exam stays fair for everyone.")) });
  modal({ title: hw.title, body: h("div", {},
    h("div", { class: "row", style: { justifyContent: "center", gap: "20px" } }, gradeChip(g, "big"), h("div", {}, h("div", { class: "muted small" }, t("yourScore")), h("div", { style: { fontSize: "28px", fontWeight: 900 } }, `${s.correct}/${s.total} · ${Math.round(s.score)}%`))),
    s.teacher_comment ? h("div", { class: "panel", style: { marginTop: "14px" } }, h("b", {}, t("teacherComment")), h("p", { style: { margin: "6px 0 0" } }, s.teacher_comment)) : null,
    (s.writing || []).length ? h("div", {}, h("h3", { class: "section-title" }, t("writing")), (s.writing || []).map(w => h("div", { class: "panel" }, h("div", { class: "muted small" }, w.prompt), h("div", { class: "ky" }, w.text)))) : null,
    h("h3", { class: "section-title" }, "Answers"),
    h("div", { class: "list" }, (s.answers || []).map((a, i) => h("div", { class: "item" }, h("span", { style: { color: a.ok ? "var(--green)" : "var(--red)" } }, icon(a.ok ? "check" : "x")), h("div", { class: "grow" }, h("div", { class: "title" }, a.prompt || `#${i + 1}`), h("div", { class: "sub" }, a.given || "—")))))) });
}

async function startHomework(hw, c) {
  if (new Date(hw.due_at) < new Date()) return showSubmission(hw, c);
  if (hw.kind === "exam") return startExam(hw, c);
  let sets = [];
  if ((hw.set_ids || []).length) {
    const { data, error } = await client.from("question_sets").select("id,title,questions").in("id", hw.set_ids);
    if (error) return toast(errMsg(error), "bad");
    sets = data || [];
  }
  const isExam = hw.kind === "exam";
  let exercises = hw.topic_ids.length && hw.question_count ? (isExam ? buildExam(hw.topic_ids, { count: hw.question_count, lang: getLang() }) : buildLesson(hw.topic_ids, { count: hw.question_count, level: hw.difficulty ?? 1, lang: getLang(), typing: hw.difficulty === 2 })) : [];
  const custom = sets.flatMap(s => (s.questions || []).map((q, i) => customExercise(q, s.id, i))).filter(Boolean);
  // Every student gets a different order: the teacher's own questions land at random spots.
  for (const q of shuffle(custom)) exercises.splice(Math.floor(Math.random() * (exercises.length + 1)), 0, q);
  const prompts = (hw.writing_prompts || []).filter(p => p && (p.prompt || typeof p === "string"));
  if (!exercises.length && !prompts.length) return toast("This homework has no questions yet", "bad");
  modal({ title: hw.title, body: h("div", {}, hw.instructions ? h("p", {}, hw.instructions) : null,
    h("p", { class: "muted" }, `${exercises.length} questions`, prompts.length ? ` + ${prompts.length} ${t("writing").toLowerCase()}` : ""),
    h("p", { class: "due-soon" }, `${t("due")}: ${fmtDate(hw.due_at, getLang())}`),
    isExam ? h("p", { class: "exam-note" }, icon("clock"), getLang() === "ru" ? `Экзамен${hw.time_limit_minutes ? ` · ${hw.time_limit_minutes} мин` : ""}. Ответы покажут в конце. Если выйти — ответы будут отправлены.` : `Exam${hw.time_limit_minutes ? ` · ${hw.time_limit_minutes} min` : ""}. Answers are shown at the end. Leaving submits your answers.`) : null,
    h("p", { class: "small muted" }, "One attempt only. " + t("gradeScale"))), actions: [
    { label: t("cancel"), kind: "ghost" },
    { label: t("startHomework"), kind: "primary", onClick: () => go() },
  ] });

  function go() {
    const writingStep = prompts.length ? (container, setFoot) => new Promise((resolve) => {
      const areas = prompts.map(p => { const ta = h("textarea", { class: "input type-area", placeholder: t("writeHere"), maxlength: 2000 }); return { prompt: typeof p === "string" ? p : p.prompt, ta }; });
      container.replaceChildren(h("h2", { class: "ex-title" }, t("writing")), ...areas.map(a => h("div", { class: "panel" }, h("b", {}, a.prompt), h("div", { style: { height: "10px" } }), a.ta, kyKeys(a.ta))));
      setFoot("", [h("span"), h("button", { class: "btn primary", onClick: () => resolve({ writing: areas.map(a => ({ prompt: a.prompt, text: a.ta.value.trim() })) }) }, t("submitHomework"))]);
    }) : null;
    if (!exercises.length) {
      // writing-only homework
      const host = h("div", { class: "lesson" }, h("div", { class: "lesson-body" }, h("div", { class: "lesson-inner" })), h("div", { class: "lesson-foot" }, h("div", { class: "inner" })));
      document.body.append(host);
      const setFoot = (k, kids) => host.querySelector(".lesson-foot .inner").replaceChildren(...kids);
      writingStep(host.querySelector(".lesson-inner"), setFoot).then(async (w) => { host.remove(); await submit({ correct: 1, total: 1, answers: [], ...w }); });
      return;
    }
    runLesson({ exercises, mode: isExam ? "exam" : "homework", timeLimit: isExam && hw.time_limit_minutes ? hw.time_limit_minutes * 60 : null, hearts: null, after: writingStep,
      resultExtra: (res) => h("p", { class: "muted" }, `${res.correct}/${res.total}`),
      onDone: async (res) => { await submit(res); awardLesson(res); if (isExam) showExamReview(res); },
      onQuit: () => render() });
  }
  async function submit(res) {
    const payload = { homework_id: hw.id, correct: res.correct, total: res.total, answers: res.answers || [], writing: res.writing || [] };
    const { data, error } = await client.from("submissions").insert(payload).select().single();
    if (error) { toast(errMsg(error), "bad"); render(); return; }
    toast(t("submittedOk"), "good");
    await loadClasses(); render();
    const hw2 = classes.find(x => x.id === c.id)?.homework.find(x => x.id === hw.id);
    if (hw2) showSubmission(hw2, c);
  }
}

// ── Sealed exams: the questions come from the server without answers, the server marks them ──
function startExam(hw, c) {
  const ru = getLang() === "ru";
  const el = document.documentElement;
  const canFs = !!(el.requestFullscreen || el.webkitRequestFullscreen);
  const fs = !!hw.fullscreen;
  const rules = [
    ru ? "Во время экзамена нет подсказок и правильных ответов." : "No hints and no correct answers during the exam.",
    ru ? "Начать можно только один раз. В конце вы увидите оценку." : "You can start only once. You'll see your grade at the end.",
    fs ? (canFs ? (ru ? "Экзамен идёт на весь экран. Если выйти из полноэкранного режима, переключить вкладку или приложение — экзамен закончится с оценкой 0." : "The exam is full screen. Leaving full screen, switching tab or app, or closing the page ends the exam with a 0.")
      : (ru ? "Если переключить вкладку или приложение или закрыть страницу — экзамен закончится с оценкой 0." : "Switching tab or app, or closing the page, ends the exam with a 0.")) : null,
  ].filter(Boolean);
  modal({ title: hw.title, body: h("div", {}, hw.instructions ? h("p", {}, hw.instructions) : null,
    h("p", { class: "muted" }, `${hw.question_count} ${ru ? "вопросов" : "questions"}${hw.time_limit_minutes ? ` · ${hw.time_limit_minutes} ${ru ? "мин" : "min"}` : ""}`),
    h("p", { class: "due-soon" }, `${t("due")}: ${fmtDate(hw.due_at, getLang())}`),
    h("div", { class: "exam-note" + (fs ? " bad" : "") }, fs ? icon("lock") : icon("clock"), h("ul", {}, rules.map(r => h("li", {}, r))))), actions: [
    { label: t("cancel"), kind: "ghost" },
    { label: ru ? "Начать экзамен" : "Start exam", kind: fs ? "danger" : "primary", onClick: () => { go(); } },
  ] });

  const inFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
  const exitFs = () => { try { if (inFs()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch {} };
  async function go() {
    // Full screen must be requested straight from the click.
    let fsReq = null;
    if (fs && canFs) fsReq = (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    try { await fsReq; } catch { toast(ru ? "Разрешите полноэкранный режим, чтобы начать" : "Allow full screen to start the exam", "bad"); return; }
    const { data: { session } } = await client.auth.getSession();
    const token = session?.access_token;
    const { data, error } = await client.rpc("exam_start", { hw: hw.id });
    if (error) {
      exitFs();
      const m = error.message || "";
      return toast(/exam_not_ready/.test(m) ? (ru ? "Учитель ещё готовит этот экзамен" : "Your teacher is still preparing this exam")
        : /past_due/.test(m) ? t("late") : errMsg(error), "bad");
    }
    if (data.status !== "ok") { exitFs(); await loadClasses(); render(); return examEndedModal(data); }
    const exercises = data.questions.map((q, i) => ({ ...q, qi: i })).filter(q => !data.answered.includes(q.qi));
    if (!exercises.length) { const r = await finishExam(null); exitFs(); await loadClasses(); render(); return r && examEndedModal(r); }

    const pending = new Set();
    function save(i, resp) {
      const p = (async () => {
        for (let k = 0; k < 5; k++) {
          const { error } = await client.rpc("exam_answer", { hw: hw.id, idx: i, resp });
          if (!error || /time_up|already_submitted|no_attempt/.test(error.message || "")) return;
          await new Promise(r => setTimeout(r, 700 * (k + 1)));
        }
      })();
      pending.add(p); p.finally(() => pending.delete(p));
    }
    let ended = false;
    async function finishExam(reason) {
      await Promise.allSettled([...pending]);
      const { data, error } = await client.rpc("exam_finish", { hw: hw.id, reason });
      if (error) throw error;
      return data;
    }
    // Leaving the exam: tell the server even if the page is closing.
    function beacon(reason) {
      try { fetch(`${SUPABASE_URL}/rest/v1/rpc/exam_finish`, { method: "POST", keepalive: true, headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ hw: hw.id, reason }) }); } catch {}
    }
    const onFs = () => { if (!inFs()) leave("left_fullscreen"); };
    const onVis = () => { if (document.visibilityState === "hidden") leave("left_exam"); };
    const onHide = () => leave("left_exam");
    function guards(on) {
      if (!fs) return;
      const f = on ? "addEventListener" : "removeEventListener";
      if (canFs) { document[f]("fullscreenchange", onFs); document[f]("webkitfullscreenchange", onFs); }
      document[f]("visibilitychange", onVis); window[f]("pagehide", onHide);
    }
    async function leave(reason) {
      if (ended) return; ended = true; guards(false);
      L.abort();
      beacon(reason);
      let r = null;
      for (let k = 0; k < 4 && !r; k++) { try { r = await finishExam(reason); } catch { await new Promise(res => setTimeout(res, 800)); } }
      exitFs();
      L.showGrade(r || { grade: 0, correct: 0, total: data.questions.length, flag: reason });
    }
    const L = runLesson({ exercises, mode: "exam", sealed: true, timeLimit: data.seconds_left, hearts: null,
      onAnswer: save,
      submit: async () => { if (!ended) { ended = true; guards(false); } return finishExam(null); },
      onDone: async () => { exitFs(); await loadClasses(); render(); },
      onQuit: () => render() });
    guards(true);
  }
}
function examEndedModal(r) {
  const ru = getLang() === "ru";
  modal({ title: ru ? "Экзамен уже сдан" : "Exam already handed in", body: h("div", { class: "center" },
    gradeChip(r.grade, "big"),
    h("p", {}, `${r.correct}/${r.total}`),
    r.flag ? h("p", { class: "muted" }, ru ? "Экзамен был покинут — оценка 0." : "The exam was left — grade 0.") : null) });
}

async function leaderboard(c, host) {
  host.append(h("p", { class: "muted" }, "…"));
  const { data: mem } = await client.from("classroom_members").select("student_id").eq("classroom_id", c.id);
  const ids = (mem || []).map(m => m.student_id);
  const { data: ps } = ids.length ? await client.from("profiles").select("id,full_name,xp,streak,avatar_color").in("id", ids).order("xp", { ascending: false }) : { data: [] };
  const list = ps || [];
  const podium = list.length >= 2 ? h("div", { class: "podium" }, [1, 0, 2].map(i => list[i] ? h("div", { class: `p p${i + 1}` }, avatar(list[i].full_name, list[i].avatar_color, i === 0 ? 58 : 46), h("b", {}, list[i].full_name), h("span", { class: "xp" }, `${list[i].xp} XP`), h("div", { class: "step" }, i + 1)) : h("div"))) : null;
  host.replaceChildren(podium || h("span"), h("div", {}, list.map((p, i) => h("div", { class: "lb-row" + (p.id === user.id ? " me" : "") }, h("span", { class: "lb-rank" + (i < 3 ? ` top${i + 1}` : "") }, i < 3 ? icon("trophy") : i + 1), avatar(p.full_name, p.avatar_color), h("b", { class: "grow" }, p.full_name), h("span", { class: "stat flame small" }, icon("flame"), p.streak), h("span", { class: "stat xp" }, icon("bolt"), p.xp)))));
}
function presList(c, host) {
  if (!c.presentations.length) { host.append(h("p", { class: "muted" }, "—")); return; }
  host.append(h("div", { class: "list" }, c.presentations.map(p => h("div", { class: "item click", onClick: () => openSlideshow(p) }, icon("slides"), h("div", { class: "grow" }, h("div", { class: "title" }, p.title), h("div", { class: "sub" }, `${(p.slides || []).length} slides`)),
    deckUrlOf(p) ? h("a", { class: "btn ghost sm", href: officeViewerUrl(deckUrlOf(p)), target: "_blank", rel: "noopener", onClick: (e) => e.stopPropagation() }, "PowerPoint") : null,
    h("button", { class: "btn sm" }, t("open"))))));
}

// ───────────────────────── Profile ─────────────────────────
function viewProfile(main) {
  const p = prog(); const ru = getLang() === "ru";
  const wordsLearned = Object.values(p.words).filter(v => v > 0).length;
  main.append(h("div", { class: "profile-banner", style: { backgroundColor: profile.avatar_color || "var(--blue)", backgroundImage: ornamentUrl() } },
    avatar(profile.full_name, "rgba(0,0,0,.18)", 92),
    h("div", { class: "grow" }, h("h1", {}, profile.full_name), h("div", { class: "muted" }, guest ? "Guest" : user.email), h("div", { class: "muted small", style: { marginTop: "4px" } }, `${p.lessons || 0} ${ru ? "уроков пройдено" : "lessons completed"}`)),
    mascot("wave", 110)));
  main.append(h("h2", { class: "section-title" }, t("stats")), h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" } },
    statTile("flame", streakAlive(), t("streak"), "var(--orange)"), statTile("bolt", profile.xp, "XP", "var(--yellow-d)"),
    statTile("book", wordsLearned, t("wordsLearned"), "var(--blue)"), statTile("crown", TOPIC_ORDER.filter(id => topicCrowns(id) > 0).length, t("topicsDone"), "var(--green)")));
  // activity calendar: last 5 weeks
  const days = p.days || {}; const now = new Date(); const start = new Date(now); start.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 28);
  const cells = []; for (let i = 0; i < 35; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const k = d.toISOString().slice(0, 10); const v = days[k] || 0; cells.push(h("span", { class: "c" + (v >= 30 ? " l3" : v >= 15 ? " l2" : v > 0 ? " l1" : ""), title: `${k}: ${v} XP` })); }
  main.append(h("h2", { class: "section-title" }, ru ? "Активность" : "Activity"), h("div", { class: "panel" }, h("div", { class: "cal" }, cells)));
  main.append(h("h2", { class: "section-title" }, t("achievements")), h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" } }, ACHIEVEMENTS.map(a => {
    const got = p.achievements.includes(a.id);
    return h("div", { class: "badge-tile" + (got ? " got" : "") }, h("span", { class: "medal" }, icon(a.icon)), h("b", {}, tn(a)));
  })));
  const nameIn = h("input", { class: "input", value: profile.full_name, maxlength: 80 });
  main.append(h("h2", { class: "section-title" }, t("settings")), h("div", { class: "panel stack" },
    h("label", { class: "field" }, h("span", {}, t("fullName")), h("div", { class: "row" }, nameIn, h("button", { class: "btn sm", onClick: () => { profile.full_name = nameIn.value.trim() || profile.full_name; save(); toast(t("save"), "good"); render(); } }, t("save")))),
    h("div", {}, h("div", { class: "muted small", style: { fontWeight: 800, marginBottom: "6px" } }, t("uiLanguage")), h("div", { class: "seg" }, ["en", "ru"].map(l => h("button", { class: getLang() === l ? "on" : "", onClick: () => { setLang(l); profile.learn_from = l; save(); render(); } }, l === "en" ? "English" : "Русский")))),
    h("div", {}, h("div", { class: "muted small", style: { fontWeight: 800, marginBottom: "6px" } }, "Avatar"), h("div", { class: "row" }, COLORS.map(col => h("button", { style: { width: "34px", height: "34px", borderRadius: "50%", background: col, border: profile.avatar_color === col ? "3px solid var(--ink)" : "0", cursor: "pointer" }, onClick: () => { profile.avatar_color = col; save(); render(); } })))),
    h("div", {}, h("div", { class: "muted small", style: { fontWeight: 800, marginBottom: "6px" } }, t("dailyGoal")), h("div", { class: "seg" }, [10, 20, 30, 50].map(g => h("button", { class: p.goal === g ? "on" : "", onClick: () => { p.goal = g; save(); render(); } }, `${g} XP`)))),
    h("div", {}, h("div", { class: "muted small", style: { fontWeight: 800, marginBottom: "6px" } }, t("theme")), themeSeg()),
    h("label", { class: "row" }, h("input", { type: "checkbox", checked: sound.enabled, onChange: (e) => sound.set(e.target.checked) }), t("sound")),
    h("label", { class: "row" }, h("input", { type: "checkbox", checked: voice.enabled, onChange: (e) => voice.set(e.target.checked) }), getLang() === "ru" ? "Озвучивать кыргызские слова" : "Speak Kyrgyz words aloud"),
    h("label", { class: "row" }, h("input", { type: "checkbox", checked: !!p.zamyatkin, onChange: (e) => { p.zamyatkin = e.target.checked; save(); render(); } }), getLang() === "ru" ? "Метод Замяткина: показывать вкладку «Диалоги»" : "Zamyatkin method: show the Dialogues tab")));
  main.append(h("div", { style: { marginTop: "20px" } }, guest
    ? h("button", { class: "btn primary", onClick: () => { try { localStorage.removeItem("lk.guestMode"); } catch {} renderAuth("signup"); } }, t("signUp"))
    : h("button", { class: "btn ghost", onClick: () => client.auth.signOut() }, icon("logout"), t("signOut"))));
}
function statTile(ic, v, label, color) { return h("div", { class: "stat-tile" }, h("span", { style: { color } }, icon(ic)), h("div", {}, h("div", { class: "v" }, v), h("div", { class: "muted small" }, label))); }

function themeSeg() {
  let cur = "auto"; try { cur = localStorage.getItem("lk.theme") || "auto"; } catch {}
  return h("div", { class: "seg" }, [["auto", t("auto")], ["light", t("light")], ["dark", t("dark")]].map(([k, l]) => h("button", { class: cur === k ? "on" : "", onClick: () => { try { localStorage.setItem("lk.theme", k); } catch {} applyTheme(); render(); } }, l)));
}
function applyTheme() { let th = "auto"; try { th = localStorage.getItem("lk.theme") || "auto"; } catch {} if (th === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", th); }

// ───────────────────────── report ─────────────────────────
function reportDialog(item) {
  const note = h("textarea", { class: "input", placeholder: "What's wrong? / Что не так?", maxlength: 1000 });
  modal({ title: t("report"), body: h("div", {}, h("p", { class: "muted" }, t("reportText")), item ? h("p", { class: "ky" }, item.ky || item.id) : null, note), actions: [
    { label: t("cancel"), kind: "ghost" },
    { label: t("submit"), kind: "primary", onClick: async () => {
      if (guest) { toast(t("reportSent"), "good"); return; }
      const { error } = await client.from("vocab_reports").insert({ word_id: item ? item.id : "general", note: note.value.trim() });
      toast(error ? errMsg(error) : t("reportSent"), error ? "bad" : "good");
    } },
  ] });
}

boot();

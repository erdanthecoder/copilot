// LearnKyrgyz — teacher app
import { sb, SITES } from "../assets/js/config.js";
import { h, $, icon, mascot, toast, modal, confirmBox, fmtDate, relTime, gradeChip, avatar, kyKeys, errMsg, ornamentUrl, mountains } from "../assets/js/ui.js";
import { t, tn, getLang, setLang } from "../assets/js/i18n.js";
import { UNITS, TOPICS, TOPIC_ORDER, AREAS, topicLevel, topicArea } from "../assets/js/curriculum.js";
import { buildLesson, buildExam, customExercise, translit, shuffle, gradeFor, sealPaper } from "../assets/js/engine.js";
import { topicQuestions, topicMeta, toCSV, BANK_VERSION } from "../assets/js/gamebank.js";
import { showWhatsNew, versionBadge } from "../assets/js/version.js";
import { buildWorksheet, SECTIONS } from "../assets/js/worksheet.js";
import { runLesson } from "../assets/js/lesson.js";
import { googleBlock, signUpWithPassword } from "../assets/js/google.js";
import { openMeeting } from "../assets/js/call.js";
import { renderSlide, presentLive } from "../assets/js/present.js";
import { loadDeck, officeViewerUrl, deckUrlOf } from "../assets/js/pptx.js";

const client = sb();
const app = $("#app");
const COLORS = ["#1cb0f6", "#58cc02", "#ce82ff", "#ff9600", "#ff4b4b", "#2b70c9", "#00a36c", "#e5a000"];
const LEVEL_ORDER = ["A1", "A2", "B1"];
let user = null, profile = null, view = "classes", classes = [], currentClass = null, classTab = "students";

// ───────────────────────── auth ─────────────────────────
async function boot() {
  applyTheme();
  const { data } = await client.auth.getSession();
  if (data.session) return signedIn(data.session.user);
  renderAuth("signin");
}
client.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT") location.reload(); });

function renderAuth(mode, msg) {
  const signup = mode === "signup";
  const err = h("div", { class: "auth-err hidden" });
  const name = h("input", { class: "input", required: true, maxlength: 80, placeholder: "Айгүл Асанова" });
  const email = h("input", { class: "input", type: "email", required: true, autocomplete: "email" });
  const pw = h("input", { class: "input", type: "password", required: true, minlength: 6, autocomplete: signup ? "new-password" : "current-password" });
  const btn = h("button", { class: "btn purple block", type: "submit" }, signup ? "Create teacher account" : t("signIn"));
  const art = h("div", { class: "auth-art" }, mountains(),
    h("div", { class: "art-copy" }, h("h2", {}, "Teach Kyrgyz with superpowers."), h("p", {}, "Classes, homework with due dates, an automatic gradebook, live video lessons and presentations.")),
    h("div", { class: "art-letters" }, ["5", "4", "3", "Ң"].map((l, i) => h("span", { class: "letter-tile", style: { left: [12, 74, 20, 82][i] + "%", top: [34, 30, 52, 48][i] + "%", animationDelay: i * .5 + "s" } }, l))),
    h("div", { class: "art-mascot" }, mascot("wave", 210), h("span", { class: "bubble", style: { left: "-80px", top: "40px" } }, "Саламатсызбы!")));
  app.replaceChildren(h("div", { class: "auth-split" }, art, h("div", { class: "auth" }, h("div", { class: "auth-box" },
    h("div", { style: { display: "flex", justifyContent: "center" } }, brandEl()),
    mascot(signup ? "happy" : "wave", 100),
    h("h1", {}, signup ? "Set up your classroom" : "Welcome back, teacher"),
    h("p", { class: "muted" }, "Everything you need to teach Kyrgyz in one place."),
    h("form", { onSubmit: async (e) => {
      e.preventDefault(); btn.disabled = true; err.classList.add("hidden");
      try {
        if (signup) {
          signedIn(await signUpWithPassword({ email: email.value.trim(), password: pw.value, fullName: name.value.trim(), role: "teacher", learnFrom: getLang() }));
        } else {
          const { data, error } = await client.auth.signInWithPassword({ email: email.value.trim(), password: pw.value });
          if (error) throw error;
          signedIn(data.user);
        }
      } catch (ex) { err.textContent = errMsg(ex); err.classList.remove("hidden"); btn.disabled = false; }
    } }, msg ? h("div", { class: "auth-ok" }, msg) : null, err,
      googleBlock({ role: "teacher", learnFrom: getLang, onSignedIn: (u) => signedIn(u), onError: (e) => { err.textContent = errMsg(e); err.classList.remove("hidden"); } }),
      signup ? h("label", { class: "field" }, h("span", {}, "Name students will see"), name) : null,
      h("label", { class: "field" }, h("span", {}, t("email")), email),
      h("label", { class: "field" }, h("span", {}, t("password")), pw), btn),
    h("p", { class: "small muted" }, signup ? t("haveAccount") : "New teacher?", " ", h("button", { class: "link-btn", onClick: () => renderAuth(signup ? "signin" : "signup") }, signup ? t("signIn") : "Create account")),
    h("p", { class: "small muted" }, "Student? ", h("a", { href: SITES.student }, "Open the student app"))))));
}

async function signedIn(u) {
  user = u;
  const { data, error } = await client.from("profiles").select("*").eq("id", u.id).single();
  if (error || !data) { toast(errMsg(error || "Profile missing"), "bad"); return renderAuth("signin"); }
  if (data.role !== "teacher") {
    app.replaceChildren(h("div", { class: "auth" }, h("div", { class: "auth-box" }, mascot("think", 120), h("h1", {}, "This is a student account"), h("p", { class: "muted" }, "Create a separate teacher account to manage classes."), h("a", { class: "btn primary block", href: SITES.student }, "Open student app"), h("button", { class: "link-btn", onClick: () => client.auth.signOut() }, t("signOut")))));
    return;
  }
  profile = data; setLang(profile.learn_from || getLang());
  await loadClasses();
  render();
}

async function loadClasses() {
  const { data, error } = await client.from("classrooms").select("*").eq("teacher_id", user.id).order("created_at");
  if (error) toast(errMsg(error), "bad");
  classes = data || [];
  if (currentClass) currentClass = classes.find(c => c.id === currentClass.id) || null;
}

// ───────────────────────── shell ─────────────────────────
function brandEl() { return h("div", { class: "brand teacher" }, h("span", { class: "brand-mark" }, mascot("happy", 26, { hat: false })), "Learn", h("b", {}, "Kyrgyz"), user ? versionBadge("teacher", "en") : null); }
function render() {
  const nav = [["classes", "users", "Classes"], ["topics", "book", "Topics"], ["worksheets", "list", "Worksheets & tests"], ["questions", "pen", "My questions"], ["slides", "slides", "Presentations"], ["account", "settings", "Account"]];
  const main = h("main", { class: "main" });
  app.replaceChildren(h("div", { class: "shell teacher-app" },
    h("nav", { class: "side" }, brandEl(),
      nav.map(([id, ic, label]) => h("button", { class: "nav-btn" + (view === id ? " on" : ""), onClick: () => { view = id; if (id === "classes") currentClass = null; render(); } }, icon(ic), h("span", { class: "lbl" }, label))),
      h("div", { class: "spacer" }), h("div", { class: "side-foot row", style: { padding: "0 8px" } }, avatar(profile.full_name, "#a560e8", 32), h("span", { class: "small" }, profile.full_name))),
    main));
  ({ classes: currentClass ? viewClass : viewClasses, topics: viewTopics, worksheets: viewWorksheets, questions: viewQuestions, slides: viewSlides, account: viewAccount })[view](main);
  window.scrollTo(0, 0);
  if (!whatsNewChecked) {
    whatsNewChecked = true;
    if (classes.length) setTimeout(() => showWhatsNew("teacher", "en"), 700);
    else { try { localStorage.setItem("lk.seen.teacher", "2.0"); } catch {} }
  }
}

// ───────────────────────── Classes ─────────────────────────
function viewClasses(main) {
  main.append(h("div", { class: "hero-strip", style: { backgroundImage: ornamentUrl() } },
    h("div", {}, h("h1", {}, `Саламатсызбы, ${profile.full_name.split(" ")[0]}!`), h("p", {}, classes.length ? "Here's how your classes are doing." : "Let's set up your first classroom.")),
    mascot("wave", 120)));
  const stats = h("div", { class: "dash-stats" });
  main.append(stats);
  main.append(h("div", { class: "row wrap", style: { marginBottom: "14px" } }, h("h2", { class: "grow", style: { margin: 0 } }, "Your classes"), h("button", { class: "btn purple", onClick: classDialog }, icon("plus"), "New class")));
  if (!classes.length) { main.append(h("div", { class: "empty" }, mascot("cheer", 130), h("h2", {}, "Create your first classroom"), h("p", {}, "You'll get a join code and a link to share with students."), h("button", { class: "btn purple", onClick: classDialog }, icon("plus"), "New class"))); fillStats(stats, [], [], []); return; }
  const grid = h("div", { class: "grid" });
  main.append(grid);
  (async () => {
    const ids = classes.map(c => c.id);
    const [{ data: mem }, { data: hws }] = await Promise.all([client.from("classroom_members").select("classroom_id,student_id").in("classroom_id", ids), client.from("homework").select("id,classroom_id,due_at").in("classroom_id", ids)]);
    const sIds = [...new Set((mem || []).map(m => m.student_id))];
    const { data: ps } = sIds.length ? await client.from("profiles").select("id,full_name,avatar_color").in("id", sIds) : { data: [] };
    const { data: subs } = (hws || []).length ? await client.from("submissions").select("homework_id,grade,teacher_grade,submitted_at").in("homework_id", hws.map(x => x.id)) : { data: [] };
    fillStats(stats, mem || [], hws || [], subs || []);
    for (const c of classes) {
      const members = (mem || []).filter(m => m.classroom_id === c.id).map(m => (ps || []).find(p => p.id === m.student_id)).filter(Boolean);
      const open = (hws || []).filter(x => x.classroom_id === c.id && new Date(x.due_at) > new Date()).length;
      grid.append(h("div", { class: "card click class-card", onClick: () => { currentClass = c; classTab = "students"; render(); } },
        h("div", { class: "cc-head", style: { backgroundColor: c.color, backgroundImage: ornamentUrl() } }, h("h2", {}, c.name)),
        h("div", { class: "cc-body" }, h("p", { class: "muted", style: { margin: "0 0 12px" } }, c.description || "—"),
          h("div", { class: "row" }, h("div", { class: "avatar-stack" }, members.slice(0, 5).map(m => avatar(m.full_name, m.avatar_color, 30))), h("span", { class: "small muted" }, `${members.length} student${members.length === 1 ? "" : "s"}`), h("span", { class: "spacer" }), open ? h("span", { class: "pill blue" }, `${open} open`) : null, h("span", { class: "pill" }, h("b", {}, c.join_code))))));
    }
  })();
}
function fillStats(host, mem, hws, subs) {
  const students = new Set(mem.map(m => m.student_id)).size;
  const open = hws.filter(x => new Date(x.due_at) > new Date()).length;
  const gs = subs.map(x => x.teacher_grade ?? x.grade).filter(x => x != null);
  const avg = gs.length ? (gs.reduce((a, b) => a + b, 0) / gs.length).toFixed(1) : "—";
  const card = (bg, ic, v, l) => h("div", { class: "dash-stat", style: { background: bg } }, h("span", { style: { fontSize: "26px" } }, icon(ic)), h("div", { class: "v" }, v), h("div", { class: "l" }, l));
  host.replaceChildren(card("var(--purple-d)", "users", classes.length, "Classes"), card("var(--blue)", "user", students, "Students"), card("var(--orange)", "pen", open, "Open homework"), card("var(--green)", "star", avg, "Average grade"));
}

function classDialog(existing) {
  const c = existing && existing.id ? existing : null;
  const name = h("input", { class: "input", value: c?.name || "", maxlength: 80, placeholder: "7А — кыргыз тили" });
  const desc = h("input", { class: "input", value: c?.description || "", maxlength: 500, placeholder: "Beginners, Tuesdays & Thursdays" });
  let color = c?.color || COLORS[classes.length % COLORS.length];
  const sw = h("div", { class: "row wrap" });
  const drawSw = () => sw.replaceChildren(...COLORS.map(col => h("button", { type: "button", style: { width: "34px", height: "34px", borderRadius: "50%", background: col, border: color === col ? "3px solid var(--ink)" : "0", cursor: "pointer" }, onClick: () => { color = col; drawSw(); } })));
  drawSw();
  modal({ title: c ? "Edit class" : "New class", body: h("div", {}, h("label", { class: "field" }, h("span", {}, "Class name"), name), h("label", { class: "field" }, h("span", {}, "Description"), desc), h("div", { class: "field" }, h("span", {}, "Colour"), sw)), actions: [
    c ? { label: "Delete class", kind: "danger", onClick: async () => { if (!(await confirmBox("Delete class?", "This removes its homework, grades and members. It cannot be undone.", "Delete", true))) return false; const { error } = await client.from("classrooms").delete().eq("id", c.id); if (error) { toast(errMsg(error), "bad"); return false; } currentClass = null; await loadClasses(); render(); } } : null,
    { label: t("cancel"), kind: "ghost" },
    { label: t("save"), kind: "purple", onClick: async () => {
      if (!name.value.trim()) { toast("Name required", "bad"); return false; }
      const row = { name: name.value.trim(), description: desc.value.trim(), color };
      const { data, error } = c ? await client.from("classrooms").update(row).eq("id", c.id).select().single() : await client.from("classrooms").insert(row).select().single();
      if (error) { toast(errMsg(error), "bad"); return false; }
      await loadClasses(); currentClass = classes.find(x => x.id === data.id); render();
    } },
  ].filter(Boolean) });
}

function viewClass(main) {
  const c = currentClass;
  main.append(h("button", { class: "link-btn", onClick: () => { currentClass = null; render(); } }, icon("left"), "All classes"),
    h("div", { class: "row wrap", style: { margin: "8px 0 16px" } }, h("span", { style: { width: "16px", height: "48px", background: c.color, borderRadius: "8px" } }),
      h("div", { class: "grow" }, h("h1", { class: "page-title", style: { margin: 0 } }, c.name), h("div", { class: "muted" }, c.description)),
      h("button", { class: "btn ghost sm", onClick: () => classDialog(c) }, icon("edit"), "Edit")));
  const tabs = [["students", "users", "Students"], ["homework", "pen", "Homework"], ["grades", "grid", "Gradebook"], ["live", "cam", "Live lesson"], ["slides", "slides", "Presentations"]];
  main.append(h("div", { class: "tabs" }, tabs.map(([k, ic, l]) => h("button", { class: classTab === k ? "on" : "", onClick: () => { classTab = k; render(); } }, icon(ic), l))));
  const body = h("div"); main.append(body);
  ({ students: tabStudents, homework: tabHomework, grades: tabGrades, live: tabLive, slides: tabClassSlides })[classTab](body, c);
}

async function members(c) {
  const { data: mem } = await client.from("classroom_members").select("student_id,joined_at").eq("classroom_id", c.id);
  const ids = (mem || []).map(m => m.student_id);
  const { data: ps } = ids.length ? await client.from("profiles").select("id,full_name,xp,streak,last_active,progress,avatar_color").in("id", ids) : { data: [] };
  return (ps || []).map(p => ({ ...p, joined_at: mem.find(m => m.student_id === p.id)?.joined_at })).sort((a, b) => a.full_name.localeCompare(b.full_name));
}

async function tabStudents(body, c) {
  const link = `${SITES.student}?join=${c.join_code}`;
  const copy = (txt) => navigator.clipboard?.writeText(txt).then(() => toast("Copied", "good"), () => toast(txt));
  const email = h("input", { class: "input", type: "email", placeholder: "student@email.com" });
  const invList = h("div", { class: "list" });
  body.append(h("div", { class: "grid" },
    h("div", { class: "card" }, h("h3", {}, "Join code"), h("div", { class: "code-box" }, c.join_code), h("p", { class: "muted small" }, "Students open the student app → Classroom → enter this code."), h("button", { class: "btn ghost sm", onClick: () => copy(c.join_code) }, icon("copy"), "Copy code")),
    h("div", { class: "card" }, h("h3", {}, "Invite link"), h("p", { class: "small", style: { wordBreak: "break-all" } }, link), h("button", { class: "btn sm", onClick: () => copy(link) }, icon("link"), "Copy link")),
    h("div", { class: "card" }, h("h3", {}, "Invite by email"), h("form", { class: "row", onSubmit: async (e) => {
      e.preventDefault(); const v = email.value.trim(); if (!v) return;
      const { error } = await client.from("classroom_invites").insert({ classroom_id: c.id, email: v.toLowerCase() });
      if (error) return toast(errMsg(error), "bad");
      email.value = ""; toast("Invitation added — they'll see it when they sign in with that email.", "good"); drawInv();
    } }, email, h("button", { class: "btn purple sm" }, icon("mail"))), invList)));
  const drawInv = async () => {
    const { data } = await client.from("classroom_invites").select("*").eq("classroom_id", c.id);
    invList.replaceChildren(...(data || []).map(i => h("div", { class: "item", style: { padding: "6px 10px" } }, h("span", { class: "grow small" }, i.email), h("button", { class: "icon-btn", onClick: async () => { await client.from("classroom_invites").delete().eq("id", i.id); drawInv(); } }, icon("x")))));
  };
  drawInv();
  const list = h("div", {}, h("p", { class: "muted" }, "Loading…"));
  body.append(h("h2", { class: "section-title" }, "Students"), list);
  const ms = await members(c);
  if (!ms.length) { list.replaceChildren(h("div", { class: "empty" }, mascot("think", 100), h("p", {}, "No students yet. Share the code or link above."))); return; }
  list.replaceChildren(h("div", { class: "table-wrap" }, h("table", { class: "tbl" },
    h("thead", {}, h("tr", {}, h("th", {}, "Student"), h("th", { class: "c" }, "XP"), h("th", { class: "c" }, "Streak"), h("th", { class: "c" }, "Topics"), h("th", {}, "Last active"), h("th", {}))),
    h("tbody", {}, ms.map(p => h("tr", {},
      h("td", {}, h("div", { class: "row" }, avatar(p.full_name, p.avatar_color, 32), h("b", {}, p.full_name))),
      h("td", { class: "c" }, p.xp), h("td", { class: "c" }, p.streak),
      h("td", { class: "c" }, Object.values(p.progress?.topics || {}).filter(x => x.level > 0).length, " / ", TOPIC_ORDER.length),
      h("td", {}, p.last_active || "—"),
      h("td", { class: "c" }, h("button", { class: "icon-btn", title: "Remove from class", onClick: async () => {
        if (!(await confirmBox("Remove student?", `${p.full_name} will leave ${c.name}.`, "Remove", true))) return;
        const { error } = await client.from("classroom_members").delete().eq("classroom_id", c.id).eq("student_id", p.id);
        if (error) return toast(errMsg(error), "bad"); render();
      } }, icon("trash")))))))));
}

// ───────────────────────── Homework ─────────────────────────
async function tabHomework(body, c) {
  body.append(h("div", { class: "row wrap", style: { marginBottom: "14px" } }, h("p", { class: "muted grow", style: { margin: 0 } }, "Missing homework after the due date is automatically graded 2."), h("button", { class: "btn purple", onClick: () => homeworkDialog({ classroom: c }) }, icon("plus"), "Set homework")));
  const { data: hws, error } = await client.from("homework").select("*").eq("classroom_id", c.id).order("due_at", { ascending: false });
  if (error) return toast(errMsg(error), "bad");
  if (!hws.length) { body.append(h("div", { class: "empty" }, mascot("happy", 100), h("p", {}, "No homework yet. Pick topics from the full catalogue, add your own questions and choose a due date."))); return; }
  const ids = hws.map(x => x.id);
  const exams = hws.filter(x => x.kind === "exam" && new Date(x.due_at) > new Date());
  if (exams.length) {
    const { data: ready } = await client.from("exam_papers").select("homework_id").eq("variant", 0).in("homework_id", exams.map(x => x.id));
    for (const x of exams) if (!(ready || []).some(r => r.homework_id === x.id) && (x.topic_ids.length || (x.set_ids || []).length)) { try { await makeExamPapers(x); } catch {} }
  }
  const [{ data: subs }, ms] = await Promise.all([client.from("submissions").select("homework_id,student_id,grade,teacher_grade,score").in("homework_id", ids), members(c)]);
  const list = h("div", { class: "list" });
  for (const hw of hws) {
    const s = (subs || []).filter(x => x.homework_id === hw.id);
    const past = new Date(hw.due_at) < new Date();
    const avg = s.length ? Math.round(s.reduce((a, b) => a + Number(b.score), 0) / s.length) : null;
    list.append(h("div", { class: "item click hw-card", style: { "--c": past ? "var(--ink-3)" : "var(--purple-d)" }, onClick: () => homeworkReport(hw, c) },
      h("div", { class: "grow" }, h("div", { class: "title" }, hw.kind === "exam" ? h("span", { class: "pill red", style: { marginRight: "6px" } }, `EXAM${hw.time_limit_minutes ? " · " + hw.time_limit_minutes + " min" : ""}${hw.fullscreen ? " · FULL SCREEN" : ""}`) : null, hw.title),
        h("div", { class: "sub" }, past ? "Closed " : "Due ", fmtDate(hw.due_at, getLang()), ` (${relTime(hw.due_at, getLang())})`),
        h("div", { class: "sub" }, [hw.topic_ids.map(id => TOPICS[id] ? tn(TOPICS[id]) : id).join(", "), hw.set_ids?.length ? `${hw.set_ids.length} question set(s)` : "", (hw.writing_prompts || []).length ? `${hw.writing_prompts.length} writing` : ""].filter(Boolean).join(" · "))),
      h("div", { class: "center" }, h("div", { style: { fontWeight: 900, fontSize: "20px" } }, `${s.length}/${ms.length}`), h("div", { class: "small muted" }, "submitted")),
      avg != null ? h("div", { class: "center" }, h("div", { style: { fontWeight: 900, fontSize: "20px" } }, avg + "%"), h("div", { class: "small muted" }, "average")) : null,
      h("button", { class: "icon-btn", title: "Edit", onClick: (e) => { e.stopPropagation(); homeworkDialog({ classroom: c, hw }); } }, icon("edit"))));
  }
  body.append(list);
}

let setsCache = null, whatsNewChecked = false;
async function loadSets() { const { data } = await client.from("question_sets").select("*").eq("teacher_id", user.id).order("updated_at", { ascending: false }); setsCache = data || []; return setsCache; }

async function homeworkDialog({ classroom, hw = null, topics = [], exam = false, title: presetTitle = "" }) {
  const sets = await loadSets();
  const selTopics = new Set(hw ? hw.topic_ids : topics);
  const selSets = new Set(hw ? hw.set_ids || [] : []);
  const title = h("input", { class: "input", value: hw?.title || presetTitle || (topics.length === 1 ? tn(TOPICS[topics[0]]) : ""), maxlength: 120, placeholder: "Family & greetings practice" });
  const instr = h("textarea", { class: "input", maxlength: 2000, placeholder: "Instructions for students (optional)" }, hw?.instructions || "");
  let kind = hw?.kind || (exam ? "exam" : "homework");
  const count = h("input", { class: "input", type: "number", min: 0, max: 60, value: hw?.question_count ?? (kind === "exam" ? 20 : 12), style: { maxWidth: "120px" } });
  const timeLimit = h("input", { class: "input", type: "number", min: 1, max: 240, value: hw?.time_limit_minutes ?? 20, style: { maxWidth: "120px" } });
  const fsBox = h("input", { type: "checkbox", checked: !!hw?.fullscreen });
  let examLang = getLang();
  const langSeg = h("div", { class: "seg" });
  const drawLang = () => langSeg.replaceChildren(...[["en", "English"], ["ru", "Русский"]].map(([k, l]) => h("button", { type: "button", class: examLang === k ? "on" : "", onClick: () => { examLang = k; drawLang(); } }, l)));
  drawLang();
  const examOpts = h("div", { class: "row wrap", style: { gap: "20px" } }, h("label", { class: "field" }, h("span", {}, "Time limit (minutes)"), timeLimit), h("div", { class: "field" }, h("span", {}, "Questions in"), langSeg));
  const examBox = h("div", { class: "exam-setup" },
    examOpts,
    h("label", { class: "check-row" }, fsBox, h("span", {}, h("b", {}, "Full-screen exam"), h("span", { class: "small muted" }, " — the exam opens full screen. Leaving full screen, switching tab or app, or closing the page ends it with a 0."))),
    h("p", { class: "small muted", style: { margin: "6px 0 0" } }, icon("lock"), " Sealed: every student gets their own version of the paper; answers never reach students' devices and are marked on the server. No hints, no answer review afterwards, one attempt."));
  const hwOnly = [];
  const kindSeg = h("div", { class: "seg" });
  const drawKind = () => { kindSeg.replaceChildren(...[["homework", "Homework"], ["exam", "Exam (timed, no hints)"]].map(([k, l]) => h("button", { type: "button", class: kind === k ? "on" : "", onClick: () => { kind = k; drawKind(); } }, l))); examBox.classList.toggle("hidden", kind !== "exam"); hwOnly.forEach(x => x.classList.toggle("hidden", kind === "exam")); };
  drawKind();
  let diff = hw?.difficulty ?? 1;
  const diffSeg = h("div", { class: "seg" });
  const drawDiff = () => diffSeg.replaceChildren(...["Words only (easiest)", "Words & phrases", "Sentences & typing"].map((l, i) => h("button", { type: "button", class: diff === i ? "on" : "", onClick: () => { diff = i; drawDiff(); } }, l)));
  drawDiff();
  const due = h("input", { class: "input", type: "datetime-local", value: toLocalInput(hw ? new Date(hw.due_at) : defaultDue()), style: { maxWidth: "260px" } });
  let classId = classroom?.id || classes[0]?.id;
  const classSel = h("select", { class: "input", onChange: (e) => classId = e.target.value }, classes.map(c => h("option", { value: c.id, selected: c.id === classId }, c.name)));
  const prompts = (hw?.writing_prompts || []).map(p => typeof p === "string" ? p : p.prompt);
  const promptList = h("div", { class: "stack" });
  const drawPrompts = () => promptList.replaceChildren(...prompts.map((p, i) => h("div", { class: "row" }, h("input", { class: "input", value: p, placeholder: "e.g. Write 3 sentences about your family in Kyrgyz", onInput: (e) => prompts[i] = e.target.value }), h("button", { type: "button", class: "icon-btn", onClick: () => { prompts.splice(i, 1); drawPrompts(); } }, icon("trash")))),
    h("button", { type: "button", class: "btn ghost sm", onClick: () => { prompts.push(""); drawPrompts(); } }, icon("plus"), "Add writing task"));
  drawPrompts();
  const topicSummary = h("div", { class: "row wrap" });
  const drawSummary = () => topicSummary.replaceChildren(...[...selTopics].map(id => h("span", { class: "pill", style: { background: "#f5e8ff", color: "var(--purple-d)", borderColor: "transparent" } }, tn(TOPICS[id]))), h("button", { type: "button", class: "btn ghost sm", onClick: () => topicPicker(selTopics, drawSummary) }, icon("plus"), selTopics.size ? "Change topics" : "Choose topics"));
  drawSummary();
  const setsBox = h("div", { class: "stack" }, sets.length ? sets.map(s => {
    const row = h("div", { class: "topic-chip" + (selSets.has(s.id) ? " on" : ""), onClick: () => { selSets.has(s.id) ? selSets.delete(s.id) : selSets.add(s.id); row.classList.toggle("on"); } }, h("span", { class: "chk" }, icon("check")), h("b", {}, s.title), h("span", { class: "count" }, `${(s.questions || []).length} questions`));
    return row;
  }) : h("p", { class: "muted small" }, "No question sets yet — create them in “My questions”."));

  modal({ title: hw ? "Edit homework" : exam ? "Set an exam" : "Set homework", wide: true, body: h("div", {},
    h("div", { class: "field" }, h("span", {}, "Type"), kindSeg),
    !classroom ? h("label", { class: "field" }, h("span", {}, "Class"), classSel) : null,
    h("label", { class: "field" }, h("span", {}, "Title"), title),
    h("label", { class: "field" }, h("span", {}, "Instructions"), instr),
    h("div", { class: "field" }, h("span", {}, "Topics (randomised questions from the curriculum)"), topicSummary),
    h("div", { class: "row wrap", style: { gap: "20px" } }, h("label", { class: "field" }, h("span", {}, "Number of questions"), count), hwOnly[0] = h("div", { class: "field" }, h("span", {}, "Difficulty (homework)"), diffSeg)),
    examBox,
    h("div", { class: "field" }, h("span", {}, "Your own question sets"), setsBox),
    hwOnly[1] = h("div", { class: "field" }, h("span", {}, "Writing tasks (students write sentences, you read and grade)"), promptList),
    h("label", { class: "field" }, h("span", {}, "Due date & time"), due),
    h("p", { class: "small muted" }, "Grades: ≥90% → 5 · ≥75% → 4 · ≥50% → 3 · otherwise 2. Not submitted by the due date → 2. You can override any grade.")), actions: [
    hw ? { label: "Delete", kind: "danger", onClick: async () => { if (!(await confirmBox("Delete homework?", "All submissions and grades for it will be deleted.", "Delete", true))) return false; await client.from("homework").delete().eq("id", hw.id); render(); } } : null,
    { label: "Preview", kind: "ghost", onClick: async () => { if (kind === "exam" && selTopics.size) runLesson({ exercises: buildExam([...selTopics], { count: Number(count.value) || 20, lang: getLang() }), mode: "preview", hearts: null }); else previewHomework([...selTopics], Number(count.value), diff, [...selSets]); return false; } },
    { label: hw ? t("save") : kind === "exam" ? "Set exam" : "Set homework", kind: "purple", onClick: async () => {
      const d = new Date(due.value);
      if (!title.value.trim()) { toast("Add a title", "bad"); return false; }
      if (isNaN(d)) { toast("Choose a due date", "bad"); return false; }
      if (!hw && d < new Date()) { toast("The due date is in the past", "bad"); return false; }
      if (!selTopics.size && !selSets.size && !prompts.some(p => p.trim())) { toast("Choose topics, a question set or a writing task", "bad"); return false; }
      if (kind === "exam" && !selTopics.size && !selSets.size) { toast("An exam needs topics or a question set", "bad"); return false; }
      const row = { classroom_id: classId, title: title.value.trim(), instructions: instr.value.trim(), topic_ids: [...selTopics], set_ids: [...selSets], question_count: selTopics.size ? Math.max(4, Math.min(60, Number(count.value) || 12)) : 0, difficulty: diff, writing_prompts: prompts.map(p => p.trim()).filter(Boolean).map(p => ({ prompt: p })), due_at: d.toISOString(), kind, time_limit_minutes: kind === "exam" ? Math.max(1, Math.min(240, Number(timeLimit.value) || 20)) : null, fullscreen: kind === "exam" && fsBox.checked };
      if (kind === "exam") row.writing_prompts = [];
      const { data: saved, error } = hw ? await client.from("homework").update(row).eq("id", hw.id).select().single() : await client.from("homework").insert(row).select().single();
      if (error) { toast(errMsg(error), "bad"); return false; }
      if (kind === "exam") {
        const changed = !hw || hw.kind !== "exam" || String(hw.topic_ids) !== String(row.topic_ids) || String(hw.set_ids || []) !== String(row.set_ids) || hw.question_count !== row.question_count;
        try {
          const { data: started } = await client.from("exam_attempts").select("student_id").eq("homework_id", saved.id).limit(1);
          const { data: have } = await client.from("exam_papers").select("variant").eq("homework_id", saved.id).limit(1);
          if ((started || []).length) { if (changed) toast("Students have already started — the exam questions stay as they were.", "bad"); }
          else if (changed || !(have || []).length) await makeExamPapers(saved, examLang);
        } catch (e) { toast("Couldn't prepare the exam papers: " + errMsg(e), "bad"); return false; }
      }
      toast(hw ? "Saved" : kind === "exam" ? "Exam set!" : "Homework set!", "good");
      if (currentClass) { classTab = "homework"; } render();
    } },
  ].filter(Boolean) });
  drawKind();
}
// Sealed exam papers: several random versions, each with its answer key kept on the server.
async function makeExamPapers(hw, lang = getLang()) {
  const { data: mem } = await client.from("classroom_members").select("student_id").eq("classroom_id", hw.classroom_id);
  const n = Math.min(60, Math.max(8, (mem || []).length + 4));
  const { data: sets } = (hw.set_ids || []).length ? await client.from("question_sets").select("id,questions").in("id", hw.set_ids) : { data: [] };
  const rows = [];
  for (let v = 0; v < n; v++) {
    const ex = hw.topic_ids.length && hw.question_count ? buildExam(hw.topic_ids, { count: hw.question_count, lang, sealed: true }) : [];
    const custom = shuffle((sets || []).flatMap(s => (s.questions || []).map((q, i) => customExercise(q, s.id, i))).filter(Boolean));
    for (const q of custom) ex.splice(Math.floor(Math.random() * (ex.length + 1)), 0, q);
    rows.push({ homework_id: hw.id, variant: v, ...sealPaper(ex) });
  }
  const del = await client.from("exam_papers").delete().eq("homework_id", hw.id);
  if (del.error) throw del.error;
  for (let i = 0; i < rows.length; i += 10) {
    const { error } = await client.from("exam_papers").insert(rows.slice(i, i + 10));
    if (error) throw error;
  }
}
function defaultDue() { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(20, 0, 0, 0); return d; }
function toLocalInput(d) { const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; }

async function previewHomework(topicIds, count, level, setIds) {
  let ex = topicIds.length ? buildLesson(topicIds, { count: Math.max(4, count || 12), level, lang: getLang() }) : [];
  if (setIds.length) { const sets = (setsCache || []).filter(s => setIds.includes(s.id)); ex = ex.concat(sets.flatMap(s => s.questions.map((q, i) => customExercise(q, s.id, i))).filter(Boolean)); }
  if (!ex.length) return toast("Nothing to preview yet", "bad");
  runLesson({ exercises: ex, mode: "preview", hearts: null });
}

// Dr Frost–style tree picker: Level → Area → Topic
function topicPicker(selected, onDone) {
  const q = h("input", { class: "input", placeholder: "Search topics, e.g. family, past tense, Manas…" });
  let level = "all";
  const levelSeg = h("div", { class: "seg" });
  const tree = h("div");
  const drawLevel = () => levelSeg.replaceChildren(...["all", ...LEVEL_ORDER].map(l => h("button", { type: "button", class: level === l ? "on" : "", onClick: () => { level = l; drawLevel(); draw(); } }, l === "all" ? "All" : l)));
  const draw = () => {
    const s = q.value.trim().toLowerCase();
    tree.replaceChildren();
    for (const lv of LEVEL_ORDER) {
      if (level !== "all" && level !== lv) continue;
      const lvTopics = TOPIC_ORDER.filter(id => topicLevel(id) === lv && (!s || [TOPICS[id].en, TOPICS[id].ru, TOPICS[id].ky].join(" ").toLowerCase().includes(s)));
      if (!lvTopics.length) continue;
      tree.append(h("h2", { class: "section-title" }, `Level ${lv}`));
      for (const [areaId, area] of Object.entries(AREAS)) {
        const ts = lvTopics.filter(id => topicArea(id) === areaId);
        if (!ts.length) continue;
        tree.append(h("div", { class: "tree-area" }, h("h3", {}, tn(area)), h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "8px" } }, ts.map(id => {
          const chip = h("div", { class: "topic-chip" + (selected.has(id) ? " on" : ""), onClick: () => { selected.has(id) ? selected.delete(id) : selected.add(id); chip.classList.toggle("on"); } },
            h("span", { class: "chk" }, icon("check")), h("div", {}, h("b", {}, tn(TOPICS[id])), h("div", { class: "ky" }, TOPICS[id].ky)), h("span", { class: "count" }, `${TOPICS[id].words.length + TOPICS[id].sentences.length}`));
          return chip;
        }))));
      }
    }
  };
  q.addEventListener("input", draw);
  drawLevel(); draw();
  modal({ title: "Choose topics", wide: true, body: h("div", {}, h("div", { class: "row wrap" }, q, levelSeg), tree), actions: [{ label: "Done", kind: "purple", onClick: () => onDone() }], onClose: onDone });
}

async function homeworkReport(hw, c) {
  const isExam = hw.kind === "exam";
  if (isExam) { try { await client.rpc("exam_close_expired", { hw: hw.id }); } catch {} }
  const [{ data: subs }, ms, atts] = await Promise.all([client.from("submissions").select("*").eq("homework_id", hw.id), members(c),
    isExam ? client.from("exam_attempts").select("student_id,started_at,finished_at,result").eq("homework_id", hw.id).then(r => r.data || []) : Promise.resolve([])]);
  // Exam answers live with the attempt (students can't read them).
  for (const s of subs || []) { const a = atts.find(x => x.student_id === s.student_id); if (a?.result) s.answers = a.result; }
  const past = new Date(hw.due_at) < new Date();
  const rows = ms.map(m => ({ m, s: (subs || []).find(x => x.student_id === m.id) }));
  // per-question analytics (by exercise id)
  const qStats = {};
  for (const s of subs || []) if (!s.flag) for (const a of s.answers || []) { if (!a || !a.prompt) continue; const k = a.prompt; qStats[k] = qStats[k] || { n: 0, ok: 0 }; qStats[k].n++; if (a.ok) qStats[k].ok++; }
  const hardest = Object.entries(qStats).filter(([, v]) => v.n >= 1).sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).slice(0, 8);
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 0: 0 };
  rows.forEach(({ s }) => { const g = s ? (s.teacher_grade ?? s.grade) : past ? 2 : null; if (g != null) dist[g]++; });
  modal({ title: hw.title, wide: true, body: h("div", {},
    h("p", { class: "muted" }, `${past ? "Closed" : "Due"} ${fmtDate(hw.due_at, getLang())} · ${(subs || []).length}/${ms.length} submitted`),
    h("div", { class: "row wrap", style: { gap: "16px", marginBottom: "16px" } }, [5, 4, 3, 2, 0].filter(g => g || dist[0]).map(g => h("div", { class: "row" }, gradeChip(g), h("b", {}, `× ${dist[g]}`)))),
    h("div", { class: "table-wrap" }, h("table", { class: "tbl" }, h("thead", {}, h("tr", {}, h("th", {}, "Student"), h("th", { class: "c" }, "Score"), h("th", { class: "c" }, "Grade"), h("th", {}, "Submitted"), isExam ? h("th") : null)),
      h("tbody", {}, rows.map(({ m, s }) => h("tr", { class: s ? "gcell" : "", onClick: s ? () => submissionDialog(s, m, hw) : null },
        h("td", {}, h("b", {}, m.full_name)), h("td", { class: "c" }, s ? `${s.correct}/${s.total} (${Math.round(s.score)}%)` : "—"),
        h("td", { class: "c" }, s ? gradeChip(s.teacher_grade ?? s.grade) : past ? gradeChip(2, "auto") : h("span", { class: "grade pending" }, "–")),
        h("td", {}, s ? [fmtDate(s.submitted_at, getLang()), s.flag ? h("div", { class: "overdue small" }, s.flag === "left_fullscreen" ? "Left full screen" : "Left the exam") : null]
          : atts.some(a => a.student_id === m.id) ? h("span", { class: "due-soon" }, "Taking the exam now") : past ? h("span", { class: "overdue" }, "Missed") : "Not yet"),
        isExam ? h("td", { class: "c" }, (s || atts.some(a => a.student_id === m.id)) ? h("button", { class: "btn ghost sm", title: "Delete this attempt and let the student take the exam again", onClick: async (e) => {
          e.stopPropagation();
          if (!(await confirmBox("Let them retake?", `${m.full_name}'s attempt and grade will be deleted and they can start the exam again (with a new version).`, "Allow retake", true))) return;
          const { error } = await client.rpc("exam_reset", { hw: hw.id, sid: m.id });
          if (error) return toast(errMsg(error), "bad");
          toast("Retake allowed", "good"); document.querySelectorAll(".modal-back").forEach(x => x.remove()); homeworkReport(hw, c);
        } }, "Retake") : null) : null))))),
    hardest.length ? h("div", {}, h("h3", { class: "section-title" }, "Hardest questions"), h("div", { class: "list" }, hardest.map(([p, v]) => h("div", { class: "item" }, h("div", { class: "grow" }, p), h("div", { class: "bar", style: { width: "120px" } }, h("i", { style: { width: Math.round(100 * v.ok / v.n) + "%", background: v.ok / v.n < .5 ? "var(--red)" : "var(--green)" } })), h("b", {}, `${Math.round(100 * v.ok / v.n)}%`))))) : null),
    actions: [{ label: "Export CSV", kind: "ghost", onClick: () => { csv([["Student", "Correct", "Total", "Score", "Grade", "Submitted"], ...rows.map(({ m, s }) => [m.full_name, s?.correct ?? "", s?.total ?? "", s ? Math.round(s.score) : "", s ? (s.teacher_grade ?? s.grade) : past ? 2 : "", s?.submitted_at || ""])], `${hw.title}.csv`); return false; } }, { label: t("close"), kind: "purple" }] });
}

function submissionDialog(s, m, hw) {
  let g = s.teacher_grade ?? null;
  const seg = h("div", { class: "seg" });
  const drawSeg = () => seg.replaceChildren(...[["auto", `Auto (${s.grade})`], [5, "5"], [4, "4"], [3, "3"], [2, "2"]].map(([k, l]) => h("button", { type: "button", class: (g ?? "auto") === k ? "on" : "", onClick: () => { g = k === "auto" ? null : k; drawSeg(); } }, l)));
  drawSeg();
  const comment = h("textarea", { class: "input", maxlength: 1000, placeholder: "Comment for the student (optional)" }, s.teacher_comment || "");
  modal({ title: `${m.full_name} — ${hw.title}`, wide: true, body: h("div", {},
    h("div", { class: "row wrap", style: { gap: "18px" } }, gradeChip(s.teacher_grade ?? s.grade, "big"), h("div", {}, h("div", { style: { fontSize: "24px", fontWeight: 900 } }, `${s.correct}/${s.total} · ${Math.round(s.score)}%`), h("div", { class: "muted small" }, fmtDate(s.submitted_at, getLang())), s.flag ? h("div", { class: "overdue small" }, s.flag === "left_fullscreen" ? "Left full screen — automatic 0" : "Left the exam — automatic 0") : null)),
    (s.writing || []).length ? h("div", {}, h("h3", { class: "section-title" }, "Writing"), s.writing.map(w => h("div", { class: "panel" }, h("div", { class: "muted small" }, w.prompt), h("div", { class: "ky", style: { whiteSpace: "pre-wrap", fontSize: "18px" } }, w.text || "—"), h("div", { class: "small muted" }, translit(w.text || ""))))) : null,
    h("h3", { class: "section-title" }, "Answers"),
    h("div", { class: "list" }, (s.answers || []).map((a, i) => h("div", { class: "item" }, h("span", { style: { color: a.ok ? "var(--green)" : "var(--red)" } }, icon(a.ok ? "check" : "x")), h("div", { class: "grow" }, h("div", { class: "title" }, a.prompt || `#${i + 1}`), h("div", { class: "sub" }, a.given || "—", a.solution && !a.ok ? h("span", { class: "muted" }, ` → ${a.solution}`) : null)), a.ms ? h("span", { class: "small muted" }, `${Math.round(a.ms / 1000)}s`) : null))),
    h("h3", { class: "section-title" }, "Your grade"), seg, h("div", { style: { height: "10px" } }), comment), actions: [
    { label: t("cancel"), kind: "ghost" },
    { label: t("save"), kind: "purple", onClick: async () => {
      const { error } = await client.from("submissions").update({ teacher_grade: g, teacher_comment: comment.value.trim() }).eq("id", s.id);
      if (error) { toast(errMsg(error), "bad"); return false; }
      toast("Grade saved", "good"); render();
    } },
  ] });
}

// ───────────────────────── Gradebook ─────────────────────────
async function tabGrades(body, c) {
  body.append(h("p", { class: "muted" }, "Loading…"));
  const [{ data: hws }, ms] = await Promise.all([client.from("homework").select("*").eq("classroom_id", c.id).order("due_at"), members(c)]);
  const { data: subs } = hws.length ? await client.from("submissions").select("*").in("homework_id", hws.map(x => x.id)) : { data: [] };
  body.replaceChildren();
  if (!hws.length || !ms.length) { body.append(h("div", { class: "empty" }, mascot("think", 100), h("p", {}, !ms.length ? "No students yet." : "No homework yet."))); return; }
  const now = new Date();
  const cell = (m, hw) => {
    const s = subs.find(x => x.homework_id === hw.id && x.student_id === m.id);
    if (s) return { g: s.teacher_grade ?? s.grade, s };
    if (new Date(hw.due_at) < now) return { g: 2, auto: true };
    return { g: null };
  };
  const rows = ms.map(m => { const cells = hws.map(hw => cell(m, hw)); const gs = cells.filter(x => x.g != null).map(x => x.g); return { m, cells, avg: gs.length ? (gs.reduce((a, b) => a + b, 0) / gs.length) : null }; });
  body.append(h("p", { class: "small muted" }, "Red-outlined 2 = not submitted before the due date. Click a grade to review and override."),
    h("div", { class: "table-wrap" }, h("table", { class: "tbl" },
      h("thead", {}, h("tr", {}, h("th", {}, "Student"), hws.map(hw => h("th", { class: "c", title: hw.title }, hw.title.length > 14 ? hw.title.slice(0, 13) + "…" : hw.title, h("div", { class: "small", style: { textTransform: "none" } }, new Date(hw.due_at).toLocaleDateString()))), h("th", { class: "c" }, "Average"))),
      h("tbody", {}, rows.map(({ m, cells, avg }) => h("tr", {}, h("td", {}, h("b", {}, m.full_name)),
        cells.map((x, i) => h("td", { class: "c" + (x.s ? " gcell" : ""), onClick: x.s ? () => submissionDialog(x.s, m, hws[i]) : null }, x.g != null ? gradeChip(x.g, x.auto ? "auto" : "") : h("span", { class: "grade pending" }, "–"))),
        h("td", { class: "c" }, avg != null ? h("b", { style: { fontSize: "18px" } }, avg.toFixed(1)) : "—")))))),
    h("div", { style: { marginTop: "14px" } }, h("button", { class: "btn ghost sm", onClick: () => csv([["Student", ...hws.map(x => x.title), "Average"], ...rows.map(r => [r.m.full_name, ...r.cells.map(x => x.g ?? ""), r.avg ? r.avg.toFixed(2) : ""])], `${c.name} grades.csv`) }, icon("grid"), "Export CSV")));
}
function csv(rows, name) {
  const txt = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = h("a", { href: URL.createObjectURL(new Blob(["﻿" + txt], { type: "text/csv" })), download: name }); document.body.append(a); a.click(); a.remove();
}

// ───────────────────────── Live ─────────────────────────
async function tabLive(body, c) {
  const { data: live } = await client.from("meetings").select("*").eq("classroom_id", c.id).eq("status", "live").order("started_at", { ascending: false });
  const title = h("input", { class: "input", value: "Кыргыз тили сабагы", maxlength: 120 });
  const start = async (kind) => {
    const { data, error } = await client.from("meetings").insert({ classroom_id: c.id, title: title.value.trim() || "Live lesson", kind }).select().single();
    if (error) return toast(errMsg(error), "bad");
    openMeeting({ client, meeting: data, me: { id: user.id, name: profile.full_name, role: "teacher" }, onClose: () => render() });
  };
  body.append(h("div", { class: "grid" },
    h("div", { class: "card" }, h("div", { style: { fontSize: "36px", color: "var(--blue)" } }, icon("cam")), h("h3", {}, "Video lesson"), h("p", { class: "muted" }, "Camera, microphone and screen sharing. Students in this class get a “Join” banner instantly."), h("button", { class: "btn block", onClick: () => start("video") }, "Start video lesson")),
    h("div", { class: "card" }, h("div", { style: { fontSize: "36px", color: "var(--green)" } }, icon("mic")), h("h3", {}, "Voice lesson"), h("p", { class: "muted" }, "Audio only — great for pronunciation practice and slow connections."), h("button", { class: "btn primary block", onClick: () => start("voice") }, "Start voice lesson")),
    h("div", { class: "card" }, h("div", { style: { fontSize: "36px", color: "var(--purple-d)" } }, icon("slides")), h("h3", {}, "Present PowerPoint"), h("p", { class: "muted" }, "Upload your PowerPoint and present it — students follow your slides live on their devices."), h("button", { class: "btn purple block", onClick: () => { classTab = "slides"; render(); } }, "Choose presentation"))),
    h("label", { class: "field", style: { marginTop: "16px", maxWidth: "420px" } }, h("span", {}, "Lesson title"), title),
    h("p", { class: "small muted" }, "Calls connect browsers directly (peer-to-peer). Best for up to ~8 students; some school or mobile networks block direct connections."));
  if ((live || []).length) body.prepend(h("div", { class: "live-banner" }, h("span", { class: "live-dot" }), h("b", { class: "grow" }, `A lesson is live: ${live[0].title}`),
    h("button", { class: "btn sm", onClick: () => openMeeting({ client, meeting: live[0], me: { id: user.id, name: profile.full_name, role: "teacher" }, onClose: () => render() }) }, "Rejoin"),
    h("button", { class: "btn sm", onClick: async () => { await client.from("meetings").update({ status: "ended", ended_at: new Date().toISOString() }).eq("classroom_id", c.id).eq("status", "live"); render(); } }, "End")));
}

// ───────────────────────── Presentations ─────────────────────────
async function loadPres() { const { data } = await client.from("presentations").select("*").eq("teacher_id", user.id).order("updated_at", { ascending: false }); return data || []; }

// Upload a PowerPoint file: store it, read its slides, and create a presentation.
function uploadPptx(classroomId) {
  const input = h("input", { type: "file", accept: ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation", style: { display: "none" } });
  input.addEventListener("change", async () => {
    const file = input.files[0]; input.remove();
    if (!file) return;
    if (!/\.pptx$/i.test(file.name)) return toast("Please choose a .pptx file (PowerPoint 2007 or newer). For .ppt, open it in PowerPoint and “Save As” .pptx.", "bad");
    if (file.size > 50 * 1024 * 1024) return toast("That file is bigger than 50 MB. Try compressing the pictures in PowerPoint (File → Compress Pictures).", "bad");
    const prog = modal({ title: "Uploading PowerPoint…", body: h("div", { class: "center" }, mascot("think", 100), h("p", { class: "muted" }, file.name), h("p", {}, "Reading your slides…")) });
    try {
      const buf = await file.arrayBuffer();
      const deck = await loadDeck(buf);
      if (!deck.count) throw new Error("No slides found in this file.");
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
      const up = await client.storage.from("slides").upload(path, file, { contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", upsert: false });
      if (up.error) throw up.error;
      const url = client.storage.from("slides").getPublicUrl(path).data.publicUrl;
      const slides = Array.from({ length: deck.count }, (_, i) => ({ type: "pptx", url, index: i, title: deck.titles[i] || `Slide ${i + 1}` }));
      const row = { title: file.name.replace(/\.pptx$/i, "").slice(0, 120) || "PowerPoint", slides, classroom_id: classroomId || null, shared: false };
      const { data, error } = await client.from("presentations").insert(row).select().single();
      if (error) throw error;
      prog.close();
      toast(`Imported ${deck.count} slides`, "good");
      render();
      presSettings(data);
    } catch (e) { prog.close(); toast(errMsg(e), "bad"); }
  });
  document.body.append(input); input.click();
}

function uploadCard(classroomId) {
  return h("div", { class: "upload-card", onClick: () => uploadPptx(classroomId) },
    h("span", { class: "up-ic" }, icon("slides")),
    h("div", { class: "grow" }, h("h3", {}, "Upload a PowerPoint"), h("p", { class: "muted" }, "Choose a .pptx file made in PowerPoint. Students can open it, and you can present it live so their screens follow yours.")),
    h("button", { class: "btn purple" }, icon("plus"), "Upload .pptx"));
}

async function tabClassSlides(body, c) {
  const all = await loadPres();
  const mine = all.filter(p => p.classroom_id === c.id);
  body.append(uploadCard(c.id));
  presGrid(body, mine, c);
  const others = all.filter(p => p.classroom_id !== c.id);
  if (others.length) { body.append(h("h3", { class: "section-title" }, "Your other presentations")); presGrid(body, others, c); }
}
function presGrid(body, list, cls) {
  if (!list.length) { body.append(h("p", { class: "muted", style: { marginTop: "16px" } }, "No presentations yet — upload your first PowerPoint above.")); return; }
  body.append(h("div", { class: "grid", style: { marginTop: "16px" } }, list.map(p => h("div", { class: "card" },
    h("div", { style: { marginBottom: "10px" } }, renderSlide(p.slides[0])),
    h("h3", { style: { margin: "0 0 4px" } }, p.title), h("div", { class: "row wrap small muted" }, `${p.slides.length} slides`, p.shared ? h("span", { class: "pill green" }, "Shared") : h("span", { class: "pill" }, "Private"), p.classroom_id ? h("span", { class: "pill" }, classes.find(c => c.id === p.classroom_id)?.name || "") : null),
    h("div", { class: "row wrap", style: { marginTop: "12px" } },
      h("button", { class: "btn purple sm", onClick: () => { const cid = cls?.id || p.classroom_id; if (!cid) return toast("Choose a class for this presentation first (Settings → Class)", "bad"); presentLive({ client, pres: p, classroomId: cid, me: { id: user.id, name: profile.full_name } }); } }, icon("play"), "Present live"),
      h("button", { class: "btn ghost sm", onClick: () => presSettings(p) }, icon("settings"), "Settings"),
      deckUrlOf(p) ? h("a", { class: "btn ghost sm", href: officeViewerUrl(deckUrlOf(p)), target: "_blank", rel: "noopener" }, icon("eye"), "Original") : null)))));
}

function viewSlides(main) {
  main.append(h("h1", { class: "page-title" }, "Presentations"), h("p", { class: "page-sub" }, "Upload your PowerPoint presentations, share them with a class, or present them live."), uploadCard(classes[0]?.id || null));
  const host = h("div"); main.append(host);
  loadPres().then(list => presGrid(host, list, null));
}

// Title, class, sharing and delete — the slides themselves come from PowerPoint.
function presSettings(p) {
  const title = h("input", { class: "input", value: p.title, maxlength: 120 });
  const classSel = h("select", { class: "input" }, h("option", { value: "" }, "— No class —"), classes.map(c => h("option", { value: c.id, selected: c.id === p.classroom_id }, c.name)));
  const shared = h("input", { type: "checkbox", checked: !!p.shared });
  modal({ title: "Presentation settings", wide: true, body: h("div", {},
    h("div", { class: "row wrap" }, h("label", { class: "field grow" }, h("span", {}, "Title"), title), h("label", { class: "field" }, h("span", {}, "Class"), classSel)),
    h("label", { class: "row", style: { marginBottom: "14px" } }, shared, "Share with students in this class (they can open it any time)"),
    h("p", { class: "small muted" }, "To change the slides, edit the file in PowerPoint and upload it again."),
    h("div", { class: "slide-thumbs" }, p.slides.map(s => h("div", { class: "th" }, renderSlide(s))))), actions: [
    { label: "Delete", kind: "danger", onClick: async () => {
      if (!(await confirmBox("Delete presentation?", p.title, "Delete", true))) return false;
      await client.from("presentations").delete().eq("id", p.id);
      const url = deckUrlOf(p); const m = url && url.match(/\/object\/public\/slides\/(.+)$/);
      if (m && !(await loadPres()).some(x => deckUrlOf(x) === url)) await client.storage.from("slides").remove([decodeURIComponent(m[1])]);
      render();
    } },
    { label: t("cancel"), kind: "ghost" },
    { label: t("save"), kind: "purple", onClick: async () => {
      const row = { title: title.value.trim() || "Untitled", classroom_id: classSel.value || null, shared: shared.checked && !!classSel.value };
      const { error } = await client.from("presentations").update(row).eq("id", p.id);
      if (error) { toast(errMsg(error), "bad"); return false; }
      toast("Saved", "good"); render();
    } },
  ] });
}

// ───────────────────────── Topic catalogue ─────────────────────────
// One ready-made exam per unit: assign it online (timed) or print it.
function unitExams() {
  const list = h("div", { class: "unit-exams" }, UNITS.map((u, i) => h("div", { class: "ue", style: { "--c": u.color } },
    h("div", { class: "ue-head" }, h("span", { class: "lvl-tag" }, u.level), h("b", {}, `Unit ${i + 1}: ${tn(u)}`)),
    h("div", { class: "small muted" }, u.topics.map(id => tn(TOPICS[id])).join(" · ")),
    h("div", { class: "row wrap", style: { marginTop: "8px" } },
      h("button", { class: "btn purple sm", onClick: () => { if (!classes.length) return toast("Create a class first", "bad"); homeworkDialog({ classroom: currentClass, topics: u.topics, exam: true, title: `Unit ${i + 1} exam: ${tn(u)}` }); } }, icon("clock"), "Assign exam"),
      h("button", { class: "btn ghost sm", onClick: () => worksheetDialog({ topicIds: u.topics, kind: "test", title: `Unit ${i + 1} test` }) }, icon("list"), "Print test"),
      h("button", { class: "btn ghost sm", onClick: () => runLesson({ exercises: buildExam(u.topics, { count: 20, lang: getLang() }), mode: "preview", hearts: null }) }, icon("play"), "Try")))));
  const wrap = h("details", { class: "panel unit-exam-panel" }, h("summary", {}, h("b", {}, `Unit exams (${UNITS.length})`), h("span", { class: "muted small" }, " — a 20-question test for every unit, online or printable")), list);
  return wrap;
}

function viewTopics(main) {
  const total = TOPIC_ORDER.length;
  const words = TOPIC_ORDER.reduce((a, id) => a + TOPICS[id].words.length, 0);
  const sents = TOPIC_ORDER.reduce((a, id) => a + TOPICS[id].sentences.length, 0);
  main.append(h("h1", { class: "page-title" }, "Topic catalogue"), h("p", { class: "page-sub" }, `${total} topics · ${words} words · ${sents} sentences · reading passages. Every quiz is randomised from these.`));
  const q = h("input", { class: "input", placeholder: "Search topics…" });
  let level = "all", area = "all";
  const segL = h("div", { class: "seg" }), segA = h("div", { class: "seg" });
  const host = h("div");
  const drawSeg = () => {
    segL.replaceChildren(...["all", ...LEVEL_ORDER].map(l => h("button", { class: level === l ? "on" : "", onClick: () => { level = l; drawSeg(); draw(); } }, l === "all" ? "All levels" : l)));
    segA.replaceChildren(...["all", ...Object.keys(AREAS)].map(a => h("button", { class: area === a ? "on" : "", onClick: () => { area = a; drawSeg(); draw(); } }, a === "all" ? "All areas" : tn(AREAS[a]))));
  };
  const draw = () => {
    const s = q.value.trim().toLowerCase(); host.replaceChildren();
    for (const lv of LEVEL_ORDER) {
      if (level !== "all" && lv !== level) continue;
      for (const [aid, a] of Object.entries(AREAS)) {
        if (area !== "all" && aid !== area) continue;
        const ts = TOPIC_ORDER.filter(id => topicLevel(id) === lv && topicArea(id) === aid && (!s || JSON.stringify([TOPICS[id].en, TOPICS[id].ru, TOPICS[id].ky, TOPICS[id].words]).toLowerCase().includes(s)));
        if (!ts.length) continue;
        host.append(h("h2", { class: "section-title" }, h("span", { class: "lvl-tag" }, lv), " ", tn(a)), h("div", { class: "grid" }, ts.map(id => topicCard(id))));
      }
    }
    if (!host.children.length) host.append(h("p", { class: "muted" }, "No topics match."));
  };
  q.addEventListener("input", draw);
  drawSeg(); draw();
  main.append(unitExams(), q, h("div", { class: "row wrap", style: { margin: "12px 0" } }, segL, segA), host);
}
function topicCard(id) {
  const tp = TOPICS[id];
  return h("div", { class: "card" }, h("div", { class: "row" }, h("h3", { class: "grow", style: { margin: 0 } }, tn(tp)), tp.passages ? h("span", { class: "pill blue" }, "Reading") : null),
    h("div", { class: "muted" }, tp.ky), h("p", { class: "small muted" }, `${tp.words.length} words · ${tp.sentences.length} sentences`),
    h("p", { class: "small" }, tp.words.slice(0, 5).map(w => w[0]).join(", "), "…"),
    h("div", { class: "row wrap" },
      h("button", { class: "btn purple sm", onClick: () => { if (!classes.length) return toast("Create a class first", "bad"); homeworkDialog({ classroom: currentClass, topics: [id] }); } }, icon("pen"), "Assign"),
      h("button", { class: "btn ghost sm", onClick: () => topicDetail(id) }, icon("eye"), "View"),
      h("button", { class: "btn ghost sm", onClick: () => worksheetDialog({ topicIds: [id] }) }, icon("list"), "Worksheet"),
      h("button", { class: "btn ghost sm", onClick: () => gamesDialog([id]) }, icon("star"), "Game"),
      h("button", { class: "btn ghost sm", onClick: () => runLesson({ exercises: buildLesson([id], { count: 10, level: 1, lang: getLang() }), mode: "preview", hearts: null }) }, icon("play"), "Try")));
}
function topicDetail(id) {
  const tp = TOPICS[id]; const li = getLang() === "ru" ? 2 : 1;
  const row = (x) => h("div", { class: "word-row" }, h("div", {}, h("div", { class: "ky" }, x[0]), h("div", { class: "tl" }, translit(x[0]))), h("div", {}, x[li].split("|").join(" / ")), h("span"));
  modal({ title: `${tn(tp)} · ${tp.ky}`, wide: true, body: h("div", {}, h("div", { class: "panel" }, h("b", {}, "Grammar / culture note"), h("p", { style: { margin: "6px 0 0" } }, tn(tp.tip))),
    h("h3", {}, "Words"), h("div", { class: "card", style: { padding: 0 } }, tp.words.map(row)),
    h("h3", { class: "section-title" }, "Sentences"), h("div", { class: "card", style: { padding: 0 } }, tp.sentences.map(row)),
    ...(tp.passages || []).map(p => h("div", {}, h("h3", { class: "section-title" }, "Reading passage"), h("div", { class: "reading" }, h("div", { class: "ky" }, p.ky), h("div", { class: "trans" }, p[getLang()]))))),
    actions: [{ label: "Assign as homework", kind: "purple", onClick: () => { if (!classes.length) { toast("Create a class first", "bad"); return false; } homeworkDialog({ classroom: currentClass, topics: [id] }); } }] });
}

// ───────────────────────── Worksheets & printable tests (A4) ─────────────────────────
function viewWorksheets(main) {
  main.append(h("h1", { class: "page-title" }, "Worksheets & tests"), h("p", { class: "page-sub" }, "Printable A4 sheets made from any topics — every version is randomised, with an answer key for you."));
  const make = (kind) => h("div", { class: "card click ws-card", onClick: () => worksheetDialog({ topicIds: [], kind }) },
    h("span", { class: "up-ic", style: { background: kind === "test" ? "var(--red)" : "var(--green)", boxShadow: `0 4px 0 ${kind === "test" ? "var(--red-d)" : "var(--green-d)"}` } }, icon(kind === "test" ? "clock" : "list")),
    h("h3", {}, kind === "test" ? "Printable test" : "Worksheet"), h("p", { class: "muted" }, kind === "test" ? "Points per task, total score, grade box (5/4/3/2) and time limit." : "Matching, translation, gap-fill, word order, multiple choice, reading and writing."));
  const games = h("div", { class: "card click ws-card", onClick: () => gamesDialog() },
    h("span", { class: "up-ic", style: { background: "var(--purple)", boxShadow: "0 4px 0 var(--purple-d)" } }, icon("star")),
    h("h3", {}, "Quiz games · Quoldek"), h("p", { class: "muted" }, "Ready quiz questions from any topic for class games on Quoldek (or Kahoot-style CSV)."));
  main.append(h("div", { class: "grid" }, make("worksheet"), make("test"), games),
    h("h2", { class: "section-title" }, "Unit tests"), unitExams());
}

// Questions for quiz games (Quoldek partnership). Same bank as /api/quoldek/v1 on learnkyrgyz.web.app.
const QUOLDEK = "https://quoldek.web.app";
const BANK_URL = "https://learnkyrgyz.web.app/api/quoldek/v1";
function gamesDialog(topicIds = []) {
  const sel = new Set(topicIds);
  let lang = getLang();
  const langSeg = h("div", { class: "seg" });
  const drawLang = () => langSeg.replaceChildren(...[["en", "English"], ["ru", "Русский"]].map(([k, l]) => h("button", { type: "button", class: lang === k ? "on" : "", onClick: () => { lang = k; drawLang(); draw(); } }, l)));
  const summary = h("div", { class: "row wrap" });
  const preview = h("div", { class: "list game-preview" });
  const count = h("b");
  const qs = () => [...sel].flatMap(id => topicQuestions(id));
  function draw() {
    summary.replaceChildren(...[...sel].map(id => h("span", { class: "pill" }, tn(TOPICS[id]))), h("button", { type: "button", class: "btn ghost sm", onClick: () => topicPicker(sel, draw) }, icon("plus"), sel.size ? "Change topics" : "Choose topics"));
    const all = qs(); count.textContent = `${all.length} questions`;
    preview.replaceChildren(...all.slice(0, 4).map(q => h("div", { class: "item" }, h("div", { class: "grow" }, h("div", { class: "title" }, q.question[lang]), h("div", { class: "sub" }, q.options[lang].map((o, i) => i === q.answer ? `✓ ${o}` : o).join(" · "))))));
  }
  const download = (name, text, type) => { const a = h("a", { href: URL.createObjectURL(new Blob([text], { type })), download: name }); document.body.append(a); a.click(); a.remove(); };
  const name = () => sel.size === 1 ? [...sel][0] : `learnkyrgyz-${sel.size}-topics`;
  drawLang(); draw();
  modal({ title: "Quiz games · Quoldek", wide: true, body: h("div", {},
    h("p", { class: "muted" }, "LearnKyrgyz and ", h("a", { href: QUOLDEK, target: "_blank", rel: "noopener" }, "Quoldek"), " work together: pick topics and play them as a quiz game with your class. Every question has four options, a time limit and the Kyrgyz word for audio."),
    h("div", { class: "field" }, h("span", {}, "Topics"), summary),
    h("div", { class: "field" }, h("span", {}, "Questions in"), langSeg),
    h("div", { class: "row" }, count, h("span", { class: "muted small" }, " — first questions:")), preview,
    h("p", { class: "small muted" }, "Open question bank for game makers: ", h("a", { href: BANK_URL + "/index.json", target: "_blank", rel: "noopener" }, BANK_URL + "/index.json"), ` (v${BANK_VERSION}, JSON, free to use).`)),
    actions: [
      { label: "CSV (Kahoot-style)", kind: "ghost", onClick: () => { if (!sel.size) { toast("Choose topics first", "bad"); return false; } download(`${name()}-${lang}.csv`, toCSV(qs(), lang), "text/csv"); return false; } },
      { label: "Download for Quoldek", kind: "ghost", onClick: () => { if (!sel.size) { toast("Choose topics first", "bad"); return false; } download(`${name()}.json`, JSON.stringify({ name: "LearnKyrgyz question bank", version: BANK_VERSION, source: "https://learnkyrgyz.web.app", language: lang, topics: [...sel].map(id => ({ topic: topicMeta(id), questions: topicQuestions(id) })) }, null, 1), "application/json"); return false; } },
      { label: "Open Quoldek", kind: "purple", onClick: () => { window.open(QUOLDEK, "_blank", "noopener"); return false; } },
    ] });
}

function worksheetDialog({ topicIds = [], kind = "worksheet", title = "" } = {}) {
  const sel = new Set(topicIds);
  const secs = new Set(Object.keys(SECTIONS));
  let k = kind, lang = getLang(), withKey = true;
  const titleIn = h("input", { class: "input", value: title, placeholder: kind === "test" ? "Unit 2 test" : "Family worksheet", maxlength: 80 });
  const classIn = h("input", { class: "input", placeholder: "7A", maxlength: 20, style: { maxWidth: "120px" } });
  const minutes = h("input", { class: "input", type: "number", value: 40, min: 5, max: 180, style: { maxWidth: "100px" } });
  const topicsBox = h("div", { class: "row wrap" });
  const drawTopics = () => topicsBox.replaceChildren(...[...sel].map(id => h("span", { class: "pill", style: { background: "#f5e8ff", color: "var(--purple-d)", borderColor: "transparent" } }, tn(TOPICS[id]))), h("button", { type: "button", class: "btn ghost sm", onClick: () => topicPicker(sel, drawTopics) }, icon("plus"), sel.size ? "Change topics" : "Choose topics"));
  drawTopics();
  const kindSeg = h("div", { class: "seg" }), langSeg = h("div", { class: "seg" });
  const drawSegs = () => {
    kindSeg.replaceChildren(...[["worksheet", "Worksheet"], ["test", "Test"]].map(([v, l]) => h("button", { type: "button", class: k === v ? "on" : "", onClick: () => { k = v; drawSegs(); } }, l)));
    langSeg.replaceChildren(...[["en", "English"], ["ru", "Русский"]].map(([v, l]) => h("button", { type: "button", class: lang === v ? "on" : "", onClick: () => { lang = v; drawSegs(); } }, l)));
    minutesWrap.classList.toggle("hidden", k !== "test");
  };
  const minutesWrap = h("label", { class: "field" }, h("span", {}, "Time (minutes)"), minutes);
  const secBox = h("div", { class: "grid", style: { gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "8px" } }, Object.entries(SECTIONS).map(([id, sct]) => {
    const chip = h("div", { class: "topic-chip on", onClick: () => { secs.has(id) ? secs.delete(id) : secs.add(id); chip.classList.toggle("on"); } }, h("span", { class: "chk" }, icon("check")), h("div", {}, h("b", {}, sct.en), h("div", { class: "ky" }, sct.ky)));
    return chip;
  }));
  const keyCb = h("input", { type: "checkbox", checked: true, onChange: (e) => withKey = e.target.checked });
  drawSegs();
  modal({ title: "Create a worksheet or test", wide: true, body: h("div", {},
    h("div", { class: "row wrap", style: { gap: "16px" } }, h("div", { class: "field" }, h("span", {}, "Type"), kindSeg), h("div", { class: "field" }, h("span", {}, "Translations in"), langSeg), minutesWrap),
    h("div", { class: "row wrap" }, h("label", { class: "field grow" }, h("span", {}, "Title (optional)"), titleIn), h("label", { class: "field" }, h("span", {}, "Class (optional)"), classIn)),
    h("div", { class: "field" }, h("span", {}, "Topics"), topicsBox),
    h("div", { class: "field" }, h("span", {}, "Tasks"), secBox),
    h("label", { class: "row" }, keyCb, "Add an answer key page (for you)")), actions: [
    { label: t("cancel"), kind: "ghost" },
    { label: "Create", kind: "purple", onClick: () => {
      if (!sel.size) { toast("Choose at least one topic", "bad"); return false; }
      if (!secs.size) { toast("Choose at least one task", "bad"); return false; }
      const opts = { topicIds: [...sel], lang, kind: k, sections: Object.keys(SECTIONS).filter(x => secs.has(x)), withKey, title: titleIn.value.trim(), className: classIn.value.trim(), minutes: Number(minutes.value) || 40 };
      worksheetPreview(opts);
    } },
  ] });
}

function worksheetPreview(opts) {
  const frame = h("iframe", { class: "ws-frame", title: "Worksheet preview" });
  const load = () => { frame.srcdoc = buildWorksheet(opts).html; };
  load();
  modal({ title: opts.kind === "test" ? "Test preview (A4)" : "Worksheet preview (A4)", wide: true, body: h("div", {}, h("p", { class: "small muted" }, "Print it, or choose “Save as PDF” in the print window to share it digitally. “New version” makes a different random sheet."), frame), actions: [
    { label: "New version", kind: "ghost", onClick: () => { load(); return false; } },
    { label: "Print / Save PDF", kind: "purple", onClick: () => { frame.contentWindow.focus(); frame.contentWindow.print(); return false; } },
  ] });
}

// ───────────────────────── My questions (teacher-made) ─────────────────────────
async function viewQuestions(main) {
  main.append(h("div", { class: "row wrap" }, h("div", { class: "grow" }, h("h1", { class: "page-title" }, "My questions"), h("p", { class: "page-sub" }, "Write your own questions — multiple choice, true/false, typed answers or sentence building — and add them to any homework.")),
    h("button", { class: "btn purple", onClick: () => editSet({ title: "", description: "", questions: [] }) }, icon("plus"), "New question set")));
  const host = h("div", {}, h("p", { class: "muted" }, "Loading…")); main.append(host);
  const sets = await loadSets();
  if (!sets.length) { host.replaceChildren(h("div", { class: "empty" }, mascot("think", 110), h("p", {}, "No question sets yet."))); return; }
  host.replaceChildren(h("div", { class: "grid" }, sets.map(s => h("div", { class: "card" }, h("h3", {}, s.title), h("p", { class: "muted small" }, s.description || "—"), h("p", { class: "small" }, `${(s.questions || []).length} questions`),
    h("div", { class: "row wrap" }, h("button", { class: "btn purple sm", onClick: () => editSet(s) }, icon("edit"), "Edit"),
      h("button", { class: "btn ghost sm", onClick: () => { const ex = (s.questions || []).map((q, i) => customExercise(q, s.id, i)).filter(Boolean); if (!ex.length) return toast("No questions yet", "bad"); runLesson({ exercises: ex, mode: "preview", hearts: null }); } }, icon("play"), "Try"))))));
}

const Q_TYPES = { choice: "Multiple choice", truefalse: "True / false", type: "Type the answer", build: "Build the sentence" };
function editSet(s0) {
  const s = JSON.parse(JSON.stringify(s0)); s.questions = s.questions || [];
  const title = h("input", { class: "input", value: s.title, maxlength: 120, placeholder: "Unit 2 — family quiz" });
  const desc = h("input", { class: "input", value: s.description, maxlength: 500 });
  const list = h("div", { class: "q-editor" });
  const draw = () => {
    list.replaceChildren(...s.questions.map((q, i) => qCard(q, i)), h("div", { class: "row wrap" },
      Object.entries(Q_TYPES).map(([k, l]) => h("button", { class: "btn ghost sm", onClick: () => { s.questions.push(newQ(k)); draw(); } }, icon("plus"), l)),
      h("button", { class: "btn ghost sm", onClick: () => autoFill() }, icon("shuffle"), "Add from a topic")));
  };
  const newQ = (k) => ({ choice: { type: k, prompt: "", options: ["", "", "", ""], answer: 0, explain: "" }, truefalse: { type: k, prompt: "", answer: 0, explain: "" }, type: { type: k, prompt: "", answers: [""], explain: "" }, build: { type: k, prompt: "", sentence: "", extra: "", explain: "" } })[k];
  const inp = (q, key, ph, ky) => { const el = h("input", { class: "input", value: q[key] || "", placeholder: ph, onInput: (e) => q[key] = e.target.value }); return ky ? h("div", {}, el, kyKeys(el)) : el; };
  function qCard(q, i) {
    const card = h("div", { class: "qcard" }, h("div", { class: "row" }, h("b", { class: "grow" }, `${i + 1}. ${Q_TYPES[q.type]}`),
      h("button", { class: "icon-btn", onClick: () => { if (i > 0) { [s.questions[i - 1], s.questions[i]] = [s.questions[i], s.questions[i - 1]]; draw(); } } }, icon("up")),
      h("button", { class: "icon-btn", onClick: () => { s.questions.splice(i, 1); draw(); } }, icon("trash"))));
    card.append(h("label", { class: "field" }, h("span", {}, "Question"), inp(q, "prompt", "e.g. How do you say “thank you” in Kyrgyz?", true)));
    if (q.type === "choice") {
      q.options.forEach((o, j) => card.append(h("div", { class: "row", style: { marginBottom: "6px" } }, h("input", { type: "radio", name: "a" + i, checked: q.answer === j, onChange: () => q.answer = j }), h("input", { class: "input", value: o, placeholder: `Option ${String.fromCharCode(65 + j)}${j === 0 ? " (tick the correct one)" : ""}`, onInput: (e) => q.options[j] = e.target.value }))));
    }
    if (q.type === "truefalse") card.append(h("div", { class: "seg" }, ["True — Туура", "False — Туура эмес"].map((l, j) => h("button", { class: q.answer === j ? "on" : "", onClick: () => { q.answer = j; draw(); } }, l))));
    if (q.type === "type") card.append(h("label", { class: "field" }, h("span", {}, "Accepted answers (one per line — small typos are forgiven)"), (() => { const ta = h("textarea", { class: "input", rows: 3, onInput: (e) => q.answers = e.target.value.split("\n").map(x => x.trim()).filter(Boolean) }, (q.answers || []).join("\n")); return h("div", {}, ta, kyKeys(ta)); })()));
    if (q.type === "build") card.append(h("label", { class: "field" }, h("span", {}, "Correct Kyrgyz sentence (words become tiles)"), inp(q, "sentence", "Мен кыргыз тилин үйрөнүп жатам.", true)), h("label", { class: "field" }, h("span", {}, "Extra distractor words (optional, space-separated)"), inp(q, "extra", "сен барам")));
    card.append(h("label", { class: "field" }, h("span", {}, "Explanation shown after a wrong answer (optional)"), inp(q, "explain", "")));
    return card;
  }
  function autoFill() {
    const sel = h("select", { class: "input" }, TOPIC_ORDER.map(id => h("option", { value: id }, `${tn(TOPICS[id])} — ${TOPICS[id].ky}`)));
    const n = h("input", { class: "input", type: "number", value: 5, min: 1, max: 20, style: { maxWidth: "100px" } });
    modal({ title: "Add questions from a topic", body: h("div", {}, h("label", { class: "field" }, h("span", {}, "Topic"), sel), h("label", { class: "field" }, h("span", {}, "How many"), n), h("p", { class: "small muted" }, "Creates editable multiple-choice and typing questions from the topic's words.")), actions: [{ label: "Add", kind: "purple", onClick: () => {
      const tp = TOPICS[sel.value]; const li = getLang() === "ru" ? 2 : 1;
      for (const w of shuffle(tp.words).slice(0, Number(n.value) || 5)) {
        if (Math.random() < .5) {
          const others = shuffle(tp.words.filter(x => x !== w)).slice(0, 3).map(x => x[li].split("|")[0]);
          const opts = [w[li].split("|")[0], ...others];
          s.questions.push({ type: "choice", prompt: `What does «${w[0]}» mean?`, options: opts, answer: 0, explain: "" });
        } else s.questions.push({ type: "type", prompt: `Write in Kyrgyz: “${w[li].split("|")[0]}”`, answers: w[0].split("|"), explain: "" });
      }
      draw();
    } }] });
  }
  draw();
  modal({ title: s.id ? "Edit question set" : "New question set", wide: true, body: h("div", {}, h("label", { class: "field" }, h("span", {}, "Title"), title), h("label", { class: "field" }, h("span", {}, "Description"), desc), list), actions: [
    s.id ? { label: "Delete", kind: "danger", onClick: async () => { if (!(await confirmBox("Delete question set?", s.title, "Delete", true))) return false; await client.from("question_sets").delete().eq("id", s.id); render(); } } : null,
    { label: "Preview", kind: "ghost", onClick: () => { const ex = s.questions.map((q, i) => customExercise(q, "preview", i)).filter(Boolean); if (ex.length) runLesson({ exercises: ex, mode: "preview", hearts: null }); return false; } },
    { label: t("save"), kind: "purple", onClick: async () => {
      const bad = s.questions.findIndex(q => !q.prompt?.trim() || (q.type === "choice" && q.options.filter(o => o.trim()).length < 2) || (q.type === "type" && !(q.answers || []).length) || (q.type === "build" && !q.sentence?.trim()));
      if (!title.value.trim()) { toast("Add a title", "bad"); return false; }
      if (bad >= 0) { toast(`Question ${bad + 1} is incomplete`, "bad"); return false; }
      const row = { title: title.value.trim(), description: desc.value.trim(), questions: s.questions.map(q => q.type === "choice" ? { ...q, options: q.options.map(o => o.trim()) } : q) };
      const { error } = s.id ? await client.from("question_sets").update(row).eq("id", s.id) : await client.from("question_sets").insert(row);
      if (error) { toast(errMsg(error), "bad"); return false; }
      toast("Saved", "good"); render();
    } },
  ].filter(Boolean) });
}

// ───────────────────────── Account ─────────────────────────
function viewAccount(main) {
  const name = h("input", { class: "input", value: profile.full_name, maxlength: 80 });
  main.append(h("h1", { class: "page-title" }, "Account"), h("div", { class: "panel stack", style: { maxWidth: "520px" } },
    h("label", { class: "field" }, h("span", {}, "Name students see"), h("div", { class: "row" }, name, h("button", { class: "btn purple sm", onClick: async () => { profile.full_name = name.value.trim() || profile.full_name; await client.from("profiles").update({ full_name: profile.full_name }).eq("id", user.id); toast("Saved", "good"); render(); } }, t("save")))),
    h("div", {}, h("div", { class: "muted small", style: { fontWeight: 800, marginBottom: "6px" } }, "Translations shown in"), h("div", { class: "seg" }, ["en", "ru"].map(l => h("button", { class: getLang() === l ? "on" : "", onClick: async () => { setLang(l); await client.from("profiles").update({ learn_from: l }).eq("id", user.id); render(); } }, l === "en" ? "English" : "Русский")))),
    h("div", {}, h("div", { class: "muted small", style: { fontWeight: 800, marginBottom: "6px" } }, t("theme")), themeSeg()),
    h("div", { class: "muted small" }, user.email),
    h("button", { class: "btn ghost", onClick: () => client.auth.signOut() }, icon("logout"), t("signOut"))));
}
function themeSeg() {
  let cur = "auto"; try { cur = localStorage.getItem("lk.theme") || "auto"; } catch {}
  return h("div", { class: "seg" }, [["auto", t("auto")], ["light", t("light")], ["dark", t("dark")]].map(([k, l]) => h("button", { class: cur === k ? "on" : "", onClick: () => { try { localStorage.setItem("lk.theme", k); } catch {} applyTheme(); render(); } }, l)));
}
function applyTheme() { let th = "auto"; try { th = localStorage.getItem("lk.theme") || "auto"; } catch {} if (th === "auto") document.documentElement.removeAttribute("data-theme"); else document.documentElement.setAttribute("data-theme", th); }

boot();

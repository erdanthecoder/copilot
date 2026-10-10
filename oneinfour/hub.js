// FlexiHub hub: sign in once, and LearnKyrgyz, Quoldek, Kadam and CompactCoding all open signed in.
import { sb } from "../assets/js/config.js";
import { signInWithGoogle, signUpWithPassword, googleAvailable, GOOGLE_ICON } from "../assets/js/google.js";
import { handoffUrl, isTrusted, acceptHandoff } from "../assets/js/oneintwo-core.js";
import { UNITS, TOPICS } from "../assets/js/curriculum.js";

// Every update we ship goes here, newest first. It shows in the FAQ under "Updates".
const UPDATES = [
  { date: "Oct 10, 2026", title: "Giant Pentagon Mall & fixed fences", items: [
    "🛍️ The Pentagon Mall in World Islands is now the biggest building on the island, and the most crowded: more than 100 shoppers walk around, browse the shops and eat at the food court.",
    "🏬 8 shops inside: Pentagon Café (Barista job), Supermarket, Toys, Hats & Fashion, Pet Shop, Sweets & Ice Cream, Pizza & Burgers and Kyrgyz Kitchen, plus the Job Center and an mBank ATM.",
    "🚧 Fences are fixed: no more broken gaps, and you can't slip through them anymore, even when running fast or on a hoverboard.",
  ] },
  { date: "Oct 10, 2026", title: "World Islands for Android", items: [
    "🤖 World Islands is now an Android app (Android 7+). It runs full screen with Chrome's engine, so the 3D game, Google sign-in, the camera and calls all work.",
    "📲 Download both apps from world-islands.web.app/download.html (or Menu → Apps in the game) — the files download straight from the World Islands website.",
    "🪟 We are not using the Microsoft Store; the Windows app downloads from the website too."] },
  { date: "Oct 10, 2026", title: "World Islands: a professional start", items: [
    "▶️ New start screen: the island flies by behind the World Islands logo, with a big Play button, How to play, language, graphics and sound.",
    "📖 How to play: controls for keyboard, mouse and touch, how to earn money, where everything is, the phone, and playing together. Also in Menu → How to play.",
    "💻 The Windows app (2.1) opens with a branded loading window, then the game."] },
  { date: "Oct 10, 2026", from: "2026-10-10T07:00:00Z", title: "🎉 World Islands 2.0", items: [
    "World Islands is now version 2.0 — with a “What's new in 2.0” screen (Menu → What's new) that lists every update.",
    "🎪 Up to 3 admin shows at the same time, and 2 new shows: 👽 UFO invasion (a flying saucer, dancing aliens and a beam that lifts you up) and 🫧 Foam party on the stadium. One button starts a MEGA party with 3 shows.",
    "🌪️ More admin fun: tornado, earthquake, chicken rain, bubbles, a giant rainbow, everyone tiny for 30 seconds, freeze everyone, and shuffle (everyone teleports somewhere random).",
    "🤖 Bots split up between the shows and dance at each one.",
    "💻 The Windows app is now version 2.0 too, and it is being prepared for the Microsoft Store (with a privacy policy at world-islands.web.app/privacy.html).",
    "🛍️ Pentagon Mall: a five-sided shopping centre south of World Market with a supermarket, Pentagon Café, toys & fashion, sweets & ice cream and a Job Center. New job: ☕ Barista — make each drink from the right ingredients.",
    "⚡ Smoother: the island is drawn in far fewer pieces (about 40% fewer draw calls), far-away labels hide, shadows update less often on fast computers, and phones get soft shadows under every player."] },
  { date: "Oct 10, 2026", title: "World Islands: face mood fixed, fishing, hoverboard, new emotes", items: [
    "🙂 Face mood works again: the face reader wasn't loading. Now your avatar copies your face and a big emoji (😂 😡 🤩 😢) shows over your head so everyone can see it.",
    "🎣 Fishing pier on the east beach: cast, wait for a bite, reel in. Catch 7 kinds (even a shark… or an old boot). New 🎣 Fisher job pays $0.25–$3 per fish.",
    "🛹 Hoverboard: open Emotes and tap Hoverboard to zoom around (everyone sees your board).",
    "💃 New emotes: backflip, floss, laugh, spin and sleep (keys 5–9).",
    "🕺 Bots really dance now at shows and dance parties.",
    "💻 World Islands for Windows: download it at world-islands.web.app/download.html (or Menu → Windows app). Locked-down and safe: it only opens World Islands, the page can't touch your files, only secure connections, and only World Islands may use the camera and microphone."] },
  { date: "Oct 9, 2026", title: "World Islands: funny cat cartoons and more admin fun", items: [
    "🎬 New cinema cartoons: \"Барсик\", a silly orange cat, in 6 funny episodes (the cucumber, the red dot, the tiny box, the vacuum cleaner, the mirror, the cup). He speaks Russian in a squeaky cat voice, with a narrator, cartoon sounds and kids laughing.",
    "🔐 Admin now works on every server at once.",
    "🎉 New admin fun: launch everyone into the air, dance party, candy rain, fish rain, a GIANT Барсик walking across the island, snow, meteors, confetti, bring everyone to you, and powers (night, low gravity, super speed, giant).",
    "💰 Admins can give money to themselves, another player (or a phone number), or everyone online."] },
  { date: "Oct 9, 2026", title: "World Islands: basketball, restaurant, jobs and admin shows", items: [
    "🏀 Basketball: 3 vs 3 with bots on the court by the stadium. Bots also play there on their own, so you can watch or join.",
    "🍽️ Island Restaurant: sit at a table, order plov, lagman, manty and more, and a waiter brings it.",
    "💼 Jobs now work from the Jobs app on your phone: cashier, cleaner, helper (show visitors the way, help players) and waiter.",
    "🤖 Smarter bots: they ride the lifts properly, walk around the fountain, go to the bank, café and restaurant, and can take you anywhere (walk up and press 💬).",
    "🙂 Face mood works without a call: open Mood on your phone and turn on the camera, or pick a face.",
    "🔐 Admin app (password needed): disco, crab party, concert, a big 16-player football match, and how many bots walk around.",
    "📱 Faster on phones: no shadows, less grass, and the picture gets lighter by itself if the game slows down."] },
  { date: "Oct 9, 2026", title: "World Islands: football fixed", items: [
    "Teams wear red or blue shirts, and each goal has its team's colour.",
    "Signs show YOUR GOAL and SCORE HERE, and the match starts by telling you which goal to attack.",
    "Own goals count for the other team and say “Own goal!”.",
    "The ball goes where you're facing. Bots have a keeper, pass, and only shoot when close.",
    "After every goal, everyone goes back to their half for a kick-off."] },
  { date: "Oct 9, 2026", title: "FlexiHub is the new name", items: [
    "The hub is now flexihub.web.app. Old addresses (teamolive, recoon, the4workspace) still work and bring you here.",
    "The hub is simpler: information, Pomodoro timer, app status and the apps."] },
  { date: "Oct 2026", title: "World Islands", items: [
    "The game is now World Islands at world-islands.web.app.",
    "Round World Tower, mBank with card, phone and hand pay, jobs, phone calls and messages, cinema cartoons in Russian, and a better hotel."] },
];
const client = sb();
const app = document.getElementById("app");
const nav = document.getElementById("nav");
const foot = document.getElementById("foot");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const params = new URLSearchParams(location.search);
const returnTo = params.get("return") && isTrusted(params.get("return")) ? params.get("return") : null;
let asRole = params.get("as") === "teacher" ? "teacher" : "student";
let session = null, profile = null, appData = [];
let teaching = null; // a teacher's classes, students and homework
let timers = [];
const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

// ── tiny DOM helper ──
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") for (const [p, val] of Object.entries(v)) el.style.setProperty(p, val);
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return el;
}
const mark = (size = 22) => h("img", { src: "flexihub-logo.svg", alt: "", width: size, height: size, style: { "border-radius": Math.round(size * .28) + "px", display: "block", flex: "none" } });
const svg = (path) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const IC = {
  key: svg('<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 9.2-9.2M17 6l3 3M14 9l2 2"/>'),
  bolt: svg('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
  sync: svg('<path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9"/><path d="M18 3v4h-4M6 21v-4h4"/>'),
  swap: svg('<path d="M4 7h13l-3-3M20 17H7l3 3"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  device: svg('<rect x="3" y="4" width="13" height="10" rx="2"/><rect x="17" y="9" width="4" height="11" rx="1"/><path d="M7 18h6"/>'),
  shield: svg('<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>'),
  check: svg('<path d="m5 12 5 5 9-10"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  eye: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="m3 3 18 18"/>'),
  link: svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
};
const CHECK = '<svg class="check" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="currentColor" opacity=".18"/><path d="m4.5 8.2 2.3 2.3 4.7-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const top = () => window.scrollTo({ top: 0, behavior: "instant" });
const arrow = () => h("span", { class: "arrow" }, "→");
function toast(msg, kind = "") { const t = h("div", { class: "toast " + kind, role: "status" }, msg); document.body.append(t); setTimeout(() => t.remove(), 3200); }

// ── the apps ──
const INFO = {
  learnkyrgyz: {
    name: "LearnKyrgyz", mark: "LK", icon: "icons/learnkyrgyz.svg", c1: "#58cc02", c2: "#1cb0f6", tag: "Learn Kyrgyz like a game", url: "https://studentlrnkyrgyz.web.app/", teacherUrl: "https://teachlrnkyrgyz.web.app/",
    points: ["99 topics from A1 to B1, with real Kyrgyz pronunciation", "Lessons, spaced review, unit tests and dialogues", "Teachers: classes, homework, sealed exams and a gradebook"],
    how: ["Students follow a path of 99 topics. Each one teaches a few words, practises them, then builds sentences, and every word is spoken with correct Kyrgyz pronunciation.",
      "Spaced review brings words back just before you'd forget them. Unit tests check what stuck, and dialogues train listening and speaking.",
      "Teachers create a class with a join code, set homework and timed exams (sealed, optionally full screen), and grades land in a 5-point gradebook.",
      "Live lessons use video calls and your PowerPoint slides. A4 worksheets and tests print with an answer key."],
  },
  quoldek: {
    name: "Quoldek", mark: "Q", icon: "icons/quoldek.svg", c1: "#7c5cff", c2: "#2ba8ff", tag: "Classroom quiz games", url: "https://quoldek.web.app/signin.html",
    points: ["Write or paste a quiz, or bring a LearnKyrgyz topic in one tap", "11 live games: Kart Race, Laser Tag, Tug of War and more", "Homework links that mark themselves"],
    how: ["A teacher makes a quiz by writing it, pasting questions, or bringing LearnKyrgyz topics across in one tap.",
      "Host live: pick a game such as Kart Race, Laser Tag or Tug of War and put the PIN on the board.",
      "Everyone joins at playquoldek.web.app on their own phone. The fastest right answer scores the most.",
      "Or share it as homework, and it marks itself. Your quizzes are saved to your account."],
  },
  kadam: {
    name: "Kadam", mark: "K", icon: "icons/kadam.svg", c1: "#14b8a6", c2: "#c2410c", tag: "Workspace for your university path", url: "https://kadam.web.app/",
    points: ["Notes, Sheets, Slides and Canvas in one suite", "Tasks, UniSave, an AI study helper and Languages", "English, Русский and Кыргызча; works offline"],
    how: ["Eight tools for getting into university, all behind the nine-dot launcher: Notes, Sheets, Slides, Canvas, Tasks, UniSave, AI and Languages.",
      "Templates for university comparison tables, essay outlines, scholarship and deadline trackers.",
      "Everything syncs privately to your account, and you choose who can open it.",
      "Opened from FlexiHub, Kadam signs you in with this same account."],
  },
  akylduukodo: {
    name: "CompactCoding", mark: "</>", icon: "icons/akylduukodo.svg", c1: "#1cb0f6", c2: "#ff8fab", tag: "Learn programming step by step", url: "https://compactcoding.web.app/",
    points: ["Real JavaScript through short, clear lessons", "Guided practice, drills and a Code Lab", "A weekly study goal to keep you going"],
    how: ["Short lessons teach real JavaScript one idea at a time, with a book of 15 chapters.",
      "Guided practice and timed drills check every step. The Code Lab is a sandbox for your own code.",
      "A weekly goal keeps you going, and progress saves to your account.",
      "Opened from FlexiHub, CompactCoding signs you in with this same account."],
  },
  worldislands: {
    name: "World Islands", mark: "WI", icon: "icons/worldislands.png", c1: "#3aa0d8", c2: "#ffc94d", tag: "A 3D island world for learning", url: "https://world-islands.web.app/", teacherUrl: "https://world-islands.web.app/teachers",
    points: ["A 3D world in English and Russian, with your own avatar", "Math and language games that earn stars and house points", "Minigames with the class: football, Impostor, Quiz Battle"],
    how: ["Students explore six islands, ride the metro between them and walk into buildings to play learning games.",
      "Math, English and Russian games have four levels. Stars add up to house points on a class leaderboard.",
      "Stand on a pad to start a minigame: football, dodgeball, hide and seek, Impostor or Quiz Battle. Bots join when few people are online.",
      "Teachers get tools for announcements, star giveaways, music and starting minigames. Opened from FlexiHub, it signs you in with this same account."],
  },
};
const ORDER = ["learnkyrgyz", "quoldek", "kadam", "akylduukodo", "worldislands"];
const tile = (id, size = "") => { const a = INFO[id]; return h("span", { class: "tile ico " + size, style: { "--c1": a.c1, "--c2": a.c2 }, "aria-hidden": "true" }, h("img", { src: a.icon, alt: "", draggable: "false", decoding: "async" })); };
const urlFor = (id) => profile?.role === "teacher" && INFO[id].teacherUrl ? INFO[id].teacherUrl : INFO[id].url;
const appFor = (url) => ORDER.find(id => { try { const u = new URL(url); return [INFO[id].url, INFO[id].teacherUrl].filter(Boolean).some(x => new URL(x).host === u.host) || (id === "quoldek" && /quoldek\.web\.app$/.test(u.host)); } catch { return false; } });

// ── motion helpers ──
function reveal(root) {
  const els = root.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  els.forEach(e => io.observe(e));
}
function countUp(el, to) {
  if (reduce || !to) { el.textContent = (to || 0).toLocaleString(); return; }
  const t0 = performance.now(), dur = 900;
  const step = (t) => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString(); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
// Cards lean toward the pointer in 3D, with a soft light where it is.
const finePointer = matchMedia("(pointer: fine)").matches;
function tilt(el, max = 8) {
  el.classList.add("tilt");
  if (reduce || !finePointer) return el;
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.transition = "transform .12s ease-out";
    el.style.transform = `perspective(900px) rotateX(${(.5 - y) * max}deg) rotateY(${(x - .5) * max}deg) translateY(-4px)`;
    el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
  });
  el.addEventListener("pointerleave", () => { el.style.transition = "transform .6s cubic-bezier(.2,.8,.2,1)"; el.style.transform = ""; });
  return el;
}
function glow(el) { if (finePointer) el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); el.style.setProperty("--mx", e.clientX - r.left + "px"); el.style.setProperty("--my", e.clientY - r.top + "px"); }); return el; }
function confetti(x = innerWidth / 2, y = innerHeight / 3) {
  if (reduce) return;
  const colors = ["#7c5cff", "#58cc02", "#22d3ee", "#14b8a6", "#1cb0f6", "#ffc857"];
  for (let i = 0; i < 80; i++) {
    const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 300;
    const c = h("i", { class: "confetti", style: { left: x + "px", top: y + "px", background: colors[i % colors.length], "--dx": Math.cos(a) * d + "px", "--dy": Math.sin(a) * d + 220 + "px", "--r": Math.random() * 900 + "deg" } });
    document.body.append(c); setTimeout(() => c.remove(), 1600);
  }
}
// Leave for an app: a bubble in the app's colour grows from where you pressed,
// its logo flips in, and the app opens already signed in.
let lastPoint = null;
addEventListener("pointerdown", (e) => { lastPoint = { x: e.clientX, y: e.clientY }; }, { capture: true, passive: true });
function portal(url, id) {
  const a = INFO[id] || INFO.learnkyrgyz;
  const { x, y } = lastPoint || { x: innerWidth / 2, y: innerHeight / 2 };
  const far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const p = h("div", { class: "portal", role: "status", style: { "--c1": a.c1, "--c2": a.c2, "--x": x + "px", "--y": y + "px", "--s": (far * 2 / 20 + 2).toFixed(1) } },
    h("i", { class: "disc" }),
    h("div", { class: "msg" }, tile(id), h("b", {}, `Opening ${a.name}`),
      h("span", {}, session ? `Signed in as ${session.user.email}` : "Taking you there"), h("div", { class: "bar" }, h("i"))));
  document.body.append(p);
  if (INFO[id]) noteOpened(id);
  setTimeout(() => { location.href = handoffUrl(url, session); }, reduce ? 150 : 1250);
}
window.addEventListener("pageshow", (e) => { if (e.persisted) document.querySelectorAll(".portal").forEach(x => x.remove()); });

// ── data ──
async function loadMe() {
  const { data } = await client.auth.getSession();
  session = data.session;
  if (!session) { profile = null; appData = []; return; }
  const [p, d] = await Promise.all([
    client.from("profiles").select("full_name,role,xp,streak,progress,avatar_color").eq("id", session.user.id).maybeSingle(),
    client.from("app_data").select("app,key,data,updated_at"),
  ]);
  profile = p.data || { full_name: session.user.user_metadata?.full_name || session.user.email, role: "student", xp: 0, streak: 0 };
  appData = d.data || [];
  teaching = null;
  if (profile.role === "teacher") {
    // teachers don't do lessons: their dashboard is about their classes
    const { data: classes } = await client.from("classrooms").select("id,name,color,join_code,created_at").eq("teacher_id", session.user.id).order("created_at");
    const ids = (classes || []).map(c => c.id);
    const [m, hw] = ids.length ? await Promise.all([
      client.from("classroom_members").select("classroom_id").in("classroom_id", ids),
      client.from("homework").select("id,title,due_at,classroom_id").in("classroom_id", ids),
    ]) : [{ data: [] }, { data: [] }];
    const members = m.data || [], homework = hw.data || [];
    teaching = { classes: (classes || []).map(c => ({ ...c, students: members.filter(x => x.classroom_id === c.id).length })),
      students: members.length, open: homework.filter(x => new Date(x.due_at) > new Date()).sort((a, b) => new Date(a.due_at) - new Date(b.due_at)) };
  }
}
client.auth.onAuthStateChange((ev, s) => { if (ev === "TOKEN_REFRESHED" || ev === "SIGNED_IN") session = s; });
async function signOut() { await client.auth.signOut({ scope: "local" }); session = null; profile = null; history.replaceState(null, "", location.pathname); toast("Signed out"); route(); top(); }

// ── header + footer ──
const initials = (name) => (name || "?").trim().split(/[\s@]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "?";
function drawNav() {
  nav.replaceChildren();
  const tools = [
    h("button", { class: "icon-btn", onClick: toggleTheme, title: themeNow() === "dark" ? "Light mode (T)" : "Dark mode (T)", "aria-label": "Switch theme", html: themeNow() === "dark" ? SUN : MOON }),
  ];
  if (session) {
    const name = profile?.full_name || session.user.email;
    nav.append(h("a", { class: "link", href: "#today" }, "Today"), h("a", { class: "link", href: "#apps" }, "Apps"), h("a", { class: "link", href: "#guides" }, "Guides"), ...tools.filter(Boolean),
      h("span", { class: "me" }, h("button", { class: "avatar", style: avatarStyle(), title: `${session.user.email} · Edit profile`, onClick: editProfile }, initials(name)),
        h("button", { class: "btn ghost sm", onClick: signOut }, "Sign out")));
  } else {
    nav.append(h("a", { class: "link", href: "#product", onClick: goLanding }, "Product"), h("a", { class: "link", href: "#apps", onClick: goLanding }, "Apps"),
      h("a", { class: "link", href: "#security", onClick: goLanding }, "Security"), h("a", { class: "link", href: "#faq", onClick: goLanding }, "FAQ"), ...tools.filter(Boolean),
      h("a", { class: "btn ghost sm", href: "#signin", style: { "margin-left": "8px" } }, "Sign in"), h("a", { class: "btn primary sm", href: "#signup" }, "Get started"));
  }
}
function goLanding(e) {
  if (!/^#sign/.test(location.hash) || session) return;
  e.preventDefault(); const id = e.currentTarget.getAttribute("href").slice(1);
  history.replaceState(null, "", location.pathname + location.search); route();
  later(() => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }), 60);
}
function drawFoot() {
  foot.replaceChildren(
    h("div", { class: "foot-in" },
      h("div", {}, h("a", { class: "logo", href: "./", style: { display: "flex", margin: "0 0 4px" } }, mark(), h("span", { style: { color: "var(--ink)" } }, "FlexiHub")),
        h("p", { style: { "max-width": "32ch" } }, "One account for LearnKyrgyz, Quoldek, Kadam and CompactCoding. Sign in once, then every app opens signed in.")),
      h("div", {}, h("h4", {}, "Apps"), ORDER.map(id => h("a", { href: INFO[id].url, target: "_blank", rel: "noopener" }, INFO[id].name))),
      h("div", {}, h("h4", {}, "Product"), h("a", { href: "#product", onClick: goLanding }, "How it works"), h("a", { href: "#security", onClick: goLanding }, "Security"), h("a", { href: "#faq", onClick: goLanding }, "FAQ")),
      h("div", {}, h("h4", {}, "Account"), session ? [h("a", { href: "#apps" }, "Dashboard"), h("a", { href: "#", onClick: (e) => { e.preventDefault(); signOut(); } }, "Sign out")]
        : [h("a", { href: "#signin" }, "Sign in"), h("a", { href: "#signup" }, "Create account")])),
    h("div", { class: "foot-bottom" }, h("span", {}, `© ${new Date().getFullYear()} FlexiHub`), h("span", {}, "Made for a comfortable way for you to learn")));
}

// ── the console preview: one account, four apps connecting one after another ──
function consoleCard({ animate = true, name = "Aigerim Asanova", email = "aigerim@gmail.com" } = {}) {
  const rows = ORDER.map(id => {
    const st = h("span", { class: "status" }, h("i", { class: "spin" }), h("span", { html: CHECK, style: { display: "contents" } }), h("span", { class: "txt" }, "Connecting…"));
    return { st, el: h("div", { class: "app-row" }, tile(id, "sm"), h("div", {}, h("b", {}, INFO[id].name), h("div", { class: "sub" }, INFO[id].tag)), st) };
  });
  const N = ORDER.length, bar = h("i"), count = h("span", {}, `0 of ${N} signed in`);
  const el = h("div", { class: "console", "aria-hidden": "true" },
    h("div", { class: "chrome" }, h("i"), h("i"), h("i"), h("span", {}, "flexihub.web.app")),
    h("div", { class: "console-body" },
      h("div", { class: "acct" }, h("span", { class: "avatar" }, initials(name)), h("div", {}, h("b", {}, name), h("span", {}, email)), h("span", { class: "badge" }, "One account")),
      h("div", { class: "apps-list" }, rows.map(r => r.el)),
      h("div", { class: "console-foot" }, h("span", { class: "meter" }, bar), count)));
  const set = (n) => { rows.forEach((r, i) => { r.st.classList.toggle("ok", i < n); r.st.querySelector(".txt").textContent = i < n ? "Signed in" : "Connecting…"; }); bar.style.width = n * 100 / N + "%"; count.textContent = `${n} of ${N} signed in`; };
  if (!animate || reduce) { set(N); return el; }
  const cycle = () => { set(0); ORDER.map((_, i) => i + 1).forEach(n => later(() => set(n), 700 + n * 650)); later(cycle, 7200); };
  later(cycle, 300);
  return el;
}

// Headline words rise in one after another.
const words = (text, k0 = 0, cls = "") => text.split(" ").map((w, i) => [h("span", { class: "w " + cls, "aria-hidden": "true", style: { "--i": k0 + i, "--gi": i } }, w), " "]);

// The hero's 3D stage: the four apps orbit your one account, each lighting up
// as it signs in, while the scene leans toward the pointer.
function stage() {
  const hellos = ["Салам! 👋", "Hello! 👋", "Привет! 👋"];
  const bubble = h("span", { class: "hello-bubble" }, hellos[0]);
  const scene = h("div", { class: "scene" },
    h("i", { class: "floor" }), h("i", { class: "orbit-ring" }), h("i", { class: "orbit-ring r2" }),
    [0, 1, 2].map(i => h("i", { class: "wave", style: { "--i": i } })),
    h("div", { class: "orbit" }, ORDER.map((id, k) => h("div", { class: "sat", style: { "--a": k * 360 / ORDER.length + "deg" } },
      h("div", { class: "face", style: { "--a": k * 360 / ORDER.length + "deg", "--k": k, "--c1": INFO[id].c1 } }, tile(id), h("b", {}, INFO[id].name), h("i", { class: "ok" }, "✓"))))),
    h("div", { class: "core" }, h("img", { src: "flexihub-logo.svg", alt: "" })),
    bubble);
  const el = h("div", { class: "stage rise", style: { "--d": 2 }, "aria-hidden": "true" }, scene);
  if (reduce) return el;
  let n = 0;
  const say = () => { n = (n + 1) % hellos.length; bubble.textContent = hellos[n]; bubble.style.animation = "none"; void bubble.offsetWidth; bubble.style.animation = ""; later(say, 2800); };
  later(say, 2800);
  let tx = 0, ty = 0, rx = 0, ry = 0;
  const onMove = (e) => { tx = (.5 - e.clientY / innerHeight) * 14; ty = (e.clientX / innerWidth - .5) * 22; };
  if (finePointer) addEventListener("pointermove", onMove, { passive: true });
  const t0 = performance.now();
  const tick = (t) => {
    if (!el.isConnected) { removeEventListener("pointermove", onMove); return; }
    if (!finePointer) { tx = Math.sin((t - t0) / 2400) * 5; ty = Math.sin((t - t0) / 3100) * 12; }
    rx += (tx - rx) * .06; ry += (ty - ry) * .06;
    scene.style.setProperty("--rx", rx.toFixed(2) + "deg"); scene.style.setProperty("--ry", ry.toFixed(2) + "deg");
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return el;
}

// ── landing ──
function landing() {
  const feature = (ic, t, d, k) => glow(h("div", { class: "feature reveal", style: { "--d": k } }, h("div", { class: "ic", html: IC[ic] }), h("h3", {}, t), h("p", {}, d)));
  const checkItem = (ic, t, d) => h("div", { class: "check-item" }, h("span", { class: "ic", html: IC[ic] }), h("div", {}, h("b", {}, t), h("p", {}, d)));
  const q = (t, d) => h("details", { class: "card" }, h("summary", {}, t), h("p", {}, d));

  app.replaceChildren(
    h("section", { class: "hero" },
      h("div", {},
        h("span", { class: "pill rise" }, h("b", {}, "New"), "Welcome to FlexiHub"),
        h("h1", { "aria-label": "One account for all five apps." }, words("One account for"), words("all five apps.", 3, "grad")),
        h("p", { class: "lead rise", style: { "--d": 2 } }, "Sign in once with Google or email. LearnKyrgyz, Quoldek, Kadam, CompactCoding and World Islands open already signed in: no second password, no downloads."),
        h("div", { class: "cta-row rise", style: { "--d": 3 } },
          h("a", { class: "btn primary lg", href: "#signup" }, "Create free account", arrow()),
          h("a", { class: "btn ghost lg", href: "#signin" }, "Sign in")),
        h("div", { class: "trust rise", style: { "--d": 5 } }, h("span", { class: "tiles" }, ORDER.map(id => tile(id, "sm"))), h("span", {}, "LearnKyrgyz · Quoldek · Kadam · CompactCoding · World Islands"))),
      stage()),

    h("div", { class: "strip reveal" }, [["5", "apps, one sign-in"], ["99", "Kyrgyz topics"], ["11", "live quiz games"], ["0", "downloads needed"]].map(([b, s]) => h("div", {}, h("b", {}, b), h("span", {}, s)))),

    h("section", { id: "product" },
      h("div", { class: "center" }, h("span", { class: "eyebrow reveal" }, "Single sign-on"), h("h2", { class: "h2 reveal" }, "One sign-in. Every app."),
        h("p", { class: "lead reveal" }, "Your FlexiHub account is the key. Open any of the five apps from here and it arrives signed in as you.")),
      h("div", { class: "doors reveal" },
        h("div", { class: "door-svg", html: '<svg viewBox="0 0 1000 380" preserveAspectRatio="none" aria-hidden="true">' + ORDER.map((id, k) => {
          const x = 100 + k * 800 / (ORDER.length - 1), d = `M 500 88 C 500 200, ${x} 170, ${x} 262`;
          return `<path class="dline" style="--c:${INFO[id].c1};--k:${k}" d="${d}"/>` + (reduce ? "" : `<circle class="dpulse" style="--c:${INFO[id].c1}" r="4"><animateMotion dur="2.6s" begin="${k * .4}s" repeatCount="indefinite" path="${d}"/></circle>`);
        }).join("") + "</svg>" }),
        h("div", { class: "key card" }, mark(34), h("div", {}, h("b", {}, "Your FlexiHub account"), h("span", {}, "Google or email"))),
        h("div", { class: "door-row" }, ORDER.map((id, k) => h("div", { class: "door card", style: { "--k": k, "--c1": INFO[id].c1 } }, tile(id, "lg"), h("b", {}, INFO[id].name), h("span", { class: "badge" }, "Opens signed in")))))),

    h("section", { id: "inside", style: { "padding-top": 0 } },
      h("div", { class: "center" }, h("span", { class: "eyebrow reveal" }, "Inside your workspace"), h("h2", { class: "h2 reveal" }, "More than a sign-in page"),
        h("p", { class: "lead reveal" }, "A Pomodoro focus timer and live app status. These are real: try them.")),
      h("div", { class: "bento landing-bento two-up" }, focusCard(), statusCard())),

    h("section", { id: "features", style: { "padding-top": 0 } },
      h("span", { class: "eyebrow reveal" }, "Why FlexiHub"), h("h2", { class: "h2 reveal" }, "Built to save you time"),
      h("p", { class: "lead reveal" }, "Everything a student or teacher needs across the five apps, behind one account."),
      h("div", { class: "features" },
        feature("key", "One account", "One email and password, or one Google account, for all five apps.", 0),
        feature("bolt", "Opens signed in", "Press an app and you're in. There's no second sign-in screen.", 1),
        feature("swap", "Topics become games", "Pick LearnKyrgyz topics and they become a Quoldek quiz in one tap.", 2),
        feature("sync", "Saved to your account", "Progress and quizzes follow you, not the device you used.", 3),
        feature("device", "Any device", "Phone, laptop or the classroom board. Everything runs in the browser.", 4),
        feature("globe", "Three languages", "English, Русский and Кыргызча across the apps.", 5))),

    h("section", { id: "apps", style: { "padding-top": 0 } },
      h("span", { class: "eyebrow reveal" }, "The apps"), h("h2", { class: "h2 reveal" }, "Five apps, one place"),
      h("div", { class: "apps" }, ORDER.map((id, k) => appCard(id, k)))),

    h("section", { id: "how", style: { "padding-top": 0 } },
      h("span", { class: "eyebrow reveal" }, "How it works"), h("h2", { class: "h2 reveal" }, "Three steps, then you never sign in twice"),
      h("div", { class: "steps" }, [
        ["Create your account", "Use Google or an email address, as a student or a teacher. Already on LearnKyrgyz? That's your account: just sign in."],
        ["Open any app", "Your dashboard lists all five. Press one and it opens signed in as you."],
        ["Keep going anywhere", "Your progress and quizzes are saved to your account, so they're there on every device."],
      ].map(([t, d], k) => h("div", { class: "step card reveal", style: { "--d": k } }, h("div", { class: "n" }, k + 1), h("h3", {}, t), h("p", {}, d))))),

    h("section", { id: "security", class: "security", style: { "padding-top": 0 } },
      h("div", {}, h("span", { class: "eyebrow reveal" }, "Security"), h("h2", { class: "h2 reveal" }, "Private by design"),
        h("p", { class: "lead reveal" }, "Moving between apps never exposes your password. Each app gets a short-lived sign-in and nothing more.")),
      h("div", { class: "checks card reveal" },
        checkItem("lock", "Your password stays here", "Apps receive a sign-in token, never your password."),
        checkItem("eye", "Never sent in the open", "The hand-off travels in the part of the link that browsers don't send to servers, and each app removes it at once."),
        checkItem("link", "Only our five apps", "Sign-ins are only ever handed to LearnKyrgyz, Quoldek, Kadam, CompactCoding and World Islands."),
        checkItem("shield", "Your data is yours", "Each account can read and change only its own data."))),

    h("section", { id: "bridge", style: { "padding-top": 0 } },
      h("div", { class: "bridge card reveal" },
        h("div", {}, h("span", { class: "eyebrow" }, "LearnKyrgyz × Quoldek"), h("h2", { class: "h2" }, "A topic becomes a game in one tap"),
          h("ol", { class: "clean" },
            h("li", {}, "Pick topics such as Greetings or Family in LearnKyrgyz or on your dashboard."),
            h("li", {}, "Press Play in Quoldek. The questions are built for you, with the Kyrgyz word in every explanation."),
            h("li", {}, "Quoldek opens signed in with the quiz ready. Choose a game and put the PIN on the board."))),
        h("div", { class: "flow" },
          h("div", { class: "end l" }, tile("learnkyrgyz", "lg"), "LearnKyrgyz"), h("i", { class: "track" }),
          ["Greetings", "Салам!", "Family"].map((t, i) => h("span", { class: "fcard", style: { "--i": i } }, t)),
          h("div", { class: "end r" }, tile("quoldek", "lg"), "Quoldek")))),

    h("section", { id: "faq", style: { "padding-top": 0 } },
      h("div", { class: "center" }, h("span", { class: "eyebrow reveal" }, "FAQ"), h("h2", { class: "h2 reveal" }, "Questions, answered")),
      h("div", { class: "faq reveal" },
        q("Is it free?", "Yes. Creating an account and using all five apps is free."),
        q("I already have a LearnKyrgyz account.", "Then you already have a FlexiHub account. Sign in with the same email or Google account."),
        q("Do I still need separate accounts for Kadam or CompactCoding?", "No. Open them from FlexiHub and they sign you in with this account. If you used the same Google account there before, your old work is still there."),
        q("What happens when I sign out?", "Signing out here signs you out of this page. Each app keeps its own session until you sign out there too."),
        q("Does it work on phones?", "Yes. Everything runs in the browser, so there's nothing to install.")),
      h("div", { class: "center", style: { "margin-top": "56px" } }, h("span", { class: "eyebrow reveal" }, "Updates"), h("h2", { class: "h2 reveal" }, "What's new")),
      h("div", { class: "faq reveal" }, ...UPDATES.filter(u => !u.from || Date.now() >= Date.parse(u.from)).map((u, i) => { const d = q(u.date + " · " + u.title, ""); d.querySelector("p").remove(); d.append(h("ul", { class: "upd" }, ...u.items.map(x => h("li", {}, x)))); if (!i) d.open = true; return d; }))),

    h("section", { style: { "padding-top": 0, "padding-bottom": 0 } },
      h("div", { class: "cta card reveal" },
        h("h2", { class: "h2", style: { position: "relative" } }, "Ready? ", h("span", { class: "grad" }, "Баштайлы!")),
        h("p", { class: "lead", style: { margin: "0 auto", position: "relative" } }, "One account, and every app is a tap away."),
        h("div", { class: "cta-row", style: { position: "relative" } }, h("a", { class: "btn primary lg", href: "#signup" }, "Create free account", arrow()), h("a", { class: "btn ghost lg", href: "#signin" }, "Sign in")))));
  reveal(app);
  drawDoors();
  fitFlow();
}
function drawDoors() {
  const el = document.querySelector(".doors"); if (!el) return;
  if (reduce || !("IntersectionObserver" in window)) { el.classList.add("drawn"); return; }
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { el.classList.add("drawn"); io.disconnect(); } }), { threshold: .3 });
  io.observe(el);
}
// Each card travels the full dashed track, whatever the width.
function fitFlow() {
  const f = document.querySelector(".flow"); if (!f) return;
  const set = () => f.querySelectorAll(".fcard").forEach(c => c.style.setProperty("--w", Math.max(40, f.clientWidth - 140 - c.offsetWidth) + "px"));
  set(); addEventListener("resize", set);
}
function appCard(id, k) {
  const a = INFO[id];
  return tilt(h("div", { class: "app card reveal", style: { "--c1": a.c1, "--c2": a.c2, "--d": k } },
    h("div", { class: "app-head" }, tile(id), h("div", {}, h("h3", {}, a.name), h("div", { class: "tag" }, a.tag), h("div", { class: "host" }, new URL(a.url).host))),
    h("ul", {}, a.points.map(p => h("li", {}, p))),
    h("div", { class: "foot-row" },
      h("a", { class: "open", href: session ? "#" : "#signup", onClick: session ? (e) => { e.preventDefault(); portal(urlFor(id), id); } : null }, session ? `Open ${a.name}` : "Get started", arrow()),
      h("span", { class: "badge" }, "Auto sign-in"))));
}

// ── sign in / create account ──
function authView(mode) {
  const signup = mode === "signup";
  const err = h("div", { class: "err hidden", role: "alert" });
  const showErr = (e) => { err.textContent = (e && (e.message || e.error_description)) || String(e); err.classList.remove("hidden"); };
  const name = h("input", { class: "input", placeholder: "Айжан Асанова", autocomplete: "name", maxlength: 80 });
  const email = h("input", { class: "input", type: "email", placeholder: "you@example.com", autocomplete: "email", required: true });
  const pw = h("input", { class: "input", type: "password", placeholder: signup ? "At least 6 characters" : "Your password", autocomplete: signup ? "new-password" : "current-password", minlength: 6, required: true });
  const roleSeg = h("div", { class: "seg", role: "radiogroup" }, ["student", "teacher"].map(r => h("button", { type: "button", role: "radio", "aria-checked": String(asRole === r), class: asRole === r ? "on" : "", onClick: (e) => { asRole = r; [...roleSeg.children].forEach(b => { const on = b === e.currentTarget; b.classList.toggle("on", on); b.setAttribute("aria-checked", String(on)); }); } }, r === "student" ? "Student" : "Teacher")));
  const submit = h("button", { class: "btn brand lg block", type: "submit" }, signup ? "Create account" : "Sign in");
  const google = h("button", { type: "button", class: "btn lg block google hidden", html: GOOGLE_ICON + "<span>Continue with Google</span>", onClick: async () => {
    google.disabled = true; err.classList.add("hidden");
    try { await signInWithGoogle({ role: asRole, learnFrom: "en" }); await done(); }
    catch (e) { if (!/popup-closed|cancelled-popup/i.test(String(e && (e.code || e.message)))) showErr(e); }
    finally { google.disabled = false; }
  } });
  const or = h("div", { class: "or hidden" }, "or with email");
  googleAvailable().then(ok => { if (ok) { google.classList.remove("hidden"); or.classList.remove("hidden"); } });

  async function done() {
    await loadMe();
    toast(signup ? "Account created. Welcome!" : "Signed in", "good");
    if (signup) confetti();
    history.replaceState(null, "", location.pathname + location.search);
    route(); top();
  }
  const form = h("form", { onSubmit: async (e) => {
    e.preventDefault(); err.classList.add("hidden"); submit.disabled = true;
    try {
      if (signup) await signUpWithPassword({ email: email.value.trim(), password: pw.value, fullName: name.value.trim() || email.value.split("@")[0], role: asRole, learnFrom: "en" });
      else { const { error } = await client.auth.signInWithPassword({ email: email.value.trim(), password: pw.value }); if (error) throw error; }
      await done();
    } catch (ex) { showErr(ex); submit.disabled = false; }
  } },
    signup ? h("label", { class: "field" }, h("span", {}, "Full name"), name) : null,
    h("label", { class: "field" }, h("span", {}, "Email"), email),
    h("label", { class: "field" }, h("span", {}, "Password"), pw),
    signup ? h("div", { class: "field" }, h("span", {}, "I'm a"), roleSeg) : null,
    submit);

  const target = returnTo && appFor(returnTo);
  app.replaceChildren(h("div", { class: "auth-wrap" },
    h("div", { class: "auth-art" },
      h("span", { class: "eyebrow rise" }, mark(), "FlexiHub account"),
      h("h1", { class: "rise", style: { "--d": 1 } }, signup ? "One account for every app." : "Welcome back."),
      h("p", { class: "lead rise", style: { "--d": 2 } }, "It's your LearnKyrgyz account too. Quoldek, Kadam and CompactCoding open with it already signed in."),
      h("div", { class: "rise", style: { "--d": 3 } }, consoleCard({ animate: true }))),
    h("div", { class: "auth card rise" },
      target ? h("div", { class: "return-banner" }, tile(target, "sm"), h("span", {}, `Sign in to continue to ${INFO[target].name}`)) : null,
      h("h2", {}, signup ? "Create your account" : "Sign in to FlexiHub"),
      h("p", { class: "sub" }, signup ? "Free, and it works in all five apps." : "Use the account you use in any of the five apps."),
      h("div", { class: "seg" },
        h("button", { type: "button", class: signup ? "" : "on", onClick: () => { location.hash = "signin"; } }, "Sign in"),
        h("button", { type: "button", class: signup ? "on" : "", onClick: () => { location.hash = "signup"; } }, "Create account")),
      err, google, or, form,
      h("p", { class: "legal" }, "One account for LearnKyrgyz, Quoldek, Kadam and CompactCoding."))));
  if (matchMedia("(pointer: fine)").matches) later(() => (signup ? name : email).focus(), 60);
}

// ── dashboard ──
function dashboard() {
  const first = (profile.full_name || session.user.email).split(/[\s@]/)[0];
  const teacher = profile.role === "teacher";
  const pr = profile.progress || {};
  const topicsDone = Object.values(pr.topics || {}).filter(t => (t.level || 0) > 0).length;
  const words = Object.keys(pr.words || {}).length;
  const qz = appData.find(r => r.app === "quoldek" && r.key === "quizzes");
  const quizzes = qz ? Object.keys(qz.data || {}).length : 0;
  const kpi = (id, value, label, k, emoji) => glow(h("div", { class: "kpi card reveal", style: { "--d": k, "--c1": INFO[id].c1 } }, h("span", {}, tile(id, "sm"), label), odometer(value), h("i", { class: "kpi-emoji", "aria-hidden": "true" }, emoji)));
  const provider = session.user.app_metadata?.provider === "google" || (session.user.identities || []).some(i => i.provider === "google") ? "Google" : "Email";

  app.replaceChildren(h("div", { class: "dash" },
    skyBanner({ first, teacher }),
    false && h("div", { class: "kpis" },
      teacher && teaching ? [
        kpi("learnkyrgyz", teaching.classes.length, "Classes", 0, "🏫"),
        kpi("learnkyrgyz", teaching.students, "Students", 1, "🧑‍🎓"),
        kpi("learnkyrgyz", teaching.open.length, "Open homework", 2, "📝"),
      ] : [
        kpi("learnkyrgyz", profile.xp || 0, "XP", 0, "⚡"),
        kpi("learnkyrgyz", profile.streak || 0, "Day streak", 1, "🔥"),
        kpi("learnkyrgyz", topicsDone || words, topicsDone ? "Topics done" : "Words learned", 2, "🏔️"),
      ],
      kpi("quoldek", quizzes, "Quoldek quizzes", 3, "🎮")),

    h("div", { class: "sec-h", id: "today" }, h("h2", {}, "Today"), h("p", {}, kyDate())),
    h("div", { class: "bento two-up" }, focusCard(), statusCard()),

    h("div", { class: "sec-h", id: "apps" }, h("h2", {}, "Your apps"), h("p", {}, "Drag to reorder · press 1–4 to open")),
    launcher(myOrder().map((id, k) => tilt(h("div", { class: "item card reveal", "data-id": id, draggable: "true", style: { "--c1": INFO[id].c1, "--d": k } },
      h("span", { class: "kbd-corner" }, kbd(String(k + 1))),
      h("div", { class: "row" }, tile(id, "lg"), h("div", {}, h("b", {}, INFO[id].name), h("div", { class: "tag" }, INFO[id].tag), h("div", { class: "host" }, new URL(INFO[id].url).host))),
      h("span", { class: "badge", style: { "margin-left": 0, "justify-self": "start" } }, "Opens signed in"),
      h("button", { class: "btn ghost block", onClick: () => portal(urlFor(id), id) }, `Open ${INFO[id].name}`, arrow()))))),

    h("div", { class: "sec-h", id: "account" }, h("h2", {}, "Account"), h("p", {}, "Your details")),
    h("div", { class: "one" },
      h("div", { class: "panel card reveal" },
        h("div", { class: "row-between" }, h("b", {}, "Account"), h("span", { class: "badge" }, "Active")),
        h("div", { class: "kv" },
          h("div", {}, h("span", {}, "Name"), h("b", {}, profile.full_name || "—", " ", h("button", { class: "linkish tiny", onClick: editProfile }, "Edit"))),
          h("div", {}, h("span", {}, "Email"), h("b", {}, session.user.email)),
          h("div", {}, h("span", {}, "Role"), h("b", {}, teacher ? "Teacher" : "Student")),
          h("div", {}, h("span", {}, "Signs in with"), h("b", {}, provider)),
          h("div", {}, h("span", {}, "Apps"), h("b", {}, "All five connected"))),
        h("button", { class: "btn ghost block", onClick: signOut }, "Sign out"))),

    h("div", { class: "sec-h", id: "guides" }, h("h2", {}, "How the apps work"), h("p", {}, "Short guides")),
    h("div", { class: "guides" }, [...ORDER.map(id => h("details", { class: "card", open: id === "learnkyrgyz" ? true : null },
      h("summary", {}, tile(id, "sm"), INFO[id].name), h("ol", {}, INFO[id].how.map(x => h("li", {}, x))))),
      h("details", { class: "card" }, h("summary", {}, mark(), "How one account works"),
        h("ol", {}, h("li", {}, "Your FlexiHub account is your LearnKyrgyz account: the same email, password or Google."),
          h("li", {}, "When you open an app from here, your sign-in goes with you in the part of the link that browsers don't send to servers, and the app removes it straight away."),
          h("li", {}, "Kadam and CompactCoding swap it for their own sign-in, so you arrive signed in there too."),
          h("li", {}, "Signing out here signs out of this page only; each app keeps its own session.")))])));
  reveal(app);
}

function picker() {
  const sel = new Set(); let lang = "en";
  const units = h("div", { class: "units" });
  const sum = h("span", { class: "tiny faint" }, "Pick up to 6 topics");
  const draw = () => {
    units.replaceChildren(...UNITS.map((u, i) => h("div", { class: "unit" }, h("div", { class: "unit-h" }, `Unit ${i + 1} · ${u.level} · ${u.en}`),
      u.topics.map(id => h("button", { class: "chip" + (sel.has(id) ? " on" : ""), "aria-pressed": String(sel.has(id)), onClick: () => { sel.has(id) ? sel.delete(id) : sel.size < 6 && sel.add(id); draw(); } }, TOPICS[id].en)))));
    sum.textContent = sel.size ? `${sel.size} selected: ${[...sel].map(id => TOPICS[id].en).join(", ")}` : "Pick up to 6 topics";
  };
  draw();
  const langSeg = h("div", { class: "seg", style: { margin: 0, "min-width": "200px" } }, [["en", "English"], ["ru", "Русский"]].map(([v, l]) => h("button", { type: "button", class: v === lang ? "on" : "", onClick: (e) => { lang = v; [...langSeg.children].forEach(b => b.classList.toggle("on", b === e.currentTarget)); } }, l)));
  const go = (mode) => () => { if (!sel.size) return toast("Pick at least one topic", "bad"); portal(`https://quoldek.web.app/?learnkyrgyz=${[...sel].join(",")}&lang=${lang}&go=${mode}`, "quoldek"); };
  return h("div", { class: "panel card reveal" },
    h("div", { class: "row-between" }, h("div", { style: { display: "flex", gap: "10px", "align-items": "center" } }, tile("learnkyrgyz", "sm"), h("span", { class: "faint" }, "→"), tile("quoldek", "sm"), h("b", {}, "Make a Quoldek quiz")), sum),
    units,
    h("div", { class: "row-between" },
      h("div", { style: { display: "flex", gap: "10px", "align-items": "center" } }, h("span", { class: "tiny faint" }, "Questions in"), langSeg),
      h("div", { style: { display: "flex", gap: "8px", "flex-wrap": "wrap" } },
        h("button", { class: "btn ghost", onClick: go("take") }, "Practise alone"),
        h("button", { class: "btn brand", onClick: go("host") }, "Play in Quoldek", arrow()))));
}

// ── small stores in this browser (conveniences only; nothing here is an account) ──
const store = {
  get(k, d) { try { const v = localStorage.getItem("ws." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("ws." + k, JSON.stringify(v)); } catch { /* private mode */ } },
};

// ── theme: follows the system until you choose ──
const themeNow = () => document.documentElement.dataset.theme || "dark";
function setTheme(t, save = true) {
  const flip = () => { document.documentElement.dataset.theme = t; if (save) { try { localStorage.setItem("ws.theme", t); } catch {} if (session) flag("style"); } drawNav(); };
  if (document.startViewTransition && !reduce && save) document.startViewTransition(flip); else flip();
}
const toggleTheme = () => setTheme(themeNow() === "dark" ? "light" : "dark");
matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", (e) => { let saved = null; try { saved = localStorage.getItem("ws.theme"); } catch {} if (!saved) setTheme(e.matches ? "light" : "dark", false); });
const SUN = svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>');
const MOON = svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>');
const BELL = svg('<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>');
const SEARCH = svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>');
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const kbd = (...keys) => h("span", { class: "kbds" }, keys.map(k => h("kbd", {}, k)));

// ── apps in the order you chose (drag to reorder on the dashboard) ──
const myOrder = () => { const o = store.get("order", ORDER); return o.length === ORDER.length && ORDER.every(id => o.includes(id)) ? o : ORDER; };
function openApp(id) { session ? portal(urlFor(id), id) : window.open(INFO[id].url, "_blank", "noopener"); }
// the apps you opened most recently, newest first
const recent = () => store.get("recent", []).filter(r => INFO[r.id]);
function noteOpened(id) { store.set("recent", [{ id, at: Date.now() }, ...recent().filter(r => r.id !== id)].slice(0, 6)); store.set("opened", [...new Set([...store.get("opened", []), id])]); }
function ago(t) {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return "just now"; if (s < 3600) return Math.round(s / 60) + " min ago";
  if (s < 86400) return Math.round(s / 3600) + " h ago"; return Math.round(s / 86400) + " d ago";
}

// ── ⌘K: search and jump anywhere ──
function commands() {
  const list = [];
  const add = (group, label, run, extra = {}) => list.push({ group, label, run, ...extra });
  myOrder().forEach((id, i) => add("Apps", `Open ${INFO[id].name}`, () => openApp(id), { icon: tile(id, "xs"), hint: INFO[id].tag, keys: session ? [String(i + 1)] : null }));
  const go = (id) => () => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); else { location.hash = id; } };
  if (session) {
    [["today", "Today"], ["apps", "Your apps"], ["bridge", "Topics → Quoldek"], ["guides", "Guides"]].forEach(([id, l]) => add("Go to", l, go(id), { icon: h("span", { class: "cmd-ic", html: svg('<path d="M5 12h14M13 6l6 6-6 6"/>') }) }));
    add("Actions", "Start a 25-minute focus session", () => { focus.start(25); document.getElementById("today")?.scrollIntoView({ behavior: "smooth" }); }, { icon: h("span", { class: "cmd-ic", html: svg('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>') }) });
    add("Actions", "Edit my profile", () => editProfile(), { icon: h("span", { class: "cmd-ic", html: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>') }) });
    add("Actions", "Sign out", () => signOut(), { icon: h("span", { class: "cmd-ic", html: svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>') }) });
    Object.entries(TOPICS).forEach(([id, t]) => add("Play a topic in Quoldek", `${t.en} · ${t.ky}`, () => portal(`https://quoldek.web.app/?learnkyrgyz=${id}&lang=en&go=host`, "quoldek"), { icon: tile("quoldek", "xs"), hidden: true }));
  } else {
    [["product", "How it works"], ["apps", "The apps"], ["security", "Security"], ["faq", "FAQ"]].forEach(([id, l]) => add("Go to", l, go(id), { icon: h("span", { class: "cmd-ic", html: svg('<path d="M5 12h14M13 6l6 6-6 6"/>') }) }));
    add("Actions", "Create an account", () => { location.hash = "signup"; }, { icon: h("span", { class: "cmd-ic", html: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0M19 8v6M16 11h6"/>') }) });
    add("Actions", "Sign in", () => { location.hash = "signin"; }, { icon: h("span", { class: "cmd-ic", html: svg('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>') }) });
  }
  add("Actions", themeNow() === "dark" ? "Switch to light mode" : "Switch to dark mode", toggleTheme, { icon: h("span", { class: "cmd-ic", html: themeNow() === "dark" ? SUN : MOON }), keys: ["T"] });
  add("Actions", "What's new", () => whatsNew(), { icon: h("span", { class: "cmd-ic", html: BELL }) });
  add("Actions", "Install FlexiHub as an app", () => install(), { icon: h("span", { class: "cmd-ic", html: DOWNLOAD }) });
  if (session) {
    add("Actions", "Take the tour again", () => { store.set("toured", false); scrollTo({ top: 0 }); tour(); }, { icon: h("span", { class: "cmd-ic", html: svg('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>') }) });
    add("Go to", "Achievements", go("badges"), { icon: h("span", { class: "cmd-ic", html: svg('<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/>') }) });
  }
  add("Actions", "Keyboard shortcuts", () => shortcuts(), { icon: h("span", { class: "cmd-ic", html: svg('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>') }), keys: ["?"] });
  return list;
}
function score(label, q) {
  const l = label.toLowerCase(); if (!q) return 1;
  if (l.startsWith(q)) return 3; if (l.includes(q)) return 2;
  let i = 0; for (const ch of l) if (ch === q[i]) i++;
  return i === q.length ? 1 : 0;
}
function palette() {
  if (document.querySelector(".cmdk")) return;
  if (session) flag("command");
  const all = commands();
  const input = h("input", { class: "cmd-input", placeholder: session ? "Search apps, topics and actions…" : "Search apps and actions…", "aria-label": "Search", autocomplete: "off", spellcheck: "false" });
  const listEl = h("div", { class: "cmd-list", role: "listbox" });
  let items = [], at = 0;
  const close = () => { wrap.classList.add("out"); setTimeout(() => wrap.remove(), 160); };
  const run = (c) => { close(); setTimeout(() => c.run(), 60); };
  const draw = () => {
    const q = input.value.trim().toLowerCase();
    items = all.filter(c => (!c.hidden || q) && score(c.label, q) > 0).sort((a, b) => score(b.label, q) - score(a.label, q)).slice(0, q ? 40 : 30);
    if (!q) items.sort((a, b) => all.indexOf(a) - all.indexOf(b));
    at = Math.min(at, Math.max(0, items.length - 1));
    const groups = [...new Set(items.map(c => c.group))];
    listEl.replaceChildren(...(items.length ? groups.map(g => h("div", { class: "cmd-group" }, h("div", { class: "cmd-gh" }, g),
      items.filter(c => c.group === g).map(c => { const i = items.indexOf(c);
        return h("div", { class: "cmd-item" + (i === at ? " on" : ""), role: "option", "aria-selected": String(i === at), onMousemove: () => { if (at !== i) { at = i; mark(); } }, onClick: () => run(c) },
          c.icon || null, h("span", { class: "cmd-label" }, c.label), c.hint ? h("span", { class: "cmd-hint" }, c.hint) : null, c.keys ? kbd(...c.keys) : null); })))
      : [h("div", { class: "cmd-empty" }, "Nothing matches. Try a topic like “family” or an app name.")]));
  };
  const mark = () => listEl.querySelectorAll(".cmd-item").forEach((el, i) => { el.classList.toggle("on", i === at); el.setAttribute("aria-selected", String(i === at)); if (i === at) el.scrollIntoView({ block: "nearest" }); });
  input.addEventListener("input", () => { at = 0; draw(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); at = Math.min(items.length - 1, at + 1); mark(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); at = Math.max(0, at - 1); mark(); }
    else if (e.key === "Enter") { e.preventDefault(); if (items[at]) run(items[at]); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
  });
  const wrap = h("div", { class: "cmdk", onClick: (e) => { if (e.target === wrap) close(); } },
    h("div", { class: "cmd-box", role: "dialog", "aria-label": "Command menu" },
      h("div", { class: "cmd-top" }, h("span", { class: "cmd-ic", html: SEARCH }), input, h("kbd", {}, "esc")),
      listEl,
      h("div", { class: "cmd-foot" }, h("span", {}, kbd("↑", "↓"), " move"), h("span", {}, kbd("↵"), " open"), h("span", {}, kbd(isMac ? "⌘" : "Ctrl", "K"), " anywhere"))));
  document.body.append(wrap); draw(); input.focus();
}

// ── a sheet that slides in from the side ──
function sheet(title, body) {
  document.querySelector(".sheet-wrap")?.remove();
  const close = () => { wrap.classList.add("out"); setTimeout(() => wrap.remove(), 220); };
  const wrap = h("div", { class: "sheet-wrap", onClick: (e) => { if (e.target === wrap) close(); } },
    h("aside", { class: "sheet", role: "dialog", "aria-label": title },
      h("div", { class: "sheet-h" }, h("b", {}, title), h("button", { class: "btn ghost sm", onClick: close, "aria-label": "Close" }, "Close")), body));
  const esc = (e) => { if (e.key === "Escape") { close(); removeEventListener("keydown", esc); } };
  addEventListener("keydown", esc);
  document.body.append(wrap);
  return close;
}
const NEWS = [
  { v: "3.2", date: "9 Oct 2026", title: "FlexiHub", items: ["TeamOlive is now FlexiHub, at flexihub.web.app. Same account, same apps; the old addresses forward here"] },
  { v: "3.1", date: "9 Oct 2026", title: "Simpler", items: ["FlexiHub now keeps only what matters: the apps, a Pomodoro timer, live app status and information"] },
  { v: "3.0", date: "9 Oct 2026", title: "FlexiHub", items: ["The4Workspace is now FlexiHub, at flexihub.web.app. Your account, apps and progress are the same; the old address forwards here", "A new logo", "Banda World Islands is now World Islands, at world-islands.web.app"] },
  { v: "2.5", date: "9 Oct 2026", title: "World Islands", items: ["World Islands is the fifth app: a 3D island world with learning games, minigames and teacher tools", "It opens signed in from the dashboard, the launcher and the app switcher"] },
  { v: "2.4", date: "28 Sep 2026", title: "One workspace, everywhere", items: ["A switcher in every app: press the FlexiHub button (or Alt+W) in LearnKyrgyz, Quoldek, Kadam or CompactCoding to jump to another app, signed in", "Install FlexiHub as an app on your phone or computer", "Achievements: 12 badges to collect, with a shiny unlock", "A short tour for your first visit"] },
  { v: "2.3", date: "27 Sep 2026", title: "A friendlier dashboard", items: ["A live sky over your dashboard: the sun or moon where it really is, stars at night, clouds and the Ala-Too", "Today's quest: one small thing in each app, ticked off as you open them, with a daily quest streak", "Numbers roll into place, cards glow where your cursor is, app icons wiggle hello"] },
  { v: "2.2", date: "27 Sep 2026", title: "A workspace, not just a door", items: ["⌘K / Ctrl+K opens a command menu: every app, every Kyrgyz topic, every action", "Your dashboard has a Today row: your streak ring and a focus timer", "Live app status, recently opened apps, and a launcher you can reorder by dragging", "Light and dark mode, keyboard shortcuts, and a new floating header"] },
  { v: "2.1", date: "26 Sep 2026", title: "FlexiHub", items: ["OneInFour is now FlexiHub at flexihub.web.app", "Quoldek 5.0 signs in with FlexiHub, then opens your TeachBoard or StudentBoard", "AkylduuKodo is now CompactCoding at compactcoding.web.app", "Every app has a FlexiHub button"] },
  { v: "2.0", date: "26 Sep 2026", title: "One account, four apps", items: ["Kadam and CompactCoding sign you in automatically", "The four logos orbit your account in 3D; a bubble grows as you open an app"] },
];
const newsSeen = () => store.get("news", "") === NEWS[0].v;
function whatsNew() {
  store.set("news", NEWS[0].v); document.querySelector(".bell")?.classList.remove("unread");
  sheet("What's new", h("div", { class: "news" }, NEWS.map((n, i) => h("article", { class: "news-item" + (i === 0 ? " latest" : "") },
    h("div", { class: "news-meta" }, h("span", { class: "badge" }, "v" + n.v), h("span", { class: "faint tiny" }, n.date)),
    h("h3", {}, n.title), h("ul", {}, n.items.map(x => h("li", {}, x)))))));
}
function shortcuts() {
  const row = (keys, what) => h("div", { class: "sc-row" }, h("span", {}, what), kbd(...keys));
  sheet("Keyboard shortcuts", h("div", { class: "sc" },
    row([isMac ? "⌘" : "Ctrl", "K"], "Open the command menu"), row(["/"], "Search"),
    session ? myOrder().map((id, i) => row([String(i + 1)], `Open ${INFO[id].name}`)) : null,
    row(["T"], "Light or dark"), row(["F"], "Start or pause the focus timer"), row(["?"], "This list")));
}
addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key.toLowerCase() === "t") toggleTheme();
  else if (e.key.toLowerCase() === "f" && session) focus.toggle();
  else if (session && /^[1-9]$/.test(e.key) && +e.key <= ORDER.length) openApp(myOrder()[+e.key - 1]);
});

// ── Today: greeting, quest, streak ring, focus timer ──
// the date in Kyrgyz (browsers have no Kyrgyz calendar names built in)
function kyDate(d = new Date()) {
  const days = ["жекшемби", "дүйшөмбү", "шейшемби", "шаршемби", "бейшемби", "жума", "ишемби"];
  const months = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
  return `${d.getDate()}-${months[d.getMonth()]}, ${days[d.getDay()]}`;
}
function greeting() {
  const hr = new Date().getHours();
  if (hr >= 5 && hr < 12) return ["Кутман таң", "Good morning"];
  if (hr >= 12 && hr < 18) return ["Кутман күн", "Good afternoon"];
  if (hr >= 18 && hr < 23) return ["Кутман кеч", "Good evening"];
  return ["Жакшы түн", "Good night"];
}
// ── Today's quest: one small thing in each app. Opening an app from here ticks it off. ──
const QUEST = {
  learnkyrgyz: { teacher: "Check on your classes", student: "Do one Kyrgyz lesson", emoji: "📚" },
  quoldek: { teacher: "Run a quiz game", student: "Play a quiz game", emoji: "🎮" },
  kadam: { teacher: "Plan your week", student: "Plan one university task", emoji: "🗂️" },
  akylduukodo: { teacher: "Try a coding lesson", student: "Write a little code", emoji: "💻" },
  worldislands: { teacher: "Start a Quiz Battle", student: "Earn a star on the islands", emoji: "🏝️" },
};
const todayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const questDone = () => { const at = new Date(); at.setHours(0, 0, 0, 0); return new Set(recent().filter(r => r.at >= at.getTime()).map(r => r.id)); };
function questStreak() {
  // days in a row the whole quest was finished (kept on this device)
  const log = store.get("quests", {}); let n = 0; const d = new Date();
  if (!log[todayKey(d)]) d.setDate(d.getDate() - 1);
  while (log[todayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function questCard() {
  const done = session ? questDone() : new Set(), role = profile?.role === "teacher" ? "teacher" : "student";
  const n = done.size, all = n === ORDER.length;
  if (all && session) { const log = store.get("quests", {}); if (!log[todayKey()]) { log[todayKey()] = true; store.set("quests", log); later(() => { confetti(innerWidth / 2, innerHeight / 3); toast("Quest complete! See you tomorrow 🎉", "good"); }, 900); } }
  const segs = h("div", { class: "q-segs" }, ORDER.map((id, i) => h("i", { class: done.has(id) ? "on" : "", style: { "--c1": INFO[id].c1, "--i": i } })));
  const streak = questStreak();
  return glow(h("div", { class: "widget quest card reveal" + (all ? " complete" : ""), id: "quest", style: { "--d": 1 } },
    h("div", { class: "q-glow", "aria-hidden": "true" }),
    h("div", { class: "w-h" }, h("span", { class: "eyebrow" }, "Today's quest"), h("span", { class: "q-streak", title: "Days in a row you finished the quest" }, "⚡ ", streak, streak === 1 ? " day" : " days")),
    h("div", { class: "q-title" }, all ? h("span", {}, "All done. ", h("span", { class: "grad" }, "Legend!")) : h("span", {}, h("b", { class: "q-count" }, n), ` of ${ORDER.length} done`)),
    segs,
    h("div", { class: "q-list" }, myOrder().map((id, i) => {
      const ok = done.has(id);
      return h("button", { class: "q-item" + (ok ? " ok" : ""), style: { "--c1": INFO[id].c1, "--i": i }, onClick: () => openApp(id) },
        h("span", { class: "q-check", html: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m7 12.5 3.2 3.2L17 9"/></svg>` }),
        tile(id, "xs"),
        h("span", { class: "q-text" }, h("b", {}, QUEST[id][role]), h("span", {}, ok ? "Done today" : `Open ${INFO[id].name}`)),
        h("span", { class: "q-emoji", "aria-hidden": "true" }, QUEST[id].emoji));
    })),
    h("p", { class: "faint tiny", style: { margin: 0 } }, session ? "Open an app from here and its task ticks itself off. A new quest every morning." : "Sign in and every app you open ticks off a task. A new quest every morning.")));
}

// ── the sky over the dashboard: the real time of day, over Ala-Too ──
function skyBanner({ first, teacher }) {
  const now = new Date(), hr = now.getHours() + now.getMinutes() / 60;
  const day = hr >= 6 && hr < 19.5;
  // where the sun (or moon) is along its arc, 0..1
  const t = day ? (hr - 6) / 13.5 : ((hr < 6 ? hr + 24 : hr) - 19.5) / 10.5;
  const phase = hr < 5 || hr >= 21 ? "night" : hr < 8 ? "dawn" : hr < 17 ? "day" : hr < 21 ? "dusk" : "night";
  // kept to the open right half of the sky, above the hills
  const x = 62 + t * 32, y = 70 - Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * 52;
  const stars = phase === "night" || phase === "dusk" ? Array.from({ length: 46 }, (_, i) => h("i", { class: "star", style: { left: (i * 37.3 % 100) + "%", top: (i * 23.7 % 60) + "%", "--tw": (1.5 + (i % 7) * .4) + "s", "--d": (i % 5) * -.6 + "s", "--s": (1 + (i % 3)) + "px" } })) : [];
  const clouds = [0, 1, 2].map(i => h("i", { class: "cloud", style: { top: (14 + i * 14) + "%", "--dur": (60 + i * 25) + "s", "--delay": (-i * 22) + "s", "--sc": (1 - i * .18) } }));
  const mountains = h("div", { class: "mtn", html:
    `<svg viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">
      <path class="m3" d="M0 150 L120 90 L210 130 L330 60 L450 120 L560 70 L690 125 L800 80 L930 130 L1040 75 L1200 120 V220 H0Z"/>
      <path class="m2" d="M0 175 L150 110 L260 150 L400 95 L520 160 L640 105 L760 150 L900 100 L1030 160 L1200 115 V220 H0Z"/>
      <path class="snow" d="M400 95 L372 112 L390 110 L404 118 L418 108 L432 112Z M900 100 L874 116 L890 114 L903 121 L916 112 L930 117Z M150 110 L128 124 L142 122 L152 128 L162 121 L174 125Z"/>
      <path class="m1" d="M0 200 L180 150 L330 185 L480 140 L640 190 L800 150 L960 190 L1100 160 L1200 180 V220 H0Z"/>
    </svg>` });
  const [ky, en] = greeting();
  const el = h("div", { class: "sky " + phase + " rise" },
    h("div", { class: "sky-layer stars-l" }, stars),
    h("i", { class: "orb " + (day ? "sun" : "moon"), style: { left: x + "%", top: y + "%" } }),
    h("div", { class: "sky-layer clouds-l" }, clouds),
    phase === "night" || phase === "dusk"
      ? h("div", { class: "sky-layer" }, [0, 1].map(i => h("i", { class: "shoot", style: { "--d": (i * 5.5 + 2) + "s", top: (10 + i * 18) + "%", left: (55 + i * 20) + "%" } })))
      : h("div", { class: "sky-layer birds" }, [0, 1, 2].map(i => h("i", { class: "bird", style: { "--d": (-i * 1.3) + "s", top: (22 + i * 7) + "%", "--dur": (22 + i * 4) + "s" }, html: '<svg viewBox="0 0 24 10" aria-hidden="true"><path d="M1 8 Q6 1 12 7 Q18 1 23 8"/></svg>' }))),
    mountains,
    h("div", { class: "sky-text" },
      h("p", { class: "greet-en" }, en + " · " + now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })),
      h("h1", {}, words(`${ky}, ${first}!`), h("span", { class: "wave-hand" }, " 👋")),
      h("p", { class: "sky-sub" }, "Everything you need is one click away. Press ", kbd(isMac ? "⌘" : "Ctrl", "K"), " to jump anywhere."),
      h("div", { class: "sky-cta" },
        h("button", { class: "btn primary lg", onClick: () => portal(urlFor("learnkyrgyz"), "learnkyrgyz") }, teacher ? "Open my classes" : "Continue learning", arrow()))));
  // the far hills move least, the near ones most
  if (!reduce && finePointer) el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    el.style.setProperty("--px", px.toFixed(3)); el.style.setProperty("--py", py.toFixed(3));
  });
  return el;
}

// numbers that roll into place like an odometer
function odometer(value) {
  const s = Number(value || 0).toLocaleString("en-US"), el = h("b", { class: "odo", "aria-label": s });
  [...s].forEach((ch, i) => {
    if (!/\d/.test(ch)) return el.append(h("span", { class: "odo-sep" }, ch));
    const col = h("span", { class: "odo-col", style: { "--i": i } }, h("span", { class: "odo-strip" }, Array.from({ length: 20 }, (_, k) => h("span", {}, k % 10))));
    el.append(col);
    later(() => { col.firstChild.style.transform = `translateY(-${(10 + Number(ch)) * 5}%)`; }, 250 + i * 90);
  });
  return el;
}

function ring(pct, size = 120, stroke = 10, cls = "") {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const el = h("div", { class: "ring " + cls, style: { width: size + "px", height: size + "px" }, html:
    `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><defs><linearGradient id="rg${cls}" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset=".6" stop-color="#22d3ee"/><stop offset="1" stop-color="#34d399"/></linearGradient></defs>`
    + `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${stroke}"/>`
    + `<circle class="arc" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="url(#rg${cls})" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`
    + `<g class="tip-g" style="transform-origin:${size / 2}px ${size / 2}px"><circle class="tip" cx="${size / 2}" cy="${stroke / 2}" r="${stroke / 2 + 2}"/></g></svg>` });
  el.set = (p) => { p = Math.max(0, Math.min(1, p)); el.querySelector(".arc").style.strokeDashoffset = String(c * (1 - p)); el.querySelector(".tip-g").style.transform = `rotate(${p * 360}deg)`; el.classList.toggle("has-tip", p > 0.005 && p < 0.995); };
  later(() => el.set(pct), 250);
  return el;
}
function streakCard() {
  const st = profile.streak || 0, next = Math.max(7, Math.ceil((st + 1) / 7) * 7), left = next - st;
  const rg = ring(st / next, 118, 10, "st");
  rg.append(h("div", { class: "ring-in" }, h("b", {}, h("span", { class: "flame" }, "🔥"), " " + st), h("span", {}, st === 1 ? "day" : "days")));
  return glow(h("div", { class: "widget streak card reveal", style: { "--d": 2 } },
    h("div", { class: "w-h" }, h("span", { class: "eyebrow" }, "Streak"), h("span", { class: "faint tiny" }, "LearnKyrgyz")),
    h("div", { class: "streak-row" }, rg, h("div", {},
      h("b", { class: "big" }, st && st % 7 === 0 ? `${st / 7} full week${st > 7 ? "s" : ""}!` : `${left} day${left === 1 ? "" : "s"} to ${next}`),
      h("p", { class: "faint tiny" }, st ? "Do one lesson today to keep it alive." : "One lesson starts a new streak."),
      h("button", { class: "btn ghost sm", onClick: () => portal(urlFor("learnkyrgyz"), "learnkyrgyz") }, "Do a lesson", arrow())))));
}
// for teachers, in place of a streak: their classes, at a glance
function classesCard() {
  const t = teaching || { classes: [], students: 0, open: [] }, next = t.open[0];
  const when = (d) => { const days = Math.ceil((new Date(d) - Date.now()) / 864e5); return days <= 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`; };
  const copy = async (code, b) => { try { await navigator.clipboard.writeText(code); b.textContent = "Copied!"; setTimeout(() => { b.textContent = code; }, 1400); } catch { toast("Join code: " + code); } };
  return glow(h("div", { class: "widget classes card reveal", style: { "--d": 2 } },
    h("div", { class: "w-h" }, h("span", { class: "eyebrow" }, "Your classes"), h("span", { class: "faint tiny" }, "LearnKyrgyz")),
    t.classes.length
      ? h("div", { class: "cls-list" }, t.classes.slice(0, 3).map((c, i) => h("div", { class: "cls-row", style: { "--c": c.color || "#1cb0f6", "--i": i } },
          h("i", { class: "cls-dot" }), h("span", { class: "cls-name" }, c.name), h("span", { class: "faint tiny" }, c.students + (c.students === 1 ? " student" : " students")),
          h("button", { class: "code-chip", title: "Copy the join code", onClick: (e) => copy(c.join_code, e.currentTarget) }, c.join_code))))
      : h("p", { class: "faint tiny", style: { margin: 0 } }, "No classes yet. Make one and share its join code with your students."),
    next ? h("div", { class: "cls-next" }, h("span", { class: "faint tiny" }, "Next homework due " + when(next.due_at)), h("b", {}, next.title)) : null,
    h("button", { class: "btn ghost sm", style: { "justify-self": "start" }, onClick: () => portal(urlFor("learnkyrgyz"), "learnkyrgyz") }, t.classes.length ? "Open my classes" : "Make a class", arrow())));
}

// a focus timer that keeps running across reloads, and chimes at the end
const focus = {
  state() { return store.get("focus", null); },
  start(mins) { store.set("focus", { end: Date.now() + mins * 60e3, mins, paused: null }); this.tick(); if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().catch(() => {}); },
  toggle() { const s = this.state(); if (!s) return this.start(25); if (s.paused != null) store.set("focus", { ...s, end: Date.now() + s.paused, paused: null }); else store.set("focus", { ...s, paused: Math.max(0, s.end - Date.now()) }); this.tick(); },
  reset() { store.set("focus", null); document.title = baseTitle; this.tick(); },
  left() { const s = this.state(); if (!s) return 0; return s.paused != null ? s.paused : Math.max(0, s.end - Date.now()); },
  chime() {
    try { const ac = new (window.AudioContext || window.webkitAudioContext)(); [0, .18, .36].forEach((t, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = [660, 880, 990][i]; g.gain.setValueAtTime(.0001, ac.currentTime + t); g.gain.exponentialRampToValueAtTime(.25, ac.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + t + .5); o.connect(g).connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + .55); }); } catch {}
    try { if (Notification.permission === "granted") new Notification("Focus session done", { body: "Take a five-minute break.", icon: "flexihub-logo.svg" }); } catch {}
  },
  views: new Set(),
  tick() {
    const s = this.state(), ms = this.left();
    if (s && s.paused == null && ms <= 0) { store.set("focus", null); if (s.mins !== 5) store.set("focusDone", store.get("focusDone", 0) + 1); this.chime(); toast("Focus session done. Take a break!", "good"); confetti(); later(checkBadges, 1200); }
    this.views.forEach(v => v.isConnected ? v.paint() : this.views.delete(v));
    const on = this.state() && this.state().paused == null;
    const mm = String(Math.floor(this.left() / 60000)).padStart(2, "0"), ss = String(Math.floor(this.left() / 1000) % 60).padStart(2, "0");
    document.title = on ? `${mm}:${ss} · Focus · FlexiHub` : baseTitle;
  },
};
const baseTitle = document.title;
setInterval(() => { if (focus.state()) focus.tick(); }, 1000);
function focusCard() {
  const rg = ring(0, 118, 10, "fc"), time = h("b", {}, "25:00"), label = h("span", {}, "focus");
  rg.append(h("div", { class: "ring-in" }, time, label));
  const main = h("button", { class: "btn brand sm", onClick: () => focus.toggle() }, "Start");
  const modes = h("div", { class: "seg mini" }, [[25, "25m"], [50, "50m"], [5, "Break"]].map(([m, l]) => h("button", { type: "button", onClick: () => focus.start(m) }, l)));
  const card = glow(h("div", { class: "widget focus card reveal", id: "focus", style: { "--d": 3 } },
    h("div", { class: "w-h" }, h("span", { class: "eyebrow" }, "Focus"), kbd("F")),
    h("div", { class: "streak-row" }, rg, h("div", { style: { display: "grid", gap: "8px" } }, main, h("button", { class: "btn ghost sm", onClick: () => focus.reset() }, "Reset"))),
    modes));
  card.paint = () => {
    const s = focus.state(), ms = s ? focus.left() : 25 * 60e3, total = (s ? s.mins : 25) * 60e3;
    time.textContent = `${String(Math.floor(ms / 60000)).padStart(2, "0")}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
    label.textContent = !s ? "ready" : s.paused != null ? "paused" : s.mins === 5 ? "break" : "focus";
    main.textContent = !s ? "Start" : s.paused != null ? "Resume" : "Pause";
    rg.set(s ? 1 - ms / total : 0); card.classList.toggle("running", !!s && s.paused == null);
  };
  focus.views.add(card); later(() => card.paint(), 300);
  return card;
}
// ── are the apps up? a real request to each, timed ──
function statusCard() {
  const rows = myOrder().map(id => { const dot = h("i", { class: "dot wait" }), ms = h("span", { class: "faint tiny" }, "checking…");
    return { id, dot, ms, el: h("div", { class: "st-row" }, tile(id, "xs"), h("span", {}, INFO[id].name), h("span", { class: "grow" }), ms, dot) }; });
  const check = () => rows.forEach(async (r) => {
    r.dot.className = "dot wait"; r.ms.textContent = "checking…";
    const t0 = performance.now();
    try { await fetch(INFO[r.id].url, { mode: "no-cors", cache: "no-store" }); const t = Math.round(performance.now() - t0); r.dot.className = "dot ok"; r.ms.textContent = `Online · ${t} ms`; }
    catch { r.dot.className = "dot bad"; r.ms.textContent = "Can't reach"; }
  });
  later(check, 400);
  return glow(h("div", { class: "widget status card reveal", style: { "--d": 4 } },
    h("div", { class: "w-h" }, h("span", { class: "eyebrow" }, "App status"), h("button", { class: "linkish tiny", onClick: check }, "Check again")),
    h("div", { class: "st-list" }, rows.map(r => r.el))));
}
function recentCard() {
  const list = recent();
  return glow(h("div", { class: "widget recent card reveal", style: { "--d": 5 } },
    h("div", { class: "w-h" }, h("span", { class: "eyebrow" }, "Recently opened"), h("span", { class: "faint tiny" }, "on this device")),
    list.length ? h("div", { class: "st-list" }, list.slice(0, 4).map(r => h("button", { class: "st-row clickable", onClick: () => openApp(r.id) }, tile(r.id, "xs"), h("span", {}, INFO[r.id].name), h("span", { class: "grow" }), h("span", { class: "faint tiny" }, ago(r.at)))))
      : h("p", { class: "faint tiny", style: { margin: "6px 0 0" } }, "Apps you open from here show up here, so you can jump back in.")));
}
// ── your profile: name and colour, saved to the account ──
const COLORS = ["#7c5cff", "#22d3ee", "#58cc02", "#14b8a6", "#1cb0f6", "#f59e0b", "#ef4444", "#ec4899"];
function avatarStyle() { const c = profile?.avatar_color; return c ? { background: c } : null; }
function editProfile() {
  let color = profile.avatar_color || COLORS[0];
  const name = h("input", { class: "input", value: profile.full_name || "", maxlength: 80, autocomplete: "name" });
  const prev = h("span", { class: "avatar xl", style: { background: color } }, initials(profile.full_name || session.user.email));
  name.addEventListener("input", () => { prev.textContent = initials(name.value || session.user.email); });
  const sw = h("div", { class: "swatches" }, COLORS.map(c => h("button", { type: "button", class: "sw" + (c === color ? " on" : ""), style: { background: c }, "aria-label": "Colour " + c, onClick: (e) => { color = c; prev.style.background = c; sw.querySelectorAll(".sw").forEach(x => x.classList.toggle("on", x === e.currentTarget)); } })));
  const save = h("button", { class: "btn brand block", onClick: async () => {
    save.disabled = true;
    const { error } = await client.from("profiles").update({ full_name: name.value.trim() || profile.full_name, avatar_color: color }).eq("id", session.user.id);
    if (error) { toast(error.message, "bad"); save.disabled = false; return; }
    profile.full_name = name.value.trim() || profile.full_name; profile.avatar_color = color;
    close(); toast("Profile saved", "good"); route();
  } }, "Save");
  const close = sheet("Your profile", h("div", { class: "prof" }, h("div", { style: { display: "flex", "justify-content": "center" } }, prev),
    h("label", { class: "field" }, h("span", {}, "Name"), name), h("div", { class: "field" }, h("span", {}, "Colour"), sw),
    h("p", { class: "faint tiny" }, "Your name shows in LearnKyrgyz and here. Your email and sign-in stay the same."), save,
    h("button", { class: "btn ghost block", onClick: () => { close(); signOut(); } }, "Sign out")));
}

// drag the app cards into the order you like; it is kept on this device
function launcher(items) {
  const box = h("div", { class: "launch" }, items);
  let dragged = null;
  box.addEventListener("dragstart", (e) => { dragged = e.target.closest(".item"); if (!dragged) return; dragged.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", dragged.dataset.id); } catch {} });
  box.addEventListener("dragover", (e) => {
    if (!dragged) return; e.preventDefault();
    const over = e.target.closest(".item"); if (!over || over === dragged) return;
    const r = over.getBoundingClientRect(), after = (e.clientX - r.left) > r.width / 2;
    const first = [...box.children].map(x => [x, x.getBoundingClientRect()]);
    over[after ? "after" : "before"](dragged);
    if (!reduce) first.forEach(([x, a]) => { const b = x.getBoundingClientRect(); const dx = a.left - b.left, dy = a.top - b.top; if (dx || dy) x.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0 0" }], { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" }); });
  });
  box.addEventListener("dragend", () => {
    if (!dragged) return; dragged.classList.remove("dragging"); dragged = null;
    const order = [...box.children].map(x => x.dataset.id); store.set("order", order);
    [...box.children].forEach((x, i) => { const k = x.querySelector(".kbd-corner kbd"); if (k) k.textContent = String(i + 1); });
    toast("Order saved: press 1–4 to open", "good"); flag("style");
  });
  return box;
}

// ── achievements: small badges for the things people actually do here (kept on this device) ──
const BADGES = [
  { id: "first", emoji: "🚀", name: "Lift-off", how: "Open any app from FlexiHub", test: (d) => d.opened.size >= 1 },
  { id: "explorer", emoji: "🧭", name: "Explorer", how: "Open every app", test: (d) => d.opened.size >= ORDER.length },
  { id: "focus", emoji: "🎯", name: "Deep focus", how: "Finish a focus session", test: (d) => d.focus >= 1 },
  { id: "focus5", emoji: "🧘", name: "Zen master", how: "Finish 5 focus sessions", test: (d) => d.focus >= 5 },
  { id: "command", emoji: "⌨️", name: "Commander", how: "Open the command menu", test: (d) => d.flags.command },
  { id: "style", emoji: "🎨", name: "Make it yours", how: "Switch theme or reorder your apps", test: (d) => d.flags.style },
  { id: "owl", emoji: "🦉", name: "Night owl", how: "Visit after 10 pm", test: (d) => d.flags.owl },
  { id: "bird", emoji: "🐦", name: "Early bird", how: "Visit before 7 am", test: (d) => d.flags.bird },
  { id: "install", emoji: "📲", name: "At home", how: "Install FlexiHub as an app", test: (d) => d.flags.install },
];
const flag = () => {}; // achievements were removed
function badgeData() {
  return { opened: new Set(store.get("opened", [])), quests: Object.keys(store.get("quests", {})).length, qstreak: questStreak(), focus: store.get("focusDone", 0), flags: store.get("flags", {}) };
}
function checkBadges({ quiet = false } = {}) {
  const have = new Set(store.get("badges", [])), d = badgeData(), fresh = BADGES.filter(b => !have.has(b.id) && b.test(d));
  if (!fresh.length) return;
  store.set("badges", [...have, ...fresh.map(b => b.id)]);
  if (!quiet) fresh.forEach((b, i) => setTimeout(() => unlocked(b), 700 + i * 2600));
  document.querySelectorAll(".badges").forEach(el => el.replaceWith(badgeShelf()));
}
// a badge arrives: it flips in, shines, and a little burst goes off
function unlocked(b) {
  const el = h("div", { class: "unlock", role: "status" },
    h("div", { class: "unlock-medal" }, h("span", {}, b.emoji), h("i", { class: "shine" })),
    h("div", {}, h("span", { class: "eyebrow" }, "Achievement unlocked"), h("b", {}, b.name), h("span", { class: "faint tiny" }, b.how)));
  document.body.append(el);
  const r = el.getBoundingClientRect(); confetti(r.left + 40, r.top + 30);
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 500); }, 3600);
}
function badgeShelf() {
  const have = new Set(store.get("badges", []));
  return h("div", { class: "badges card reveal in" },
    h("div", { class: "w-h" }, h("span", { class: "eyebrow" }, have.size === BADGES.length ? "All collected!" : "Collect them all"), h("span", { class: "faint tiny" }, `${have.size} of ${BADGES.length}`)),
    h("div", { class: "b-bar" }, h("i", { style: { width: (have.size / BADGES.length * 100) + "%" } })),
    h("div", { class: "b-grid" }, BADGES.map((b, i) => h("div", { class: "badge-m" + (have.has(b.id) ? " got" : ""), style: { "--i": i }, tabindex: "0", title: `${b.name}: ${b.how}` },
      h("span", { class: "b-medal" }, have.has(b.id) ? b.emoji : "🔒"), h("b", {}, b.name), h("span", {}, b.how)))));
}

// ── a short tour, the first time the dashboard opens ──
function tour() {
  if (store.get("toured", false) || reduce) return;
  store.set("toured", true);
  const steps = [
    { sel: ".sky", title: "Welcome to your workspace 👋", text: "This is your home for LearnKyrgyz, Quoldek, Kadam and CompactCoding. The sky follows the real time of day." },
    { sel: ".launch", title: "Your apps, your order", text: "Drag the cards into the order you like, then press 1–4 to open them from anywhere on this page." },
    { sel: ".search-pill", title: "Jump anywhere", text: `Press ${isMac ? "⌘" : "Ctrl"}+K to find any app, action or Kyrgyz topic. Inside the apps, Alt+W opens the app switcher.` },
  ];
  let i = 0;
  const hole = h("div", { class: "tour-hole" }), card = h("div", { class: "tour-card", role: "dialog" });
  const layer = h("div", { class: "tour" }, hole, card);
  const end = () => { layer.classList.add("out"); setTimeout(() => layer.remove(), 300); };
  const show = () => {
    const s = steps[i], t = document.querySelector(s.sel);
    if (!t) { if (++i < steps.length) return show(); return end(); }
    t.scrollIntoView({ block: "center", behavior: "smooth" });
    setTimeout(() => {
      const r = t.getBoundingClientRect(), pad = 10;
      Object.assign(hole.style, { left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
      const below = r.bottom + 220 < innerHeight;
      card.style.left = Math.max(16, Math.min(innerWidth - 356, r.left)) + "px";
      card.style.top = (below ? r.bottom + 18 : Math.max(16, r.top - 200)) + "px";
      card.replaceChildren(h("span", { class: "eyebrow" }, `Step ${i + 1} of ${steps.length}`), h("b", {}, s.title), h("p", {}, s.text),
        h("div", { class: "tour-dots" }, steps.map((_, k) => h("i", { class: k === i ? "on" : "" }))),
        h("div", { class: "tour-actions" }, h("button", { class: "btn ghost sm", onClick: end }, "Skip"),
          h("button", { class: "btn brand sm", onClick: () => { if (++i < steps.length) show(); else { end(); toast("You're all set. Have a great day! ✨", "good"); } } }, i === steps.length - 1 ? "Let's go" : "Next", arrow())));
      card.classList.remove("pop"); void card.offsetWidth; card.classList.add("pop");
    }, 420);
  };
  document.body.append(layer); later(show, 50);
}

// ── install as an app ──
let installEvt = null;
addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; drawNav(); });
addEventListener("appinstalled", () => { installEvt = null; flag("install"); toast("FlexiHub is installed 🎉", "good"); drawNav(); });
async function install() {
  if (!installEvt) return toast(isMac ? "In Safari: Share → Add to Dock / Home Screen" : "Use your browser's menu → Install FlexiHub");
  installEvt.prompt(); const { outcome } = await installEvt.userChoice; if (outcome === "accepted") { installEvt = null; drawNav(); }
}
const DOWNLOAD = svg('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>');

// ── router ──
function route() {
  if (document.startViewTransition && !reduce && app.firstElementChild && !app.querySelector(".boot")) return void document.startViewTransition(render);
  render();
}
function render() {
  clearTimers();
  drawNav(); drawFoot();
  const hash = location.hash.replace("#", "");
  if (session && returnTo) { // came from an app to sign in: send them straight back
    const id = appFor(returnTo) || "learnkyrgyz";
    app.replaceChildren(h("div", { class: "boot" }, mark(72)));
    return portal(returnTo, id);
  }
  if (!session && (hash === "signin" || hash === "signup" || returnTo)) return authView(hash === "signup" ? "signup" : "signin");
  if (session) dashboard(); else landing();
  if (hash && document.getElementById(hash)) later(() => document.getElementById(hash).scrollIntoView(), 50);
}
window.addEventListener("hashchange", () => {
  const hh = location.hash.replace("#", "");
  if (hh === "signin" || hh === "signup") { if (!session) { route(); top(); } }
  else if (!document.getElementById(hh) || app.querySelector(".auth-wrap")) route();
});

// ── ambient motion: drifting points of light, a soft cursor light, buttons that respond ──
function starfield() {
  if (reduce) return;
  const cv = h("canvas", { class: "stars" }); document.querySelector(".bg").append(cv);
  const g = cv.getContext("2d"); let W, H, dpr, pts = [], mx = -1e4, my = -1e4;
  const colors = ["#a78bfa", "#58cc02", "#22d3ee", "#14b8a6", "#1cb0f6"];
  const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    const count = Math.round(Math.min(70, innerWidth * innerHeight / 20000)); pts = Array.from({ length: count }, () => ({ x: Math.random() * W, y: Math.random() * H, z: .4 + Math.random() * .8, vx: (Math.random() - .5) * .2 * dpr, vy: (Math.random() - .5) * .2 * dpr, c: colors[Math.floor(Math.random() * colors.length)] })); };
  size(); addEventListener("resize", size);
  addEventListener("pointermove", (e) => { mx = e.clientX * dpr; my = e.clientY * dpr; }, { passive: true });
  let sy = 0; addEventListener("scroll", () => { sy = scrollY; }, { passive: true });
  const link = 120 * (devicePixelRatio || 1);
  const tick = () => {
    if (!document.hidden) {
      g.clearRect(0, 0, W, H);
      for (const p of pts) {
        const dx = mx - p.x, dy = my - p.y, d = Math.hypot(dx, dy) || 1;
        if (d < 200 * dpr) { p.vx -= dx / d * .01 * dpr; p.vy -= dy / d * .01 * dpr; }
        p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        p.py = ((p.y - sy * dpr * p.z * .15) % H + H) % H;
        g.globalAlpha = .55 * p.z; g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.py, 1.4 * dpr * p.z, 0, 7); g.fill();
      }
      g.lineWidth = dpr * .7;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.py - b.py);
        if (d < link) { g.globalAlpha = (1 - d / link) * .22; g.strokeStyle = a.c; g.beginPath(); g.moveTo(a.x, a.py); g.lineTo(b.x, b.py); g.stroke(); }
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function pointerFx() {
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".btn"); if (!b || reduce) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height);
    const rip = h("span", { class: "ripple", style: { width: d + "px", height: d + "px", left: e.clientX - r.left - d / 2 + "px", top: e.clientY - r.top - d / 2 + "px" } });
    b.append(rip); setTimeout(() => rip.remove(), 650);
  });
  if (reduce || !finePointer) return;
  const spot = h("i", { class: "spot" }); document.body.append(spot);
  let sx = innerWidth / 2, sy = innerHeight / 3, tx = sx, ty = sy;
  addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  const loop = () => { sx += (tx - sx) * .12; sy += (ty - sy) * .12; spot.style.transform = `translate(${sx - 320}px, ${sy - 320}px)`; requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  document.addEventListener("pointermove", (e) => {
    const b = e.target.closest(".btn.lg");
    document.querySelectorAll(".btn.pulled").forEach(x => { if (x !== b) { x.classList.remove("pulled"); x.style.translate = ""; } });
    if (!b) return;
    const r = b.getBoundingClientRect(); b.classList.add("pulled");
    b.style.translate = `${(e.clientX - r.left - r.width / 2) * .2}px ${(e.clientY - r.top - r.height / 2) * .3}px`;
  }, { passive: true });
}
// The header floats, tightens as you scroll, and a thin bar shows how far down you are.
function headerFx() {
  const top = document.querySelector(".top"), bar = h("div", { class: "progress", "aria-hidden": "true" }, h("i"));
  document.body.append(bar);
  let ticking = false;
  const upd = () => { ticking = false; const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    top.classList.toggle("scrolled", y > 8); bar.firstChild.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`; };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
}
// First visit in a tab: the four app logos fly in and become one account.
function intro() {
  let seen = false; try { seen = sessionStorage.getItem("oi4.intro") === "1"; sessionStorage.setItem("oi4.intro", "1"); } catch {}
  if (seen || reduce || returnTo) return Promise.resolve();
  const from = [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1.2]];
  let done;
  const finish = () => { if (layer.classList.contains("out")) return; layer.classList.add("out"); setTimeout(() => layer.remove(), 750); done(); };
  const layer = h("div", { class: "intro", onClick: () => finish() },
    ORDER.map((id, k) => h("span", { class: "fly", style: { "--k": k, "--c1": INFO[id].c1, "--fx": from[k][0] * innerWidth * .6 + "px", "--fy": from[k][1] * innerHeight * .6 + "px", "--fr": (k % 2 ? 1 : -1) * 120 + "deg", "--tx": from[k][0] * 46 + "px", "--ty": from[k][1] * 46 + "px" } }, h("img", { src: INFO[id].icon, alt: "" }))),
    h("i", { class: "burst" }), h("i", { class: "burst b2" }),
    h("div", { class: "one" }, h("img", { src: "flexihub-logo.svg", alt: "" }), h("b", {}, "Flexi", h("span", {}, "Hub"))));
  document.body.append(layer);
  return new Promise((res) => { done = res; setTimeout(finish, 2300); });
}

(async () => {
  // Single sign-on check from an app (?return=…&silent=1): answer at once and
  // send the visitor straight back, with the session or with #oit=none.
  if (params.get("silent") === "1" && returnTo) {
    let s = null;
    try { s = (await client.auth.getSession()).data.session; } catch {}
    if (s) return location.replace(handoffUrl(returnTo, s));
    const u = new URL(returnTo);
    u.hash = "oit=none" + (u.hash.length > 1 ? "&" + u.hash.slice(1) : "");
    return location.replace(u.href);
  }
  // Arriving from a LearnKyrgyz app's FlexiHub button, already signed in there.
  try { await acceptHandoff(client); } catch {}
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
  starfield(); pointerFx(); headerFx();
  const shown = intro();
  try { await loadMe(); } catch (e) { console.warn(e); }
  await shown;
  route();
})();

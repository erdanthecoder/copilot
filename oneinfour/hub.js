// The4Workspace hub: sign in once, and LearnKyrgyz, Quoldek, Kadam and AkylduuKodo all open signed in.
import { sb } from "../assets/js/config.js";
import { signInWithGoogle, signUpWithPassword, googleAvailable, GOOGLE_ICON } from "../assets/js/google.js";
import { handoffUrl, isTrusted, acceptHandoff } from "../assets/js/oneintwo-core.js";
import { UNITS, TOPICS } from "../assets/js/curriculum.js";

const client = sb();
const app = document.getElementById("app");
const nav = document.getElementById("nav");
const foot = document.getElementById("foot");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const params = new URLSearchParams(location.search);
const returnTo = params.get("return") && isTrusted(params.get("return")) ? params.get("return") : null;
let asRole = params.get("as") === "teacher" ? "teacher" : "student";
let session = null, profile = null, appData = [];
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
const mark = (size = 22) => h("img", { src: "icon.svg", alt: "", width: size, height: size, style: { "border-radius": Math.round(size * .28) + "px", display: "block", flex: "none" } });
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
    name: "Quoldek", mark: "Q", icon: "icons/quoldek.svg", c1: "#7c5cff", c2: "#2ba8ff", tag: "Classroom quiz games", url: "https://quoldek.web.app/",
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
      "Opened from The4Workspace, Kadam signs you in with this same account."],
  },
  akylduukodo: {
    name: "AkylduuKodo", mark: "</>", icon: "icons/akylduukodo.svg", c1: "#1cb0f6", c2: "#ff8fab", tag: "Learn programming step by step", url: "https://compactit.web.app/",
    points: ["Real JavaScript through short, clear lessons", "Guided practice, drills and a Code Lab", "A weekly study goal to keep you going"],
    how: ["Short lessons teach real JavaScript one idea at a time, with a book of 15 chapters.",
      "Guided practice and timed drills check every step. The Code Lab is a sandbox for your own code.",
      "A weekly goal keeps you going, and progress saves to your account.",
      "Opened from The4Workspace, AkylduuKodo signs you in with this same account."],
  },
};
const ORDER = ["learnkyrgyz", "quoldek", "kadam", "akylduukodo"];
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
  setTimeout(() => { location.href = handoffUrl(url, session); }, reduce ? 150 : 1250);
}
window.addEventListener("pageshow", (e) => { if (e.persisted) document.querySelectorAll(".portal").forEach(x => x.remove()); });

// ── data ──
async function loadMe() {
  const { data } = await client.auth.getSession();
  session = data.session;
  if (!session) { profile = null; appData = []; return; }
  const [p, d] = await Promise.all([
    client.from("profiles").select("full_name,role,xp,streak,progress").eq("id", session.user.id).maybeSingle(),
    client.from("app_data").select("app,key,data,updated_at"),
  ]);
  profile = p.data || { full_name: session.user.user_metadata?.full_name || session.user.email, role: "student", xp: 0, streak: 0 };
  appData = d.data || [];
}
client.auth.onAuthStateChange((ev, s) => { if (ev === "TOKEN_REFRESHED" || ev === "SIGNED_IN") session = s; });
async function signOut() { await client.auth.signOut({ scope: "local" }); session = null; profile = null; history.replaceState(null, "", location.pathname); toast("Signed out"); route(); top(); }

// ── header + footer ──
const initials = (name) => (name || "?").trim().split(/[\s@]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("") || "?";
function drawNav() {
  nav.replaceChildren();
  if (session) {
    const name = profile?.full_name || session.user.email;
    nav.append(h("a", { class: "link", href: "#apps" }, "Apps"), h("a", { class: "link", href: "#bridge" }, "Topics → Quoldek"), h("a", { class: "link", href: "#guides" }, "Guides"),
      h("span", { class: "me" }, h("span", { class: "avatar", title: session.user.email }, initials(name)),
        h("button", { class: "btn ghost sm", onClick: signOut }, "Sign out")));
  } else {
    nav.append(h("a", { class: "link", href: "#product", onClick: goLanding }, "Product"), h("a", { class: "link", href: "#apps", onClick: goLanding }, "Apps"),
      h("a", { class: "link", href: "#security", onClick: goLanding }, "Security"), h("a", { class: "link", href: "#faq", onClick: goLanding }, "FAQ"),
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
      h("div", {}, h("a", { class: "logo", href: "./", style: { display: "flex", margin: "0 0 4px" } }, mark(), h("span", { style: { color: "var(--ink)" } }, "The4Workspace")),
        h("p", { style: { "max-width": "32ch" } }, "One account for LearnKyrgyz, Quoldek, Kadam and AkylduuKodo. Sign in once, then every app opens signed in.")),
      h("div", {}, h("h4", {}, "Apps"), ORDER.map(id => h("a", { href: INFO[id].url, target: "_blank", rel: "noopener" }, INFO[id].name))),
      h("div", {}, h("h4", {}, "Product"), h("a", { href: "#product", onClick: goLanding }, "How it works"), h("a", { href: "#security", onClick: goLanding }, "Security"), h("a", { href: "#faq", onClick: goLanding }, "FAQ")),
      h("div", {}, h("h4", {}, "Account"), session ? [h("a", { href: "#apps" }, "Dashboard"), h("a", { href: "#", onClick: (e) => { e.preventDefault(); signOut(); } }, "Sign out")]
        : [h("a", { href: "#signin" }, "Sign in"), h("a", { href: "#signup" }, "Create account")])),
    h("div", { class: "foot-bottom" }, h("span", {}, `© ${new Date().getFullYear()} The4Workspace`), h("span", {}, "Made for learners and teachers in Kyrgyzstan")));
}

// ── the console preview: one account, four apps connecting one after another ──
function consoleCard({ animate = true, name = "Aigerim Asanova", email = "aigerim@gmail.com" } = {}) {
  const rows = ORDER.map(id => {
    const st = h("span", { class: "status" }, h("i", { class: "spin" }), h("span", { html: CHECK, style: { display: "contents" } }), h("span", { class: "txt" }, "Connecting…"));
    return { st, el: h("div", { class: "app-row" }, tile(id, "sm"), h("div", {}, h("b", {}, INFO[id].name), h("div", { class: "sub" }, INFO[id].tag)), st) };
  });
  const bar = h("i"), count = h("span", {}, "0 of 4 signed in");
  const el = h("div", { class: "console", "aria-hidden": "true" },
    h("div", { class: "chrome" }, h("i"), h("i"), h("i"), h("span", {}, "the4workspace.web.app")),
    h("div", { class: "console-body" },
      h("div", { class: "acct" }, h("span", { class: "avatar" }, initials(name)), h("div", {}, h("b", {}, name), h("span", {}, email)), h("span", { class: "badge" }, "One account")),
      h("div", { class: "apps-list" }, rows.map(r => r.el)),
      h("div", { class: "console-foot" }, h("span", { class: "meter" }, bar), count)));
  const set = (n) => { rows.forEach((r, i) => { r.st.classList.toggle("ok", i < n); r.st.querySelector(".txt").textContent = i < n ? "Signed in" : "Connecting…"; }); bar.style.width = n * 25 + "%"; count.textContent = `${n} of 4 signed in`; };
  if (!animate || reduce) { set(4); return el; }
  const cycle = () => { set(0); [1, 2, 3, 4].forEach(n => later(() => set(n), 700 + n * 650)); later(cycle, 7200); };
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
    h("div", { class: "orbit" }, ORDER.map((id, k) => h("div", { class: "sat", style: { "--a": k * 90 + "deg" } },
      h("div", { class: "face", style: { "--a": k * 90 + "deg", "--k": k, "--c1": INFO[id].c1 } }, tile(id), h("b", {}, INFO[id].name), h("i", { class: "ok" }, "✓"))))),
    h("div", { class: "core" }, h("img", { src: "icon.svg", alt: "" })),
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
        h("span", { class: "pill rise" }, h("b", {}, "New"), "Every app now signs you in automatically"),
        h("h1", { "aria-label": "One account for all four apps." }, words("One account for"), words("all four apps.", 3, "grad")),
        h("p", { class: "lead rise", style: { "--d": 2 } }, "Sign in once with Google or email. LearnKyrgyz, Quoldek, Kadam and AkylduuKodo open already signed in: no second password, no downloads."),
        h("div", { class: "cta-row rise", style: { "--d": 3 } },
          h("a", { class: "btn primary lg", href: "#signup" }, "Create free account", arrow()),
          h("a", { class: "btn ghost lg", href: "#signin" }, "Sign in")),
        h("div", { class: "trust rise", style: { "--d": 4 } }, h("span", { class: "tiles" }, ORDER.map(id => tile(id, "sm"))), h("span", {}, "LearnKyrgyz · Quoldek · Kadam · AkylduuKodo"))),
      stage()),

    h("div", { class: "strip reveal" }, [["4", "apps, one sign-in"], ["99", "Kyrgyz topics"], ["11", "live quiz games"], ["0", "downloads needed"]].map(([b, s]) => h("div", {}, h("b", {}, b), h("span", {}, s)))),

    h("section", { id: "product" },
      h("div", { class: "center" }, h("span", { class: "eyebrow reveal" }, "Single sign-on"), h("h2", { class: "h2 reveal" }, "One sign-in. Every app."),
        h("p", { class: "lead reveal" }, "Your The4Workspace account is the key. Open any of the four apps from here and it arrives signed in as you.")),
      h("div", { class: "doors reveal" },
        h("div", { class: "door-svg", html: '<svg viewBox="0 0 1000 380" preserveAspectRatio="none" aria-hidden="true">' + ORDER.map((id, k) => {
          const x = 125 + k * 250, d = `M 500 88 C 500 200, ${x} 170, ${x} 262`;
          return `<path class="dline" style="--c:${INFO[id].c1};--k:${k}" d="${d}"/>` + (reduce ? "" : `<circle class="dpulse" style="--c:${INFO[id].c1}" r="4"><animateMotion dur="2.6s" begin="${k * .4}s" repeatCount="indefinite" path="${d}"/></circle>`);
        }).join("") + "</svg>" }),
        h("div", { class: "key card" }, mark(34), h("div", {}, h("b", {}, "Your The4Workspace account"), h("span", {}, "Google or email"))),
        h("div", { class: "door-row" }, ORDER.map((id, k) => h("div", { class: "door card", style: { "--k": k, "--c1": INFO[id].c1 } }, tile(id, "lg"), h("b", {}, INFO[id].name), h("span", { class: "badge" }, "Opens signed in")))))),

    h("section", { id: "features", style: { "padding-top": 0 } },
      h("span", { class: "eyebrow reveal" }, "Why The4Workspace"), h("h2", { class: "h2 reveal" }, "Built to save you time"),
      h("p", { class: "lead reveal" }, "Everything a student or teacher needs across the four apps, behind one account."),
      h("div", { class: "features" },
        feature("key", "One account", "One email and password, or one Google account, for all four apps.", 0),
        feature("bolt", "Opens signed in", "Press an app and you're in. There's no second sign-in screen.", 1),
        feature("swap", "Topics become games", "Pick LearnKyrgyz topics and they become a Quoldek quiz in one tap.", 2),
        feature("sync", "Saved to your account", "Progress and quizzes follow you, not the device you used.", 3),
        feature("device", "Any device", "Phone, laptop or the classroom board. Everything runs in the browser.", 4),
        feature("globe", "Three languages", "English, Русский and Кыргызча across the apps.", 5))),

    h("section", { id: "apps", style: { "padding-top": 0 } },
      h("span", { class: "eyebrow reveal" }, "The apps"), h("h2", { class: "h2 reveal" }, "Four apps, one place"),
      h("div", { class: "apps" }, ORDER.map((id, k) => appCard(id, k)))),

    h("section", { id: "how", style: { "padding-top": 0 } },
      h("span", { class: "eyebrow reveal" }, "How it works"), h("h2", { class: "h2 reveal" }, "Three steps, then you never sign in twice"),
      h("div", { class: "steps" }, [
        ["Create your account", "Use Google or an email address, as a student or a teacher. Already on LearnKyrgyz? That's your account: just sign in."],
        ["Open any app", "Your dashboard lists all four. Press one and it opens signed in as you."],
        ["Keep going anywhere", "Your progress and quizzes are saved to your account, so they're there on every device."],
      ].map(([t, d], k) => h("div", { class: "step card reveal", style: { "--d": k } }, h("div", { class: "n" }, k + 1), h("h3", {}, t), h("p", {}, d))))),

    h("section", { id: "security", class: "security", style: { "padding-top": 0 } },
      h("div", {}, h("span", { class: "eyebrow reveal" }, "Security"), h("h2", { class: "h2 reveal" }, "Private by design"),
        h("p", { class: "lead reveal" }, "Moving between apps never exposes your password. Each app gets a short-lived sign-in and nothing more.")),
      h("div", { class: "checks card reveal" },
        checkItem("lock", "Your password stays here", "Apps receive a sign-in token, never your password."),
        checkItem("eye", "Never sent in the open", "The hand-off travels in the part of the link that browsers don't send to servers, and each app removes it at once."),
        checkItem("link", "Only our four apps", "Sign-ins are only ever handed to LearnKyrgyz, Quoldek, Kadam and AkylduuKodo."),
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
        q("Is it free?", "Yes. Creating an account and using all four apps is free."),
        q("I already have a LearnKyrgyz account.", "Then you already have a The4Workspace account. Sign in with the same email or Google account."),
        q("Do I still need separate accounts for Kadam or AkylduuKodo?", "No. Open them from The4Workspace and they sign you in with this account. If you used the same Google account there before, your old work is still there."),
        q("What happens when I sign out?", "Signing out here signs you out of this page. Each app keeps its own session until you sign out there too."),
        q("Does it work on phones?", "Yes. Everything runs in the browser, so there's nothing to install."))),

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
    h("div", { class: "app-head" }, tile(id), h("div", {}, h("h3", {}, a.name), h("div", { class: "tag" }, a.tag))),
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
      h("span", { class: "eyebrow rise" }, mark(), "The4Workspace account"),
      h("h1", { class: "rise", style: { "--d": 1 } }, signup ? "One account for every app." : "Welcome back."),
      h("p", { class: "lead rise", style: { "--d": 2 } }, "It's your LearnKyrgyz account too. Quoldek, Kadam and AkylduuKodo open with it already signed in."),
      h("div", { class: "rise", style: { "--d": 3 } }, consoleCard({ animate: true }))),
    h("div", { class: "auth card rise" },
      target ? h("div", { class: "return-banner" }, tile(target, "sm"), h("span", {}, `Sign in to continue to ${INFO[target].name}`)) : null,
      h("h2", {}, signup ? "Create your account" : "Sign in to The4Workspace"),
      h("p", { class: "sub" }, signup ? "Free, and it works in all four apps." : "Use the account you use in any of the four apps."),
      h("div", { class: "seg" },
        h("button", { type: "button", class: signup ? "" : "on", onClick: () => { location.hash = "signin"; } }, "Sign in"),
        h("button", { type: "button", class: signup ? "on" : "", onClick: () => { location.hash = "signup"; } }, "Create account")),
      err, google, or, form,
      h("p", { class: "legal" }, "One account for LearnKyrgyz, Quoldek, Kadam and AkylduuKodo."))));
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
  const kpi = (id, value, label, k) => { const b = h("b", {}, "0"); later(() => countUp(b, value), 200); return h("div", { class: "kpi card reveal", style: { "--d": k } }, h("span", {}, tile(id, "sm"), label), b); };
  const provider = session.user.app_metadata?.provider === "google" || (session.user.identities || []).some(i => i.provider === "google") ? "Google" : "Email";

  app.replaceChildren(h("div", { class: "dash" },
    h("div", { class: "hello rise" },
      h("div", {}, h("h1", {}, "Салам, ", first, "! ", h("span", { class: "wave-hand" }, "👋")), h("p", {}, "Your account works in all four apps. Pick one to open it signed in.")),
      h("button", { class: "btn primary lg", onClick: () => portal(urlFor("learnkyrgyz"), "learnkyrgyz") }, teacher ? "Open my classes" : "Continue learning", arrow())),
    h("div", { class: "kpis" },
      kpi("learnkyrgyz", profile.xp || 0, "XP", 0),
      kpi("learnkyrgyz", profile.streak || 0, "Day streak", 1),
      kpi("learnkyrgyz", topicsDone || words, topicsDone ? "Topics done" : "Words learned", 2),
      kpi("quoldek", quizzes, "Quoldek quizzes", 3)),

    h("div", { class: "sec-h", id: "apps" }, h("h2", {}, "Your apps"), h("p", {}, "4 of 4 connected")),
    h("div", { class: "launch" }, ORDER.map((id, k) => tilt(h("div", { class: "item card reveal", style: { "--c1": INFO[id].c1, "--d": k } },
      h("div", { class: "row" }, tile(id, "lg"), h("div", {}, h("b", {}, INFO[id].name), h("div", { class: "tag" }, INFO[id].tag))),
      h("span", { class: "badge", style: { "margin-left": 0, "justify-self": "start" } }, "Opens signed in"),
      h("button", { class: "btn ghost block", onClick: () => portal(urlFor(id), id) }, `Open ${INFO[id].name}`, arrow()))))),

    h("div", { class: "sec-h", id: "bridge" }, h("h2", {}, "LearnKyrgyz topics → Quoldek"), h("p", {}, "A topic becomes a game in one tap")),
    h("div", { class: "two" },
      picker(),
      h("div", { class: "panel card reveal" },
        h("div", { class: "row-between" }, h("b", {}, "Account"), h("span", { class: "badge" }, "Active")),
        h("div", { class: "kv" },
          h("div", {}, h("span", {}, "Name"), h("b", {}, profile.full_name || "—")),
          h("div", {}, h("span", {}, "Email"), h("b", {}, session.user.email)),
          h("div", {}, h("span", {}, "Role"), h("b", {}, teacher ? "Teacher" : "Student")),
          h("div", {}, h("span", {}, "Signs in with"), h("b", {}, provider)),
          h("div", {}, h("span", {}, "Apps"), h("b", {}, "All four connected"))),
        h("button", { class: "btn ghost block", onClick: signOut }, "Sign out"))),

    h("div", { class: "sec-h", id: "guides" }, h("h2", {}, "How the apps work"), h("p", {}, "Short guides")),
    h("div", { class: "guides" }, [...ORDER.map(id => h("details", { class: "card", open: id === "learnkyrgyz" ? true : null },
      h("summary", {}, tile(id, "sm"), INFO[id].name), h("ol", {}, INFO[id].how.map(x => h("li", {}, x))))),
      h("details", { class: "card" }, h("summary", {}, mark(), "How one account works"),
        h("ol", {}, h("li", {}, "Your The4Workspace account is your LearnKyrgyz account: the same email, password or Google."),
          h("li", {}, "When you open an app from here, your sign-in goes with you in the part of the link that browsers don't send to servers, and the app removes it straight away."),
          h("li", {}, "Kadam and AkylduuKodo swap it for their own sign-in, so you arrive signed in there too."),
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

// ── router ──
function route() {
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
// First visit in a tab: the four app logos fly in and become one account.
function intro() {
  let seen = false; try { seen = sessionStorage.getItem("oi4.intro") === "1"; sessionStorage.setItem("oi4.intro", "1"); } catch {}
  if (seen || reduce || returnTo) return Promise.resolve();
  const from = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  let done;
  const finish = () => { if (layer.classList.contains("out")) return; layer.classList.add("out"); setTimeout(() => layer.remove(), 750); done(); };
  const layer = h("div", { class: "intro", onClick: () => finish() },
    ORDER.map((id, k) => h("span", { class: "fly", style: { "--k": k, "--c1": INFO[id].c1, "--fx": from[k][0] * innerWidth * .6 + "px", "--fy": from[k][1] * innerHeight * .6 + "px", "--fr": (k % 2 ? 1 : -1) * 120 + "deg", "--tx": from[k][0] * 46 + "px", "--ty": from[k][1] * 46 + "px" } }, h("img", { src: INFO[id].icon, alt: "" }))),
    h("i", { class: "burst" }), h("i", { class: "burst b2" }),
    h("div", { class: "one" }, h("img", { src: "icon.svg", alt: "" }), h("b", {}, "The", h("span", {}, "4"), "Workspace")));
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
  // Arriving from a LearnKyrgyz app's The4Workspace button, already signed in there.
  try { await acceptHandoff(client); } catch {}
  starfield(); pointerFx();
  const shown = intro();
  try { await loadMe(); } catch (e) { console.warn(e); }
  await shown;
  route();
})();

// OneInFour hub: sign in once, open any app already signed in.
import { sb } from "../assets/js/config.js";
import { signInWithGoogle, signUpWithPassword, googleAvailable, GOOGLE_ICON } from "../assets/js/google.js";
import { handoffUrl, isTrusted } from "../assets/js/oneintwo-core.js";
import { UNITS, TOPICS } from "../assets/js/curriculum.js";

const client = sb();
const app = document.getElementById("app");
const nav = document.getElementById("nav");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const params = new URLSearchParams(location.search);
const returnTo = params.get("return") && isTrusted(params.get("return")) ? params.get("return") : null;
let asRole = params.get("as") === "teacher" ? "teacher" : "student";
let session = null, profile = null, appData = [];

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
const rings = (cls = "") => h("span", { class: "rings4 " + cls }, h("i"), h("i"), h("i"), h("i"));
// A headline whose letters rise in one after another.
const letters = (text, delay = 0) => h("span", { class: "letters", "aria-label": text }, [...text].map((ch, i) => h("span", { class: "ch", "aria-hidden": "true", style: { "--i": i + delay } }, ch === " " ? "\u00a0" : ch)));
function toast(msg, kind = "") { const t = h("div", { class: "toast " + kind }, msg); document.body.append(t); setTimeout(() => t.remove(), 3200); }

// ── the apps ──
const INFO = {
  learnkyrgyz: {
    name: "LearnKyrgyz", mark: "LK", c1: "#58cc02", c2: "#1cb0f6", tag: "Learn Kyrgyz like a game", url: "https://studentlrnkyrgyz.web.app/", teacherUrl: "https://teachlrnkyrgyz.web.app/", sso: true,
    points: ["99 topics from A1 to B1, with real Kyrgyz pronunciation", "Lessons, spaced review, unit tests and dialogues", "Teachers: classes, homework, sealed exams, gradebook"],
    how: ["Students follow a path of 99 topics. Each one teaches a few words, then practises them, then builds sentences, and every word is spoken with correct Kyrgyz pronunciation.",
      "Spaced review brings words back just before you'd forget them. Unit tests check what stuck, and dialogues train listening and speaking.",
      "Teachers create a class with a join code, set homework and timed exams (sealed, optionally full screen), and grades land in a 5-point gradebook.",
      "Live lessons use video calls and your PowerPoint slides. A4 worksheets and tests print with an answer key."],
    mini: () => h("div", { class: "mini lk" }, [[16, 70], [54, 40], [92, 70], [130, 40], [168, 70]].map(([x, y], i) => h("i", { class: "dot", style: { left: x + "px", top: y + "px", "--i": i } })), h("span", { class: "bubble" }, "Салам!")),
  },
  quoldek: {
    name: "Quoldek", mark: "Q", c1: "#7c5cff", c2: "#22d3ee", tag: "Classroom quiz games", url: "https://quoldek.web.app/", sso: true,
    points: ["Write or paste a quiz, or bring a LearnKyrgyz topic in one tap", "11 live games: Kart Race, Laser Tag, Tug of War…", "Homework links that mark themselves"],
    how: ["A teacher makes a quiz by writing it, pasting questions, or bringing LearnKyrgyz topics across in one tap.",
      "Host live: pick a game such as Kart Race, Laser Tag or Tug of War and put the PIN on the board.",
      "Everyone joins at playquoldek.web.app on their own phone. The fastest right answer scores the most.",
      "Or share it as homework (hwquoldek.web.app/ab2c9k), and it marks itself."],
    mini: () => h("div", { class: "mini q" }, h("span", { class: "pin" }, "PIN 482 913"), ["#ff5d8f", "#ffc857", "#58cc02"].map((c, i) => h("div", { class: "lane", style: { top: 34 + i * 26 + "px" } }, h("i", { class: "kart", style: { background: c, "animation-delay": `${i * -0.7}s`, "animation-duration": `${3.4 + i * 0.5}s` } })))),
  },
  kadam: {
    name: "Kadam", mark: "K", c1: "#0f9d58", c2: "#34d399", tag: "Everything for your university application", url: "https://kadam.web.app/", sso: false,
    points: ["Notes, Sheets, Slides and Canvas, like a workspace suite", "Tasks, UniSave, an AI study helper and Languages", "English, Русский and Кыргызча; works offline"],
    how: ["Eight tools for getting into university, all behind the nine-dot launcher: Notes, Sheets, Slides, Canvas, Tasks, UniSave, AI and Languages.",
      "Templates for university comparison tables, essay outlines, scholarship and deadline trackers.",
      "Everything syncs privately to your Kadam account, and you choose who can open it.",
      "Kadam has its own sign-in. Use the same Google account you use here."],
    mini: () => h("div", { class: "mini k" }, h("div", { class: "doc" }, [0, 1, 2, 3, 4].map(i => h("i", { style: { "--i": i, width: [90, 70, 95, 60, 80][i] + "%" } }))), h("div", { class: "grid" }, Array.from({ length: 16 }, (_, i) => h("b", { style: { "--i": i } })))),
  },
  akylduukodo: {
    name: "AkylduuKodo", mark: "</>", c1: "#1cb0f6", c2: "#7c5cff", tag: "Learn programming, one clear step at a time", url: "https://akylduukodo.web.app/", sso: false,
    points: ["Real JavaScript through short lessons", "Guided practice, drills and a Code Lab", "A weekly study goal to keep you going"],
    how: ["Short lessons teach real JavaScript one idea at a time, with a book of 15 chapters.",
      "Guided practice and timed drills check every step. The Code Lab is a sandbox for your own code.",
      "A weekly goal keeps you going, and progress saves to your account.",
      "AkylduuKodo has its own sign-in. Use the same Google account you use here."],
    mini: () => h("div", { class: "mini a" }, h("pre", { html: '<span class="kw">function</span> <span class="fn">salam</span>(name) {\n  <span class="kw">return</span> <span class="st">"Салам, "</span> + name;\n}\n<span class="fn">salam</span>(<span class="st">"Айжан"</span>)<span class="caret"></span>' })),
  },
};
const ORDER = ["learnkyrgyz", "quoldek", "kadam", "akylduukodo"];
const tile = (id, extra = "") => { const a = INFO[id]; return h("span", { class: "tile " + extra, style: { "--c1": a.c1, "--c2": a.c2 } }, a.mark); };
const appFor = (url) => ORDER.find(id => { try { const u = new URL(url); return [INFO[id].url, INFO[id].teacherUrl].filter(Boolean).some(x => new URL(x).host === u.host) || (id === "quoldek" && /quoldek\.web\.app$/.test(u.host)); } catch { return false; } });

// ── motion helpers ──
function reveal(root) {
  const els = root.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
  els.forEach(e => io.observe(e));
}
function tilt(card) {
  if (reduce) return card;
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.transform = `perspective(900px) rotateY(${(x - .5) * 10}deg) rotateX(${(.5 - y) * 10}deg) translateY(-4px)`;
    card.style.setProperty("--mx", x * 100 + "%"); card.style.setProperty("--my", y * 100 + "%");
  });
  card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  return card;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest(".btn"); if (!b || reduce) return;
  const r = b.getBoundingClientRect(); const s = Math.max(r.width, r.height);
  const rip = h("span", { class: "ripple", style: { width: s + "px", height: s + "px", left: e.clientX - r.left - s / 2 + "px", top: e.clientY - r.top - s / 2 + "px" } });
  b.append(rip); setTimeout(() => rip.remove(), 650);
});
function countUp(el, to) {
  if (reduce || !to) { el.textContent = to.toLocaleString(); return; }
  const t0 = performance.now(), dur = 1100;
  const step = (t) => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString(); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function confetti(x = innerWidth / 2, y = innerHeight / 3) {
  if (reduce) return;
  const colors = ["#7c5cff", "#58cc02", "#22d3ee", "#ffc857", "#ff5d8f"];
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 260;
    const c = h("i", { class: "confetti", style: { left: x + "px", top: y + "px", background: colors[i % 5], "--dx": Math.cos(a) * d + "px", "--dy": Math.sin(a) * d + 180 + "px", "--r": Math.random() * 720 + "deg" } });
    document.body.append(c); setTimeout(() => c.remove(), 1500);
  }
}
// Leave for an app: a disc in the app's colour grows from where you clicked.
function portal(url, id, ev) {
  const a = INFO[id] || INFO.quoldek;
  const x = ev?.clientX ?? innerWidth / 2, y = ev?.clientY ?? innerHeight / 2;
  const p = h("div", { class: "portal", style: { "--c1": a.c1, "--x": x + "px", "--y": y + "px" } }, h("i", { class: "disc" }), h("div", { class: "msg" }, h("span", { class: "tile", style: { "--c1": "transparent", "--c2": "transparent" } }, a.mark), h("b", {}, `Opening ${a.name}…`), session && a.sso ? h("span", {}, "You're signed in with your OneInFour account") : null));
  document.body.append(p);
  setTimeout(() => { location.href = a.sso ? handoffUrl(url, session) : url; }, reduce ? 150 : 1000);
}

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
}
client.auth.onAuthStateChange((ev, s) => { if (ev === "TOKEN_REFRESHED" || ev === "SIGNED_IN") session = s; });

// ── header ──
function drawNav() {
  nav.replaceChildren();
  if (session) {
    const name = (profile?.full_name || session.user.email || "?").trim();
    nav.append(h("a", { href: "#apps", class: "hide-sm" }, "Apps"), h("a", { href: "#together", class: "hide-sm" }, "LearnKyrgyz × Quoldek"),
      h("span", { class: "me" }, h("span", { class: "avatar", title: session.user.email }, name[0].toUpperCase()),
        h("button", { class: "btn ghost sm", onClick: async () => { await client.auth.signOut({ scope: "local" }); session = null; route(); } }, "Sign out")));
  } else {
    nav.append(h("a", { href: "#how", class: "hide-sm", onClick: goLanding }, "How it works"), h("a", { href: "#apps", class: "hide-sm", onClick: goLanding }, "Apps"),
      h("a", { class: "btn ghost sm hide-xs", href: "#signin" }, "Sign in"), h("a", { class: "btn sm", href: "#signup" }, "Create account"));
  }
}
function goLanding() { if (/^#sign/.test(location.hash)) { history.replaceState(null, "", location.pathname + location.search); route(); } }

// ── landing ──
function landing() {
  const words = ORDER.map(id => h("span", { style: { "--c1": INFO[id].c1, "--c2": INFO[id].c2 } }, INFO[id].name));
  const rot = h("span", { class: "rotator" }, words);
  let i = 0; words[0].classList.add("on");
  if (!reduce) setInterval(() => { words[i].classList.replace("on", "out"); const prev = words[i]; setTimeout(() => prev.classList.remove("out"), 650); i = (i + 1) % words.length; words[i].classList.add("on"); }, 2200);

  const orbit = h("div", { class: "orbit reveal" }, h("i", { class: "ring" }), h("i", { class: "ring r2" }),
    h("div", { class: "spin" },
      ORDER.map((id, k) => h("i", { class: "beam", style: { "--a": k * 90 + "deg", "--c1": INFO[id].c1, "--k": k } })),
      ORDER.map((id, k) => h("div", { class: "node", style: { "--a": k * 90 + "deg" } }, h("div", { class: "tile", style: { "--c1": INFO[id].c1, "--c2": INFO[id].c2 } }, INFO[id].mark, h("small", {}, INFO[id].name))))),
    h("div", { class: "you" }, h("div", {}, rings(), h("div", {}, "One account"))),
    [[12, 18], [80, 10], [90, 70], [8, 78], [50, 96], [60, 4]].map(([x, y], k) => h("i", { class: "spark", style: { left: x + "%", top: y + "%", "animation-delay": k * .5 + "s" } })));

  app.replaceChildren(
    h("section", { class: "hero" },
      h("div", {},
        h("span", { class: "kicker reveal" }, rings("sm"), "OneInFour"),
        h("h1", { class: "hero-h" }, letters("One account."), h("br"), h("span", { class: "grad" }, letters("Four apps.", 12)), h("span", { class: "open-line" }, "Open ", rot)),
        h("p", { class: "lead reveal", style: { "--d": 2 } }, "Make one account here, with Google or email. It opens LearnKyrgyz, Quoldek, Kadam and AkylduuKodo from one place, and a LearnKyrgyz topic becomes a Quoldek game in one tap."),
        h("div", { class: "hero-actions reveal", style: { "--d": 3 } }, h("a", { class: "btn lg", href: "#signup" }, "Create your account"), h("a", { class: "btn ghost lg", href: "#signin" }, "Sign in")),
        h("div", { class: "trust reveal", style: { "--d": 4 } }, h("span", {}, "Google or email"), h("span", {}, "Free"), h("span", {}, "Nothing to download"))),
      orbit),
    doors(),
    h("section", { id: "how" },
      h("span", { class: "kicker reveal" }, "How it works"),
      h("h2", { class: "h2 reveal" }, "Three steps, then you never log in twice"),
      h("div", { class: "steps" }, [
        ["Make one account", "With Google or an email address, as a student or a teacher. It's your LearnKyrgyz account, so if you already have one, just sign in."],
        ["Press any app", "LearnKyrgyz and Quoldek open already signed in. Kadam and AkylduuKodo open from the same dashboard."],
        ["Move topics in one tap", "Pick LearnKyrgyz topics and press Play in Quoldek. The quiz is made there, ready to host. There are no files and no copying."],
      ].map(([t, d], k) => h("div", { class: "step glass reveal", style: { "--d": k } }, h("div", { class: "num" }, k + 1), h("h3", {}, t), h("p", { class: "muted", style: { margin: 0 } }, d))))),
    h("section", { id: "apps" },
      h("span", { class: "kicker reveal" }, "The apps"),
      h("h2", { class: "h2 reveal" }, "What each app does"),
      h("div", { class: "apps" }, ORDER.map((id, k) => appCard(id, k, false)))),
    together(),
    h("section", { class: "reveal", style: { "text-align": "center" } },
      h("h2", { class: "h2" }, "Ready? Баштайлы!"),
      h("p", { class: "lead", style: { margin: "0 auto 22px" } }, "One account, and every app is a tap away."),
      h("a", { class: "btn lg green", href: "#signup" }, "Create your account")));
  reveal(app);
  fitFlow();
  drawDoors();
}

// One account, four doors: lines draw from the account to each app as it scrolls into view.
function doors() {
  const status = { learnkyrgyz: "Opens signed in", quoldek: "Opens signed in", kadam: "Same Google account", akylduukodo: "Same Google account" };
  return h("section", { id: "one", class: "doors-sec" },
    h("span", { class: "kicker reveal" }, "One account · four apps"),
    h("h2", { class: "h2 reveal" }, "One key opens every door"),
    h("div", { class: "doors reveal" },
      h("div", { class: "door-svg", html: '<svg viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">' + ORDER.map((id, k) => {
        const x = 125 + k * 250;
        return `<path class="dline" style="--c:${INFO[id].c1};--k:${k}" d="M 500 118 C 500 230, ${x} 190, ${x} 300"/><circle class="dpulse" style="--c:${INFO[id].c1};--k:${k}" r="7"><animateMotion dur="2.4s" begin="${k * 0.35}s" repeatCount="indefinite" path="M 500 118 C 500 230, ${x} 190, ${x} 300"/></circle>`;
      }).join("") + "</svg>" }),
      h("div", { class: "key-card glass" }, rings(), h("div", {}, h("b", {}, "Your OneInFour account"), h("span", { class: "small muted" }, "Google or email · one password"))),
      h("div", { class: "door-row" }, ORDER.map((id, k) => h("div", { class: "door glass", style: { "--c1": INFO[id].c1, "--k": k } }, tile(id), h("b", {}, INFO[id].name), h("span", { class: "small muted" }, status[id]))))));
}
function drawDoors() {
  const el = document.querySelector(".doors"); if (!el) return;
  if (reduce || !("IntersectionObserver" in window)) { el.classList.add("drawn"); return; }
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { el.classList.add("drawn"); io.disconnect(); } }), { threshold: .35 });
  io.observe(el);
}
// The cards fly along the same arc as the dashed line, whatever the width.
function fitFlow() {
  const f = document.querySelector(".flow"); if (!f) return;
  const set = () => { const w = f.clientWidth - 192, hgt = f.clientHeight; f.style.setProperty("--path", `path("M 0 0 C ${w * .23} ${-hgt * .52}, ${w * .77} ${-hgt * .52}, ${w} 0")`); };
  set(); addEventListener("resize", set);
}

function appCard(id, k, live) {
  const a = INFO[id];
  const openBtn = h("button", { class: "btn sm", style: { "--c": a.c1 }, onClick: (e) => portal(profile?.role === "teacher" && a.teacherUrl ? a.teacherUrl : a.url, id, e) }, `Open ${a.name} →`);
  return tilt(h("div", { class: "app reveal", style: { "--c1": a.c1, "--c2": a.c2, "--d": k } },
    h("i", { class: "glow" }), a.mini(),
    h("div", { class: "app-head" }, tile(id), h("div", {}, h("h3", {}, a.name), h("div", { class: "tag" }, a.tag))),
    h("ul", {}, a.points.map(p => h("li", {}, p))),
    h("div", { class: "row" }, live ? openBtn : h("a", { class: "btn sm ghost", href: a.url, target: "_blank", rel: "noopener" }, "Visit"),
      h("span", { class: "pill" + (a.sso ? " ok" : "") }, a.sso ? "Same account" : "Own sign-in"))));
}

function together() {
  return h("section", { id: "together" },
    h("div", { class: "bridge glass reveal" },
      h("div", {},
        h("span", { class: "kicker" }, "LearnKyrgyz × Quoldek"),
        h("h2", { class: "h2" }, "A topic becomes a game in one tap"),
        h("ol", { class: "muted", style: { "padding-left": "20px" } },
          h("li", {}, "Pick topics in LearnKyrgyz or on your OneInFour dashboard, such as Greetings or Family."),
          h("li", {}, "Press ", h("b", {}, "Play in Quoldek"), ". The questions fly across: four options each, a timer, and the Kyrgyz word in every explanation."),
          h("li", {}, "Quoldek opens with the quiz made and you already signed in. Pick a game, put the PIN on the board, and the class plays on their phones."))),
      h("div", { class: "flow" },
        h("div", { class: "end l" }, tile("learnkyrgyz"), h("span", { class: "lbl" }, "LearnKyrgyz")),
        h("div", { html: '<svg viewBox="0 0 260 230" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="arcg" x1="0" x2="1"><stop offset="0" stop-color="#58cc02"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs><path class="arc" d="M 0 115 C 60 -5, 200 -5, 260 115"/></svg>' }),
        ["Greetings", "Салам!", "Family"].map((t, i) => h("span", { class: "fcard", style: { "--i": i } }, t)),
        h("div", { class: "end r" }, tile("quoldek"), h("span", { class: "lbl" }, "Quoldek")))));
}

// ── sign in / sign up ──
function authView(mode) {
  const signup = mode === "signup";
  const err = h("div", { class: "err hidden" });
  const showErr = (e) => { err.textContent = (e && (e.message || e.error_description)) || String(e); err.classList.remove("hidden"); };
  const name = h("input", { class: "input", placeholder: "Айжан Асанова", autocomplete: "name", maxlength: 80 });
  const email = h("input", { class: "input", type: "email", placeholder: "you@example.com", autocomplete: "email", required: true });
  const pw = h("input", { class: "input", type: "password", placeholder: signup ? "At least 6 characters" : "Your password", autocomplete: signup ? "new-password" : "current-password", minlength: 6, required: true });
  const roleSeg = h("div", { class: "seg" }, ["student", "teacher"].map(r => h("button", { type: "button", class: asRole === r ? "on" : "", onClick: (e) => { asRole = r; [...roleSeg.children].forEach(b => b.classList.toggle("on", b === e.currentTarget)); } }, r === "student" ? "🎒 Student" : "🍎 Teacher")));
  const submit = h("button", { class: "btn block lg", type: "submit" }, signup ? "Create my account" : "Sign in");
  const google = h("button", { type: "button", class: "btn block google hidden", html: GOOGLE_ICON + "<span>Continue with Google</span>", onClick: async () => {
    google.disabled = true;
    try { await signInWithGoogle({ role: asRole, learnFrom: "en" }); await done(); }
    catch (e) { if (!/popup-closed|cancelled-popup/i.test(String(e && (e.code || e.message)))) showErr(e); }
    finally { google.disabled = false; }
  } });
  const or = h("div", { class: "or hidden" }, "or with email");
  googleAvailable().then(ok => { if (ok) { google.classList.remove("hidden"); or.classList.remove("hidden"); } });

  async function done() {
    await loadMe(); confetti();
    toast(signup ? "Account created. Welcome!" : "Signed in", "good");
    history.replaceState(null, "", location.pathname + location.search);
    setTimeout(route, returnTo ? 500 : 300);
  }
  const form = h("form", { onSubmit: async (e) => {
    e.preventDefault(); err.classList.add("hidden"); submit.disabled = true;
    try {
      if (signup) await signUpWithPassword({ email: email.value.trim(), password: pw.value, fullName: name.value.trim() || email.value.split("@")[0], role: asRole, learnFrom: "en" });
      else { const { error } = await client.auth.signInWithPassword({ email: email.value.trim(), password: pw.value }); if (error) throw error; }
      await done();
    } catch (ex) { showErr(ex); submit.disabled = false; }
  } },
    signup ? h("label", { class: "field" }, h("span", {}, "Your name"), name) : null,
    h("label", { class: "field" }, h("span", {}, "Email"), email),
    h("label", { class: "field" }, h("span", {}, "Password"), pw),
    signup ? h("div", { class: "field" }, h("span", {}, "I am a…"), roleSeg) : null,
    submit);

  const target = returnTo && appFor(returnTo);
  app.replaceChildren(h("div", { class: "auth-wrap" },
    h("div", { class: "auth-art" },
      h("span", { class: "kicker" }, rings("sm"), "OneInFour account"),
      h("h1", { class: "h2", style: { "font-size": "clamp(34px,4.6vw,56px)" } }, signup ? "One account for every app." : "Welcome back."),
      h("p", { class: "lead" }, "It's your LearnKyrgyz account too, and Quoldek opens with it already signed in."),
      h("div", { class: "apps", style: { "grid-template-columns": "repeat(4, 64px)", gap: "12px" } }, ORDER.map((id, k) => h("span", { class: "reveal", style: { "--d": k } }, tile(id))))),
    h("div", { class: "auth glass" },
      target ? h("div", { class: "return-banner", style: { "--c1": INFO[target].c1 } }, tile(target), h("span", {}, `Sign in to continue to ${INFO[target].name}`)) : null,
      h("div", { class: "tabs" + (signup ? " two" : "") }, h("i", { class: "thumb" }),
        h("button", { type: "button", class: signup ? "" : "on", onClick: () => { location.hash = "signin"; } }, "Sign in"),
        h("button", { type: "button", class: signup ? "on" : "", onClick: () => { location.hash = "signup"; } }, "Create account")),
      err, google, or, form,
      h("p", { class: "small faint", style: { margin: "14px 0 0", "text-align": "center" } }, "By continuing you use one account across LearnKyrgyz and Quoldek."))));
  reveal(app);
  setTimeout(() => (signup ? name : email).focus(), 60);
}

// ── dashboard ──
function dashboard() {
  const first = (profile.full_name || session.user.email).split(/[\s@]/)[0];
  const pr = profile.progress || {};
  const topicsDone = Object.values(pr.topics || {}).filter(t => (t.level || 0) > 0).length;
  const words = Object.keys(pr.words || {}).length;
  const qz = appData.find(r => r.app === "quoldek" && r.key === "quizzes");
  const quizzes = qz ? Object.keys(qz.data || {}).length : 0;
  const stat = (id, value, label) => { const b = h("b", {}, "0"); setTimeout(() => countUp(b, value), 250); return h("div", { class: "stat glass reveal" }, tile(id), h("div", {}, b, h("span", { class: "lbl" }, label))); };

  app.replaceChildren(h("div", { class: "dash" },
    h("div", { class: "hello reveal" },
      h("div", {}, h("h1", {}, "Салам, ", first, "! ", h("span", { class: "wave" }, "👋")),
        h("p", { class: "muted", style: { margin: "6px 0 0" } }, `One account · ${session.user.email} · ${profile.role === "teacher" ? "Teacher" : "Student"}`)),
      h("button", { class: "btn green lg", onClick: (e) => portal(profile.role === "teacher" ? INFO.learnkyrgyz.teacherUrl : INFO.learnkyrgyz.url, "learnkyrgyz", e) }, profile.role === "teacher" ? "Open my classes →" : "Continue learning →")),
    h("div", { class: "stats" },
      stat("learnkyrgyz", profile.xp || 0, "LearnKyrgyz XP"),
      stat("learnkyrgyz", profile.streak || 0, "day streak"),
      stat("learnkyrgyz", topicsDone || words, topicsDone ? "topics done" : "words learned"),
      stat("quoldek", quizzes, "Quoldek quizzes")),
    h("h2", { id: "apps" }, "Your apps"),
    h("p", { class: "muted", style: { margin: 0 } }, "LearnKyrgyz and Quoldek open already signed in. Kadam and AkylduuKodo have their own sign-in, so use the same Google account there."),
    h("div", { class: "apps" }, ORDER.map((id, k) => appCard(id, k, true))),
    h("h2", { id: "together" }, "LearnKyrgyz → Quoldek"),
    picker(),
    h("h2", {}, "How they work"),
    h("div", { class: "explain" }, [...ORDER.map(id => h("details", { class: "how glass reveal" + (id === "learnkyrgyz" ? "" : ""), open: id === "learnkyrgyz" ? true : null },
      h("summary", {}, tile(id), `How ${INFO[id].name} works`), h("ol", {}, INFO[id].how.map(x => h("li", {}, x))))),
      h("details", { class: "how glass reveal" }, h("summary", {}, h("span", { class: "tile", style: { "--c1": "#7c5cff", "--c2": "#58cc02" } }, "1∞"), "How one account works"),
        h("ol", {}, h("li", {}, "Your OneInFour account is your LearnKyrgyz account: same email, same password or Google."),
          h("li", {}, "When you open an app from here, your sign-in travels with you inside the link. It's never sent to a server, and the app removes it from the address bar."),
          h("li", {}, "Quoldek keeps your quizzes in your account, so they follow you to any device."),
          h("li", {}, "Signing out here signs out of this page only; each app keeps its own session.")))])));
  reveal(app);
}

function picker() {
  const sel = new Set(); let lang = "en";
  const units = h("div", { class: "units" });
  const sum = h("span", { class: "muted small" }, "Pick up to 6 topics");
  const draw = () => {
    units.replaceChildren(...UNITS.map((u, i) => h("div", { class: "unit" }, h("div", { class: "unit-h" }, `Unit ${i + 1} · ${u.level} · ${u.en}`),
      u.topics.map(id => h("button", { class: "chip" + (sel.has(id) ? " on" : ""), onClick: () => { sel.has(id) ? sel.delete(id) : sel.size < 6 && sel.add(id); draw(); } }, TOPICS[id].en)))));
    sum.textContent = sel.size ? `${sel.size} topic${sel.size > 1 ? "s" : ""}: ${[...sel].map(id => TOPICS[id].en).join(", ")}` : "Pick up to 6 topics";
  };
  draw();
  const langSeg = h("div", { class: "seg", style: { "max-width": "260px" } }, [["en", "English"], ["ru", "Русский"]].map(([v, l]) => h("button", { type: "button", class: v === lang ? "on" : "", onClick: (e) => { lang = v; [...langSeg.children].forEach(b => b.classList.toggle("on", b === e.currentTarget)); } }, l)));
  const go = (mode) => (e) => { if (!sel.size) return toast("Pick at least one topic", "bad"); portal(`https://quoldek.web.app/?learnkyrgyz=${[...sel].join(",")}&lang=${lang}&go=${mode}`, "quoldek", e); };
  return h("div", { class: "picker glass reveal" },
    h("div", { class: "row", style: { display: "flex", gap: "14px", "align-items": "center", "flex-wrap": "wrap" } }, tile("learnkyrgyz", "sm"), h("span", { style: { "font-size": "22px" } }, "→"), tile("quoldek", "sm"),
      h("p", { class: "muted", style: { margin: 0, flex: "1 1 280px" } }, "Choose topics and they become a Quoldek quiz, made for you and ready to host, already signed in.")),
    units, h("div", { style: { display: "flex", gap: "12px", "align-items": "center", "flex-wrap": "wrap", "justify-content": "space-between" } },
      h("div", { style: { display: "grid", gap: "8px" } }, h("span", { class: "small faint" }, "Questions in"), langSeg), sum,
      h("div", { style: { display: "flex", gap: "8px", "flex-wrap": "wrap" } },
        h("button", { class: "btn ghost", onClick: go("take") }, "Practise alone"),
        h("button", { class: "btn", onClick: go("host") }, "Play in Quoldek →"))));
}

// ── router ──
async function route() {
  drawNav();
  const hash = location.hash.replace("#", "");
  if (session && returnTo) { // came from an app to sign in: send them straight back
    const id = appFor(returnTo) || "learnkyrgyz";
    app.replaceChildren(h("div", { class: "boot" }, h("div", { style: { "text-align": "center" } }, rings("big"), h("p", { class: "muted" }, `Signing you in to ${INFO[id].name}…`))));
    return setTimeout(() => portal(returnTo, id), 350);
  }
  if (!session && (hash === "signin" || hash === "signup" || returnTo)) return authView(hash === "signup" ? "signup" : "signin");
  if (session) return dashboard();
  landing();
  if (hash && document.getElementById(hash)) setTimeout(() => document.getElementById(hash).scrollIntoView(), 50);
}
window.addEventListener("hashchange", () => { const h2 = location.hash.replace("#", ""); if (h2 === "signin" || h2 === "signup" || !session) route(); });

// ── ambient motion: starfield that leans toward the pointer, spotlight, magnetic buttons ──
function starfield() {
  if (reduce) return;
  const cv = document.createElement("canvas"); cv.className = "stars";
  document.querySelector(".bg").append(cv);
  const g = cv.getContext("2d"); let W, H, dpr, pts = [], mx = -1e4, my = -1e4;
  const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    const n = Math.round(Math.min(90, innerWidth * innerHeight / 16000)); pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25 * dpr, vy: (Math.random() - .5) * .25 * dpr, c: ["#7c5cff", "#58cc02", "#22d3ee", "#ffc857"][Math.floor(Math.random() * 4)] })); };
  size(); addEventListener("resize", size);
  addEventListener("pointermove", (e) => { mx = e.clientX * dpr; my = e.clientY * dpr; }, { passive: true });
  const link = 130 * (devicePixelRatio || 1);
  const tick = () => {
    if (!document.hidden) {
      g.clearRect(0, 0, W, H);
      for (const p of pts) {
        const dx = mx - p.x, dy = my - p.y, d = Math.hypot(dx, dy);
        if (d < 220 * dpr) { p.vx += dx / d * .012 * dpr; p.vy += dy / d * .012 * dpr; }
        p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        g.fillStyle = p.c; g.globalAlpha = .8; g.beginPath(); g.arc(p.x, p.y, 1.6 * dpr, 0, 7); g.fill();
      }
      g.lineWidth = dpr * .8;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) { g.globalAlpha = (1 - d / link) * .35; g.strokeStyle = a.c; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function pointerFx() {
  if (reduce || !matchMedia("(pointer: fine)").matches) return;
  const spot = h("i", { class: "spot" }); document.body.append(spot);
  addEventListener("pointermove", (e) => { spot.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`; }, { passive: true });
  document.addEventListener("pointermove", (e) => {
    const b = e.target.closest(".btn.lg, .btn.magnet"); document.querySelectorAll(".btn.pulled").forEach(x => { if (x !== b) { x.classList.remove("pulled"); x.style.translate = ""; } });
    if (!b) return;
    const r = b.getBoundingClientRect(); b.classList.add("pulled");
    b.style.translate = `${(e.clientX - r.left - r.width / 2) * .18}px ${(e.clientY - r.top - r.height / 2) * .28}px`;
  }, { passive: true });
}
// First visit in a tab: four app tiles fly together into one glowing account.
function intro() {
  let seen = false; try { seen = sessionStorage.getItem("oi4.intro") === "1"; sessionStorage.setItem("oi4.intro", "1"); } catch {}
  if (seen || reduce) return Promise.resolve();
  const layer = h("div", { class: "intro", onClick: () => finish() },
    ORDER.map((id, k) => h("span", { class: "tile it", style: { "--c1": INFO[id].c1, "--c2": INFO[id].c2, "--k": k } }, INFO[id].mark)),
    h("div", { class: "intro-core" }, rings("big"), h("b", {}, "One", h("span", {}, "In"), "Four")));
  document.body.append(layer);
  let done;
  const finish = () => { if (layer.classList.contains("out")) return; layer.classList.add("out"); setTimeout(() => layer.remove(), 700); done(); };
  return new Promise((res) => { done = res; setTimeout(finish, 2100); });
}

(async () => {
  starfield(); pointerFx();
  const shown = intro();
  try { await loadMe(); } catch (e) { console.warn(e); }
  await shown;
  route();
})();

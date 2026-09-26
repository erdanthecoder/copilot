// Presentations: slide rendering, a teacher presenter that students follow
// live (over a private Realtime channel), and live quiz slides.
import { h, icon, toast, sound } from "./ui.js";
import { translit } from "./engine.js";
import { mountPptxSlide } from "./pptx.js";

export const SLIDE_TYPES = {
  title: { label: "Title", icon: "star" },
  text: { label: "Text & bullets", icon: "list" },
  word: { label: "Word card", icon: "book" },
  image: { label: "Image", icon: "image" },
  quiz: { label: "Quiz question", icon: "question" },
};
// Slides imported from PowerPoint (not added by hand).
export const IMPORTED_TYPES = { pptx: { label: "PowerPoint slide", icon: "slides" } };
export function blankSlide(type) {
  return {
    title: { type, title: "Сабакка кош келиңиздер!", subtitle: "Welcome to the lesson" },
    text: { type, title: "New slide", bullets: ["First point", "Second point"] },
    word: { type, ky: "Салам", tr: "Hello", note: "" },
    image: { type, title: "", url: "", caption: "" },
    quiz: { type, question: "What does «Рахмат» mean?", options: ["Thank you", "Hello", "Goodbye", "Please"], answer: 0 },
  }[type];
}

// opts: { onPick(i), picked, tally: [counts], reveal }
export function renderSlide(s, opts = {}) {
  const stage = h("div", { class: "slide-stage" });
  let inner;
  if (s && s.type === "pptx") { mountPptxSlide(stage, s.url, s.index); return stage; }
  if (!s) inner = h("div", { class: "slide" });
  else if (s.type === "title") inner = h("div", { class: "slide title-slide" }, h("h1", {}, s.title || ""), s.subtitle ? h("p", {}, s.subtitle) : null);
  else if (s.type === "text") inner = h("div", { class: "slide" }, h("h2", {}, s.title || ""), h("ul", {}, (s.bullets || []).filter(Boolean).map(b => h("li", {}, b))));
  else if (s.type === "word") inner = h("div", { class: "slide" }, h("div", { class: "big-ky" }, s.ky || ""), h("div", { class: "tl" }, translit(s.ky || "")), h("div", { class: "tr" }, s.tr || ""), s.note ? h("p", { class: "center", style: { color: "#777" } }, s.note) : null);
  else if (s.type === "image") inner = h("div", { class: "slide", style: { alignItems: "center" } }, s.title ? h("h2", {}, s.title) : null, s.url ? h("img", { src: s.url, alt: s.caption || s.title || "", referrerpolicy: "no-referrer" }) : h("p", { style: { color: "#999" } }, "Add an image URL"), s.caption ? h("p", {}, s.caption) : null);
  else if (s.type === "quiz") {
    const total = (opts.tally || []).reduce((a, b) => a + b, 0);
    inner = h("div", { class: "slide" }, h("h2", {}, s.question || ""), h("div", { class: "qopts" }, (s.options || []).map((o, i) => {
      const cls = "qopt" + (opts.reveal && i === s.answer ? " correct" : "") + (opts.picked === i ? " picked" : "");
      return h("button", { class: cls, onClick: () => opts.onPick && opts.onPick(i) }, String.fromCharCode(65 + i) + ". " + o, opts.tally ? h("span", { class: "n" }, total ? `${opts.tally[i] || 0}` : "") : null);
    })));
  }
  stage.append(inner);
  return stage;
}

// Teacher: full-screen presenter; broadcasts slide changes to the class.
export async function presentLive({ client, pres, classroomId, me, onClose }) {
  let idx = 0; const tallies = {}; const reveals = {}; const voted = {};
  const topic = `class:${classroomId}:present`;
  let ch = null;
  if (classroomId) {
    await client.realtime.setAuth();
    ch = client.channel(topic, { config: { private: true, broadcast: { self: false } } });
    ch.on("broadcast", { event: "hello" }, () => pushState());
    ch.on("broadcast", { event: "answer" }, ({ payload }) => {
      const key = payload.index; voted[key] = voted[key] || {};
      if (voted[key][payload.from] != null) tallies[key][voted[key][payload.from]]--;
      tallies[key] = tallies[key] || []; tallies[key][payload.option] = (tallies[key][payload.option] || 0) + 1;
      voted[key][payload.from] = payload.option; sound.tap(); draw();
    });
    await new Promise(res => ch.subscribe(s => { if (s === "SUBSCRIBED") res(); if (s === "CHANNEL_ERROR") { toast("Live sync unavailable — presenting locally", "bad"); res(); } }));
  }
  const stageWrap = h("div", { style: { width: "100%", display: "flex", justifyContent: "center" } });
  const counter = h("span");
  const revealBtn = h("button", { class: "btn gold sm", onClick: () => { reveals[idx] = true; pushState(); draw(); } }, "Reveal answer");
  const root = h("div", { class: "present-full" }, stageWrap,
    h("div", { class: "ctrls" },
      h("button", { class: "btn ghost sm", onClick: () => go(-1) }, icon("left")), counter, h("button", { class: "btn ghost sm", onClick: () => go(1) }, icon("right")),
      revealBtn,
      classroomId ? h("span", { class: "pill red" }, h("span", { class: "live-dot" }), "Students follow live") : null,
      h("button", { class: "btn danger sm", onClick: close }, "End")));
  document.body.append(root);
  const key = (e) => { if (e.key === "ArrowRight" || e.key === " ") go(1); if (e.key === "ArrowLeft") go(-1); if (e.key === "Escape") close(); };
  document.addEventListener("keydown", key);
  function go(d) { idx = Math.max(0, Math.min(pres.slides.length - 1, idx + d)); pushState(); draw(); }
  function draw() {
    const s = pres.slides[idx];
    stageWrap.replaceChildren(renderSlide(s, { tally: s?.type === "quiz" ? (tallies[idx] || []) : null, reveal: reveals[idx] }));
    counter.textContent = `${idx + 1} / ${pres.slides.length}`;
    revealBtn.classList.toggle("hidden", s?.type !== "quiz" || !!reveals[idx]);
  }
  function pushState(ended = false) {
    if (!ch) return;
    ch.send({ type: "broadcast", event: "state", payload: { ended, id: pres.id, title: pres.title, index: idx, slide: pres.slides[idx], count: pres.slides.length, reveal: !!reveals[idx], teacher: me.name } });
  }
  function close() { pushState(true); document.removeEventListener("keydown", key); if (ch) setTimeout(() => client.removeChannel(ch), 300); root.remove(); onClose && onClose(); }
  draw(); pushState();
}

// Student: listen for a live presentation in a class. Calls onLive(state) / onEnd().
export async function watchPresentations({ client, classroomId, onState }) {
  await client.realtime.setAuth();
  const ch = client.channel(`class:${classroomId}:present`, { config: { private: true, broadcast: { self: false } } });
  ch.on("broadcast", { event: "state" }, ({ payload }) => onState(payload));
  ch.subscribe(s => { if (s === "SUBSCRIBED") ch.send({ type: "broadcast", event: "hello", payload: {} }); });
  return {
    answer: (index, option, me) => ch.send({ type: "broadcast", event: "answer", payload: { index, option, from: me.id, name: me.name } }),
    stop: () => client.removeChannel(ch),
  };
}

// Student: full-screen live viewer that follows the teacher.
export function openLiveViewer({ state, watcher, me, onClose }) {
  let cur = state; const picks = {};
  const stageWrap = h("div", { style: { width: "100%", display: "flex", justifyContent: "center" } });
  const info = h("span");
  const root = h("div", { class: "present-full" }, stageWrap, h("div", { class: "ctrls" }, h("span", { class: "pill red" }, h("span", { class: "live-dot" }), "LIVE"), info, h("button", { class: "btn ghost sm", onClick: close }, "Close")));
  document.body.append(root);
  function draw() {
    const s = cur.slide;
    stageWrap.replaceChildren(renderSlide(s, { picked: picks[cur.index], reveal: cur.reveal, onPick: s?.type === "quiz" && !cur.reveal ? (i) => { picks[cur.index] = i; watcher.answer(cur.index, i, me); sound.tap(); draw(); } : null }));
    info.textContent = `${cur.title} · ${cur.index + 1} / ${cur.count}`;
    if (s?.type === "quiz" && cur.reveal && picks[cur.index] != null) { if (picks[cur.index] === s.answer) sound.correct(); }
  }
  function close() { root.remove(); onClose && onClose(); }
  draw();
  return { update(st) { if (st.ended) { toast("The presentation has ended"); close(); return; } cur = st; draw(); }, close };
}

// Anyone: browse a presentation at their own pace.
export function openSlideshow(pres) {
  let idx = 0; const picks = {};
  const stageWrap = h("div", { style: { width: "100%", display: "flex", justifyContent: "center" } });
  const counter = h("span");
  const root = h("div", { class: "present-full" }, stageWrap, h("div", { class: "ctrls" },
    h("button", { class: "btn ghost sm", onClick: () => go(-1) }, icon("left")), counter, h("button", { class: "btn ghost sm", onClick: () => go(1) }, icon("right")),
    h("button", { class: "btn ghost sm", onClick: close }, "Close")));
  document.body.append(root);
  const key = (e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); if (e.key === "Escape") close(); };
  document.addEventListener("keydown", key);
  function go(d) { idx = Math.max(0, Math.min(pres.slides.length - 1, idx + d)); draw(); }
  function draw() {
    const s = pres.slides[idx];
    stageWrap.replaceChildren(renderSlide(s, { picked: picks[idx], reveal: picks[idx] != null, onPick: s?.type === "quiz" && picks[idx] == null ? (i) => { picks[idx] = i; i === s.answer ? sound.correct() : sound.wrong(); draw(); } : null }));
    counter.textContent = `${idx + 1} / ${pres.slides.length}`;
  }
  function close() { document.removeEventListener("keydown", key); root.remove(); }
  draw();
}

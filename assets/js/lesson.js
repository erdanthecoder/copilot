// Full-screen lesson player (Duolingo-style) used for practice, homework and teacher previews.
import { h, icon, mascot, sound, confetti, modal, kyKeys, speakKy, kyVoice, countUp } from "./ui.js";
import { checkTyped, normalize, translit, shuffle } from "./engine.js";
import { t, getLang } from "./i18n.js";
import { TOPICS } from "./curriculum.js";

/*
  opts: {
    exercises, mode: "practice" | "homework" | "preview",
    hearts: number | null, onHeart(n), onReport(item), onDone(result), onQuit(),
    after: optional async (container) => extra step before results (e.g. homework writing)
  }
*/
export function runLesson(opts) {
  const lang = getLang();
  const homework = opts.mode === "homework";
  // "intro" cards teach a new word and aren't scored; everything else is.
  let scoredIdx = 0;
  const queue = opts.exercises.map((ex) => ({ ex, i: ex.type === "intro" ? -1 : scoredIdx++, retry: false }));
  const total = scoredIdx;
  const answers = new Array(total).fill(null);
  let hearts = opts.hearts ?? null;
  let doneCount = 0, streak = 0, bestStreak = 0;
  const t0 = Date.now();
  let exStart = Date.now();
  let current = null, state = "answer", getAnswer = null, checkFn = null;

  const bar = h("i", { style: { width: "0%" } });
  const heartEl = h("span", { class: "stat heart" }, icon("heart"), h("span", {}, hearts ?? ""));
  if (hearts == null) heartEl.classList.add("hidden");
  const body = h("div", { class: "lesson-inner" });
  const footInner = h("div", { class: "inner" });
  const foot = h("div", { class: "lesson-foot" }, footInner);
  const root = h("div", { class: "lesson", role: "dialog" },
    h("div", { class: "lesson-top" },
      h("button", { class: "icon-btn", "aria-label": t("close"), onClick: quit }, icon("x")),
      h("div", { class: "bar" }, bar), heartEl),
    h("div", { class: "lesson-body" }, body), foot);
  document.body.append(root);
  document.body.style.overflow = "hidden";

  const onKey = (e) => {
    if (e.target.tagName === "TEXTAREA" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); primary(); return; }
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "Enter") { e.preventDefault(); primary(); }
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9 && state === "answer") { const b = body.querySelectorAll("[data-num]")[n - 1]; if (b) b.click(); }
  };
  document.addEventListener("keydown", onKey);

  function cleanup() { document.removeEventListener("keydown", onKey); root.remove(); document.body.style.overflow = ""; }

  function quit() {
    if (opts.mode === "preview") { cleanup(); opts.onQuit && opts.onQuit(); return; }
    modal({ title: t("quitTitle"), body: h("div", { class: "center" }, mascot("sad", 100), h("p", {}, t("quitText"))), actions: [
      { label: t("endSession"), kind: "ghost plain", onClick: () => { cleanup(); opts.onQuit && opts.onQuit(); } },
      { label: t("keepLearning"), kind: "primary" },
    ] });
  }

  let primaryBtn;
  function setFoot(kind, content) {
    foot.className = "lesson-foot " + (kind || "");
    footInner.replaceChildren(...content);
  }
  function answerFoot() {
    primaryBtn = h("button", { class: "btn primary", disabled: true, onClick: primary }, t("check"));
    setFoot("", [homework ? h("span") : h("button", { class: "btn ghost plain", onClick: skip }, t("skip")), primaryBtn]);
  }
  function setReady(ok) { if (primaryBtn && state === "answer") primaryBtn.disabled = !ok; }

  function primary() {
    if (state === "answer") { if (primaryBtn && !primaryBtn.disabled) check(); }
    else if (state === "feedback") next();
  }
  function skip() { if (state !== "answer") return; grade({ ok: false, given: "" }); }
  function check() { const r = checkFn(); grade(r); }

  function grade(r) {
    state = "feedback";
    const { ex, i, retry } = current;
    const ms = Date.now() - exStart;
    if (!retry) answers[i] = { id: ex.item?.id || ex.type, type: ex.type, prompt: ex.prompt || ex.before || "", given: r.given ?? "", ok: !!r.ok, ms };
    if (r.ok) {
      sound.correct(); streak++; bestStreak = Math.max(bestStreak, streak);
      if (streak >= 3 && streak % 5 === 0) { const c = h("div", { class: "combo" }, `${streak} ${t("inARow")}`); document.body.append(c); setTimeout(() => c.remove(), 1500); }
      if (!homework || retry) doneCount++;
    } else {
      sound.wrong(); streak = 0;
      body.querySelector(".ex-card")?.classList.add("shake");
      if (homework) doneCount++;
      else queue.push({ ex: current.ex, i, retry: true });
      if (hearts != null && !retry) { hearts = Math.max(0, hearts - 1); heartEl.lastChild.textContent = hearts; heartEl.classList.remove("lost"); void heartEl.offsetWidth; heartEl.classList.add("lost"); opts.onHeart && opts.onHeart(hearts); }
    }
    if (r.ok && homework) doneCount++;
    progress();
    bar.parentNode.classList.toggle("hot", streak >= 3);
    const sol = r.ok ? (r.note || "") : r.solution;
    const explain = !r.ok ? (ex.explain || (ex.item?.topic && TOPICS[ex.item.topic]?.tip?.[lang]) || "") : "";
    const reportBtn = ex.item && !ex.item.custom && opts.onReport ? h("button", { class: "link-btn small", onClick: () => opts.onReport(ex.item) }, icon("flag"), " ", t("report")) : null;
    setFoot(r.ok ? "right" : "wrong", [
      h("div", { class: "fb" },
        h("div", { class: "badge" }, icon(r.ok ? "check" : "x")),
        h("div", {}, h("h3", {}, r.ok ? t("correct2") : t("incorrect")), sol ? h("div", { class: "sol" }, sol) : null, explain ? h("div", { class: "explain" }, explain) : null, reportBtn)),
      h("button", { class: "btn " + (r.ok ? "primary" : "danger"), onClick: next }, t("continue")),
    ]);
    body.querySelectorAll("button.opt, .tile, textarea, input").forEach(b => { if (!b.classList.contains("right") && !b.classList.contains("wrong")) b.setAttribute("disabled", ""); });
    if (hearts === 0 && !homework) { setTimeout(() => outOfHearts(), 600); }
  }

  function progress() {
    const pct = homework ? (doneCount / total) : (Math.min(doneCount, total) / total);
    bar.style.width = Math.round(pct * 100) + "%";
  }

  function outOfHearts() {
    state = "over";
    body.replaceChildren(h("div", { class: "results" }, mascot("sad", 140), h("h1", { style: { color: "var(--red)" } }, t("outOfHearts")), h("p", { class: "muted" }, t("outOfHeartsText"))));
    setFoot("", [h("span"), h("button", { class: "btn primary", onClick: () => { cleanup(); opts.onDone && opts.onDone(result(true)); } }, t("continue"))]);
  }

  function result(failed = false) {
    const firstTry = answers.filter(Boolean);
    const correct = firstTry.filter(a => a.ok).length;
    const secs = Math.round((Date.now() - t0) / 1000);
    const acc = total ? Math.round(100 * correct / total) : 0;
    const xp = failed ? 0 : 10 + (acc === 100 ? 5 : 0) + Math.min(5, Math.floor(bestStreak / 5) * 2);
    return { correct, total, answers: answers.map(a => a || { ok: false, given: "" }), secs, acc, xp, failed, mistakes: firstTry.filter(a => !a.ok).map(a => a.id) };
  }

  async function next() {
    if (state === "over") return;
    if (!queue.length) return finish();
    current = queue.shift();
    state = "answer";
    exStart = Date.now();
    try { if (localStorage.getItem("lk.debug")) window.__lkEx = current.ex; } catch {}
    if (current.ex.type === "intro") {
      state = "feedback";
      body.replaceChildren(renderIntro(current.ex));
      sound.tap();
      setFoot("", [h("span"), h("button", { class: "btn primary", onClick: next }, t("continue"))]);
      return;
    }
    body.replaceChildren(render(current.ex));
    answerFoot();
    const f = body.querySelector("textarea"); if (f) setTimeout(() => f.focus(), 50);
  }

  async function finish() {
    state = "over";
    const res = result();
    if (opts.after) {
      body.replaceChildren(); footInner.replaceChildren();
      const extra = await opts.after(body, setFoot, res);
      if (extra) Object.assign(res, extra);
    }
    sound.done(); confetti();
    const mins = Math.floor(res.secs / 60), s = res.secs % 60;
    const moodTitle = res.acc >= 90 ? t("lessonComplete") : res.acc >= 60 ? t("lessonComplete") : t("lessonComplete");
    body.replaceChildren(h("div", { class: "results" },
      mascot(res.acc >= 90 ? "cheer" : res.acc >= 60 ? "happy" : "think", 150),
      h("h1", {}, moodTitle),
      opts.resultExtra ? opts.resultExtra(res) : null,
      h("div", { class: "res-cards" },
        h("div", { class: "res-card", style: { "--c": "var(--yellow)" } }, h("b", {}, t("totalXp")), h("span", {}, icon("bolt"), h("span", { class: "cu", "data-to": res.xp }, "0"))),
        h("div", { class: "res-card", style: { "--c": "var(--green)" } }, h("b", {}, t("accuracy")), h("span", {}, icon("target"), h("span", { class: "cu", "data-to": res.acc, "data-suffix": "%" }, "0%"))),
        h("div", { class: "res-card", style: { "--c": "var(--blue)" } }, h("b", {}, t("time")), h("span", {}, icon("clock"), `${mins}:${String(s).padStart(2, "0")}`)))));
    body.querySelectorAll(".cu").forEach(el => countUp(el, +el.dataset.to, 900, el.dataset.suffix || ""));
    setFoot("", [h("span"), h("button", { class: "btn primary", onClick: () => { cleanup(); opts.onDone && opts.onDone(res); } }, t("continue"))]);
  }

  // ───────── renderers ─────────
  function kyText(s, big) {
    const v = kyVoice();
    return h("span", {}, h("span", { class: "ky" }, s),
      v ? h("button", { class: "icon-btn", "aria-label": "Listen", onClick: () => speakKy(s) }, icon("speaker")) : null,
      h("span", { class: "tl" }, translit(s)));
  }
  function promptBubble(text, isKy) {
    return h("div", { class: "prompt-row" }, mascot(isKy ? "think" : "happy", 96), h("div", { class: "speech" }, isKy ? kyText(text) : text));
  }

  function renderIntro(ex) {
    const v = kyVoice();
    return h("div", { class: "ex-card intro-card" },
      h("div", { class: "intro-kicker" }, icon("star"), lang === "ru" ? "Новое слово" : "New word"),
      mascot("wave", 110),
      h("div", { class: "intro-word" }, ex.ky, v ? h("button", { class: "icon-btn", "aria-label": "Listen", onClick: () => speakKy(ex.ky) }, icon("speaker")) : null),
      h("div", { class: "intro-tl" }, translit(ex.ky)),
      h("div", { class: "intro-tr" }, ex.tr),
      ex.example ? h("div", { class: "intro-ex" }, h("span", { class: "ky" }, ex.example[0]), h("span", {}, ex.example[1])) : null);
  }

  function render(ex) {
    const card = h("div", { class: "ex-card" });
    if (ex.type === "choose") renderChoose(ex, card);
    else if (ex.type === "match") renderMatch(ex, card);
    else if (ex.type === "build") renderBuild(ex, card);
    else if (ex.type === "type") renderType(ex, card);
    else if (ex.type === "blank") renderBlank(ex, card);
    else if (ex.type === "read") renderRead(ex, card);
    return card;
  }

  function optionButtons(ex, labels, isKy, onPick) {
    let sel = -1;
    const btns = labels.map((o, i) => h("button", { class: "opt", "data-num": i + 1, onClick: () => { sound.tap(); sel = i; btns.forEach((b, j) => b.classList.toggle("sel", j === i)); onPick(i); } },
      h("span", { class: "num" }, i + 1), h("span", {}, isKy ? h("span", { class: "ky" }, o) : o)));
    return { btns, get: () => sel };
  }

  function renderChoose(ex, card) {
    const promptIsKy = ex.promptLang === "ky";
    const custom = ex.promptLang === "mixed";
    card.append(h("h2", { class: "ex-title" }, custom ? ex.prompt : promptIsKy ? t("selectMeaning") : t("selectKy").replace(/[:\s]+$/, "")));
    if (!custom) card.append(promptBubble(ex.prompt, promptIsKy));
    const o = optionButtons(ex, ex.options, ex.optionLang === "ky", () => setReady(true));
    card.append(h("div", { class: "options" + (ex.options.every(x => x.length < 18) ? " two" : "") }, o.btns));
    checkFn = () => {
      const s = o.get(); const ok = s === ex.answer;
      o.btns[s].classList.add(ok ? "right" : "wrong"); if (!ok) o.btns[ex.answer].classList.add("right");
      return { ok, given: ex.options[s], solution: ex.options[ex.answer] };
    };
  }

  function renderRead(ex, card) {
    card.append(h("h2", { class: "ex-title" }, t("readAnswer")));
    const trans = h("div", { class: "trans hidden" }, ex.translation);
    const toggle = h("button", { class: "link-btn small", onClick: () => { trans.classList.toggle("hidden"); toggle.textContent = trans.classList.contains("hidden") ? t("showTranslation") : t("hideTranslation"); } }, t("showTranslation"));
    card.append(h("div", { class: "reading" }, h("div", { class: "ky" }, ex.text), trans), toggle);
    card.append(h("h3", { style: { margin: "14px 0 12px" } }, ex.prompt));
    const o = optionButtons(ex, ex.options, false, () => setReady(true));
    card.append(h("div", { class: "options" }, o.btns));
    checkFn = () => {
      const s = o.get(); const ok = s === ex.answer;
      o.btns[s].classList.add(ok ? "right" : "wrong"); if (!ok) o.btns[ex.answer].classList.add("right");
      return { ok, given: ex.options[s], solution: ex.options[ex.answer] };
    };
  }

  function renderMatch(ex, card) {
    card.append(h("h2", { class: "ex-title" }, t("tapPairs")));
    const left = shuffle(ex.pairs.map((p, i) => ({ text: p.ky, i, ky: true })));
    const right = shuffle(ex.pairs.map((p, i) => ({ text: p.tr, i })));
    let pickL = null, pickR = null, matched = 0, mistakes = 0;
    const mk = (x, side) => {
      const b = h("button", { class: "opt", onClick: () => {
        if (b.classList.contains("gone")) return;
        sound.tap();
        if (side === "L") { pickL?.el.classList.remove("sel"); pickL = { ...x, el: b }; } else { pickR?.el.classList.remove("sel"); pickR = { ...x, el: b }; }
        b.classList.add("sel");
        if (pickL && pickR) {
          const a = pickL, c = pickR; pickL = pickR = null;
          if (a.i === c.i) {
            sound.match(); a.el.classList.replace("sel", "right"); c.el.classList.replace("sel", "right");
            setTimeout(() => { a.el.classList.add("gone"); c.el.classList.add("gone"); }, 250);
            if (++matched === ex.pairs.length) { setReady(true); setTimeout(() => check(), 350); }
          } else {
            mistakes++; sound.wrong();
            [a.el, c.el].forEach(el => { el.classList.replace("sel", "wrong"); setTimeout(() => el.classList.remove("wrong"), 400); });
          }
        }
      } }, x.ky ? h("span", { class: "ky" }, x.text) : x.text);
      return b;
    };
    card.append(h("div", { class: "match" }, h("div", { class: "col" }, left.map(x => mk(x, "L"))), h("div", { class: "col" }, right.map(x => mk(x, "R")))));
    checkFn = () => ({ ok: mistakes <= 1, given: `${mistakes} mistakes`, solution: ex.pairs.map(p => `${p.ky} = ${p.tr}`).join(" · ") });
  }

  function renderBuild(ex, card) {
    const custom = ex.promptLang === "mixed";
    card.append(h("h2", { class: "ex-title" }, custom ? ex.prompt : ex.lang === "ky" ? t("buildSentence") : t("buildTranslation")));
    if (!custom) card.append(promptBubble(ex.prompt, ex.promptLang === "ky"));
    const area = h("div", { class: "answer-area" });
    const chosen = [];
    const bank = h("div", { class: "bank" }, ex.bank.map((w) => {
      const tile = h("button", { class: "tile", onClick: () => {
        if (tile.classList.contains("used")) return;
        sound.tap(); tile.classList.add("used");
        const placed = h("button", { class: "tile", onClick: () => { sound.tap(); placed.remove(); tile.classList.remove("used"); chosen.splice(chosen.indexOf(entry), 1); setReady(chosen.length > 0); } }, w);
        const entry = { w, placed }; chosen.push(entry); area.append(placed); setReady(true);
      } }, w);
      return tile;
    }));
    card.append(area, bank);
    checkFn = () => {
      const given = chosen.map(c => c.w).join(" ");
      const ok = ex.accepted.some(a => normalize(a) === normalize(given));
      return { ok, given, solution: ex.accepted[0] };
    };
  }

  function renderType(ex, card) {
    const custom = ex.promptLang === "mixed";
    card.append(h("h2", { class: "ex-title" }, custom ? ex.prompt : ex.lang === "ky" ? t("typeKy") : t("typeTr")));
    if (!custom) card.append(promptBubble(ex.prompt, ex.promptLang === "ky"));
    const ta = h("textarea", { class: "input type-area", placeholder: t("typeHere"), autocapitalize: "off", autocomplete: "off", spellcheck: "false", onInput: () => setReady(ta.value.trim().length > 0) });
    card.append(ta);
    if (ex.lang === "ky") card.append(kyKeys(ta));
    checkFn = () => {
      const r = checkTyped(ta.value, ex.accepted);
      const note = r.special ? `${t("almost")} ${ex.accepted[0]}` : r.typo ? `${t("typo")} ${ex.accepted[0]}` : "";
      return { ok: r.ok, given: ta.value.trim(), solution: ex.accepted[0], note };
    };
  }

  function renderBlank(ex, card) {
    card.append(h("h2", { class: "ex-title" }, t("fillBlank")));
    const slot = h("span", { class: "blank-slot" }, " ");
    card.append(h("p", { class: "muted" }, ex.hint));
    card.append(h("div", { class: "blank-sent ky" }, ex.before, " ", slot, " ", ex.after));
    let sel = -1;
    const btns = ex.options.map((o, i) => h("button", { class: "opt", "data-num": i + 1, onClick: () => { sound.tap(); sel = i; slot.textContent = o; btns.forEach((b, j) => b.classList.toggle("sel", j === i)); setReady(true); } },
      h("span", { class: "num" }, i + 1), h("span", { class: "ky" }, o)));
    card.append(h("div", { class: "options two" }, btns));
    checkFn = () => {
      const ok = sel === ex.answer;
      btns[sel].classList.add(ok ? "right" : "wrong"); if (!ok) btns[ex.answer].classList.add("right");
      return { ok, given: ex.options[sel], solution: `${ex.before} ${ex.options[ex.answer]} ${ex.after}`.trim() };
    };
  }

  progress();
  next();
  return { close: cleanup };
}

// Shared-account helpers with UI (flying hand-off, notes). Core logic: oneintwo-core.js
import { h, icon, mascot } from "./ui.js";
export * from "./oneintwo-core.js";
import { HUB } from "./oneintwo-core.js";

// Leave for another app with a short "portal" animation. Opens a tab straight from the
// click (so it is never blocked), then points it at the app when the animation ends.
export function flyTo(url, { from = "LearnKyrgyz", to = "Quoldek", label = "", cards = [], newTab = true } = {}) {
  const tab = newTab ? window.open("", "_blank") : null;
  if (tab) { try { tab.document.title = `Opening ${to}…`; tab.document.body.style.background = "#140d2b"; } catch {} }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const flying = (cards.length ? cards : ["?", "?", "?"]).slice(0, 6).map((c, i) => h("span", { class: "oit-card", style: { "--i": i, "--n": Math.min(cards.length || 3, 6) } }, c));
  const layer = h("div", { class: "oit-fly" + (reduce ? " still" : "") },
    h("div", { class: "oit-stage" },
      h("div", { class: "oit-end a" }, h("span", { class: "oit-logo" }, mascot("happy", 54, { hat: false })), h("b", {}, from)),
      h("div", { class: "oit-path" }, flying, h("i", { class: "oit-beam" })),
      h("div", { class: "oit-end b" }, h("span", { class: "oit-logo q" }, "Q"), h("b", {}, to))),
    h("p", { class: "oit-label" }, label || `Taking you to ${to}…`));
  document.body.append(layer);
  const go = () => {
    if (tab && !tab.closed) { tab.location.href = url; setTimeout(() => layer.classList.add("done"), 200); setTimeout(() => layer.remove(), 900); }
    else location.href = url;
  };
  setTimeout(go, reduce ? 300 : 1500);
}

// Card that explains the shared account inside an app.
export function hubNote(ru) {
  return h("a", { class: "card click oit-note", href: HUB, target: "_blank", rel: "noopener" },
    h("span", { class: "oit-rings" }, h("i"), h("i")),
    h("div", { class: "grow" }, h("b", {}, ru ? "Один аккаунт — OneInTwo" : "One account — OneInTwo"),
      h("p", { class: "small muted", style: { margin: "2px 0 0" } }, ru ? "Этот аккаунт работает и в Quoldek. Kadam и AkylduuKodo — на той же панели." : "This account also works in Quoldek. Kadam and AkylduuKodo are on the same dashboard.")),
    icon("right"));
}

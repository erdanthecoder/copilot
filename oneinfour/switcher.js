/* TeamOlive app switcher — one launcher shared by LearnKyrgyz, Quoldek, Kadam and
 * CompactCoding. Each app loads this one file from https://teamolive.web.app/switcher.js,
 * so a change here reaches all four at once.
 *
 * Switching goes through TeamOlive (?return=…&silent=1): if you are signed in there, the
 * next app opens signed in as the same account; if not, it opens as usual. Nothing is stored
 * here and nothing is sent anywhere else.
 *
 * It draws itself inside a shadow root, so it cannot disturb the app's own styles, and it
 * steps aside in full screen (exams, presentations, games), when the page adds the class
 * "t4w-hide" to <body>, or while an element matching the script tag's data-hide is on the
 * page (for example data-hide=".lesson", so it never covers a lesson's buttons).
 */
(function () {
  'use strict';
  if (window.__the4workspaceSwitcher) return;
  window.__the4workspaceSwitcher = true;

  const HUB = 'https://teamolive.web.app';
  const hideSel = (document.currentScript && document.currentScript.dataset.hide) || '';
  // a bar fixed along the bottom of the page (a phone's tab bar) that the button should sit above
  const aboveSel = (document.currentScript && document.currentScript.dataset.above) || '';
  // data-side="right" puts it in the bottom-right corner, for apps whose left corner is taken
  const right = (document.currentScript && document.currentScript.dataset.side) === 'right';
  const host = location.hostname;
  const teacherLK = host === 'teachlrnkyrgyz.web.app';
  const APPS = [
    { id: 'learnkyrgyz', name: 'LearnKyrgyz', tag: 'Learn Kyrgyz', url: teacherLK ? 'https://teachlrnkyrgyz.web.app/' : 'https://studentlrnkyrgyz.web.app/', icon: HUB + '/icons/learnkyrgyz.svg', c: '#58cc02', hosts: /^(learnkyrgyz|studentlrnkyrgyz|teachlrnkyrgyz)\.web\.app$/ },
    { id: 'quoldek', name: 'Quoldek', tag: 'Quiz games', url: 'https://quoldek.web.app/signin.html', icon: HUB + '/icons/quoldek.svg', c: '#7c5cff', hosts: /^quoldek\.web\.app$/ },
    { id: 'kadam', name: 'Kadam', tag: 'Workspace', url: 'https://kadam.web.app/', icon: HUB + '/icons/kadam.svg', c: '#14b8a6', hosts: /^kadam\.web\.app$/ },
    { id: 'akylduukodo', name: 'CompactCoding', tag: 'Learn to code', url: 'https://compactcoding.web.app/', icon: HUB + '/icons/akylduukodo.svg', c: '#1cb0f6', hosts: /^(compactcoding|akylduukodo)\.web\.app$/ },
    { id: 'worldislands', name: 'World Islands', tag: '3D learning world', url: 'https://world-islands.web.app/', icon: HUB + '/icons/worldislands.png', c: '#3aa0d8', hosts: /^(world-islands|banda-worldislands|bandaworld)\.web\.app$/ },
  ];
  // the pages a class is sent to (joining a game, homework) never show it
  if (/^(play|live|hw)quoldek\.web\.app$/.test(host) || /\/(play|take|join|host|show)(\.html)?\/?$/.test(location.pathname)) return;
  const here = APPS.find(a => a.hosts.test(host));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const go = (a) => a ? HUB + '/?return=' + encodeURIComponent(a.url) + '&silent=1' : HUB + '/';

  const css = `
  :host { all: initial; }
  * { box-sizing: border-box; }
  .wrap { position: fixed; left: max(16px, env(safe-area-inset-left)); bottom: max(16px, env(safe-area-inset-bottom)); z-index: 2147483000; font: 500 14px/1.4 Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color: #ededf3; }
  .wrap.hidden { display: none; }
  .fab { width: 48px; height: 48px; border-radius: 16px; border: 1px solid rgba(255,255,255,.16); padding: 0; cursor: pointer; background: #110c2a; box-shadow: 0 12px 30px -10px rgba(0,0,0,.6), 0 0 0 0 rgba(124,92,255,.5); display: grid; place-items: center; transition: transform .25s cubic-bezier(.2,1.4,.3,1), box-shadow .3s; position: relative; }
  .fab img { width: 36px; height: 36px; border-radius: 11px; display: block; transition: transform .5s cubic-bezier(.2,1.4,.3,1); }
  .fab:hover { transform: translateY(-2px) scale(1.06); box-shadow: 0 18px 40px -12px rgba(0,0,0,.7), 0 0 0 6px rgba(124,92,255,.18); }
  .fab:hover img, .open .fab img { transform: rotate(-90deg); }
  .fab::after { content: ""; position: absolute; inset: -3px; border-radius: 18px; border: 2px solid rgba(124,92,255,.55); opacity: 0; animation: ${reduce ? 'none' : 'halo 3.2s ease-out 1.2s 2'}; pointer-events: none; }
  @keyframes halo { 0% { opacity: .9; transform: scale(1); } 100% { opacity: 0; transform: scale(1.45); } }
  .tip { position: absolute; left: 58px; bottom: 11px; white-space: nowrap; padding: 6px 10px; border-radius: 9px; background: #110c2a; border: 1px solid rgba(255,255,255,.14); font-size: 12.5px; opacity: 0; transform: translateX(-6px); transition: .2s; pointer-events: none; }
  .fab:hover + .tip { opacity: 1; transform: none; }
  .open .tip { display: none; }
  .panel { position: absolute; left: 0; bottom: 62px; width: 300px; padding: 14px; border-radius: 22px; background: rgba(17,14,40,.9); backdrop-filter: blur(18px) saturate(160%); -webkit-backdrop-filter: blur(18px) saturate(160%); border: 1px solid rgba(255,255,255,.14); box-shadow: 0 40px 90px -30px rgba(0,0,0,.85), 0 0 0 1px rgba(124,92,255,.18);
    transform-origin: 24px 100%; transform: scale(.6) translateY(10px); opacity: 0; pointer-events: none; transition: transform .38s cubic-bezier(.2,1.3,.3,1), opacity .2s; }
  .open .panel { transform: none; opacity: 1; pointer-events: auto; }
  .head { display: flex; align-items: center; justify-content: space-between; padding: 2px 4px 10px; }
  .head b { font-size: 13px; letter-spacing: .02em; } .head span { font-size: 11.5px; color: #a8a8bb; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .app { position: relative; display: grid; justify-items: center; gap: 6px; padding: 14px 8px 12px; border-radius: 16px; border: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.03); color: inherit; text-decoration: none; cursor: pointer; overflow: hidden;
    opacity: 0; transform: translateY(12px) scale(.92); transition: transform .25s cubic-bezier(.2,1.4,.3,1), border-color .2s, background .2s, opacity .2s; }
  .open .app { opacity: 1; transform: none; transition-delay: calc(var(--i) * 45ms); }
  .app:hover { transform: translateY(-3px) !important; border-color: color-mix(in srgb, var(--c) 60%, transparent); background: color-mix(in srgb, var(--c) 14%, transparent); }
  .app::before { content: ""; position: absolute; inset: auto -30% -60% -30%; height: 90%; background: radial-gradient(closest-side, var(--c), transparent); opacity: 0; transition: opacity .3s; }
  .app:hover::before { opacity: .35; }
  .app img { width: 44px; height: 44px; border-radius: 13px; position: relative; box-shadow: 0 10px 22px -10px var(--c); transition: transform .35s cubic-bezier(.2,1.6,.4,1); }
  .app:hover img { transform: scale(1.1) rotate(-6deg); }
  .app b { font-size: 13px; position: relative; } .app small { font-size: 11px; color: #a8a8bb; position: relative; }
  .app.here { border-color: color-mix(in srgb, var(--c) 45%, transparent); }
  .app.here::after { content: "You're here"; position: absolute; top: 6px; right: 6px; font-size: 9.5px; font-weight: 700; letter-spacing: .03em; padding: 2px 6px; border-radius: 6px; background: var(--c); color: #fff; }
  .home { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 10px 12px; border-radius: 14px; background: linear-gradient(135deg, rgba(124,92,255,.22), rgba(34,211,238,.12)); border: 1px solid rgba(124,92,255,.35); color: inherit; text-decoration: none; opacity: 0; transform: translateY(8px); transition: .3s; }
  .open .home { opacity: 1; transform: none; transition-delay: 200ms; }
  .home:hover { background: linear-gradient(135deg, rgba(124,92,255,.32), rgba(34,211,238,.2)); }
  .home img { width: 28px; height: 28px; border-radius: 8px; } .home b { font-size: 13px; display: block; } .home span { font-size: 11.5px; color: #c4c4d4; } .home i { margin-left: auto; font-style: normal; }
  .foot { margin-top: 10px; text-align: center; font-size: 11px; color: #74748a; } kbd { font: 600 10.5px Inter, system-ui, sans-serif; padding: 1px 5px; border-radius: 4px; border: 1px solid rgba(255,255,255,.18); }
  .bubble { position: fixed; z-index: 2147483001; width: 24px; height: 24px; margin: -12px 0 0 -12px; border-radius: 50%; pointer-events: none; transform: scale(0); transition: transform .7s cubic-bezier(.7,0,.25,1); }
  .right { left: auto; right: max(16px, env(safe-area-inset-right)); }
  .right .panel { left: auto; right: 0; transform-origin: calc(100% - 24px) 100%; }
  .right .tip { left: auto; right: 58px; transform: translateX(6px); }
  @media (max-width: 480px) { .panel { width: min(300px, calc(100vw - 32px)); } .tip { display: none; } }
  @media (prefers-reduced-motion: reduce) { .panel, .app, .home, .fab, .fab img { transition: none !important; } }
  `;

  function mount() {
    if (document.getElementById('the4workspace-switcher')) return;
    const holder = document.createElement('div');
    holder.id = 'the4workspace-switcher';
    const root = holder.attachShadow({ mode: 'open' });
    const style = document.createElement('style'); style.textContent = css;
    const wrap = document.createElement('div'); wrap.className = 'wrap' + (right ? ' right' : '');
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    wrap.innerHTML = `
      <div class="panel" role="dialog" aria-label="Switch app">
        <div class="head"><b>TeamOlive</b><span>one account · all your apps</span></div>
        <div class="grid">${APPS.map((a, i) => `
          <a class="app${here && here.id === a.id ? ' here' : ''}" href="${esc(go(a))}" data-id="${a.id}" style="--c:${a.c};--i:${i}">
            <img src="${esc(a.icon)}" alt="" loading="lazy"><b>${esc(a.name)}</b><small>${esc(a.tag)}</small></a>`).join('')}
        </div>
        <a class="home" href="${HUB}/"><img src="${HUB}/teamolive-logo.svg" alt=""><div><b>Open TeamOlive</b><span>Your dashboard, quest and more</span></div><i>→</i></a>
        <div class="foot"><kbd>Alt</kbd> + <kbd>W</kbd> opens this anywhere</div>
      </div>
      <button class="fab" aria-label="Switch app (TeamOlive)" aria-expanded="false"><img src="${HUB}/teamolive-logo.svg" alt=""></button>
      <span class="tip">Switch app</span>`;
    root.append(style, wrap);
    document.body.append(holder);

    const fab = wrap.querySelector('.fab');
    const toggle = (on) => { const open = on ?? !wrap.classList.contains('open'); wrap.classList.toggle('open', open); fab.setAttribute('aria-expanded', String(open)); if (open) setTimeout(() => wrap.querySelector('.app:not(.here)')?.focus(), 60); };
    fab.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
    document.addEventListener('click', (e) => { if (!holder.contains(e.target)) toggle(false); });
    addEventListener('keydown', (e) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'w' || e.key === 'W' || e.code === 'KeyW')) { e.preventDefault(); toggle(); }
      else if (e.key === 'Escape' && wrap.classList.contains('open')) toggle(false);
    });
    // leaving for another app: a bubble in its colour grows from the tile
    wrap.querySelectorAll('.app').forEach((el) => el.addEventListener('click', (e) => {
      const id = el.dataset.id;
      if (here && here.id === id) { e.preventDefault(); toggle(false); return; }
      if (reduce) return;
      e.preventDefault();
      const r = el.getBoundingClientRect(), c = getComputedStyle(el).getPropertyValue('--c');
      const b = document.createElement('div'); b.className = 'bubble';
      b.style.left = r.left + r.width / 2 + 'px'; b.style.top = r.top + r.height / 2 + 'px'; b.style.background = c;
      root.append(b);
      const far = Math.hypot(innerWidth, innerHeight) * 2 / 24;
      requestAnimationFrame(() => { b.style.transform = `scale(${far})`; });
      setTimeout(() => { location.href = el.href; }, 520);
    }));
    // step aside in full screen, or when the page asks
    let queued = false;
    const soon = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; hide(); }); } };
    const hide = () => {
      let busy = false; try { busy = !!(hideSel && document.querySelector(hideSel)); } catch { /* a bad selector hides nothing */ }
      const off = !!document.fullscreenElement || document.body.classList.contains('t4w-hide') || busy;
      wrap.classList.toggle('hidden', off); if (off) toggle(false);
      let lift = 0;
      if (aboveSel) try { const bar = document.querySelector(aboveSel); if (bar) { const r = bar.getBoundingClientRect(); if (getComputedStyle(bar).position === 'fixed' && r.bottom >= innerHeight - 2 && r.top > innerHeight / 2) lift = r.height; } } catch { }
      wrap.style.bottom = lift ? `calc(${lift + 12}px + env(safe-area-inset-bottom))` : '';
    };
    addEventListener('resize', soon);
    document.addEventListener('fullscreenchange', hide);
    new MutationObserver(soon).observe(document.body, { attributes: true, attributeFilter: ['class'], childList: true, subtree: !!hideSel });
    hide();
    addEventListener('pageshow', (e) => { if (e.persisted) root.querySelectorAll('.bubble').forEach(b => b.remove()); });
  }
  if (document.body) mount(); else addEventListener('DOMContentLoaded', mount);
})();

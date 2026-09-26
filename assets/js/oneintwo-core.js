// OneInFour — one account for LearnKyrgyz and Quoldek, with Kadam and AkylduuKodo on the same dashboard.
//
// The account is the LearnKyrgyz (Supabase) account. oneinfour.web.app signs people in;
// opening another app hands the session over in the URL fragment (#oit=…), which never
// reaches a server. The receiving app stores it and removes it from the address bar.
// Hand-offs only ever go to the addresses in TRUSTED below.
export const HUB = "https://oneinfour.web.app";
export const QUOLDEK = "https://quoldek.web.app";

export const APPS = [
  { id: "learnkyrgyz", name: "LearnKyrgyz", url: "https://studentlrnkyrgyz.web.app/", teacherUrl: "https://teachlrnkyrgyz.web.app/", color: "#58cc02", sso: true },
  { id: "quoldek", name: "Quoldek", url: "https://quoldek.web.app/", color: "#7c5cff", sso: true },
  { id: "kadam", name: "Kadam", url: "https://kadam.web.app/", color: "#0f9d58", sso: false },
  { id: "akylduukodo", name: "AkylduuKodo", url: "https://akylduukodo.web.app/", color: "#1cb0f6", sso: false },
];
const TRUSTED = /^https:\/\/(learnkyrgyz|studentlrnkyrgyz|teachlrnkyrgyz|quoldek|playquoldek|livequoldek|hwquoldek|kadam|akylduukodo|oneintwo|oneinfour)\.web\.app(\/|$)|^https:\/\/erdanthecoder\.github\.io\/(copilot|quiznova|official-fixed_game)(\/|$)/;
export const isTrusted = (url) => { try { return TRUSTED.test(new URL(url).href); } catch { return false; } };

const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64 = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));

// A link into another app that carries the current session (only to trusted apps).
export function handoffUrl(url, session) {
  if (!session || !isTrusted(url)) return url;
  const u = new URL(url);
  const extra = u.hash && u.hash.length > 1 ? "&" + u.hash.slice(1) : "";
  u.hash = "oit=" + b64(JSON.stringify({ at: session.access_token, rt: session.refresh_token })) + extra;
  return u.href;
}

// Read #oit=… on arrival and sign in with it. Returns true when a session was taken over.
export async function acceptHandoff(client) {
  const m = location.hash.match(/(?:^#|&)oit=([A-Za-z0-9_-]+)/);
  if (!m) return false;
  const rest = location.hash.slice(1).split("&").filter(p => !p.startsWith("oit=")).join("&");
  history.replaceState(null, "", location.pathname + location.search + (rest ? "#" + rest : ""));
  try {
    const { at, rt } = JSON.parse(unb64(m[1]));
    const { data: cur } = await client.auth.getSession();
    if (cur.session && cur.session.refresh_token === rt) return true;
    const { error } = await client.auth.setSession({ access_token: at, refresh_token: rt });
    return !error;
  } catch { return false; }
}


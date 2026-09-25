// "Continue with Google" via Firebase Authentication, bridged into a Supabase
// session by the auth-bridge edge function. Works on the Firebase-hosted
// *.web.app sites, which serve the project's config at /__/firebase/init.json.
import { sb } from "./config.js";

let configPromise = null;
function firebaseConfig() {
  if (!configPromise) {
    configPromise = fetch("/__/firebase/init.json", { cache: "no-store" })
      .then(r => (r.ok ? r.json() : null))
      .then(c => (c && c.apiKey ? c : null))
      .catch(() => null);
  }
  return configPromise;
}

export async function googleAvailable() { return !!(await firebaseConfig()); }

export async function signInWithGoogle({ role, learnFrom }) {
  const cfg = await firebaseConfig();
  if (!cfg) throw new Error("Google sign-in is only available on the learnkyrgyz.web.app sites.");
  const fb = await import(new URL("../vendor/firebase-auth.js", import.meta.url).href);
  const app = fb.initializeApp(cfg, "learnkyrgyz");
  const auth = fb.getAuth(app);
  const provider = new fb.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await fb.signInWithPopup(auth, provider, fb.browserPopupRedirectResolver);
  const idToken = await cred.user.getIdToken();
  const { data, error } = await sb().functions.invoke("auth-bridge", { body: { action: "firebase", idToken, role, learn_from: learnFrom } });
  await fb.signOut(auth).catch(() => {});
  if (error) throw new Error(await bridgeError(error));
  if (!data || !data.access_token) throw new Error((data && data.error) || "Google sign-in failed");
  const res = await sb().auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
  if (res.error) throw res.error;
  return res.data.user;
}

// Create a confirmed account (no confirmation email needed), then sign in.
export async function signUpWithPassword({ email, password, fullName, role, learnFrom }) {
  const { data, error } = await sb().functions.invoke("auth-bridge", { body: { action: "signup", email, password, full_name: fullName, role, learn_from: learnFrom } });
  if (error) throw new Error(await bridgeError(error));
  if (data && data.error) throw new Error(data.error);
  const res = await sb().auth.signInWithPassword({ email, password });
  if (res.error) throw res.error;
  return res.data.user;
}

async function bridgeError(error) {
  try { const body = await error.context.json(); if (body && body.error) return body.error; } catch {}
  return error.message || String(error);
}

export const GOOGLE_ICON = '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

// A "Continue with Google" button plus an "or" divider; hidden unless Google sign-in is available here.
export function googleBlock({ role, learnFrom, label = "Continue with Google", orLabel = "or", onSignedIn, onError }) {
  const wrap = document.createElement("div");
  wrap.className = "google-block hidden";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn ghost block google-btn";
  btn.innerHTML = GOOGLE_ICON;
  btn.append(document.createTextNode(label));
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try { onSignedIn(await signInWithGoogle({ role, learnFrom: learnFrom() })); }
    catch (e) { if (!/popup-closed|cancelled-popup/i.test(String(e && (e.code || e.message)))) onError(e); }
    finally { btn.disabled = false; }
  });
  const or = document.createElement("div");
  or.className = "or"; or.textContent = orLabel;
  wrap.append(btn, or);
  googleAvailable().then(ok => { if (ok) wrap.classList.remove("hidden"); });
  return wrap;
}

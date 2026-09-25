// auth-bridge: account creation without email confirmation, and
// "Continue with Google" through Firebase Authentication.
//
//   POST { action: "signup", email, password, full_name, role, learn_from }
//     -> creates a confirmed Supabase user; the client then signs in with the password.
//   POST { action: "firebase", idToken, role, learn_from }
//     -> verifies a Firebase ID token (Google sign-in), finds or creates the
//        Supabase user with that verified email, and returns a Supabase session.
//
// The Firebase project is pinned to whatever project serves
// https://learnkyrgyz.web.app, so tokens from other Firebase projects are rejected.
import { createClient } from "npm:@supabase/supabase-js@2";
import * as jose from "npm:jose@5";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const JWKS = jose.createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

let project: { id: string; at: number } | null = null;
async function firebaseProjectId(): Promise<string> {
  if (project && Date.now() - project.at < 3600_000) return project.id;
  const r = await fetch("https://learnkyrgyz.web.app/__/firebase/init.json");
  if (!r.ok) throw new Error("Google sign-in isn't set up yet (no Firebase web app found).");
  const cfg = await r.json();
  if (!cfg.projectId) throw new Error("Google sign-in isn't set up yet.");
  project = { id: cfg.projectId, at: Date.now() };
  return project.id;
}

const cleanRole = (r: unknown) => (r === "teacher" ? "teacher" : "student");
const cleanLang = (l: unknown) => (l === "ru" ? "ru" : "en");
const cleanName = (n: unknown, email: string) => (typeof n === "string" && n.trim() ? n.trim().slice(0, 80) : email.split("@")[0]);

async function sessionFor(email: string) {
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error) throw error;
  const token_hash = data.properties.hashed_token;
  const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  let res = await anon.auth.verifyOtp({ token_hash, type: "email" });
  if (res.error) res = await anon.auth.verifyOtp({ token_hash, type: "magiclink" });
  if (res.error || !res.data.session) throw res.error || new Error("Could not create a session");
  return { access_token: res.data.session.access_token, refresh_token: res.data.session.refresh_token };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  try {
    if (body.action === "signup") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Please enter a valid email." }, 400);
      if (password.length < 6) return json({ error: "Password must be at least 6 characters." }, 400);
      const { error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { role: cleanRole(body.role), full_name: cleanName(body.full_name, email), learn_from: cleanLang(body.learn_from) },
      });
      if (error) {
        if (/already|registered|exists/i.test(error.message)) return json({ error: "An account with this email already exists. Please sign in." }, 409);
        throw error;
      }
      return json({ ok: true });
    }

    if (body.action === "firebase") {
      const projectId = await firebaseProjectId();
      const { payload } = await jose.jwtVerify(String(body.idToken || ""), JWKS, {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
      });
      const email = String(payload.email || "").toLowerCase();
      const provider = (payload.firebase as { sign_in_provider?: string } | undefined)?.sign_in_provider;
      if (!email || payload.email_verified !== true || provider !== "google.com") return json({ error: "Google account email is not verified." }, 401);
      const { error } = await admin.auth.admin.createUser({
        email, email_confirm: true,
        user_metadata: { role: cleanRole(body.role), full_name: cleanName(payload.name, email), learn_from: cleanLang(body.learn_from), avatar_url: payload.picture || null },
      });
      if (error && !/already|registered|exists/i.test(error.message)) throw error;
      return json(await sessionFor(email));
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("auth-bridge", msg);
    return json({ error: /jwt|signature|token|claim/i.test(msg) ? "Google sign-in could not be verified. Please try again." : msg }, 400);
  }
});

// Public client configuration. The publishable key is safe to ship: every
// table is protected by row-level security in supabase/migrations.
export const SUPABASE_URL = "https://lzamxwqxnzcrazyuipjx.supabase.co";
export const SUPABASE_KEY = "sb_publishable_zSvDRXqxLlW1tuaoJ06PUw_Tges-7OG";

// On Firebase Hosting each app lives on its own *.web.app site; anywhere
// else (GitHub Pages, local server) they are sibling folders.
const onWebApp = location.hostname.endsWith(".web.app") || location.hostname.endsWith(".firebaseapp.com");
const base = (() => {
  const p = location.pathname.replace(/(student|teacher)\/?(index\.html)?$/, "").replace(/index\.html$/, "");
  return location.origin + (p.endsWith("/") ? p : p + "/");
})();
export const SITES = onWebApp
  ? { home: "https://learnkyrgyz.web.app/", student: "https://studentlrnkyrgyz.web.app/", teacher: "https://teachlrnkyrgyz.web.app/" }
  : { home: base, student: base + "student/", teacher: base + "teacher/" };

let client = null;
export function sb() {
  if (!client) {
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

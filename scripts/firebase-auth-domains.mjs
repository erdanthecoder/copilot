// Adds the LearnKyrgyz sites to Firebase Authentication's authorized domains,
// so "Continue with Google" works on all of them. Uses the service-account
// key from GOOGLE_APPLICATION_CREDENTIALS. Run by .github/workflows/firebase.yml.
import { GoogleAuth } from "google-auth-library";

const project = process.argv[2];
const wanted = ["learnkyrgyz.web.app", "studentlrnkyrgyz.web.app", "teachlrnkyrgyz.web.app", "erdanthecoder.github.io"];
const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
const client = await auth.getClient();
const url = `https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/config`;
try {
  const { data } = await client.request({ url });
  const current = data.authorizedDomains || [];
  const merged = [...new Set([...current, ...wanted])];
  if (merged.length === current.length) { console.log("Authorized domains already set:", current.join(", ")); process.exit(0); }
  await client.request({ url: `${url}?updateMask=authorizedDomains`, method: "PATCH", data: { authorizedDomains: merged } });
  console.log("Authorized domains now:", merged.join(", "));
} catch (e) {
  console.log("::warning::Could not update Firebase Auth authorized domains —", e.response?.data?.error?.message || e.message,
    "\nEnable Authentication (Google provider) in the Firebase console, then re-run this workflow.");
}

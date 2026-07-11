# Erdan's Notebook

A single-file, offline-first, rich-text writing app made for Erdan, with optional account sync across devices.

## Usage

Open `index.html` by double-clicking it (or opening it in any browser, including Safari on iPad). Everything — HTML, CSS, and JavaScript — lives in that one file. No install, no build step.

- Organize writing into **Notebooks → Sections → Pages** in the sidebar.
- Format text with the toolbar: headings, bold/italic/underline, bulleted/numbered lists, checklists, quotes, tables, highlight color, and text color.
- Work **autosaves** to the browser's local storage whenever it's available. If storage is blocked (private browsing, restricted settings, etc.), the app keeps working entirely in memory and shows a notice so you know to export.
- Use **Export** to download all your notebooks as one `.json` file, and **Import** to load that file back in — a manual backup/transfer option that always works, sync or no sync.
- Toggle **light/dark** theme from the sidebar.
- The app works with **no account at all** ("Continue without an account") exactly as it always has — local-only, fully offline.

## Account sync (optional)

Signing in syncs your notebooks between devices (e.g. a PC and an iPad) using Firebase (free tier): email/password or Google sign-in, and a Realtime Database document per account. It's offline-first — edits always land locally first and sync in the background when a connection is available; a blocked or failing network never stops you from writing.

To turn sync on, open `index.html` and fill in `FIREBASE_CONFIG` and (optionally) `GOOGLE_CLIENT_ID` near the top of the `<script>` block, in the "FIREBASE CONFIGURATION" section, using values from your own free Firebase project (Authentication with Email/Password + Google providers enabled, and a Realtime Database). Until those are filled in, the app runs exactly as before — no login screen, fully local.

Realtime Database security rules should restrict each account to its own data:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

Note: Google sign-in uses a redirect to Google's OAuth endpoint, which requires the app to be served from an `http(s)://` URL registered with Google (e.g. GitHub Pages) — it's hidden automatically when opened as a local `file://` page. Email/password sign-in works everywhere, including as a local file.

## Notes for maintenance

`index.html` is organized into clearly commented sections: Firebase configuration, local storage layer, state, data helpers, rendering, mutations, editor toolbar, export/import, theme, and account sync (Firebase Auth + Realtime Database, both called directly via `fetch()` against their REST APIs — no SDK download, so the file stays dependency-free). There are no build tools or external dependencies to update.

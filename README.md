# Obsition

A single-file, offline-first, rich-text writing app with a Notion/Obsidian-inspired sidebar, mind maps, and optional account sync across devices.

## Usage

Open `index.html` by double-clicking it (or opening it in any browser, including Safari on iPad). Everything — HTML, CSS, and JavaScript — lives in that one file. No install, no build step.

- Organize writing into **Notebooks → Sections → Pages** in the sidebar. Each notebook gets an automatic color dot; each page shows a breadcrumb trail above its title.
- Two page types: a **rich text document** (headings, bold/italic/underline, bulleted/numbered lists, checklists, quotes, tables, highlight color, text color) or a **Mind Map** (draggable, connectable idea nodes on a canvas — works with mouse or touch).
- Work **autosaves** to the browser's local storage whenever it's available. If storage is blocked (private browsing, restricted settings, etc.), the app keeps working entirely in memory and shows a notice so you know to export.
- Use **Export** to download everything as one `.json` file, and **Import** to load it back in — a manual backup/transfer option that always works, sync or no sync.
- Toggle **light/dark** theme from the sidebar.
- The app works with **no account at all** ("Continue without an account") — local-only, fully offline.

## Mind maps

Add a mind map page from a section's 🧠+ button in the sidebar. Double-click empty canvas space to add a node, drag a node's body to move it, drag the small blue dot on a node onto another node to connect them, and click a connection line to remove it. Mind map data lives in the same page object as everything else, so it rides along with autosave, export/import, and account sync automatically.

## Account sync (optional)

Signing in syncs your notebooks between devices using Firebase (free tier): email/password or Google sign-in, and a Realtime Database document per account. It's offline-first — edits always land locally first and sync in the background when a connection is available; a blocked or failing network never stops you from writing.

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

`index.html` is organized into clearly commented sections: Firebase configuration, local storage layer, state, data helpers, rendering, mutations, editor toolbar, mind map, export/import, theme, and account sync (Firebase Auth + Realtime Database, both called directly via `fetch()` against their REST APIs — no SDK download, so the file stays dependency-free). There are no build tools or external dependencies to update.

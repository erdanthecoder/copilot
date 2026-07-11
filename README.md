# Erdan's Notebook

A single-file, offline, rich-text writing app made for Erdan.

## Usage

Open `index.html` by double-clicking it (or opening it in any browser, including Safari on iPad). Everything — HTML, CSS, and JavaScript — lives in that one file. No install, no build step, no internet connection required.

- Organize writing into **Notebooks → Sections → Pages** in the sidebar.
- Format text with the toolbar: headings, bold/italic/underline, bulleted/numbered lists, checklists, quotes, tables, highlight color, and text color.
- Work **autosaves** to the browser's local storage whenever it's available. If storage is blocked (private browsing, restricted settings, etc.), the app keeps working entirely in memory and shows a notice so you know to export.
- Use **Export** to download all your notebooks as one `.json` file, and **Import** to load that file back in — this is how you move your writing between a PC and an iPad.
- Toggle **light/dark** theme from the sidebar.

## Notes for maintenance

`index.html` is organized into clearly commented sections: storage layer, state, data helpers, rendering, mutations, editor toolbar, export/import, and theme. There are no external dependencies to update.

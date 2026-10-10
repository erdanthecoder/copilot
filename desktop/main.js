// World Islands for Windows.
// A small, locked-down window around https://world-islands.web.app:
//  - the page has no access to Node.js or your files (sandbox + context isolation, no preload);
//  - it can only open World Islands and the sign-in pages it needs; any other link opens in your normal browser;
//  - only HTTPS (and secure WebSockets) are allowed, bad certificates are never accepted;
//  - only World Islands may use the camera and microphone (for phone calls and the mood camera), nothing else gets permissions;
//  - the app itself is protected by Electron fuses (no "run as Node", no debugging flags, the app files are checked).
const { app, BrowserWindow, session, shell, Menu } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const OFFLINE = path.join(__dirname, 'offline.html');
// the only local files the app may show: the offline page and the start-up splash (with its logo)
const LOCAL = new Set(['offline.html', 'splash.html', 'logo.png'].map(f => pathToFileURL(path.join(__dirname, f)).href));
const isOffline = url => { try { return url.split('#')[0] === pathToFileURL(OFFLINE).href; } catch (e) { return false; } };
const isLocal = url => { try { return LOCAL.has(url.split('#')[0]); } catch (e) { return false; } };

const HOME = 'https://world-islands.web.app/';
const GAME = new Set(['https://world-islands.web.app']);
// pages the game itself needs to open inside the window (sign-in)
const SIGN_IN = [/^https:\/\/flexihub\.web\.app$/, /^https:\/\/[a-z0-9-]+\.supabase\.co$/, /^https:\/\/([a-z0-9-]+\.)*google\.com$/, /^https:\/\/accounts\.youtube\.com$/, /^https:\/\/[a-z0-9-]+\.firebaseapp\.com$/];
const allowedPage = url => { try { const u = new URL(url); if (u.protocol !== 'https:') return false; return GAME.has(u.origin) || SIGN_IN.some(r => r.test(u.origin)); } catch (e) { return false; } };
const isGame = url => { try { return GAME.has(new URL(url).origin); } catch (e) { return false; } };
const openOutside = url => { try { const u = new URL(url); if (u.protocol === 'https:' || u.protocol === 'mailto:') shell.openExternal(u.toString()); } catch (e) {} };

app.enableSandbox();
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');
// smoother 3D: draw on the graphics card where possible and don't slow the game down in the background
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
if (!app.requestSingleInstanceLock()) app.quit();

let win, splash;
// a small branded window while the game loads
function showSplash() {
  splash = new BrowserWindow({ width: 520, height: 340, frame: false, resizable: false, movable: true, center: true, show: false, backgroundColor: '#0e1622', icon: path.join(__dirname, 'icon.png'), skipTaskbar: false,
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, devTools: false, javascript: false } });
  splash.webContents.on('will-navigate', e => e.preventDefault());
  splash.once('ready-to-show', () => splash.show());
  splash.loadFile(path.join(__dirname, 'splash.html'));
  splash.shownAt = Date.now();
}
function create() {
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 900, minHeight: 600,
    title: 'World Islands', backgroundColor: '#0e1622', icon: path.join(__dirname, 'icon.png'), autoHideMenuBar: true, show: false,
    webPreferences: {
      sandbox: true, contextIsolation: true, nodeIntegration: false, nodeIntegrationInWorker: false, nodeIntegrationInSubFrames: false,
      webSecurity: true, allowRunningInsecureContent: false, backgroundThrottling: false, webviewTag: false, experimentalFeatures: false,
      navigateOnDragDrop: false, spellcheck: false, devTools: !app.isPackaged, safeDialogs: true,
    },
  });
  // Google refuses to sign in inside apps that say "Electron"; look like the normal Chrome browser this window really is
  win.webContents.setUserAgent(win.webContents.getUserAgent().replace(/\s(Electron|world-islands)\/\S+/g, '') + ' WorldIslandsApp/' + app.getVersion());
  // show the game when it has drawn (at least ~1.5 s of splash so it doesn't flash)
  win.once('ready-to-show', () => {
    const wait = Math.max(0, 1500 - (Date.now() - (splash ? splash.shownAt : 0)));
    setTimeout(() => { win.maximize(); win.show(); if (splash && !splash.isDestroyed()) splash.close(); splash = null; }, wait);
  });

  const wc = win.webContents;
  wc.on('will-navigate', (e, url) => { if (!allowedPage(url) && !isOffline(url)) { e.preventDefault(); openOutside(url); } });
  wc.on('will-redirect', (e, url) => { if (!allowedPage(url)) { e.preventDefault(); openOutside(url); } });
  wc.on('will-attach-webview', e => e.preventDefault());
  wc.setWindowOpenHandler(({ url }) => {
    // sign-in popups stay inside a safe child window; everything else goes to the normal browser
    if (allowedPage(url)) return { action: 'allow', overrideBrowserWindowOptions: { autoHideMenuBar: true, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, devTools: false } } };
    openOutside(url); return { action: 'deny' };
  });
  wc.on('did-create-window', child => {
    child.webContents.on('will-navigate', (e, url) => { if (!allowedPage(url)) { e.preventDefault(); openOutside(url); } });
    child.webContents.setWindowOpenHandler(({ url }) => { openOutside(url); return { action: 'deny' }; });
  });
  // no internet: a friendly page with a "try again" button
  wc.on('did-fail-load', (e, code, desc, url, isMain) => { if (isMain && code !== -3 && !isOffline(url)) win.loadFile(OFFLINE); });
  // F11 fullscreen, Ctrl+R / F5 reload, Ctrl+= / Ctrl+- zoom
  wc.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
    else if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) { if (isOffline(wc.getURL())) win.loadURL(HOME); else wc.reload(); e.preventDefault(); }
    else if (input.control && (input.key === '=' || input.key === '+')) { wc.setZoomLevel(wc.getZoomLevel() + 0.5); e.preventDefault(); }
    else if (input.control && input.key === '-') { wc.setZoomLevel(wc.getZoomLevel() - 0.5); e.preventDefault(); }
    else if (input.control && input.shift && input.key.toLowerCase() === 'i') e.preventDefault();
  });
  win.loadURL(HOME);
  if (!app.isPackaged && process.env.WI_SELFTEST) selfTest(wc);
}

// developer check (never in the installed app): prove the rules hold, then quit
function selfTest(wc) {
  const log = (...a) => console.log('[selftest]', ...a);
  wc.on('did-finish-load', async () => {
    const url = wc.getURL(); log('loaded', url);
    if (!isOffline(url)) return;
    log('node in page?', await wc.executeJavaScript('typeof require + "/" + typeof process'));
    await wc.executeJavaScript('location.href = "file:///etc/passwd"').catch(() => {});
    setTimeout(async () => {
      log('after file nav', wc.getURL());
      log('popup to evil site', await wc.executeJavaScript('String(window.open("https://example.com/evil"))'));
      app.quit();
    }, 1500);
  });
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  const ses = session.defaultSession;
  // only HTTPS / WSS on the network; the offline page is the only local file
  ses.webRequest.onBeforeRequest((d, cb) => {
    const ok = /^(https|wss|data|blob|devtools):/.test(d.url) || isLocal(d.url);
    cb({ cancel: !ok });
  });
  // camera + microphone (calls, mood camera), fullscreen and pointer lock — and only for World Islands
  const GOOD = new Set(['media', 'fullscreen', 'pointerLock', 'clipboard-sanitized-write']);
  ses.setPermissionRequestHandler((wc, perm, cb, details) => cb(GOOD.has(perm) && isGame(details.requestingUrl || wc.getURL())));
  ses.setPermissionCheckHandler((wc, perm, origin) => GOOD.has(perm) && isGame(origin));
  ses.setDevicePermissionHandler(() => false);
  ses.on('will-download', e => e.preventDefault());
  showSplash();
  create();
});

// never accept a broken or fake HTTPS certificate
app.on('certificate-error', (e, wc, url, err, cert, cb) => cb(false));
app.on('web-contents-created', (e, contents) => { contents.on('will-attach-webview', ev => ev.preventDefault()); });
app.on('window-all-closed', () => app.quit());

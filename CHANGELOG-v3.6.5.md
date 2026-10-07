# Lexius v3.6.5 — Editor Stability & Security Update

## 🔧 Bug Fixes

### 1. Fixed Multiple Caret Instances on Editor Switch
**Problem:** Switching between Caret and Monaco editors (via the Personalization dropdown) would spawn multiple editor instances that accumulated in memory. Each switch left the previous instance alive, causing:
- Memory leaks
- Duplicate key handlers
- Unusable editor state

**Root Causes:**
- **`navbar.js`** — Nested event listener bug: the click handler for editor selection registered *another* click handler inside itself. Every click added a new handler, so `initEditor()` fired N times on the N-th click.
- **`langs.js.js`** — `initEditor()` lacked proper cleanup when switching editors:
  - Caret → Monaco: Caret instance never deleted
  - Monaco → Caret: Monaco not disposed; Caret creation skipped with a comment

**Fix:**
- **`assets/scripts/navbar.js`** — Flattened the nested `forEach`/`addEventListener` into a single handler per option element.
- **`assets/scripts/langs.js.js`** — Added symmetric cleanup in `initEditor()`:
  ```js
  // Clean up Caret before creating Monaco
  const caretInstance = getCaretInstance();
  if (caretInstance?.delete) { try { caretInstance.delete(); } catch {} }
  window.caretInstance = null;
  window.setCaretTheme = null;

  // Clean up Monaco before creating Caret
  if (window.editorInstance?.dispose) { window.editorInstance.dispose(); }
  window.editorInstance = null;
  ```

---

## 🔒 Security Hardening

### 2. Content Security Policy (CSP) Overhaul
**Problem:** The original CSP used `default-src 'none'` which blocked all external CDN resources the app depends on (unpkg, jsDelivr, Font Awesome, esm.sh, Monaco loader, etc.).

**Fix:** Updated the `<meta http-equiv="Content-Security-Policy">` in `index.html` to explicitly allow the required origins while keeping a restrictive baseline:

```html
<meta http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' https://unpkg.com https://cdn.jsdelivr.net https://kit.fontawesome.com https://esm.sh;
    connect-src 'self' https: blob:;
    img-src 'self' data: https:;
    style-src 'self' 'unsafe-inline' https:;
    font-src 'self' https: data:;
    frame-ancestors 'none';
  ">
```

> ⚠️ Note: `frame-ancestors` is ignored in `<meta>` tags — serve it via HTTP header in production.

---

## 🧭 Electron Local URI Support (`lexius://app/`)

**Problem:** Absolute paths like `/assets/styles/codicon.css` resolve to the filesystem root (`C:\` or `/`) under Electron's `file://` protocol, breaking asset loading.

**Solution:** Registered a custom `lexius` protocol that maps `lexius://app/<path>` → `<app-root>/<path>`.

**`main.js` changes:**
```js
const { protocol } = require('electron');
const path = require('path');

protocol.registerFileProtocol('lexius', (request, callback) => {
  const parsed = new URL(request.url);
  let filePath = decodeURIComponent(parsed.pathname); // /assets/...
  if (filePath === '/' || filePath === '') filePath = '/index.html';
  const target = path.resolve(__dirname, `.${filePath}`);
  // Security: prevent directory traversal
  if (!target.startsWith(path.resolve(__dirname) + path.sep) && target !== path.resolve(__dirname)) {
    return callback({ error: -6 });
  }
  callback({ path: target });
});

win.loadURL('lexius://app/');
```

**Result:** All `<link href="/assets/...">`, `<script src="/assets/...">`, `<img src="/assets/...">` in `index.html` now resolve correctly in both:
- Electron (`lexius://app/`)
- Web server (`web.js` serves from `./`)

---

## 📝 Files Modified

| File | Changes |
|------|---------|
| `index.html` | CSP meta tag rewritten to allow CDN origins |
| `main.js` | Custom `lexius://` protocol + `win.loadURL('lexius://app/')` |
| `assets/scripts/navbar.js` | Fixed nested click handler on editor-switch dropdown |
| `assets/scripts/langs.js.js` | Proper editor-instance cleanup in `initEditor()` |

---

## ✅ Verification Checklist

- [ ] Switch editor Caret ↔ Monaco multiple times — only one instance exists
- [ ] No console errors about duplicate editors or CSP violations
- [ ] All stylesheets, scripts, fonts, and images load in Electron
- [ ] `web.js` (HTTP mode) still works without protocol changes
- [ ] DevTools CSP tab shows no blocked resources (except `frame-ancestors` warning)

---

## 🚀 Upgrade Notes

No database migrations or config changes required. Simply pull and rebuild:

```bash
npm install
npm run build
```
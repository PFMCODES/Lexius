# Lexius v4.6 — Stability, Security & Electron Update

> A more stable editor, stronger security, and a proper Electron foundation.

## 🔧 Bug Fixes

### 1. Fixed Multiple Caret Instances on Editor Switch

Switching between **Caret** and **Monaco** could previously create multiple editor instances that stayed alive in memory.

This could cause:

* Memory leaks
* Duplicate keyboard handlers
* Broken editor state
* Increasing resource usage after repeated switching

This has now been fixed.

Editor switching now properly cleans up the previous editor before initializing the new one.

### 2. Fixed Editor Switch Event Handling

The editor selection dropdown had a nested event-listener issue that caused additional click handlers to be registered every time the option was clicked.

This meant that repeated switching could trigger `initEditor()` multiple times.

The event handling has been cleaned up so each option has a single click handler.

---

## 🔒 Security Improvements

### Content Security Policy Overhaul

Lexius now has a more practical and restrictive **Content Security Policy**.

The previous CSP was too restrictive for the resources Lexius actually uses, blocking required CDN resources such as:

* unpkg
* jsDelivr
* Font Awesome
* esm.sh
* Monaco resources

The new policy explicitly allows the required resources while keeping a restrictive baseline.

This also makes Electron development cleaner by reducing unnecessary CSP violations.

---

## 🖥️ Electron Support

### Lexius now has its own local URI

Lexius Desktop now uses:

```text
lexius://app/
```

instead of loading the application directly through `file://`.

This gives Lexius a proper application origin while allowing the existing web code to keep using normal root-relative paths.

For example:

```html
<link href="/assets/styles/codicon.css">
<script src="/assets/main.js"></script>
<img src="/assets/images/lexius.png">
```

These paths continue to work without needing separate Electron-specific paths.

The custom protocol maps:

```text
lexius://app/assets/main.js
```

to:

```text
<Lexius app root>/assets/main.js
```

This keeps the web and desktop versions much closer together.

### Why this matters

Lexius can now use the same `/assets/...` structure across:

* Web
* Electron

No rewriting paths just because the application is running on desktop.

---

## 🧹 Better Editor Lifecycle

Caret and Monaco now properly clean themselves up when switching engines.

### Caret → Monaco

The existing Caret instance is deleted before Monaco is created.

### Monaco → Caret

The existing Monaco instance is disposed before Caret is created.

This keeps editor switching predictable and prevents old instances from piling up.

---

## 📁 Files Modified

| File                         | Changes                                         |
| ---------------------------- | ----------------------------------------------- |
| `index.html`                 | Updated CSP policy                              |
| `main.js`                    | Added `lexius://` protocol and Electron loading |
| `assets/scripts/navbar.js`   | Fixed editor-switch event handling              |
| `assets/scripts/langs.js.js` | Added proper editor cleanup                     |

---

## ✅ Verification

The v4.6 update should be verified against:

* Switching Caret ↔ Monaco repeatedly
* Checking for duplicate editor instances
* Checking for memory leaks
* Checking Electron asset loading
* Checking stylesheets, scripts, fonts, and images
* Checking CSP violations
* Running the web version normally
* Confirming `/assets/...` paths continue working

---

## 🚀 v4.6

Lexius v4.6 is primarily about making the foundations stronger.

With **editor lifecycle fixes, improved CSP handling, and the new `lexius://` Electron origin**, Lexius is becoming more consistent across both web and desktop.

The goal isn't just adding more features.

It's making the features already in Lexius **actually behave properly**.

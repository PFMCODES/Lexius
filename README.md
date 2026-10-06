<p align="center">
  <img src="assets/images/favicon.svg" width="120" alt="Lexius logo">
</p>

# **Lexius — Code Editor**

**Lexius** is a lightweight, fast, and customizable code editor built with modern web technologies.

It focuses on speed, clarity, and providing a flexible development experience with support for multiple editor engines, workspaces, and integrated development tools.

---

## Features

- Clean and modern UI
- Multiple editor engines
- Monaco editor support
- Experimental Caret editor engine
- Fully working Workspaces
- Project names
- Run code directly inside Lexius
- Integrated terminal
- Notification and update system
- Upcoming feature and roadmap insights
- Available on Web and Desktop

---

## Editor Engines

Lexius currently supports two editor engines:

### Monaco

Monaco is the default editor engine and provides the stable editing experience in Lexius.

### Caret

Caret is Lexius' own editor engine and is currently experimental.

You can switch between editor engines through the **Personalization** option in the Lexius navbar.

Caret is actively being improved, with bug fixes and refinements planned for future releases.

---

## Workspaces

Lexius v4.5 includes fully working Workspaces.

Workspaces allow you to organize your projects and keep your development environment structured.

Projects can also have custom names, making it easier to identify and manage multiple projects.

---

## Running Code

Lexius supports executing code directly inside the editor.

### Supported languages

- Python
- JavaScript
- TypeScript
- Markdown
- SVG
- HTML

### Limitations

- Single-file execution
- No external libraries or modules
- Code runs in a sandboxed environment

---

## Integrated Terminal

Lexius includes an integrated terminal for working alongside your code.

The terminal can be opened directly inside the editor without requiring a separate terminal window.

---

## Notifications and Updates

Lexius includes a built-in notification system for delivering updates, announcements, and other information directly inside the editor.

The system also powers Lexius' update posts and upcoming-feature announcements.

The megaphone section provides a look at features currently in development and what's coming next.

---

## Platforms

### Web

- [Lexius](https://lexius.koreorg.com)
- [GitHub Pages](https://pfmcodes.github.io/Lexius/)

### Desktop

#### Windows

Download the latest release from the [GitHub Releases](https://github.com/PFMCODES/Lexius/releases) page. (Latest Version may take to come PC)

---

## Build Your Own Lexius

Lexius is **free and open source**, so you can customize and build your own version.

```bash
git clone https://github.com/PFMCODES/Lexius.git

cd Lexius

npm install

npm run web
npm run desktop
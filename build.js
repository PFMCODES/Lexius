window.addEventListener('DOMContentLoaded', () => {

  // Head Elements
  document.title = 'MineCraft'

  const metaCharset = document.createElement('meta')
  metaCharset.setAttribute('charset', 'UTF-8')

  const metaViewport = document.createElement('meta')
  metaViewport.name = 'viewport'
  metaViewport.content = 'width=device-width, initial-scale=1.0'

  const metaTheme = document.createElement('meta')
  metaTheme.name = 'theme-color'
  metaTheme.content = '#7E57C2'

  const linkManifest = document.createElement('link')
  linkManifest.rel = 'manifest'
  linkManifest.href = 'manifest.json'

  const linkFavicon = document.createElement('link')
  linkFavicon.rel = 'shortcut icon'
  linkFavicon.href = 'images/logo.svg'
  linkFavicon.type = 'image/x-icon'

  const linkCSS1 = document.createElement('link')
  linkCSS1.rel = 'stylesheet'
  linkCSS1.href = 'https://unpkg.com/monaco-editor@0.39.0/min/vs/editor/editor.main.css'

  const linkCSS2 = document.createElement('link')
  linkCSS2.rel = 'stylesheet'
  linkCSS2.href = 'styles.css'

  const linkCSS3 = document.createElement('link')
  linkCSS3.rel = 'stylesheet'
  linkCSS3.href = 'https://microsoft.github.io/vscode-codicons/dist/codicon.css'

  const scriptFirebaseApp = document.createElement('script')
  scriptFirebaseApp.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js'

  const scriptFirebaseAuth = document.createElement('script')
  scriptFirebaseAuth.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js'

  document.head.append(metaCharset, metaViewport, linkManifest, metaTheme, scriptFirebaseApp, scriptFirebaseAuth, linkCSS1, linkFavicon, linkCSS2, linkCSS3)

  // Body Content
  const topBar = document.createElement('div')
  topBar.className = 'top-bar'

  const topBarMain = document.createElement('div')
  topBarMain.className = 'top-bar-main'

  const logo = document.createElement('div')
  logo.className = 'logo'
  logo.innerHTML = `<img src="images/logo.svg" alt="logo" />`

  const file = document.createElement('div')
  file.className = 'file'
  const fileBtn = document.createElement('button')
  fileBtn.setAttribute('data', 'false')
  fileBtn.textContent = 'File'
  file.appendChild(fileBtn)

  const langPath = document.createElement('div')
  langPath.id = 'lang-path'

  topBarMain.append(logo, file, langPath)
  topBar.appendChild(topBarMain)

  const main = document.createElement('main')

  const sideBar = document.createElement('div')
  sideBar.className = 'side-bar'

  const topSide = document.createElement('div')
  topSide.className = 'top'
  topSide.innerHTML = `
    <button onclick="Run()"><i class="codicon codicon-play" aria-hidden="true"></i></button>
    <button onclick="search()"><i class="codicon codicon-search" aria-hidden="true"></i></button>
  `

  const bottomSide = document.createElement('div')
  bottomSide.className = 'bottom'
  bottomSide.innerHTML = `<button id="googleSignInBtn"><i class="codicon codicon-account"></i></button>`

  sideBar.append(topSide, bottomSide)

  const lexiusEditor = document.createElement('div')
  lexiusEditor.id = 'Lexius text-editor'
  lexiusEditor.className = 'Lexius'

  const editor = document.createElement('div')
  editor.id = 'editor'
  lexiusEditor.appendChild(editor)

  main.append(sideBar, lexiusEditor)

  document.body.append(topBar, main)

  // External scripts at end of body
  const scriptMonaco = document.createElement('script')
  scriptMonaco.src = 'https://unpkg.com/monaco-editor@0.39.0/min/vs/loader.js'

  const scriptSW = document.createElement('script')
  scriptSW.textContent = `
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('Service Worker Registered', registration))
        .catch(error => console.log('Service Worker Registration Failed', error));
    }
  `

  const scriptIndex = document.createElement('script')
  scriptIndex.src = 'scripts/index.js'

  document.body.append(scriptMonaco, scriptSW, scriptIndex)
})

// monacoLoader.js
let isLoaded = false;

export function loadMonaco() {
  return new Promise((resolve, reject) => {
    if (window.monaco && isLoaded) return resolve(window.monaco);

    // Load Monaco from CDN
    require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@latest/min/vs' } });

    require(['vs/editor/editor.main'], () => {
      isLoaded = true;
      resolve(window.monaco);
    }, reject);
  });
}

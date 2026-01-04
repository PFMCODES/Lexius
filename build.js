// build-themes.js
const fs = require('fs');
const { convertTheme } = require('monaco-vscode-textmate-theme-converter');

const dark = JSON.parse(fs.readFileSync('./assets/themes/dark.json', 'utf8'));
const light = JSON.parse(fs.readFileSync('./assets/themes/light.json', 'utf8'));

const lightMono = convertTheme(light);
const mono = convertTheme(dark);

fs.writeFileSync('./assets/themes/light-mono.json', JSON.stringify(lightMono, null, 2));
fs.writeFileSync('./assets/themes/dark-mono.json', JSON.stringify(mono, null, 2));
console.log('Themes converted and saved.');
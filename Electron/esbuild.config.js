// esbuild.config.js
require('esbuild').build({
    entryPoints: ['scripts/index.js'],
    bundle: true,
    minify: true,
    format: 'esm',
    outfile: 'scripts/dist/index.js',
    loader: {
      '.ttf': 'file',  // Handle font files (codicon.ttf)
      '.css': 'css'    // Handle CSS files (for Monaco's styling)
    },
    external: ['https://unpkg.com/monaco-editor@0.39.0/min/vs/loader.js'],  // Externalize Monaco's loader.js
  }).catch(() => process.exit(1));
  
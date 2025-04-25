const packager = require('@electron/packager');

(async () => {
  await packager({
    dir: '.', // source folder
    out: 'dist', // output folder
    name: 'Lexius',
    platform: 'win32',
    arch: 'ia32',
    icon: 'assets/icon.ico',
    overwrite: true
  });

  await packager({
    dir: '.',
    out: 'dist',
    name: 'Lexius',
    platform: 'linux',
    arch: 'ia32',
    icon: 'assets/icon.png',
    overwrite: true
  });

  console.log('✅ All builds complete!');
})();

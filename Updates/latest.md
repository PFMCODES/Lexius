# Lexius v4.6 — Stability, Security & Desktop Support

> A more reliable editor, improved security, and Lexius coming to your desktop.

## What's New

### Desktop Support Is Here

Lexius is now available as a desktop application for **Windows and Linux**!

You can use Lexius without relying on a browser, with dedicated desktop builds for your operating system.

**Available downloads:**

* **Windows:** Windows installer (`.exe`)
* **Linux:** Debian package (`.deb`), AppImage (`.AppImage`), and Snap (`.snap`)

Whether you prefer installing an application normally or running a portable AppImage, there's an option for you.

### Important: Filesystem Limitations

Filesystem functionality in the desktop version is **still incomplete and may not work correctly**.

Some file operations or workflows may behave unexpectedly. This release introduces desktop support, but filesystem functionality still needs further work.

Please keep this limitation in mind when trying Lexius Desktop.

## Improvements & Bug Fixes

### More Reliable Editor Switching

Lexius supports both **Monaco** and **Caret** as editor engines. Previously, switching between them could leave old editor instances running in the background.

This could lead to duplicate keyboard handling, unnecessary memory usage, or unexpected editor behavior.

Lexius now cleans up the previous editor before switching to the new one, helping keep the experience more stable.

### Fixed Editor Switching Issues

We fixed an issue where repeatedly clicking the editor selection option could trigger the switching process multiple times.

Editor selection should now behave more consistently, even when switching between engines repeatedly.

### Improved Security

Lexius has received improvements to its security rules, which control how scripts, styles, images, fonts, and other resources are loaded.

These changes help Lexius load the resources it needs while maintaining restrictions on what the application can access.

### A Better Desktop Foundation

The desktop version has been improved to handle application resources more consistently.

This also helps keep the web and desktop versions closer together, reducing the need for separate resource paths between the two environments.

## What This Means for You

* **Windows and Linux support:** Run Lexius as a desktop application.
* **Two editor engines:** Choose between Monaco and Caret through Personalization.
* **More reliable switching:** Reduced risk of duplicate editor instances and unnecessary resource usage.
* **Improved security rules:** Better handling of the resources Lexius uses.
* **Continued development:** Desktop filesystem functionality still needs improvement.

## What's Next?

Lexius v4.6 focuses on improving reliability while taking an important step toward a more complete desktop experience.

Desktop support is here, but there's still work to do. Filesystem functionality remains an area for improvement, and future updates will continue refining the experience.

**Lexius v4.6 — A step forward for Lexius on the desktop.**

## Downloads
[Download](/Downloads/)

### Direct Downlaods
Linux:
[.deb](/dist/lexius_4.6.0_amd64.deb)
[.AppImage](/dist/Lexius-4.6.0.AppImage)
[.snap](/dist/lexius_4.6.0_amd64.snap)

Windows:
[.exe](/dist/Lexius%20Setup%204.6.0.exe)
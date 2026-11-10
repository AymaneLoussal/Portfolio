# Ayman Loussal — Portfolio V5

A local, static portfolio built around three identities: **Development / Modeling / Football**. No deployment was performed.

## Run and edit

```powershell
node scripts/serve.mjs
# Open http://127.0.0.1:4173
```

The preview is already running if that address opens. Do not start a second server on the same port.

```powershell
npm.cmd run build
npm.cmd run check
npm.cmd test
```

Build regenerates [index.html](index.html) from [scripts/build-page.mjs](scripts/build-page.mjs) and [src/content.js](src/content.js). Browser tests require the preview server, installed Chrome, and the development dependencies (`npm.cmd ci` on a fresh checkout). Use `npm.cmd` on Windows if PowerShell blocks npm.ps1.

## Design and behavior

- **Home:** oversized typography, a preserved portrait, three gateways, and three interlocking metallic Three.js frames. Mouse movement and dragging explore the sculpture; touch retains native vertical scrolling.
- **Development:** technical dark surfaces, a toolkit, and three project case studies: ToolShare, FTMBALL, and source-reviewed LinkUp. Project graphics are conceptual illustrations, not application screenshots.
- **Modeling:** warm ivory editorial typography and an asymmetric five-photo gallery. Images keep their natural proportions. The lightbox supports arrows, keyboard, touch gestures, Escape, and focus restoration.
- **Football:** a stadium-green environment, Difaa Safi profile, and a Winger / Midfielder position explorer. The existing football image is labeled artwork. No performance statistics were invented.
- **Contact:** separate development, modeling, and football email subjects, plus the supplied GitHub and Instagram destinations. Email is aymanloussal552@gmail.com.

Three scroll-linked transition scenes connect the environments. Native scrolling drives CSS transforms and the current-world indicator; scrolling is never intercepted. Desktop scenes use sticky positioning. Mobile and reduced-motion layouts simplify the transitions. GSAP was unnecessary for these effects.

Sound is off on every visit and starts only after an explicit gesture. Each environment has a short synthesized tone palette. A single oscillator and gain envelope avoid overlapping voices; disabling sound fades and suspends audio. Hidden tabs suspend audio. Audible quality still needs human listening.

Contextual pointer labels, restrained magnetic links, project-art tilt, and a short skippable introduction complement the content. Pointer labels clear on scroll, window blur, and dialog opening. Drag instructions are hidden on touch devices and when WebGL is unavailable.

## Structure and performance

- [src/styles.css](src/styles.css): responsive layouts, typography, environments, and reduced-motion styles.
- [src/app.js](src/app.js): dialogs, gallery, mobile menu, position controls, clipboard, and pointer interactions.
- [src/journey.js](src/journey.js): scroll progress, section tracking, and reveal behavior.
- [src/sound.js](src/sound.js): opt-in audio lifecycle and palettes.
- [src/sculpture.js](src/sculpture.js): local Three.js sculpture, capped pixel ratio, visibility-aware rendering, static reduced-motion rendering, and context-loss fallback.
- [assets/](assets/): preserved images, local fonts, Three.js, and licenses.

Principal content exists in HTML without JavaScript. Below-fold images are lazy loaded with reserved dimensions. All runtime assets are local. The CSS sculpture remains when WebGL is unavailable. The preview server binds to loopback and blocks backup and node_modules access; it is a development server.

For static hosting, upload only index.html, favicon.svg, src/, and assets/. Configure compression and caching at the host. A production domain is needed before setting a canonical URL and absolute social-preview URL.

## Preservation and factual changes

The prior version is preserved in [backup/pre-v5/](backup/pre-v5/); the original source remains in [backup/index.original.html](backup/index.original.html). All seven original image files are preserved. Parkour, Four Dimensions, and Beyond Code were removed from the live presentation. Older project entries remain in the backup.

LinkUp was checked against its public [repository](https://github.com/AymaneLoussal/linkup), specifically [composer.json](https://github.com/AymaneLoussal/linkup/blob/main/composer.json), [routes](https://github.com/AymaneLoussal/linkup/blob/main/routes/web.php), and [PostController](https://github.com/AymaneLoussal/linkup/blob/main/app/Http/Controllers/PostController.php). These support the Laravel, posts, image-upload, profile, and social-route descriptions. They do not establish production readiness or individual contribution boundaries. No Reverb claim is made.

ToolShare and FTMBALL use supplied project facts; repository links and unsupported implementation details were not invented. An unverified LinkedIn destination and unavailable CV download are omitted.

## Verification

Validated on 2026-11-09 using installed headless Chrome. See [results](qa/results.json) and [browser checks](scripts/browser-check.mjs).

Checks cover responsive widths from 320 to 1440 pixels, project dialogs and keyboard focus, five-image gallery navigation and swipe-event handling, image loading, corrected contact links, clipboard, football positions, world navigation, sound state and palettes, native scroll progress, reduced motion, WebGL fallback, early intro dismissal, and JavaScript-disabled content. Static checks cover syntax, unique IDs, navigation targets, local assets, and preservation of original photos.

Screenshots: [desktop hero](qa/desktop-hero.png), [mobile hero](qa/mobile-hero.png), [modeling](qa/desktop-gallery.png), [football](qa/desktop-football.png), and [mobile lightbox](qa/mobile-lightbox.png).

No Lighthouse score is claimed. Safari, Firefox, screen readers, physical touch devices, and audible sound quality were not tested. The Three.js request failure in the report is deliberately injected to verify fallback behavior.

## Assets and details still needed

- Higher-resolution photo originals: existing copies are approximately 341–512 pixels wide.
- Real match photography or video for football; the current image is artwork.
- ToolShare and FTMBALL repositories, real screenshots, deployment links, and specific contribution details.
- A real CV PDF and production domain, if desired.

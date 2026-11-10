# Ayman Loussal — portfolio

A local-first static portfolio built around **Code / Presence / Discipline / Movement**. No hosting service, paid dependency, framework runtime, or deployment is required.

## Run locally

Requires Node.js 20 or newer. From this folder:

```powershell
node scripts/serve.mjs
```

Open **http://127.0.0.1:4173**. Stop the server with Ctrl+C. The VS Code **Preview portfolio** task runs the same command. No dependency installation is needed to view the site.

On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`:

```powershell
npm.cmd run build
npm.cmd run check
```

For the browser suite, keep the preview server running in another terminal, then:

```powershell
npm.cmd ci
npm.cmd test
```

The browser suite uses installed Google Chrome through Playwright. It needs permission to launch that browser. Other systems can change `channel: 'chrome'` in the test script to an installed supported browser.

## What changed

- Replaced the nested pill/card styling with a charcoal editorial layout, oversized typography, thin dividers, restrained blue accents, and distinct layouts for each dimension.
- Made development the opening focus, with project concept diagrams explicitly distinguished from screenshots.
- Preserved all seven existing image assets locally, alongside their original source URLs in [the asset manifest](assets/manifest.json). No faces or replacement photos were generated.
- Reused the original football SVG geometry and orbital-sculpture concept. Preserved project dialogs, gallery navigation, sound, mobile navigation, and clipboard interaction.
- Added the missing Four Dimensions navigation, a dedicated Parkour anchor, a short once-per-session introduction, pointer labels, subtle magnetic links, and keyboard/touch interactions.
- Removed the broken CV button. Added direct email access, useful metadata, and retained the original social addresses.

## Verified fixes

- Gallery images now use natural dimensions and `object-fit: contain`; responsive crop overrides are gone.
- Corrected mismatched portrait captions and identified the football image as artwork. Removed the unsupported airtime statistic and implied club affiliation.
- Project and gallery dialogs now contain keyboard focus, close with Escape, and restore focus to their opener. Gallery descriptions update with the image; arrows wrap, and swipe gestures advance the gallery.
- Mobile menu state is exposed through `aria-expanded`, closes after selection, and supports Escape.
- Tactical pitch nodes can be focused and activated by keyboard or touch. Their scaling now uses each node's own center.
- Sound starts off, initializes only after a user gesture, handles unsupported audio, and disconnects finished audio nodes. A saved preference never triggers automatic playback.
- Fixed a test-discovered 320px heading overflow and an early-intro-dismissal timer error.

## Architecture and performance

- [index.html](index.html): generated semantic page; all principal content exists without JavaScript.
- [scripts/build-page.mjs](scripts/build-page.mjs): editable page template. Uses the original pitch geometry from the preserved backup.
- [src/content.js](src/content.js): shared project/gallery content for the generated page and interactive details. Run the build after changing this file.
- [src/styles.css](src/styles.css): design tokens, responsive layouts, typography, and reduced-motion rules.
- [src/app.js](src/app.js): dialogs, gallery, navigation, cursor, pitch, clipboard, sound, and short entrance effects.
- [src/sculpture.js](src/sculpture.js): Three.js sculpture with a small procedural studio environment, capped pixel ratio, smoothed pointer movement, scroll response, visibility-aware rendering, dynamic reduced-motion handling, resize observation, context-loss fallback, and resource disposal.
- [assets/](assets/): original photographs, local fonts, Three.js, attribution/licenses, and the source manifest.
- [backup/index.original.html](backup/index.original.html): untouched pre-redesign source. The original favicon is backed up too.

Runtime Tailwind, external font requests, and external Three.js requests were removed. Below-fold images are lazy-loaded and reserve their natural aspect ratios. Native CSS and IntersectionObserver provide the restrained reveal effects; GSAP was not added because this design does not need pinned timelines or complex scroll orchestration. The CSS sculpture remains when WebGL is unavailable. Reduced motion preserves a static WebGL image when rendering is supported.

The local preview server is for development, binds to loopback, and does not serve the backup or node_modules directories. No publication was performed. A production upload should include only the generated page, favicon, src, and assets; enable compression and asset caching in the chosen host.

## Test results

Tested on 2026-11-08 with installed headless Chrome:

- **51 browser assertions passed.** See [the test report](qa/results.json) and [repeatable test script](scripts/browser-check.mjs).
- WebGL renders; reduced motion freezes the sculpture and changing the setting resumes animation.
- No horizontal overflow at **320, 390, 768, 1024, and 1440px**.
- Four project dialogs: matching content, keyboard focus wrapping, Escape dismissal, and restored focus.
- Gallery: previous/next wrapping, changing alternative text, mobile controls, touch-event swipe handling, focus restoration, and all seven images loaded with `contain`.
- Clipboard contents, sound on/off state, keyboard pitch interaction, mobile navigation, WebGL dependency failure, early intro dismissal, and JavaScript-disabled content checked.
- **No uncaught JavaScript errors.** The reported Three.js request failure is deliberately injected by the fallback test.
- Syntax/static checks passed: unique IDs, valid section targets, local asset existence, preserved images, no empty image URLs, and no fake CV control.
- Editor diagnostics found no errors in HTML, CSS, or application scripts.
- Desktop hero, mobile hero, and gallery screenshots were visually inspected. Saved captures: [desktop](qa/desktop-hero.png), [mobile](qa/mobile-hero.png), [gallery](qa/desktop-gallery.png), [mobile lightbox](qa/mobile-lightbox.png).

Limits: no Lighthouse/Core Web Vitals score is claimed. Safari, Firefox, a physical touch device, a screen reader, and audible sound quality were not tested. Swipe was tested by dispatching touch events. Social destinations and email ownership are retained from the original page, not independently identity-verified.

## Content that still needs your input

- **Project repositories and real screenshots:** ToolShare and FTMBALL use facts in your brief. EPS Education and FactoryFlow remain as clearly marked original archive entries. Prior claims about optimistic locking, Redis, production telemetry, automated maintenance, and deployment were not verifiable from this repository, so they are not presented as established facts.
- **Case-study depth:** specific contributions, real implementation challenges, verified features, and deployment links require each project's source and your account of the work. Contact links let visitors ask instead of sending them to fabricated repository URLs.
- **Other projects:** LinkUp, Smart Wallet, Aetherion, and KARI were candidates in the brief, but no screenshots, source, or links exist here. Add them once their content is available.
- **CV:** supply the real PDF before adding a download.
- **Photography:** the existing images are only around 341–512px wide. They are preserved without recompression, but higher-resolution originals would improve large displays.
- **Domain:** no canonical URL was invented. Once the real domain is known, add it and convert Open Graph image metadata to an absolute production URL.

The meaningful next step is enriching verified project case studies and replacing low-resolution image copies with your original files. These improvements will help recruiters more than adding further animation.

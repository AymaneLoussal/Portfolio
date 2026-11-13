# Football correction and navigation cleanup

Removed the world sidebar from the page generator, generated HTML, CSS, and scroll tracking. Removed the reserved main-content gutter and its compensating typography/layout rules. Desktop and mobile header links now share active-section tracking. Existing sticky header, anchors and mobile menu remain.

Football returns to a two-column desktop composition: a 440px-wide, approximately 587px-high contained image frame beside the profile. Mobile stacks one compact frame, profile and pitch. Artwork and original photograph crossfade within the same frame using native scroll progress. Both use contain; original files remain unchanged. Permanent full-image links work with keyboard, reduced motion and no JavaScript. Reduced motion keeps the artwork static and both full-image links available.

Opening, sculpture, sound and project data unchanged.

Changed application files: scripts/build-page.mjs, index.html, src/styles.css, src/journey.js.
Updated tests: scripts/browser-check.mjs, scripts/refinement-check.mjs, scripts/visual-polish-check.mjs, scripts/cinematic-check.mjs, scripts/football-photo-check.mjs.
Added screenshot helper: scripts/correction-capture.mjs.

Static checks, full browser suite, V5.1 regression suite and updated layout checks passed. Widths: 320, 390, 430, 768, 1024, 1280, 1440, 1920 plus zoom-equivalent sizes. Full browser suite confirms header navigation, world transitions, sound state, keyboard/gallery behavior and WebGL fallback with no unexpected page/console errors. Cinematic suite updated for contained framing and no-JS full-image links rather than sequential image visibility.

Desktop/mobile hero, modeling and football screenshots are in this directory. Desktop football inspection shows image and profile side by side, with no sidebar or right gutter. Mobile inspection shows compact image then profile. Compare with ../v5.2/ screenshots. Real mobile devices and browser-chrome zoom were not tested.

No Git write operations or deployment.

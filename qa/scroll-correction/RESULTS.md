# Scroll and navigation correction
Restored minimal world links without a panel, border or reserved gutter. Desktop uses the existing outer margin; <=1100px uses normal flow. Both header menus and world links share active-state updates. Contrast switches for modeling and transition backgrounds.

Why motion was subdued: progress previously spanned viewport plus bridge height, and background gradients were static. Active progress now spans the visible composition (38% viewport desktop, 35% mobile); RGB background interpolation, portrait reveal, headline movement and pitch perspective are tied directly to scroll. Existing bridge height is reduced to 90svh desktop; mobile remains 440px. Native scroll and reduced-motion fallbacks remain.

Football raw progress is remapped: 0–45% artwork, 45–75% smoothstep crossfade, 75–100% real photo. Compact frame, contain, original files and full-image links unchanged.

Changed: scripts/build-page.mjs, generated index.html, src/journey.js, src/styles.css, existing browser/refinement/layout tests; added scripts/scroll-scene-check.mjs. Opening, sculpture, content and sound unchanged.

Passed static checks, full browser suite, refinement checks, responsive layout checks and cinematic tests. New scene test captures all three bridges at 0/25/50/75/100% for desktop/mobile, asserts progress and differing rendered screenshots, verifies football opacity at holds/midpoint, and checks world link targets/active state. Navigation timing test now waits for active destination rather than assuming a long smooth scroll finishes in one second.

Visual review: desktop editorial changes dark→warm with a clearly revealed portrait; mobile stadium changes warm→green with pitch perspective. Scene and navigation foreground colors corrected after screenshot review. Screenshot byte differences alone do not establish perceptual quality; representative captures were inspected. No physical-device performance or screen-reader claim. No new dependencies, video or autoplay audio.

Evidence: stages.json, {1440,390}-{editorial,stadium,reconnect}-{0,0.25,0.5,0.75,1}.png; football stages and qa/results.json in this folder.
No commit, push, merge or deployment.

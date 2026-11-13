# Portfolio audit for review

Audit date: 2026-11-12. Scope: current source, generated page, local assets, scripts, existing checks, and headless Chrome inspection. This is an audit only; application code and existing assets were not changed. The observations below distinguish verified behavior from improvement hypotheses. Screenshots and a capture helper were created under `qa/review/`.

## Executive assessment

The portfolio has a coherent and distinctive visual identity: one oversized personal introduction leads into three visually different but related worlds. Its strongest qualities are the restrained dark hero and metallic sculpture, editorial modeling treatment, stadium-green football identity, and native, non-intercepted scrolling. The core information matches the supplied team, roles and contact details. Existing functional checks pass. The main priorities are accessibility and progressive enhancement, legibility of small text, better evidence for project and athletic claims, and measuring actual performance before changing motion.

## File tree and responsibilities

```text
index.html                    generated, directly served page
src/
  content.js                  project and five-image gallery data
  styles.css                  complete design, responsive rules, motion
  app.js                      menu, dialogs, gallery, pitch, clipboard, pointer UX
  journey.js                  scroll progress, active world, reveal observer
  sculpture.js                Three.js scene, input, lifecycle and fallback
  sound.js                    opt-in Web Audio synthesis and lifecycle
assets/
  three.min.js                local Three.js r128 (~603 KB)
  *.jpg                       original portraits, modeling, football and parkour images
  fonts/                      local Hanken Grotesk and JetBrains Mono TTFs/CSS
  manifest.json, *-OFL.txt, Three-MIT.txt
scripts/
  build-page.mjs              generates index.html from content.js and template
  export.mjs                  copies runtime files to dist/
  serve.mjs                   local loopback static preview on port 4173
  check.mjs                   static assertions and JS parsing
  browser-check.mjs           Playwright/Chrome functional checks and screenshots
  prepare-assets.mjs, prepare-fonts.mjs  asset preparation utilities
package.json, package-lock.json, vercel.json, favicon.svg, README.md
backup/                       original and pre-v5 files, not live runtime
dist/                         generated deployment output; may be stale until built
qa/                           previous QA evidence; qa/review/ contains this review
```

`node_modules/`, `.git/`, and editor configuration are not application source. The current page references local CSS, fonts, Three.js, data, sculpture, audio, journey and app scripts in that order with `defer`. `content.js` is consumed both by the generator and the browser for dialog and lightbox data. Therefore content edits require updating the source data/template and regenerating `index.html`; editing only generated HTML risks losing changes. `vercel.json` specifies the build/export pipeline. The preview server serves the workspace, excludes backup and node_modules, and is intended for local development. No build was run during this audit because it writes generated application files.

## Visual design and what to preserve

- **Hero:** enormous name, monochrome tilted portrait, three identity statements and interactive metallic nested frames form a recognizable personal composition. Three gateway links make the concept actionable. The locally rendered sculpture has a CSS fallback.
- **Typography and color:** Hanken Grotesk sans, JetBrains Mono metadata and italic Georgia contrast expressive headings with technical labels. The dark base `#090b10`, light text `#eeeef0` and periwinkle `#9db9ff` connect the page; modeling changes to warm ivory `#e6e0d4`, football to deep stadium greens. The alternation is a defining feature.
- **Hierarchy and spacing:** large headings, generous negative space, fine rules, numbered sections and asymmetric layouts create an editorial rhythm. Tiny 6–10px metadata and controls are a legibility concern even where intentional. Avoid solving it by flattening the hierarchy.
- **Development:** blue-black technical background, toolkit chips, three conceptual project artworks and case-study dialogs. The graphics are honestly labeled concept studies; preserve their visual language while adding real project evidence when available.
- **Modeling:** warm background, serif accent, staggered uncropped photographs and accessible lightbox. Maintain the different image proportions and quiet editorial pacing. Source photos are only roughly 341–512px wide, so enlarged images can be soft.
- **Football:** large solid/outlined type, green atmosphere, labeled illustration, factual player profile and interactive position diagram. The distinction between artwork and match photography is clear and should remain.
- **Contact:** concise paths for all three disciplines, prefilled email subjects, direct email, copy control and social links. It closes the narrative without a complex form.
- **Responsive:** at 760px and below the menu and layouts reflow, hero portrait and text share a row, sculpture moves below, content stacks and the world navigator becomes a fixed bottom pill. The navigator overlaps content in the mobile screenshots; it also has small labels and targets. Desktop fixed world indicators have weak visual contrast against the modeling background.

## Content and links

The live page states **Difaa Safi** and **Winger / Midfielder**, exactly as supplied. Email `aymanloussal552@gmail.com`, GitHub `https://github.com/aymaneloussal`, and Instagram `https://www.instagram.com/eeymee_en/` match the supplied values. Contact pathways generate distinct inquiry subjects. These are string and behavior checks; account ownership, delivery, current affiliation and external destination availability were not independently verified.

ToolShare is described as a Node/Express/MongoDB/Docker reservation API; FTMBALL as a Laravel team manager; LinkUp as a Laravel/PHP/Blade social app with a repository link. The data explicitly marks unverified detail and limits claims; preserve that honesty. Missing or weak evidence includes real product screenshots, public links or demos for the first two projects, specific individual contributions, outcomes, and verified technical decisions. Modeling would benefit from higher-resolution originals and, if the owner chooses, booking-relevant information and credits. Football has an illustration and generic role descriptions but no match photos, footage, playing history or independently supplied performance evidence. Do not invent statistics or personal details.

## Implementation and key functions

- `scripts/build-page.mjs`: `bridge()` constructs three transition scenes; template generates sections, project cards, gallery, position explorer and contact from `content.js`.
- `src/app.js`: intro dismissal; `closeMenu`; `openDialog`; project details assembled using `textContent`; `showImage` wraps gallery indexes; keyboard, touch and backdrop handlers; position buttons update pressed state, label and SVG description; clipboard feedback; decorative cursor, magnetic links and project tilt. Native dialogs restore focus and have an explicit tab loop.
- `src/journey.js`: `update()` calculates active world at 45% viewport height, sets `body.dataset.world`, `aria-current`, `--hero-progress` and bridge `--progress`; `schedule()` coalesces scroll/resize work into one animation frame. IntersectionObserver adds one-time `.reveal` to selected blocks.
- `src/sculpture.js`: Three.js extruded shared frame geometry, three metallic materials, procedural environment texture and lights; `render`, `tick`, `sync`, `resize`, `dispose` manage rendering. Observer pauses offscreen, hidden tab and reduced-motion continuous animation; CSS sculpture survives failures and context loss.
- `src/sound.js`: `play`, `hush`, one oscillator/gain, palette per active world; toggle owns Web Audio lifecycle.
- `src/styles.css` is compressed into long logical lines, so search selectors rather than assuming stable line numbers. It defines base tokens, section rules, transitions, `@keyframes`, breakpoints at 1100/760/370px and reduced-motion overrides.

## Scroll, motion and interaction

Scrolling is native; CSS smooth scrolling applies to anchor navigation. No wheel or touch scrolling is intercepted. There is no GSAP or ScrollTrigger dependency or use. Three natural-height bridges connect development→modeling, modeling→football and football→contact. Desktop uses a sticky stage with CSS-variable-driven grid perspective, headline movement, orbit, portrait and stadium light transforms. At mobile widths stages become relative and shorter; some transforms still depend on scroll. Reduced motion shortens bridges, removes sticky positioning, transforms and CSS animations, and makes the sculpture static. Note that this was verified for the tested conditions, not every runtime preference change and device.

Representative scroll implementation (`src/journey.js`):

```js
const progress = motion.matches ? .5 : clamp((height-r.top)/(height+r.height));
bridge.style.setProperty('--progress', progress.toFixed(4));
// scroll and resize schedule at most one pending requestAnimationFrame
```

The hero sculpture independently reads `scrollY / innerHeight`: frames spread and camera moves as the hero leaves. It responds to pointer position, and mouse dragging rotates it; touch retains vertical pan. On fine pointers, contextual labels follow the pointer, project art tilts and selected links move magnetically. A 1.75-second maximum intro can be skipped by early input. Reveal animations use opacity and translate; the football pitch switches highlighted SVG zones. Dialogs and menu provide standard interactions.

Potential costs, not measured bottlenecks: continuously rendered antialiased WebGL while the hero is visible; large transformed grid layers and transparency; backdrop blur on header/dialog; pointermove layout reads; and simultaneous hero/scroll rendering. Existing mitigations include pixel ratio caps (1.4 mobile/1.75 desktop), local assets, shared geometry, low-power preference, visibility observers, one-frame scroll scheduling and reduced motion. Mobile still renders WebGL, so profile real low-end devices before changing it. Tilt and reveal both set transforms on different elements currently; no observed conflict was demonstrated. Switching to reduced motion clears magnetic transforms but not inline tilt immediately; CSS `!important` suppresses it while reduced motion is active, and stale tilt could return if preference switches back without pointer leave. Test before fixing.

## Sound system

Sound defaults off on every load. The button creates/resumes an AudioContext after a gesture. A single continuously started sine oscillator feeds a gain envelope, so new gestures replace earlier tones instead of stacking voices. Approximate palette tuples are start Hz, end Hz and duration seconds: home `[220,330,.3]`, development `[520,260,.09]`, modeling `[392,440,.22]`, football `[160,90,.16]`, contact `[262,392,.28]`. Generic link/button clicks, dialog opening, enabling sound and `portfolio:world` changes trigger it. There are no prerecorded effects or adjustable user volume; gain targets are `.018` for interaction and `.012` for world changes. The button sets `aria-pressed`, changes its label, fades and suspends when off; hidden tabs suspend and page lifecycle handles closing/resuming. A localStorage value is written but never read, consistent with the default-off behavior.

```js
envelope.gain.setTargetAtTime(kind === 'world' ? .012 : .018, now + .025, .015);
envelope.gain.setTargetAtTime(0, now + duration, .03);
```

Browsers may suspend or reject Web Audio, particularly on mobile or background/restore; the toggle catches initial failure, but asynchronous resume failures after visibility changes are swallowed. A dialog opening invokes `play('open')` and the delegated click also invokes `play()`, immediately replacing the first envelope: this can change the intended attack. Rapid gestures similarly replace envelopes and may sound abrupt; no audible listening was performed. Sound is low-volume synthesis rather than a verified professional mix. Consider a listening pass, consistent loudness across devices, gesture deduplication and a user volume control only if useful, while retaining explicit opt-in and silence as the default.

## Prioritized recommendations

Difficulty and risk are estimates for a focused change, not measured effort.

### MUST FIX

1. **JavaScript-disabled controls appear actionable but do not work.** Current markup still displays the mobile menu, project detail, gallery, sound, clipboard and position buttons without JS; the existing no-JS test only checks content and fallback visibility, not those controls. Mobile navigation is hidden by CSS while its toggle cannot open. Provide usable static links/details or hide unavailable controls and expose a static mobile navigation when JS is absent. Files: `scripts/build-page.mjs`, `index.html` generated, `src/styles.css`, `scripts/browser-check.mjs`. Difficulty: medium; design risk: low if limited to fallback. Verified by source inspection; no-JS controls were not individually exercised in the suite.
2. **Fixed navigation and tiny text impair access.** The mobile pill overlays content, as visible in review screenshots, and several actual labels are 6–8px; desktop world markers are faint over ivory. Add safe spacing or context-aware positioning, enlarge interactive hit areas and essential labels, and check contrast against each world. Files: `src/styles.css`, possibly `scripts/build-page.mjs`. Difficulty: medium; design risk: low–medium. Screenshot observation; full WCAG contrast and target-size audit not performed.

### SHOULD IMPROVE

1. **Provide stronger work evidence.** Current project visuals are illustrative; two lack source/demo links and contributions/outcomes are unclear. Add verified project links, real screenshots and concise roles/results when supplied, retaining the concept-art treatment where appropriate. Files: `src/content.js`, `scripts/build-page.mjs`, assets. Difficulty: medium; design risk: low–medium.
2. **Upgrade supplied photography and football proof.** Gallery uses small images and football uses labeled art; gather approved higher-resolution originals and real match imagery or footage. Avoid invented claims. Files: assets, `src/content.js`, generator. Difficulty: medium, dependent on materials; design risk: low.
3. **Profile before optimizing.** Current scene and transitions have sensible safeguards but GPU/paint cost and battery impact are unknown. Measure frame times, memory and network on representative mobile hardware, then tune pixel ratio, effects or render cadence only where needed. Files: `src/sculpture.js`, `src/journey.js`, `src/styles.css`. Difficulty: medium; design risk: low–medium.
4. **Harden interaction lifecycle and sound.** One click may trigger both dialog and delegated audio; repeated gestures replace envelopes. Test sound audibly, deduplicate triggers, verify suspend/resume and clear tilt state when motion preferences change. Files: `src/sound.js`, `src/app.js`. Difficulty: low–medium; design risk: low.
5. **Improve maintainability and production metadata.** Minified-style source CSS and generated one-line HTML are hard to review; generated and source content can drift. Format source, add a non-mutating generation consistency check and, once a production domain exists, use absolute social image/canonical URLs. Current relative `og:image` may not work reliably in social crawlers. Files: `src/styles.css`, `scripts/build-page.mjs`, checks. Difficulty: medium; design risk: low if behavior preserved.
6. **Broaden real-world QA.** Existing tests cover useful paths but not screen readers, actual touch hardware, keyboard-only complete journeys, contrast, zoom, audio quality, Safari/Firefox or performance. Add targeted checks and manual sessions. Files: `scripts/browser-check.mjs`, QA documentation. Difficulty: medium; design risk: none.

### OPTIONAL CREATIVE ENHANCEMENTS

1. **Refine world transitions.** Existing bridge progress already drives grid, portrait and orbit; after profiling, subtly tune easing or add restrained color/light modulation rather than replacing the scroll architecture. Files: `src/styles.css`, `src/journey.js`. Difficulty: medium; design risk: medium. Preserve reduced-motion and native scroll.
2. **Add carefully authored sonic identity.** Existing five sine sweeps could evolve into a small matched palette with softer envelopes and subtle material character, tested by listening and kept opt-in. Files: `src/sound.js`, optional licensed assets. Difficulty: medium; design risk: low visually, medium to audio experience.
3. **Enrich position explorer or sculpture.** Current pitch changes highlighted zones and hero frames respond to drag. Optional subtle, nonessential position paths or interaction cues could improve discovery; keep static equivalents and reduced-motion mode. Files: generator, `src/app.js`, `src/sculpture.js`, `src/styles.css`. Difficulty: medium; design risk: medium.

## Verification and screenshots

- `npm.cmd run check`: **passed** on 2026-11-12. Checks unique IDs, anchors, local assets, original image presence, expected content, syntax and other assertions. The explicit command checks three named JS files; `check.mjs` separately parses all `src/*.js`.
- Existing `scripts/browser-check.mjs` ran from `qa/review/` against the locally served original page so historical QA files were not overwritten: **all assertions passed**. It checks Chrome WebGL, widths 320–1440, project dialogs and focus, gallery controls and synthetic swipe, image loads, clipboard, position control, world navigation, sound state, transition progress, reduced motion and static sculpture, deliberate Three.js request failure, and basic no-JS content. Its intentional aborted request is recorded as `net::ERR_FAILED`; unexpected HTTP errors, console errors and uncaught page errors were empty. Full result: `qa/review/qa/results.json`.
- Additional screenshots were taken in headless Chrome at 1440×1000 and 390×844, using viewport captures after scrolling each section into view. Some show the middle of a long section rather than its heading. They are snapshots, not proof of animation smoothness or real device behavior.
- Desktop: `qa/review/desktop-home.png`, `desktop-development.png`, `desktop-modeling.png`, `desktop-football.png`, `desktop-contact.png`. Mobile: `qa/review/mobile-home.png`, `mobile-development.png`, `mobile-modeling.png`, `mobile-football.png`, `mobile-contact.png`.
- Existing suite's review captures: `qa/review/qa/desktop-hero.png`, `desktop-gallery.png`, `desktop-football.png`, `mobile-hero.png`, `mobile-lightbox.png`.
- Not tested: audible output, physical touch, Safari, Firefox, assistive technology, production social crawlers, Lighthouse, frame rate or live external account availability. No deployment or build was performed. Screenshot automation does not establish visual behavior across all viewport sizes.

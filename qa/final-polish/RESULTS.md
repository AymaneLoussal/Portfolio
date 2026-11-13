# Final polish verification

Changed src/styles.css and added scripts/visual-polish-check.mjs. No content, photographs, sculpture or motion changes.

Desktop main content reserves a 144px right rail. The 112px navigator, including its labels, stays within that rail with room for keyboard outlines. This reduces available desktop content width; heading sizing and editorial introduction flow accommodate that space. Mobile retains normal-flow world navigation.

Gallery captions are 12px; technical labels are 11px. Copy-email and social links now have visible borders, larger text, and at least 44px height. Email controls wrap at narrow widths.

Passed:
- npm.cmd run check
- node scripts/refinement-check.mjs
- full scripts/browser-check.mjs (after/qa/results.json)
- node scripts/visual-polish-check.mjs (results.json)

Desktop widths: 1024, 1280, 1440, 1920. Mobile widths: 320, 390, 430. All five sections checked for horizontal overflow; desktop reserved-rail separation and keyboard focus checked; mobile world links, pitch buttons, copy, social and menu controls checked for 44px targets and horizontal clipping.
200% reflow equivalents checked at CSS widths 512, 640, 720 and 960. This is viewport-based zoom-equivalent testing, not manual browser-chrome zoom. Physical devices and assistive technology were not tested.

Before/after desktop and mobile screenshots of all five sections are in before/ and after/. Existing suite adds dialog/hero/gallery evidence under after/qa/. Screenshot review confirms the football navigator sits outside the content region. No commit, push or deployment.

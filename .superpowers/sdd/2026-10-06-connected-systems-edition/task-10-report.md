# Task 10 Report — Code, Performance and Static Responsive Audit

Status: DONE_WITH_CONCERNS — code/test work is complete; parent owns browser QA and production delivery.
Commit: cf47718 — Polish Connected Systems responsive experience

## Changes

- Added `tests/connected-systems-performance.test.cjs` with eight tests. Static artifact checks cover lazy/async/dimensioned below-fold images, existing local assets, local deferred scripts without async ordering races, one hero decoder with its retained poster, no eager static interlude hints, unchanged runtime dependency set, all chapter headings/copy, unique valid native fragment destinations, readable case panels, qualifier fallback, project-page assets and contact paths.
- Executed the real scene module against a small media/DOM boundary fixture across all eight scene selections, at both mobile and desktop source preferences. The test records actual source loads and head hints: startup requests nothing, every selection loads exactly its own clip and retains only its immediate successor hint, the final scene leaves no hint, slow decoding keeps the video hidden over its poster, and teardown clears hints/restores the hero poster. Reduced-motion traversal requests no interlude media; a failed scene clears its source/hint and leaves its slot readable, and the next selection recovers.
- Added negative controls that deliberately change imagery to eager, remove script defer, and remove the hero poster in memory. The same artifact checks reject all three mutations. These controls validate the tests; they do not modify production files.
- Wrapped the existing email and phone text in native `mailto:contact@avantageai.com` and `tel:+919270856871` anchors. This makes the contact endpoint actionable while online forms remain intentionally disabled. Existing visible details and focus rules are retained.
- `cinematic-preview.html` is the one justified file outside the Task 10 file list. The parent explicitly approved this change after the failing fallback check exposed the gap. No backend/form submission behavior was added.
- No CSS change was justified by the static audit. `connected-systems.css` and the existing `hero-network.test.cjs` remain unchanged. No new production dependencies or media files were added.

## RED / GREEN evidence

Before the contact markup change, ran `node --test tests/connected-systems-performance.test.cjs tests/hero-network.test.cjs` twice. Both runs: 9 tests, 8 pass, 1 fail. The sole failure was `fallback chapters, cases, qualifier and contact destinations are present before scripts execute`, because the email was plain text rather than a usable native contact link. The first assertion used a regex; it was rewritten as a parsed-anchor check to give a concise failure message. The final RED message was `email must remain actionable while online submission is unavailable`.

After adding the two native contact links, the same command passed: 9 tests, 9 pass, 0 fail. Existing performance contracts passed when first characterized; they did not require artificial production edits. The committed in-memory negative controls show that imagery/script/poster regressions are detected.

## Complete verification

- Initial `node --test tests/*.test.cjs`: 125 tests, 124 pass, 1 fail. The sole failure was the existing `preview serves video byte ranges, HEAD, and rejects invalid ranges`, caused by `connect EACCES 127.0.0.1:52284` under the sandbox loopback restriction.
- Repeated the complete command with approved localhost access: **125 tests, 125 pass, 0 fail**. Output saved in `task-10-suite.log`.
- The complete suite includes the real hero content factory without GSAP, reversible smooth-scroll behavior without GSAP or Lenis, reduced-motion poster/static content and pin removal, stalled media watchdog expiry, failed/missing clips, cached interlude resumption, navigation focus/hash restoration, qualifier recommendation/transfer, case disclosure and keyboard paths.
- `node --check` ran successfully for every top-level `dist/*.js` file and every `tests/*.cjs` file.
- `git diff --check` and `git diff --cached --check` passed. Only ordinary LF-to-CRLF notices were emitted.
- Reviewed the complete new test file and the two-line HTML change before staging. Staged only those two files and created the exact required commit. No deploy or push was performed.

## Static viewport audit

These are CSS/markup findings, not measured browser results. Width calculations assume the normal 16px root font. Each target still requires the parent's browser check.

| Target | Static findings and remaining browser emphasis |
| --- | --- |
| 390×844 | Chapter gutters are 24px, leaving 342px. Capability, agent, software-board and insights content stack; transformation pairs stack; case stories and qualifier stack. Map controls occupy two contained columns; all edition text inherits overflow wrapping. Actions stack and retain 44px minimum height; qualifier rows are 48px. Case heading/Close controls stack. Contact sections use one column; callback form retains sufficient width for the 250px submit minimum. Check actual hero header wrapping, sticky row keyboard scrolling and all long copy. |
| 768×1024 | 7vw gutters leave about 660px. Navigation becomes left aligned and scrolls internally. Software sidebar wraps above its board; insights use two columns plus a full-width summary; cases and qualifier stack. Capability cards remain three contained columns, roughly 209px each before padding. Map remains three columns. Check actual reading comfort in these denser tablet layouts; no fixed-width overflow defect was established statically. |
| 1440×900 | Chapter interior is capped at 1152px. Desktop capability/case grids use `minmax(0, 1fr)`; comparison columns clip only decoration and retain all labels. Qualifier columns contain wrapping component chips. Header, nav, CTA and contact layout need measured browser confirmation. |
| 1920×1080 | The same 1152px content cap prevents excessive reading width. Gutter caps at 112px. Media crops are contained by interlude overflow and height limits; project screenshots use width 100%, auto height and contain. Check visual pacing and actual handoffs at wide-screen size. |

Across all four targets: semantic chapters remain in normal flow, navigation owns its horizontal scroll, capability cards have `min-width: 0`, transformation content remains outside clipped decoration, case details use normal document flow, and the qualifier's fieldset/recommendation have contained columns. Reduced-motion CSS removes transforms/animation from decorative and chapter motion; the real runtime tests cover preference changes. Native CTA anchors resolve to actual sections; case project links resolve to existing local pages. Contact focus treatment comes from the existing visible anchor focus rule.

## Self review and remaining work

Reviewed source/hint budget, no extra decoder creation, poster ownership, mobile selection, cleanup, reduced-motion loading, failed-scene recovery, static asset availability, fragment uniqueness, no-JS case/qualifier availability, contact action paths, runtime dependency scope and all staged changes. The media fixture simulates browser boundaries; it does not measure bytes, decode timing or rendering. Static attribute checks do not substitute for layout measurements.

Parent still needs local checks at all four requested viewports, keyboard-only interaction, actual reduced motion, slow media/failed interlude/missing GSAP browser modes, console/network inspection, production deployment READY/alias validation, phone/desktop live smoke tests and authorized push.

Seven unsupplied chapter/finale clips remain intentional poster fallbacks, as recorded by earlier tasks. Forms remain disabled because no backend is in scope; the now-actionable email and phone provide direct contact alternatives. No browser screenshots, accessibility-tree inspection, measured overflow, real media playback or production checks are claimed here.

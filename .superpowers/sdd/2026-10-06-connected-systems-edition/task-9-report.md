# Task 9 Report — Finale, Lifecycle, and Accessibility

Status: DONE_WITH_CONCERNS
Commit: d7531b8b0f86d1882e5131e7371dbcbabb743c75 — Integrate Connected Systems experience (amended after review; replaces aa072818fe504c141918d5472b3c3361fdfc7cc0)

## Implementation

- Added the deferred `window.AvantageConnectedSystems.start(): {refresh(), destroy()}` coordinator. Startup runs once and repeated calls return the same live instance; destroy is idempotent and a subsequent start builds fresh owned components.
- Added the first keyboard skip link to the focusable semantic main, a persistent static screen-reader h1 containing the public page title, and decorative video ARIA treatment. The runtime hero headline is now h2 and retains its original desktop/mobile/short-screen sizing. This avoids duplicate or absent h1 states without coupling the primary heading to a hidden cinematic panel.
- Retained the exact finale statement and both exact CTAs. Added a static lime finale rule and generous finale spacing; the existing finale interlude remains connected through the scene spine.
- Added visible textarea, button and link focus rules, contact anchor offsets, and an independent reduced-motion rule for interlude/finale decoration. Semantic content stays in normal document flow. Existing component reduced-motion, offscreen and keyboard behavior remains delegated to its owners.
- Native skip, finale and contextual anchors now align, preserve history state and focus their targets without a second Lenis anchor jump. Modified clicks and new-window/download links remain native. Existing navigation, map, cases and qualifier retain their component-owned keyboard paths.
- Refresh coalesces media load/metadata, resize, pageshow, font readiness and ResizeObserver layout changes, covering case-panel expansion and recommendation reflow. Public refresh synchronizes ScrollTrigger, Lenis dimensions and chapter timelines. Teardown cancels the pending frame, disconnects its observer, removes all owned listeners, destroys owned components and releases their public instance references.
- Added reversible start/refresh/destroy methods to the existing smooth-scroll bridge, including ticker and preference/page lifecycle removal. Missing GSAP or Lenis leaves native scrolling. Made cinematic content timelines optional so missing GSAP no longer throws during hero initialization.

## Ownership graph

- Existing hero controller still owns its hero timeline/pin, seeker, story, stars and billboards. Its existing scene-enter/release protocol still yields and regains the shared video. It now publishes its existing scene controller as `AvantageScenes.instance`.
- Coordinator adopts that exact scene instance at initial startup. It never creates a second controller or video surface while that instance exists. After coordinator destruction, restarting creates a fresh scene instance against the same original video. The hero's retained old scene reference is safe because scene destruction is idempotent.
- Coordinator destroys and replaces the standalone instances of ChapterNav, SystemMap, Chapters, Transformation, CaseStudies and SystemBuilder before owning new callback-connected instances. The navigation standalone wrapper now releases its pagehide listener on direct destruction, matching the other five modules.
- Chapter navigation calls the shared scene controller using the scene lookup and activates the chapter. Map selection clicks the corresponding real chapter anchor, preserving its hash, sticky offset and focus behavior. Scene-enter events update navigation without moving focus. Chapters retain their own scene-hold listener.
- Qualifier continuation calls `AvantageBrief.applyRecommendation` and permits navigation only when it returns true. Component cleanup does not erase confirmed brief fields.
- Component observers own offscreen work: scene slots release borrowed media, map paths stop signals, and capability timelines pause outside readable content. These observers and chapter timelines are destroyed through their component APIs. The coordinator adds no continuous decorative timeline.
- Smooth scrolling remains one GSAP ticker and one Lenis instance. Coordinator destroy stops it and removes its listeners; restart re-enables it when motion and libraries permit.
- Cached page exits preserve coordinated component state; permanent exits destroy it. The isolated hero retains its established page lifecycle.

## Files and necessary integration scope

The six planned files were added/updated: connected-systems.js, cinematic-preview.html, connected-systems.css, smooth-scroll.js and the two new accessibility/lifecycle test files.

Four additional files were required by the existing implementation: cinematic-preview.js publishes the already-running scene owner; cinematic-content.js resolves the static/runtime heading and missing-GSAP gaps; chapter-navigation.js releases its standalone pagehide listener; cinematic-scenes.test.cjs verifies the real hero publishes its exact existing controller. The parent was informed before these bridge edits. No dependencies, backend, project content or media records changed.

## RED evidence

Initial required command: `node --test tests/connected-systems-accessibility.test.cjs tests/connected-systems-lifecycle.test.cjs`.

Result before production edits: 7 tests, 0 pass, 7 fail. Expected failures covered the absent skip/static heading, real content factory throwing on missing GSAP, absent coordinated page integration, missing coordinator/start/lifecycle/skip handling, and absent smooth-scroll destruction.

Additional ownership regression proof: ran `node --test --test-name-pattern="hero decoder yields|real standalone navigation" tests/cinematic-scenes.test.cjs tests/connected-systems-lifecycle.test.cjs` against the original HEAD versions of cinematic-preview.js and chapter-navigation.js, restoring the new files in a finally block. Result: 2 tests, 0 pass, 2 fail. Hero scene publication was undefined instead of the actual scene instance; direct navigation destruction retained one listener instead of zero. Both pass with the integration changes.

During implementation the default Python command was unavailable, so file substitutions used the existing Node runtime. One skip test initially asserted that focus was the last integration callback; it was corrected to assert exactly one focus with preventScroll independently of the later chapter callback. No product change was needed for that fixture expectation.

## Verification

Final focused required command: `node --test tests/connected-systems-accessibility.test.cjs tests/connected-systems-lifecycle.test.cjs` — 8 tests, 8 pass, 0 fail.

Expanded ownership check: the same two files plus cinematic-scenes.test.cjs — 22 tests, 22 pass, 0 fail. Includes actual scene/hero cooperation and reduced-motion pin reversion, plus coordinator callback ownership, idempotence, stale refresh safety, cached exit, destroy/restart, skip focus/history, native fallback, active Lenis teardown and preference changes, and real navigation standalone cleanup.

Initial complete suite inside the sandbox: 113 tests, 112 pass, 1 fail. Sole failure: `preview serves video byte ranges, HEAD, and rejects invalid ranges` with `connect EACCES 127.0.0.1:49672`, the existing loopback restriction.

Final complete command: `node --test tests/*.test.cjs` with approved localhost escalation — 114 tests, 114 pass, 0 fail. Output saved to task-9-suite.log. The final additional test accounts for the increased count.

- Syntax checks for connected-systems.js, smooth-scroll.js, cinematic-content.js, chapter-navigation.js and cinematic-preview.js exited 0.
- `git diff --check` and `git diff --cached --check` exited 0.
- Reviewed every tracked change plus the new coordinator and tests before staging. Approved Git escalation staged only the ten implementation/test files and created the exact requested commit. Normal LF-to-CRLF notifications were present.
- This report is written after the implementation commit, alongside the existing untracked SDD coordination files.

## Self review and limits

Reviewed one-video/controller ownership, startup callback order, all six standalone handoffs, scene mapping, brief confirmation order, native/modified links, keyboard focus and sticky offsets, static/runtime heading hierarchy, decorative exposure, timeline ownership, observer cleanup, queued callbacks, cached/permanent exits, repeated start/destroy, reduced-motion delegates and missing libraries.

Browser screenshots, actual screen-reader announcements, real Lenis navigation across every panel and measured four-viewport overflow are not claimed by these Node checks. They remain for Task 10/root browser verification. Earlier task evidence records that the in-app browser cannot be made visible from a subagent.

The seven unsupplied chapter/finale clips still use their intentional local poster fallbacks; this integration does not create or claim those missing assets. The intro prototype and stable hero assets remain intact. Essential chapter content, native links, comparisons, cases and contact information remain readable without scripts or video. Online form submission remains disabled as previously scoped.

No production deployment was performed.

## Review corrections — late layout alignment and cached interlude playback

The parent review identified two P2 issues. Both were reproduced before editing production code.

1. Coordinator-owned skip, finale and contextual links initially aligned only once, so delayed hero metadata/pin expansion could move their destination. The coordinator now retains the selected target/hash and corrects its position after its complete refresh, media/layout changes, and completed external ScrollTrigger refreshes. External refresh corrections run on the next animation frame after other resize listeners. Corrections are immediate and never repeat focus, history or selection callbacks. Wheel, touchstart, pointerdown or keydown cancels pending alignment and its queued frame. Hash changes replace or clear ownership; direct main hashes receive the same late-layout correction. Destruction cancels both refresh and alignment frames and removes the additional input/hash/ScrollTrigger listeners.

2. The hero pauses the shared video during a persisted pagehide, but the unfinished scene previously kept its playback state and watchdog. The scene controller now exposes suspend()/resume() for lifecycle coordination. Suspension pauses the borrowed surface, clears its watchdog/preload hint and invalidates pending playback promise callbacks. Resume preserves source, decoder, controller and currentTime; it plays only an unfinished, nonfailed scene with motion enabled, a visible document and a currently visible slot. Held/failed/reduced-motion states remain paused. An offscreen unfinished scene waits for its observer to see the slot again. Loading scenes continue through their existing metadata/decoded handlers. Successful resume rearms the watchdog from a fresh deadline, and metadata does not reset the position of an already-started scene. The coordinator calls these methods on cached pagehide/pageshow and document visibility changes. Scene playback remains owned by the scene module.

This adds cinematic-scenes.js to the necessary integration scope. No second media surface or scene controller was added.

RED command: `node --test --test-name-pattern="late hero pin|bfcache without|cached interludes" tests/connected-systems-lifecycle.test.cjs tests/cinematic-scenes.test.cjs`.

Result before fixes: 3 tests, 0 pass, 3 fail. The late-pin regression received no corrective scroll; a cached unfinished scene expired its watchdog while suspended; an offscreen restored scene also retained its running watchdog. The bfcache tests execute the actual hero, scene and coordinator modules together against the existing media/DOM boundary fixture, including a 16-second simulated cached stay, playback frame preservation, one observer/controller, held/failed/offscreen/reduced/hidden states, and the resumed watchdog deadline. The layout test covers both the main skip target and sticky-offset callback target, delayed pin growth during metadata refresh, an external refresh, one focus/history action, cancellation on user input and listener cleanup.

The first post-edit test run exposed a fixture omission: the combined hero/scene fixture had no window.location, now needed by initial hash restoration. Adding the browser location boundary fixed that setup without changing production hash behavior.

Final focused command: `node --test tests/connected-systems-accessibility.test.cjs tests/connected-systems-lifecycle.test.cjs tests/cinematic-scenes.test.cjs` — 25 tests, 25 pass, 0 fail.

Final complete command: `node --test tests/*.test.cjs` with approved localhost access — 117 tests, 117 pass, 0 fail. Final output replaces task-9-suite.log. Syntax checks for both changed production modules and both changed tests pass. `git diff --check` and `git diff --cached --check` pass. Reviewed the four-file correction and amended the original commit without changing its exact requested message. The current Task 9 commit is d7531b8b0f86d1882e5131e7371dbcbabb743c75. Browser QA and the previously stated missing-clip limitations remain unchanged.

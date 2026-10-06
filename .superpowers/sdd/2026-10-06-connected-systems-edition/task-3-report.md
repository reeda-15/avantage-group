# Task 3 Report — Edition Chapter Navigation

Status: DONE_WITH_CONCERNS
Commit: 74784e4 — Add edition chapter navigation (amended after review; replaces 14d3530)

## Implementation

- Added sticky edition navigation immediately before the overview with the seven exact labels and hashes: Overview, AI Agents, Automations, Custom Software, Data & Insights, Creative AI, and Our Work.
- Native anchors remain available without JavaScript, GSAP, Lenis, or media. Existing chapter scroll margins provide the no-JS offset.
- Added `window.AvantageChapterNav.create(root, {offset, onSelect})`, returning `setActive(id)` and `destroy()`; the same API is exported for Node verification.
- Selection calculates the chapter's document position minus the supplied numeric offset or the measured sticky bar height plus 16px. It uses the existing `AvantageScroll` bridge (and therefore Lenis when active), with native scrolling as the fallback. Reduced motion and direct hash restoration use immediate scrolling.
- Native keyboard activation uses the same anchor click path. Each explicit selection updates the URL through history, applies exactly one `aria-current="location"`, and focuses the semantic chapter with `preventScroll: true`.
- Direct hash restoration validates known chapter IDs, safely ignores malformed/unknown hashes, and responds to history hash changes. A restored hash remains eligible for layout correction through late hero metadata and deferred ScrollTrigger refreshes without repeating focus or selection callbacks. A coalesced animation frame corrects the position after the existing smooth-scroll refresh listener updates Lenis dimensions. User wheel, touch, pointer, or keyboard input cancels correction and any queued frame; a replacement hash establishes a fresh target.
- An IntersectionObserver updates active navigation without moving focus or calling selection hooks. Its activation band uses viewport-height pixel margins rather than percentages; observer state rebuilds on resize. Explicit chapter selection owns the active state through alignment until fresh user input, preventing an observer entry from the previous viewport from replacing the selected chapter. Every final hash alignment reapplies its active state.
- Scrollable links stay inside one contained mobile row, with visible focus, at least 44px link height, and a Lenis prevention marker for native internal scrolling. Wider screens center the row and expose all labels.
- The supplied `onSelect` receives the chapter ID. Exceptions from optional scene work are isolated after selection, so video failure cannot block navigation.
- Standalone deferred startup emits `avantage:chapter-select` with `{detail: {id}}`, exposes its instance as `AvantageChapterNav.instance`, preserves that instance for the browser back/forward cache, and destroys it on a permanent page exit. Task 9 can destroy this standalone instance before creating the coordinated instance.
- Destruction removes navigation, hash, resize, load, metadata, ScrollTrigger refresh, and input listeners; cancels queued alignment; disconnects the observer; clears observer and selection state; restores original active attributes; and makes subsequent controller calls inert.
- Preserved the existing hero, scene records, video/controller ownership, chapter text, callback and brief sections, and production dependencies. No later task content was added.

## Files

- `dist/chapter-navigation.js`
- `dist/cinematic-preview.html`
- `dist/connected-systems.css`
- `tests/chapter-navigation.test.cjs`

This report was written after the implementation commit alongside the existing untracked SDD coordination files.

## RED evidence

Initial command: `node --test tests/chapter-navigation.test.cjs`

Result: 8 tests, 0 pass, 8 fail before implementation. The semantic navigation and stylesheet assertions failed because the links/row were absent. The controller checks failed with the expected missing-module error for `dist/chapter-navigation.js`.

Self-review regression RED runs before the corresponding production fixes:

- `node --test --test-name-pattern='keyboard anchor' tests/chapter-navigation.test.cjs`: 1 fail. `cancelBubble` was false, permitting Lenis' global anchor handler to issue a second scroll without the sticky offset. Inspection of the bundled Lenis confirmed that its anchor handler does not check `defaultPrevented`.
- `node --test --test-name-pattern='default offset' tests/chapter-navigation.test.cjs`: 1 fail. The observer margin was `-80px 0px -60% 0px` instead of the height-based `-80px 0px -540px 0px` for a 900px viewport. IntersectionObserver percentage margins resolve against width, which can eliminate the activation band on wide screens.
- `node --test --test-name-pattern='late hero pin' tests/chapter-navigation.test.cjs`: 1 fail. The direct hash stayed at top 2520 after simulated late hero pin layout required top 20020. Added the one-time initial layout correction and user-input cancellation.

## GREEN and regression verification

Initial implementation required command: `node --test tests/chapter-navigation.test.cjs tests/smooth-scroll.test.cjs`

Result: 13 tests, 13 pass, 0 fail. The navigation file contributes 11 tests, covering semantic targets/labels/order, active state, keyboard activation, offset arithmetic, native and Lenis bridge branches, reduced motion, direct/history hashes, malformed hashes, late layout correction, observer behavior, callback execution/failure isolation, teardown, browser startup/events/back-forward cache, and contained row/focus CSS.

First full-suite sandbox run: 51 tests, 50 pass, 1 fail. The unchanged `preview serves video byte ranges, HEAD, and rejects invalid ranges` test could not connect to its temporary local server: `connect EACCES 127.0.0.1:56167`.

Initial implementation full-suite command: `node --test tests/*.test.cjs`, using approved escalation for the temporary localhost preview server.

Result: 54 tests, 54 pass, 0 fail after all navigation corrections and browser startup verification.

- `git diff --check`: exit 0.
- `git diff --cached --check`: exit 0 before commit.
- Reviewed the full page/CSS diff, navigation module, and tests. Only the four Task 3 files were staged.
- Initial staging encountered the protected `.git/index.lock`; approved escalation staged and committed the requested files with the exact requested message.
- Standard Git LF-to-CRLF notices were present; both whitespace checks passed.

## Self review

Reviewed native anchor behavior, keyboard focus, modifier clicks, same-hash history de-duplication, unknown IDs, reduced motion, sticky height measurement, observer selection and resize cleanup, no-observer navigation, optional hook failure, direct hash restoration after asynchronous hero layout, manual input cancellation, and permanent exit versus cached page handling. Initial additional tests caught and corrected Lenis' duplicate anchor processing, the width-dependent observer percentage margin, and the initial hash layout shift. Independent browser review then identified the deferred pin and stale observer defects described below; these required further corrections before final delivery.

## Review corrections and final verification

Independent browser review found two P2 issues: the metadata handler cleared restoration before ScrollTrigger's deferred pin expansion, and a predecessor's observer entry could replace `aria-current` before final alignment without a later threshold crossing to correct it.

RED command: `node --test --test-name-pattern='pin expansion during|observer delivery before' tests/chapter-navigation.test.cjs`

Result: 2 tests, 0 pass, 2 fail before production corrections. The pin expansion test observed applied top 20 instead of 30487 after a simulated scroll/pin layout change and deferred Lenis dimension update. The observer test found `null` rather than `location` on Creative AI after a stale Data & Insights entry arrived.

P2 position correction: metadata no longer completes restoration. Hash restoration remains eligible until user input or hash replacement. Initial restore, metadata, and page load schedule a coalesced animation frame; ScrollTrigger's `refresh` listener schedules another correction after pin layout and the existing smooth-scroll listener's Lenis resize complete. The regression expands the overview position during alignment, updates the scroll limit, dispatches refresh, and verifies top 30487. A later refresh with a further layout change verifies top 33020. Focus and selection callbacks occur only once. Manual wheel input cancels an already queued frame and prevents subsequent refreshes from restoring the hash.

P2 active-state correction: a selection ID prevents stale observer deliveries from changing the selected chapter until fresh user input. Final hash alignment explicitly reapplies `aria-current`. The regression delivers predecessor entries before metadata, before the refresh correction, and after final alignment, with no new intersection threshold crossing; Creative AI stays active. After manual input releases ownership, the observer can select Our Work normally.

Cleanup verification creates a pending refresh correction, destroys the controller, and verifies the queued frame is removed and later refresh events cause no scroll. Missing ScrollTrigger listener methods remain optional; native and reduced-motion branches stay usable.

Final required command: `node --test tests/chapter-navigation.test.cjs tests/smooth-scroll.test.cjs`

Result: 15 tests, 15 pass, 0 fail (13 navigation tests and 2 unchanged smooth-scroll tests).

Final full-suite command: `node --test tests/*.test.cjs`, using approved escalation for the temporary localhost preview server.

Result: 56 tests, 56 pass, 0 fail. `git diff --check` and `git diff --cached --check` both exited 0. Reviewed the final two-file correction diff and amended the implementation commit, preserving the exact requested message. The resulting commit is `74784e4`.

## Risks and limits

- As explicitly directed by the Task 3 brief, scene coordination is supplied through `onSelect`; standalone selections also emit the coordination event. The current hero privately owns the scene instance and its existing observer already activates visible scene slots. Task 9 still needs to wire the chapter hook to that owned instance's `goTo(id)` without allocating a duplicate scene controller. This task does not claim that a direct scene-instance bridge has been added.
- Node tests execute the real controller with browser-boundary fixtures and verify semantic/CSS contracts. Browser visual measurement of overflow, focus visibility, sticky behavior, and final media timing at the planned four viewports remains for Tasks 9–10.
- The Task 2 limitation remains: seven chapter clips have not been supplied and use posters. Navigation works independently of those assets.

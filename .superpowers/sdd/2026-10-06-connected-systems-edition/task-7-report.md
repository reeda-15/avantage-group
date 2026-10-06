# Task 7 Report — Work and Proof Stories

Status: DONE_WITH_CONCERNS
Commit: f87500c9927ea31c37c37c88e24533294fadfae9 — Turn Avantage work into proof stories (amended after review; replaces 2d4f8f1)

## Implementation

- Added three edition project cards and three semantic in-page articles to Our Work: BTP Travel CRM, Harshad Steel ERP, and VRC Plasto PLM. Each includes Friction, Connected solution and Outcome, client context, and an existing project destination. An all-projects link preserves access to the Works archive.
- All story text and native hash/project links are available without JavaScript. Close controls are styled out until enhancement initializes. JavaScript hides inactive articles and exposes at most one detail panel, with expanded state and control references on the originating links.
- Added `window.AvantageCaseStudies.create(root): {open(id), close(), destroy()}`, with the same Node export. A document or the component itself can be the root. Missing markup returns an inert interface.
- Pointer and native keyboard anchor activation open a story; Space is also supported. Escape within the component, the Close button, or a repeated selection closes it. Opening focuses and immediately aligns the labelled article; closing returns focus to its originating link. Panels remain non-modal in normal page flow.
- Native `#case-btp-travel-crm`, `#case-harshad-steel-erp` and `#case-vrc-plasto-plm` hashes work before enhancement and initialize the matching enhanced story. Hash and popstate events synchronize panel visibility without creating history entries. Explicit opening pushes only a new destination. Closing replaces the current case hash with the prior hash (or Our Work for a direct case arrival), preserves the pathname, query and existing history state, and never overwrites an unrelated component's hash. Unknown and malformed hashes are ignored safely.
- Existing smooth-scroll anchor delegation is contained at the component click boundary. Modified/new-tab links retain native browser behavior. No GSAP, motion preference API or animation API is needed; this component adds no continuous or other decorative animation.
- Images are local, lazy, dimensioned at their original sizes, and displayed at `width: 100%; height: auto; object-fit: contain`. Full screenshot bounds and embedded client marks are preserved. Cards and reading columns use contained `minmax(0, 1fr)` grids and stack below 900px; small-screen heading/Close rows also stack.
- Idempotent cleanup removes click, keydown, hashchange and popstate listeners, restores original visibility and attributes, and makes API calls inert. Deferred standalone startup exposes `AvantageCaseStudies.instance`; explicit destroy releases its pagehide listener and cached exits retain the instance for Task 9 takeover.

## Verified facts and asset inventory

Inventory was recorded in `tests/case-studies.test.cjs` before public copy was written. Sources: `build_content.py` lines 40–42; `dist/works.html` selected projects; and the hero, client facts and explanation in each corresponding `dist/projects/*.html` page. Existing assets were opened and visually inspected, and dimensions were read from their WebP headers.

| Project / client | Verified delivered scope | Existing visual |
| --- | --- | --- |
| BTP Travel CRM / Bharat Travel Point | Custom travel CRM and accounting unifying inquiries, bookings, customers, branches, payments and marketing channel performance | `dist/assets/project-btp.webp`, 1905×992: dashboard, branch overview and visible BTP identity |
| Harshad Steel ERP / Harshad Steel / Bhavana Hardware | Custom steel/hardware ERP covering inventory, sales bills, purchase bills, cash, customers, suppliers, roles and audit logs | `dist/assets/project-harshad.webp`, 1920×991: inventory interface and client identity |
| VRC Plasto PLM / VRC Plasto Mould | Product lifecycle management digitising RFQ, feasibility, quotation, APQP, trials, PPAP and SOP handover | `dist/assets/project-vrc.webp`, 1906×991: lifecycle stages and documentation interface |

The sources provide no documented historical failure, elapsed-time improvement, revenue impact, efficiency percentage, client quotation or measured result. Friction therefore describes the workflow requirement already established by the scope, without claiming that a particular client had scattered/manual systems. Outcome describes the delivered coverage, unification or digitisation. Screenshot figures are interface data and are not interpreted as achieved business results. No unsupported figures or client impact claims were added.

## Files

- `dist/case-studies.js` (new)
- `dist/cinematic-preview.html`
- `dist/connected-systems.css`
- `tests/case-studies.test.cjs` (new)

This report was written after the implementation commit in the existing untracked SDD coordination directory.

## RED evidence

Command: `node --test tests/case-studies.test.cjs`

Result before production implementation: 9 tests, 0 pass, 9 fail. The static-story check failed because `data-case-studies` and the stories were absent. Controller tests failed with the expected missing `dist/case-studies.js` module/file error.

The first implementation focused run had 7 passes and 3 failures. Inspection showed the browser-boundary fixture lacked the DOM's `id` property despite containing the ID attribute; adding the matching getter fixed the fixture. The production hash/control-reference logic did not change for those fixture failures.

## GREEN and regression verification

Required focused command: `node --test tests/case-studies.test.cjs tests/hero-image-motion.test.cjs`

Result: 10 tests, 10 pass, 0 fail. The case checks cover semantic readable scope and source destinations; required story parts and unsupported metrics; one-open state and accessible focus; pointer, native keyboard and Space; Escape/Close/toggle and focus return; modified links; direct/hash/popstate navigation; duplicate-history prevention; pathname/query/state preservation; unknown/malformed hashes; complete state restoration and listener removal; missing History API; and standalone/cached lifecycle ownership.

Initial full suite: `node --test tests/*.test.cjs`

Restricted sandbox result: 93 tests, 92 pass, 1 fail. Sole failure: `preview serves video byte ranges, HEAD, and rejects invalid ranges`, because the sandbox denied loopback with `connect EACCES 127.0.0.1:64608`. This is the same existing environment restriction reported by prior tasks.

Final full suite: `node --test tests/*.test.cjs`, with approved localhost escalation.

Result: 93 tests, 93 pass, 0 fail. Existing Tasks 1–6 checks pass without modification.

- `node --check dist/case-studies.js`: exit 0.
- `git diff --check`: exit 0.
- `git diff --cached --check`: exit 0 before commit.
- Reviewed the full four-file implementation and confirmed the existing project/Works pages, hero, contact sections and earlier modules remain unchanged.
- Approved Git escalation staged only the four implementation files and created the exact requested commit. Only ordinary LF-to-CRLF notices appeared.
- Post-commit status contains only the pre-existing untracked `.superpowers/` coordination directory.

## Self review and remaining integration limits

Reviewed source traceability, absence of invented before-state or business improvement claims, embedded screenshot identity, aspect ratios, static reading order, h2/h3/h4 hierarchy, panel labelling, no-JS links, one-open state, keyboard activation and Escape scope, focus return, modified clicks, hash validation, browser back/forward synchronization, repeated opens, close/history ownership, preserved history state, missing APIs, event containment, cleanup restoration, repeated destroy and the standalone lifecycle handoff.

Browser screenshots, measured viewport overflow, assistive technology announcements and real Lenis scrolling were not verified in this subagent. Phone/tablet/desktop visual and browser integration QA remain assigned to Tasks 9–10 and the root agent. Direct case hashes receive immediate alignment through the available scroll adapter, with native scrolling as fallback; late hero pin/layout changes should be checked during that integration QA, just as chapter hash alignment was checked in Task 3. No claim of verified late-layout positioning is made here.

Task 9 should destroy `AvantageCaseStudies.instance` before taking component lifecycle ownership and create a fresh instance against the case root. Since detail panels change document height, the coordinator should refresh layout after relevant interaction/media changes as planned.

No new production dependency, media generation, network asset, project-page rewrite or later-task qualifier/coordinator behavior was added.

## Review correction and final verification

Independent review identified one P2: opening used native `scrollIntoView` and closing relied on focus scrolling, which could conflict with an active Lenis momentum target. Both explicit movements now use the existing `AvantageScroll.scrollTo` bridge with `{immediate: true}`, then focus with `{preventScroll: true}`. Numeric document positions preserve compatibility with the bridge's native fallback. Each movement compensates for the sticky chapter navigation's measured height, nonnegative computed top and 16px breathing room; absent navigation uses the target's computed scroll margin. Positions clamp at zero. Without the adapter, instant native scrolling retains the same compensation, with `scrollIntoView` as a final limited-API fallback.

Regression tests were added before the correction. RED command: `node --test --test-name-pattern='alignment below sticky|without the adapter' tests/case-studies.test.cjs`. Result: 2 tests, 0 pass, 2 fail because neither expected adapter nor native alignment occurred. The test boundary was adjusted to record unexpected native calls rather than throwing inside an EventTarget listener, then this clean RED was observed before production editing.

Final required focused command: `node --test tests/case-studies.test.cjs tests/hero-image-motion.test.cjs`. Result: 12 tests, 12 pass, 0 fail. The two added regressions verify immediate adapter calls for both opening and closing while the adapter is active, sticky height/top compensation, no native competing jumps, focus without scrolling, equivalent instant native fallback, and clamping near the page start. Existing case and hero checks remain green.

Final full-suite command: `node --test tests/*.test.cjs`, with approved localhost escalation. Result: 95 tests, 95 pass, 0 fail. Full output is saved in `task-7-suite.log`.

`node --check dist/case-studies.js`, `git diff --check` and `git diff --cached --check` exited 0. Reviewed the two-file correction diff and amended the exact Task 7 implementation commit to `f87500c9927ea31c37c37c88e24533294fadfae9`; the requested commit message is unchanged. Post-amend status contains only the existing untracked `.superpowers/` coordination directory. Browser verification remains scoped to the later integration QA as described above.

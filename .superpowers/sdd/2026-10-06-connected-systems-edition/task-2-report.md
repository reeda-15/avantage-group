# Task 2 Report — Modular Cinematic Scene Spine

Status: DONE_WITH_CONCERNS
Commit: f648dea — Add modular cinematic scene spine (amended after review; replaces e86f304)

## Summary

- Added the exact eight scene IDs and chapter mappings, immutable scene metadata, frame validation, and ID/chapter lookup.
- Implemented `window.AvantageScenes.create(root, options)` returning `goTo(id)`, `preload(id)`, and `destroy()`.
- Reuses the existing `#journey` video element: a visible handoff slot borrows it, and leaving the handoff restores its original parent, source elements, attributes, and presentation. No second video element or preload decoder is created.
- Emits `avantage:scene-enter`, `avantage:scene-hold`, and `avantage:scene-exit` with exactly `{id, chapterId}` in detail. An additional `avantage:scene-release` event returns decoding ownership to the isolated hero controller.
- Added eight decorative handoff slots with local, lazy poster images. The intro handoff follows the stable hero and precedes the overview; its metadata maps to `stage`. The seven chapter slots precede their existing semantic text.
- Added matched crop, object position, opacity, lighting, and transform rules for content-to-video and video-to-content states. These affect decorative media only; semantic chapter content remains in normal flow.
- Restricts media preload hints to the immediate next record, replaces stale hints, chooses the mobile source at the existing 800px breakpoint, and removes hints on failure, motion changes, release, and destruction.
- Failed, stalled, unavailable, or motion-disabled media retain readable HTML and local posters. Reduced motion starts no scene media download. Playback rejection also yields to the poster.
- Suspends the hero seeker and autoplay/decoder handlers while a modular scene owns the shared video. Restoring its sources resumes hero decoding without recreating its scroll pin or timeline.
- A motion preference change kills and reverts the hero's pin immediately while the video is borrowed. The hero rebuilds its invalidated timeline only after its own media regains ownership.
- Uses one comprehensive cleanup of all seven controller state classes on activation, departure, and release, so previous slots retain no stale transition/fallback state after switches or destruction.

## Files

- `dist/cinematic-scenes.js`
- `dist/cinematic-scenes.css`
- `dist/cinematic-preview.html`
- `dist/cinematic-preview.js`
- `tests/cinematic-scenes.test.cjs`
- `dist/assets/cinematic-v2/connected-intro-kling.mp4` (Git LFS)
- `dist/assets/cinematic-v2/connected-intro-poster.jpg`

This report is written after the implementation commit, as requested by the brief, alongside the existing untracked SDD coordination files.

## Media evidence

The initial sandbox download failed with `curl: (6) Could not resolve host: d8j0ntlcm91z4.cloudfront.net`. Approved network escalation successfully downloaded the exact supplied Higgsfield clip to the local intro path. No CloudFront URL appears in runtime code or page markup.

`ffprobe` verified a 7,390,550-byte MP4, 1280×720, 24 fps, and 10.041667 seconds. Extracted and visually inspected its first frame as the 31,676-byte local poster. The inspected frame contains no readable text, logos, interface labels, or people.

Intro metadata uses start frame 0, hold frame 216, and exit frame 240 at the default 24 fps. The current production desktop/mobile hero source paths remain in the original HTML and are retained as a one-attempt intro error fallback before the controller uses its poster.

## TDD evidence

Initial RED: `node --test tests/cinematic-scenes.test.cjs`

Result: 9 tests, 0 pass, 9 fail. Expected missing module/controller and missing page integration failures; run before production scene code was written.

Implemented and verified pure validation/lookup first with `node --test --test-name-pattern='lookups' tests/cinematic-scenes.test.cjs`: 1 pass. Added intro retry and stall tests before DOM implementation; the next scene-file run had 2 passes and 9 expected failures because `create` and page integration were absent.

Additional focused RED evidence during integration/self review:

- Hero ownership test failed with `0 !== 1`: the existing hero seeker overwrote the scene start time. Added decoder ownership suspension and verified GREEN.
- Hero restoration test failed with `2 !== 1`: metadata restoration recreated the existing hero timeline. Added metadata restoration that preserves its pin and verified GREEN.
- Matching poster assertion failed with `null` versus `/posters/agents.jpg`. Updated activation to apply the record's poster and verified GREEN.

Initial implementation required command: `node --test tests/cinematic-scenes.test.cjs tests/cinematic-mobile-media.test.cjs tests/cinematic-time.test.cjs`

Result: 27 tests, 27 pass, 0 fail. The scene file contributes 12 tests, covering mappings, validation, single-surface ownership, frame holds, lifecycle detail and order, next-only preloads, mobile source changes, errors, missing video, reduced motion changes, production intro retry, stalls, cleanup, local integration, matching posters, and actual hero/controller cooperation.

## Regression verification

First full-suite run: 41 tests, 39 pass, 2 fail.

- `all chapters are readable ordered HTML without scripts or video metadata`: the Task 1 assertion rejects `aria-hidden="true"` anywhere inside a chapter, including decorative descendants. Replaced the decorative wrapper's hidden attribute with `role="presentation"` and retained empty image alt text; semantic content stays exposed and the unchanged shell test passes.
- `preview serves video byte ranges, HEAD, and rejects invalid ranges`: sandbox loopback restriction caused `connect EACCES 127.0.0.1:54890`.

Initial implementation full-suite command: `node --test tests/*.test.cjs`, with approved escalation for the temporary loopback preview server.

Result: 41 tests, 41 pass, 0 fail after the initial implementation and poster correction. Final review-fix verification is recorded below.

Additional verification:

- `git diff --check`: exit 0.
- `git diff --cached --check`: exit 0 before commit.
- Compared normalized hero stage, callback, and brief markup to the Task 1 HEAD: all unchanged.
- Confirmed one video element in the page, eight handoff slots, deferred scene script, local poster/media paths, and no new production dependencies.
- Git's standard LF-to-CRLF warnings are line ending notifications; whitespace checks returned no errors.
- Initial staging was denied by the protected `.git/index.lock`; approved escalation staged and committed the exact seven Task 2 files.

## Self review

Read the implementation, page diff, stylesheet, and tests. Reviewed source cancellation and restoration, source-element disabling to prevent failed media restarting hero downloads, immutable metadata and invalid frame rejection, unknown ID handling, preference changes, observer release, event details, async playback rejection generation checks, watchdog cancellation, and teardown idempotence. The hero bridge test exercises both production modules together, including the legacy autoplay handler and preservation of its existing timeline. No later navigation, capability demonstrations, system map, qualifier, case studies, or coordinator were implemented.

## Review corrections and final verification

Independent review found two gaps in the initial implementation: the hero's `configure()` guard skipped timeline teardown during scene ownership, and departing scene slots retained state classes that were not covered by the original cleanup assertions. Both findings were corrected in the same checkout using tests first.

RED command: `node --test --test-name-pattern='reduced motion removes|agents to automations' tests/cinematic-scenes.test.cjs`

Result: 2 tests, 0 pass, 2 fail before production fixes. The reduced-motion assertion failed with `true !== false` because the original hero pin remained active before scene release. The slot cleanup assertion failed with `loading: departing agents retains scene-exit`.

P2 correction: teardown now runs before the scene ownership guard. It kills the old ScrollTrigger with layout reversion, kills the timeline, and marks hero configuration invalid while deferring construction until the hero regains its media. The combined hero/scene test enables motion, borrows the video for agents, then enables reduced motion. It asserts immediate pin removal and timeline termination while the video remains in the scene slot, plus paused media, no active source, and poster fallback. It also toggles motion back on before release and verifies that the hero pin rebuilds only after its original media returns.

P3 correction: `clearSlot()` removes `scene-enter`, `scene-ready`, `scene-hold`, `scene-exit`, `scene-fallback`, `content-to-video`, and `video-to-content`. Every departure invokes it before selecting the next scene; activation and release use the same cleanup. The agents → automations → destroy test runs for loading, held, and failed-media states, verifies both visited slots and all other slots have no controller state classes, and verifies the base `chapter-transition` class remains intact.

Final required command: `node --test tests/cinematic-scenes.test.cjs tests/cinematic-mobile-media.test.cjs tests/cinematic-time.test.cjs`

Result: 29 tests, 29 pass, 0 fail (14 scene tests plus the unchanged existing mobile and timing tests).

Final full-suite command: `node --test tests/*.test.cjs`, with approved escalation for the temporary loopback preview server.

Result: 43 tests, 43 pass, 0 fail. `git diff --check` and `git diff --cached --check` both exited 0. Reviewed the final three-file correction diff before amending the implementation commit, preserving the exact requested commit message. The implementation commit is now `f648dea`; this report remains with the untracked SDD coordination files.

## Risks and limits

- Only the approved intro clip was supplied. The seven other scenes deliberately have empty desktop/mobile source strings and zero frame ranges, with the shared local poster as their fallback. The spine and replacement contract are implemented, but the final requirement for eight distinct visually matched generated clips and continuous matching footage remains outstanding. This task did not invent or generate those assets.
- The intro currently uses the same lightweight 7.4 MB prototype path for desktop and mobile. The controller selects distinct mobile sources when provided; tests exercise that selection and viewport changes. Dedicated mobile encodes can be supplied through the existing record contract.
- Browser visual/performance QA at the four planned viewport sizes is deferred to Tasks 9–10. Node tests exercise the real controller and hero modules with browser-boundary doubles; they do not measure browser decoding or visual continuity.
- Video preload link support varies by browser. A browser that ignores the hint still loads only the currently activated source; no additional media decoder is allocated.
- Future footage should use the controller's default 24 fps or pass the matching `fps` option. The pending records must be updated with their approved source paths, matching posters, and frame ranges when those assets are available.

# Task 4 Report — Avantage Operating System Map

Status: DONE
Commit: db4df87 — Create Avantage operating system map

## Implementation

- Added the semantic operating system map inside the existing overview, retaining the exact statement: `Your business already has the moving parts. We make them work as one.`
- A visually dominant Avantage AI hub connects six native chapter anchors: Think → AI Agents; Connect and Automate → Automations; Build → Custom Software; Understand → Data & Insights; Create → Creative AI. All descriptions and links exist in HTML before JavaScript. No third-party branding was added.
- Added six decorative SVG paths with `aria-hidden="true"` and `focusable="false"`. The selected path uses the existing lime signal color. Desktop arranges the six controls around the central hub; phones use a two-column grid beneath a full-width hub, with the decorative SVG suppressed. Controls retain the existing visible focus treatment and at least 120px height.
- Added `window.AvantageSystemMap.create(root, {onSelect}): {select(id), destroy()}` and the equivalent Node export. Selection maintains exactly one `aria-current="true"` capability and one selected signal path. The callback receives `(capabilityId, chapterId)`. Unknown IDs are ignored; initialization does not trigger navigation or callbacks.
- The factory owns map state and decoration only. Its supplied callback owns navigation. Standalone deferred startup activates the corresponding existing chapter navigation anchor, preserving Task 3's hash/history, sticky offset, focus, scroll bridge, reduced-motion and scene-selection callback paths. It also emits `avantage:system-select` with `{detail: {id, chapterId}}`. Without a navigation callback, anchors retain their native behavior. Modified or auxiliary clicks are preserved.
- IntersectionObserver allows signal animation only while the map intersects the viewport; document visibility and live reduced-motion preferences suspend it. Missing IntersectionObserver leaves a useful static map. Reduced-motion CSS independently suppresses animation.
- Destroy disconnects the observer, removes click/visibility/preference listeners, restores all original attributes, and makes later calls or stale observer delivery inert. The standalone instance also removes its pagehide listener on direct destruction so Task 9 can take ownership without retaining that listener. Cached page exits preserve the instance; permanent exits destroy it.
- Preserved the cinematic hero, Tasks 1–3, all chapter text, contact sections, scene spine, dependencies and static deployment structure. No later-task implementation was added.

## Files

- `dist/system-map.js` (new)
- `dist/cinematic-preview.html`
- `dist/connected-systems.css`
- `tests/system-map.test.cjs` (new)
- `tests/connected-systems-shell.test.cjs` (compatibility correction)

The Task 1 shell assertion previously rejected `aria-hidden` anywhere inside a chapter, including explicitly required decorative SVG. It now removes only SVG explicitly marked decorative before checking all remaining semantic content for hidden/inert treatment. Heading, chapter order, labels and readable text checks remain intact.

This report was written after the implementation commit alongside the existing untracked SDD coordination files.

## RED evidence

Initial command: `node --test tests/system-map.test.cjs`

Result: 8 tests, 0 pass, 8 fail. Map markup and CSS assertions failed because the map was absent. Controller checks failed with the expected missing-module error for `dist/system-map.js`.

Self-review regression command: `node --test --test-name-pattern='lifecycle listener' tests/system-map.test.cjs`

Result: 1 test, 0 pass, 1 fail before the corresponding production fix. Direct destruction left one standalone pagehide listener instead of zero. The standalone wrapper now releases this listener along with factory-owned resources.

## GREEN and regression verification

Required final command: `node --test tests/system-map.test.cjs tests/chapter-navigation.test.cjs`

Result: 22 tests, 22 pass, 0 fail (9 map tests and 13 existing chapter navigation tests).

The map tests exercise static semantic links and their actual target IDs; selected capability/path state; literal callback chapter mappings; keyboard-compatible activation; modified/auxiliary clicks; native fallback; viewport and document visibility; live reduced-motion changes; missing observer fallback; complete attribute/listener/observer teardown; standalone navigation delegation and event emission; cached/permanent page exit; coordinator handoff cleanup; mobile CSS containment; and reduced-motion CSS.

Additional focused command: `node --test tests/system-map.test.cjs tests/chapter-navigation.test.cjs tests/connected-systems-shell.test.cjs`

Result: 25 tests, 25 pass, 0 fail.

Initial sandbox full suite: 64 tests, 62 pass, 2 fail. Named failures:

- `all chapters are readable ordered HTML without scripts or video metadata`: the shell assertion false positive described above, corrected while preserving essential-content checks.
- `preview serves video byte ranges, HEAD, and rejects invalid ranges`: unchanged localhost sandbox restriction, `connect EACCES 127.0.0.1:59993`.

Final full-suite command: `node --test tests/*.test.cjs`, with approved escalation for its temporary localhost preview server.

Result: 65 tests, 65 pass, 0 fail.

- `git diff --check`: exit 0.
- `git diff --cached --check`: exit 0 before commit.
- Reviewed the full HTML/CSS/shell-test diff, new controller and tests. Only the five implementation/test files were staged.
- Approved escalation staged and committed the requested files because `.git` is protected. Standard Git LF-to-CRLF notices were present; both whitespace checks passed.

## Self review and limits

Reviewed callback ownership, native anchor semantics, existing navigation delegation, initial and unknown selections, modifier clicks, offscreen/hidden/reduced-motion animation, optional browser APIs, permanent versus cached page exits, restoration of prior DOM state, and coordinator handoff cleanup. The additional failing lifecycle regression caught and fixed the retained standalone pagehide listener before delivery.

Node tests execute the real controller at the browser boundary and verify the authored semantic/CSS contracts. Visual browser measurements of overflow, connection alignment, focus visibility and final motion at the four planned viewports remain part of Tasks 9–10; this task does not claim those browser checks. Task 2's missing chapter-clip limitation and Task 3's future scene-instance coordination requirement remain as previously reported. The map adds no media or scene ownership.

# Task 8 Report — Build Your System Qualifier

Status: DONE_WITH_CONCERNS
Commit: cf3a8f8c636dd088a10f41cb9ebbeaafb095ae78 — Add Build Your System qualifier

## Implementation

- Added the semantic Build Your System section between Our Work and the finale. Six labelled native checkboxes sit in a fieldset with a legend. A labelled recommendation region uses polite, atomic live announcements, a level-three heading, a component list and a plain summary. Reset is a native button; the exact continuation label is `Design this system with us`.
- Without JavaScript the needs, an illustrative combination, explanatory text and native brief link remain readable. Choices are disabled until enhancement initializes; Reset is hidden until functional. A noscript paragraph explains how to describe the needs in the brief.
- `window.AvantageSystemBuilder` and the equivalent CommonJS module expose `recommend(problemIds): {title, components, summary}` and `create(root, {onContinue}): {reset(), destroy()}`. The root can be the component or a document. Missing markup returns an inert interface.
- Recommendations use predefined local data, fixed problem/component ordering and component de-duplication. Empty, non-array, duplicate and unknown inputs are safe. The function does not mutate inputs; each result owns a fresh component array. Unknown input cannot enter the result. New rendering uses `textContent`, `createElement` and `replaceChildren`; there is no HTML interpolation or network request.
- Checkboxes immediately update the recommendation. Confirmation alone transfers it. Empty recommendations cannot advance; modified clicks retain native anchor behavior. Native checkbox and anchor keyboard activation require no custom key handlers. Reset clears only the chooser; confirmed brief data remains intact.
- `cinematic-content.js` now exposes `window.AvantageBrief.applyRecommendation(root, recommendation)` with an equivalent CommonJS export. Its existing cinematic story factory is unchanged apart from a browser guard so the bridge can be required in Node. It checks matching existing brief services, keeps unrelated selections and every other field, and appends the summary to existing textarea text. Reconfirming an identical summary does not duplicate it. Values containing markup remain plain textarea text.
- If appending would exceed the existing message maxlength, transfer returns false before changing either message or checkboxes. The qualifier explains that the visitor should make room and continue again. This preserves the existing validation boundary and all user text.
- Successful continuation immediately aligns the existing brief below the sticky chapter navigation, uses `AvantageScroll.scrollTo` when present and instant native navigation otherwise, then focuses the section with `preventScroll`. The component contains the click so Lenis cannot issue a competing anchor scroll. A new brief hash preserves existing history state and an already active brief hash creates no new entry.
- CSS uses two contained `minmax(0, 1fr)` columns, wrapping component chips, inherited edition focus treatment, 48px choice rows and a single column below 800px. The qualifier adds no animation; reduced motion requires no API or dependency.
- Cleanup removes all owned choice/action listeners, restores original static text, component nodes, checkbox states, fieldset disabled state, reset visibility and continuation ARIA state, and makes reset and stale handlers inert. Cleanup is idempotent. The standalone instance owns one pagehide listener, releases it on explicit destroy, and preserves cached page exits.

## Mappings

| Problem ID | Suggested components |
| --- | --- |
| `manual-work` | Workflow Automation |
| `disconnected-tools` | CRM Automation + Analytics Dashboard |
| `slow-support` | AI Agent + CRM Automation |
| `poor-reporting` | Analytics Dashboard |
| `custom-software` | Custom Software |
| `content-workflow` | Workflow Automation + AI Content Workflow |

Combined component order is AI Agent, Workflow Automation, CRM Automation, Custom Software, Analytics Dashboard, AI Content Workflow. Problem labels in the summary follow the six approved problem IDs in their declared order, independent of click/input order.

| Suggested component | Existing brief checkboxes |
| --- | --- |
| AI Agent | Task Automation |
| Workflow Automation | Task Automation |
| CRM Automation | Task Automation, Custom Software |
| Custom Software | Custom Software |
| Analytics Dashboard | Custom Software |
| AI Content Workflow | Marketing Automation |

The recommendation summary gives the more specific scope while the existing form keeps its broad service choices. Existing Web/App Development, E-Commerce and The Impossible selections are retained.

## RED evidence

Command: `node --test tests/system-builder.test.cjs`

Before production edits: 11 tests, 0 pass, 11 fail. Recommendation/controller checks failed because the new system-builder module was absent. Bridge checks failed because the existing browser-only content script could not export a CommonJS transfer interface. The static check failed because the semantic qualifier section was absent. These are the expected missing-feature boundaries.

First implemented focused run: 12 tests, 11 pass, 1 fail. The test fixture inserted an unknown checkbox after the controller had captured its owned inputs, then expected that late-added input to reset. Moving the fixture input before initialization corrected the setup. Production reset logic did not change for this fixture issue. Listener accounting was also added to the fixture so standalone lifecycle removal is asserted.

## GREEN and regression verification

Required command: `node --test tests/system-builder.test.cjs tests/hero-intro.test.cjs`

Result: 12 tests, 12 pass, 0 fail. Tests cover every mapping; full combinations; de-duplication and ordering; fresh arrays; empty, malformed, duplicate, prototype-like and unknown input; safe rendering with an HTML-rejecting DOM boundary; checkbox updates and reset; confirmation and callback scope; empty and modified clicks; adapter/native alignment and focus; failed transfer; cleanup and stale controls; matching brief selections and existing message preservation; duplicate-summary prevention; full-message handling; missing form; browser/CommonJS interfaces; cached/permanent page exits; and the accessible static shell.

Initial full command: `node --test tests/*.test.cjs`

Sandbox result: 106 tests, 105 pass, 1 fail. Sole failure: `preview serves video byte ranges, HEAD, and rejects invalid ranges`, caused by denied loopback access: `connect EACCES 127.0.0.1:60827`. This is the same existing restriction recorded by previous tasks.

Final full command: `node --test tests/*.test.cjs`, with approved localhost escalation.

Result: 106 tests, 106 pass, 0 fail. Tasks 1–7 checks pass without test changes.

- `node --check dist/system-builder.js`: exit 0.
- `node --check dist/cinematic-content.js`: exit 0.
- `git diff --check`: exit 0.
- `git diff --cached --check`: exit 0 before commit.
- Reviewed all five implementation files and the full tracked diff before staging. No existing form markup, validation attributes, disabled submission buttons, contact statuses, callback sections or prior module behavior changed.
- Approved Git escalation staged exactly the five Task 8 files and created the requested commit. Only ordinary LF-to-CRLF notices appeared.
- Post-commit status contains only the pre-existing untracked `.superpowers/` coordination directory. This report was written after the implementation commit in that directory.

## Self review and remaining integration limits

Reviewed pure mapping ownership, fixed ordering, input normalization, fresh result arrays, native keyboard semantics, live-region labels, safe DOM APIs, no-JS reading/link behavior, selection isolation, summary de-duplication, preservation of unrelated input, message-length validation, all owned listener removals, cached exits, reduced-motion independence, scroll adapter use, sticky offset, focus without scrolling, history-state preservation, responsive containment and unchanged earlier tasks.

Browser viewport screenshots, measured overflow, actual screen-reader announcements, real Lenis momentum, modifier behavior across browsers and full form interaction remain for Tasks 9–10 and the root agent. This subagent did not claim those browser checks. Existing brief submission remains disabled because no backend is in scope.

Task 9 should destroy `AvantageSystemBuilder.instance` before taking ownership and create a fresh instance. The default continuation automatically calls `AvantageBrief.applyRecommendation` and then navigates. Supplying `onContinue(result)` replaces the default transfer callback: the coordinator should call that bridge itself if it supplies a hook, returning false when the bridge returns false. Any other return permits navigation. Destroy restores the initial chooser state, so lifecycle takeover should happen during startup before user interaction. Confirmed brief fields are deliberately outside chooser cleanup and remain preserved.

No backend, live AI generation, later-task coordinator or production dependency was added.

# Task 5 Report — Edition Capability Chapters

Status: DONE
Commit: c018977 — Add Connected Systems capability chapters

## Implementation

- Expanded all five existing capability chapters while preserving their approved headlines, IDs, interlude slots, section order and native navigation targets.
- Each chapter now has one named semantic figure containing its main demonstration, three capability cards, one realistic illustrative scenario, one contextual contact/brief CTA and a next-chapter handoff.
- AI Agents demonstrates shared business context, support/research/reporting roles and human exception review. Automation presents the exact ordered `Lead → Qualification → CRM → Follow-up → Report` path, manual handoffs and an exception/delivery checkpoint. Custom Software demonstrates operations, client portal, internal tools and analytics views. Data & Insights connects source records to a reporting layer and source-linked summaries. Creative AI presents an original Avantage studio concept, an original decorative SVG visual, and brief/produce/review/deliver stages.
- All labels and copy are semantic HTML; demonstrations are explicitly labelled previews, concepts or examples. No unsupported client outcomes, metrics, external product marks, generated text, new dependencies or additional network media were added.
- Added shared feature, card, connection and handoff styling. Software provides a lighter editorial section with its own text/background palette; phone layouts stack the content vertically. Existing `.edition-chapter`, `.edition-feature`, `.capability-card` and `.chapter-transition` contracts are retained.
- Added `window.AvantageChapters.create(root): {activate(id), refresh(), destroy()}` and equivalent Node export. A chapter-scoped GSAP timeline follows label → headline → demonstration → cards → connection lines → handoff. Timeline ownership stays in the chapter module; the existing scene spine owns video.
- IntersectionObserver watches each chapter's readable `.systems-container`, excluding its leading cinematic poster. Motion begins only when that content container intersects the viewport. Offscreen or hidden-document timelines pause. Unknown IDs are ignored. Activation selects one chapter without scrolling or requiring media. `avantage:scene-hold` selects its mapped chapter; refresh invalidates active timelines and reconciles motion eligibility.
- Reduced motion is complete and static, including live preference changes. Missing GSAP or IntersectionObserver leaves readable content and useful native links. No content starts hidden. CSS independently enforces static reduced-motion styles.
- Idempotent teardown disconnects observers, removes media/document listeners, kills timelines, reverts GSAP inline styles and restores original active attributes. Deferred standalone startup retains a public instance for Task 9 ownership; direct destroy releases its pagehide listener, and cached exits preserve the instance.

## Files

- `dist/capability-chapters.js` (new)
- `dist/cinematic-preview.html`
- `dist/connected-systems.css`
- `tests/capability-chapters.test.cjs` (new)

This report was written after the implementation commit alongside the existing untracked SDD coordination files.

## RED evidence

Initial command: `node --test tests/capability-chapters.test.cjs`

Result: 7 tests, 0 pass, 7 fail. Static content checks failed for absent major demonstrations and workflow markup; controller tests failed with the expected missing-module error.

Self-review command: `node --test --test-name-pattern='light software' tests/capability-chapters.test.cjs`

Result: 1 test, 0 pass, 1 fail. The light section palette did not paint a section background. The correction explicitly applies both its local background and local text colour so inherited parent colours cannot undermine contrast.

## GREEN and regression verification

Required final command: `node --test tests/capability-chapters.test.cjs tests/hero-network.test.cjs`

Result after review correction: 10 tests, 10 pass, 0 fail (9 capability checks plus existing hero contract).

Initial sandbox full suite: 72 tests, 71 pass, 1 fail. Failure: `preview serves video byte ranges, HEAD, and rejects invalid ranges`, caused by sandbox localhost access (`connect EACCES 127.0.0.1:59006`). The suite passed 72/72 with approved localhost escalation before the additional contrast regression.

Final full-suite command: `node --test tests/*.test.cjs`, with approved localhost escalation.

Result after review correction: 74 tests, 74 pass, 0 fail.

- `git diff --check`: exit 0.
- `git diff --cached --check`: exit 0.
- Reviewed the four-file staged diff and file list before committing. Existing Tasks 1–4 tests pass without modification.
- Git stage/commit used approved escalation for the protected `.git` directory. Only normal LF-to-CRLF notices were present.

## Self review and limits

Reviewed content completeness and heading order, exact automation labels, real native CTA targets, no-JS visibility, unknown activation, repeated/late callbacks, viewport and document visibility, live reduced motion, optional browser APIs, GSAP scope/revert, cached exits and coordinator handoff. Self-review found and fixed the light chapter contrast issue with RED→GREEN evidence.

Browser inspection was attempted with the in-app browser. The sandbox preview initially timed out; after starting an approved host-accessible preview, the browser tool reported `IAB visibility is not supported in a subagent thread`. No visual screenshots, console measurements or viewport results are claimed. The root agent was informed and can use the temporary preview at `http://127.0.0.1:8765/cinematic-preview.html` (exec session 55092). Full four-viewport, keyboard and browser motion QA remains in Tasks 9–10.

Task 2's existing placeholder chapter clips remain unchanged; the new HTML demonstrations work independently of them. Task 9 still needs to take ownership of standalone component instances and scene coordination. No Tasks 6–10 implementation was added.

## Review correction — content entrance trigger

The parent review found that observing an entire chapter let a sliver of its leading cinematic poster start the content timeline while the actual label and headline were still offscreen. Changed the observation target and GSAP scope to the existing readable `.systems-container`; missing content groups stay static rather than falling back to the poster.

Regression: `a visible cinematic poster cannot start motion while readable content remains offscreen`. The fixture supplies distinct section/content geometry for the actual observed targets. With the poster visible and content offscreen, activation, refresh and a scene hold must leave the timeline uncreated; content entering then starts it.

RED command: `node --test --test-name-pattern='visible cinematic poster' tests/capability-chapters.test.cjs` — 1 test failed, actual timeline count 1 versus expected 0. After the fix, focused tests passed 10/10 and the full suite passed 74/74 with approved localhost access. Both diff checks passed. Existing reduced-motion, pause/resume and teardown tests now deliver observations for the actual content targets and remain green.

Amended the original Task 5 commit, retaining its exact message; `c018977` supersedes `2a8be29`. The four-file Task 5 scope is unchanged.

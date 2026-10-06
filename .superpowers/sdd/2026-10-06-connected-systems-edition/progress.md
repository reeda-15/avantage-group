# SDD ledger — plan: docs/superpowers/plans/2026-10-06-connected-systems-edition.md

## Baseline

- Branch: `codex/cinematic-hero`
- Starting commit: `5c475bebc1fd9f787437f71f96aa01330da28abc`
- Existing suite: 26 tests passed before implementation.
- Execution workspace: current project checkout.

## Preflight

| Task | Produces | Consumed by | Status |
| --- | --- | --- | --- |
| 1 | Semantic shell, stable IDs, shared CSS tokens | Tasks 2–10 | Clean |
| 2 | Scene API, events, media transitions | Tasks 3, 5, 9 | Clean |
| 3 | Chapter navigation API | Tasks 4, 5 | Clean |
| 4 | Operating system map callbacks | Chapter navigation | Clean |
| 5 | Capability chapter contracts | Tasks 6–9 | Clean |
| 6 | Transformation comparison | Task 9 lifecycle | Clean |
| 7 | Case study component | Task 9 lifecycle | Clean |
| 8 | System builder component | Task 9 lifecycle | Clean |
| 9 | Integrated coordinator | Task 10 | Clean |
| 10 | Responsive, performance, and production verification | Delivery | Clean |

## Self-check requirements

- Task 1: focused shell and existing intro tests.
- Task 2: scene, mobile media, and cinematic timing tests.
- Task 3: navigation and smooth scroll tests.
- Task 4: system map and navigation tests.
- Task 5: capability and hero network tests.
- Task 6: transformation tests.
- Task 7: case study and image motion tests.
- Task 8: system builder and intro tests.
- Task 9: full Node test suite.
- Task 10: full suite, browser QA, production smoke tests, and whitespace check.

## Rulings

- Save the generated Higgsfield Kling prototype as a local versioned MP4 asset instead of relying on its temporary CloudFront URL. This increases repository and deployment size; if wrong, the cost is replacing the asset strategy.
- Execute in the existing `codex/cinematic-hero` checkout because the native worktree lies outside the writable sandbox and subagents cannot commit there. This reduces isolation; if wrong, the cost is possible interference with the existing feature branch.
- The seven shell section IDs are `system-overview`, `ai-agents`, `automations`, `custom-software`, `data-insights`, `creative-ai`, and `our-work`; later sections use `system-transformation` and `system-builder`. Stable IDs prevent cross-task ambiguity; if wrong, the cost is updating selectors and hashes.

## Progress

- [x] Task 1 — Connected Systems Semantic Shell (`5ae4951`, independently approved)
- [x] Task 2 — Modular Cinematic Scene Spine (`f648dea`, independently approved after lifecycle fixes)
- [x] Task 3 — Edition Chapter Navigation (`74784e4`, independently approved after browser hash fixes)
- [x] Task 4 — Avantage Operating System Map (`db4df87`, independently approved)
- [x] Task 5 — Edition Capability Chapters (`c018977`, independently approved after motion trigger fix)
- [x] Task 6 — Business Transformation Comparison (`de79969`, independently approved)
- [x] Task 7 — Work and Proof Stories (`f87500c`, independently approved after scroll integration fix)
- [x] Task 8 — Build Your System Qualifier (`cf3a8f8`, independently approved)
- [x] Task 9 — Finale, Lifecycle, and Accessibility (`d7531b8`, independently approved after lifecycle fixes)
- [x] Task 10 — Responsive QA, Performance, and Production Delivery (`cf47718`, code independently approved; local browser QA passed)

## Local browser QA

- Checked 390×844, 768×1024, 1440×900, and 1920×1080 in Chromium.
- No horizontal document overflow at any viewport.
- Exactly one `h1`, one video surface, ten visible Connected Systems sections, and no error state.
- Keyboard skip aligned and focused `#connected-systems-main` at the top.
- Case story opening updated hash, expanded state, and focus correctly.
- Qualifier recommendation transferred to the existing brief with its message and service selection.
- Desktop and mobile hero/section visuals rendered without console warnings or errors.

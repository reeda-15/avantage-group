# Task 7 Brief — Work and Proof Stories

Implement Task 7 from the approved plan using TDD in the writable main checkout.

## Contract

- Create `dist/case-studies.js` and `tests/case-studies.test.cjs`.
- Modify `dist/cinematic-preview.html` and `dist/connected-systems.css`.
- Produce `window.AvantageCaseStudies.create(root): {open(id), close(), destroy()}`.
- Inventory and use only verified project names, friction, solution, outcome wording, and imagery already in the repository. Omit unsupported figures and claims.
- Add edition-style project cards plus in-page detail panels. Each story includes friction, connected solution, and verified outcome.
- Exactly one panel opens at a time. Support pointer, keyboard, Escape close, focus return, and history-safe deep links.
- Images must preserve aspect ratio; client logos must not be cropped or distorted.
- Content and project links remain available without JavaScript.

## Constraints

- Follow Global Constraints and exact Task 7 plan steps.
- Preserve Tasks 1–6 and existing Works/project pages.
- Do not invent project metrics, results, quotes, or client claims.
- Reduced motion has no continuous decorative animation. Cleanup is complete and idempotent.
- No later-task implementation and no subagents.

## Verification and delivery

1. Record a verified facts/asset inventory in the test fixture/report before writing public copy.
2. Record RED evidence.
3. Run `node --test tests/case-studies.test.cjs tests/hero-image-motion.test.cjs`.
4. Run full suite when practical and `git diff --check`.
5. Commit exactly `Turn Avantage work into proof stories`.
6. Write `task-7-report.md` with sources, evidence, results, commit, risks, and self review.

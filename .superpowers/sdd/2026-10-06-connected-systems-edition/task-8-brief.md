# Task 8 Brief — Build Your System Qualifier

Implement Task 8 from the approved plan using TDD in the writable main checkout.

## Contract

- Create `dist/system-builder.js` and `tests/system-builder.test.cjs`.
- Modify `dist/cinematic-preview.html`, `dist/connected-systems.css`, and `dist/cinematic-content.js`.
- Export/produce `recommend(problemIds): {title, components, summary}` and `create(root, {onContinue}): {reset(), destroy()}` through the documented browser/CommonJS-compatible module pattern used by the project.
- Exact problem IDs: `manual-work`, `disconnected-tools`, `slow-support`, `poor-reporting`, `custom-software`, `content-workflow`.
- Pure predefined mappings: stable ordering, de-duplication, safe empty/repeated/unknown input handling, no network calls, no HTML interpolation.
- Add accessible fieldset, live recommendation region, reset control, and exact continuation action `Design this system with us`.
- Confirmed recommendations populate matching existing brief checkboxes and a concise plain-text message summary without erasing unrelated user input.

## Constraints

- Follow Global Constraints and exact Task 8 plan steps.
- Preserve Tasks 1–7 and existing brief validation/submission behavior.
- Static content remains useful without JS; reduced motion requires no special dependency.
- Render user-controlled text with safe text APIs only; cleanup is complete and idempotent.
- No backend, live AI generation, or later-task coordinator. No subagents.

## Verification and delivery

1. Record RED evidence.
2. Run `node --test tests/system-builder.test.cjs tests/hero-intro.test.cjs`.
3. Run full suite when practical and `git diff --check`.
4. Commit exactly `Add Build Your System qualifier`.
5. Write `task-8-report.md` with mappings, evidence, results, commit, risks, and self review.

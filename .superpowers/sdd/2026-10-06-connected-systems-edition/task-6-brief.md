# Task 6 Brief — Business Transformation Comparison

Implement Task 6 from the approved plan with TDD in the writable main checkout.

## Contract

- Create `dist/system-transformation.js` and `tests/system-transformation.test.cjs`.
- Modify `dist/cinematic-preview.html` and `dist/connected-systems.css`.
- Produce `window.AvantageTransformation.create(root): {setProgress(value), destroy()}`; clamp progress to `0..1`.
- Add all five approved before/after pairs as complete semantic DOM text at every visual state.
- Add an accessible range/progress control with pointer and keyboard support.
- Drive pointer, keyboard, and optional scroll reveal through one CSS custom property.
- Desktop reveal must remain inside its component. Mobile uses a stacked fallback without horizontal overflow.
- Assistive technology must always receive complete labels/content.

## Constraints

- Follow all Global Constraints and exact Task 6 plan steps.
- Preserve Tasks 1–5; no unsupported business claims or metrics.
- Core comparison is readable without JS; reduced motion uses the complete static/stacked view.
- Cleanup must remove listeners and transient inline state; no subagents and no later-task work.

## Verification and delivery

1. Record RED evidence.
2. Run `node --test tests/system-transformation.test.cjs`.
3. Run full suite when practical and `git diff --check`.
4. Commit exactly `Add connected business transformation`.
5. Write `task-6-report.md` with evidence, results, commit, risks, and self review.

# Task 3 Brief — Edition Chapter Navigation

Implement Task 3 from `docs/superpowers/plans/2026-10-06-connected-systems-edition.md` using TDD in `C:\Users\HP\Documents\ChatGPT\Avanatge Group`.

## Scope and contract

- Create `dist/chapter-navigation.js` and `tests/chapter-navigation.test.cjs`.
- Modify `dist/cinematic-preview.html` and `dist/connected-systems.css`.
- Produce `window.AvantageChapterNav.create(root, {offset, onSelect}): {setActive(id), destroy()}`.
- Exact targets and labels: Overview→`system-overview`, AI Agents→`ai-agents`, Automations→`automations`, Custom Software→`custom-software`, Data & Insights→`data-insights`, Creative AI→`creative-ai`, Our Work→`our-work`.
- Add the sticky navigation immediately before overview. Desktop shows all labels; mobile is one internally scrollable contained row.
- Cover active `aria-current`, direct hash restoration, keyboard activation/focus, sticky offset, observer updates, callback execution, Lenis when present, native fallback, and teardown.
- Selection must call the supplied `onSelect` hook so later coordination can invoke `AvantageScenes.goTo(id)`; navigation itself must remain usable if scenes fail.

## Constraints

- Follow all plan Global Constraints.
- Preserve Tasks 1–2 and existing hero behavior.
- Essential navigation must work without GSAP, Lenis, or video.
- Do not implement later tasks and do not spawn subagents.

## Verification and delivery

1. Record RED evidence before implementation.
2. Run `node --test tests/chapter-navigation.test.cjs tests/smooth-scroll.test.cjs`.
3. Run the full suite when practical and `git diff --check`.
4. Commit exactly `Add edition chapter navigation`.
5. Write `.superpowers/sdd/2026-10-06-connected-systems-edition/task-3-report.md` with implementation, RED/GREEN evidence, test results, commit, risks, and self review.

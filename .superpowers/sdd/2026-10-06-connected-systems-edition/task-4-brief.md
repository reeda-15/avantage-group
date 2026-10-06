# Task 4 Brief — Avantage Operating System Map

Implement Task 4 from the approved plan using TDD in the writable main checkout.

## Contract

- Create `dist/system-map.js` and `tests/system-map.test.cjs`.
- Modify `dist/cinematic-preview.html` and `dist/connected-systems.css`.
- Produce `window.AvantageSystemMap.create(root, {onSelect}): {select(id), destroy()}`.
- Central Avantage node with six capability controls: Think, Connect, Automate, Build, Understand, Create.
- Include exact statement: `Your business already has the moving parts. We make them work as one.`
- Controls remain semantic and useful without JavaScript; SVG connection paths are decorative.
- One selected state, selection callbacks, viewport-aware lime signal motion, reduced-motion static state, and complete teardown.
- Map selections must map sensibly to the existing chapter IDs and integrate through callbacks rather than owning chapter navigation.

## Constraints

- Follow all Global Constraints and Task 4 plan steps.
- Preserve Tasks 1–3, including hash navigation and the scene spine.
- Avantage must remain visually dominant; third-party tools are not part of this map.
- No later-task implementations and no subagents.

## Verification and delivery

1. Record RED before implementation.
2. Run `node --test tests/system-map.test.cjs tests/chapter-navigation.test.cjs`.
3. Run full suite when practical and `git diff --check`.
4. Commit exactly `Create Avantage operating system map`.
5. Write `task-4-report.md` in the SDD workspace with evidence, commit, risks, and self review.

# Task 1 Brief — Connected Systems Semantic Shell

## Objective

Implement Task 1 from `docs/superpowers/plans/2026-10-06-connected-systems-edition.md` using test driven development.

## Scope

- Modify `dist/cinematic-preview.html`.
- Create `dist/connected-systems.css`.
- Create `tests/connected-systems-shell.test.cjs`.
- Preserve the existing `.stage`, `#callback`, and `#brief` sections.
- Add `.connected-systems-main`, `.edition-marker`, and the required semantic sections.

## Required section IDs

1. `system-overview`
2. `ai-agents`
3. `automations`
4. `custom-software`
5. `data-insights`
6. `creative-ai`
7. `our-work`
8. `systems-finale`

Later plan tasks reserve `system-transformation` and `system-builder`; do not add their full implementations now.

## Public framing

- Title: **Avantage AI — The Connected Systems Edition**
- Secondary marker: **Systems 2026**

## Constraints

- Follow every Global Constraint in the implementation plan.
- Keep every chapter readable without video metadata or JavaScript.
- Define practical color, spacing, typography, container, card, focus, and responsive tokens.
- Do not implement later task behavior.
- Do not spawn subagents.
- Work only in `C:\Users\HP\Documents\ChatGPT\Avanatge Group`; do not use the archived native worktree.

## Verification and delivery

1. Write the focused test first and demonstrate its initial failure.
2. Implement the smallest complete shell.
3. Run `node --test tests/connected-systems-shell.test.cjs tests/hero-intro.test.cjs`.
4. Run `git diff --check`.
5. Commit with message `Build Connected Systems Edition shell`.
6. Write a report to `.superpowers/sdd/2026-10-06-connected-systems-edition/task-1-report.md` with summary, files, tests, commit, risks, and self review.

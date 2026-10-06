# Task 2 Brief — Modular Cinematic Scene Spine

## Objective

Implement Task 2 from `docs/superpowers/plans/2026-10-06-connected-systems-edition.md` using test driven development.

## Starting point

- Task 1 commit: `5ae4951`.
- Work only in `C:\Users\HP\Documents\ChatGPT\Avanatge Group`.
- Task 1 was independently approved.

## Required files and interface

- Create `dist/cinematic-scenes.js`.
- Create `dist/cinematic-scenes.css`.
- Modify `dist/cinematic-preview.html` and `dist/cinematic-preview.js`.
- Create `tests/cinematic-scenes.test.cjs`.
- Produce `window.AvantageScenes.create(root, options): {goTo(id), preload(id), destroy()}`.
- Records use `{id, chapterId, srcDesktop, srcMobile, poster, startFrame, holdFrame, exitFrame}`.
- Emit `avantage:scene-enter`, `avantage:scene-hold`, and `avantage:scene-exit` with `{detail:{id, chapterId}}`.

## Exact scene IDs and mapping

1. `intro` → hero/stage
2. `agents` → `ai-agents`
3. `automations` → `automations`
4. `software` → `custom-software`
5. `insights` → `data-insights`
6. `creative` → `creative-ai`
7. `work` → `our-work`
8. `finale` → `systems-finale`

All frame values must satisfy `startFrame <= holdFrame <= exitFrame`.

## Media ruling

Use the completed Higgsfield Kling 3.0 prototype as the intro prototype and store it locally under `dist/assets/cinematic-v2/`. Source URL:

`https://d8j0ntlcm91z4.cloudfront.net/user_3EdTduYv5mfMZSQzNpiN6aeXHIG/hf_20261002_085106_fef92cf5-a740-4fe4-8f95-4b379fbba8fd.mp4`

Retain the current production hero asset as fallback. Do not depend on the temporary URL at runtime. If network access blocks downloading, report the exact blocker and continue all independent implementation work.

## Constraints

- Follow all Global Constraints and Task 2 steps in the plan.
- Exactly one reusable video surface may be active.
- Preload only the next scene.
- Media errors reveal readable HTML fallback.
- Mobile chooses mobile source without eagerly loading all scenes.
- Reduced motion and missing video must remain usable.
- No new production dependencies.
- Do not implement later task behavior.
- Do not spawn subagents.

## Verification and delivery

1. Write failing tests first and record RED evidence.
2. Run `node --test tests/cinematic-scenes.test.cjs tests/cinematic-mobile-media.test.cjs tests/cinematic-time.test.cjs` after implementation.
3. Run `git diff --check`.
4. Commit with message `Add modular cinematic scene spine`.
5. Write `.superpowers/sdd/2026-10-06-connected-systems-edition/task-2-report.md` with summary, files, tests, commit, risks, and self review.

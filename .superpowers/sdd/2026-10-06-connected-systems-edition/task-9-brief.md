# Task 9 Brief — Finale, Lifecycle, and Accessibility

Implement Task 9 from the approved plan using TDD in the writable main checkout.

## Contract

- Create `dist/connected-systems.js`, `tests/connected-systems-accessibility.test.cjs`, and `tests/connected-systems-lifecycle.test.cjs`.
- Modify `dist/cinematic-preview.html`, `dist/connected-systems.css`, and `dist/smooth-scroll.js`.
- Produce `window.AvantageConnectedSystems.start(): {refresh(), destroy()}`.
- The coordinator must safely take ownership from every standalone `*.instance`, initialize components once, connect navigation/map/scene selections, refresh after layout-changing media, suspend offscreen decoration, and destroy every owned listener, observer, timeline, and instance.
- Add a skip link, one robust static/runtime `h1` strategy, correct heading order, visible focus, decorative ARIA treatment, and complete keyboard behavior.
- Finale exact statement: `Your business already has the moving parts. We make them work as one.`
- Finale exact CTAs: `Design my system` and `Explore our work`.
- Reduced motion replaces interludes with posters/immediate content, removes pins/parallax/continuous motion, and hides no content.
- Missing GSAP or Lenis must produce native navigation with no uncaught errors or scroll traps.
- Start is one-time/idempotent; destroy and restart are safe.

## Existing takeover notes

- Standalone instances may exist on `AvantageChapterNav.instance`, `AvantageSystemMap.instance`, `AvantageChapters.instance`, `AvantageTransformation.instance`, `AvantageCaseStudies.instance`, and `AvantageSystemBuilder.instance`; destroy before coordinator ownership.
- Navigation scene selection should use the single scene controller and never create duplicate video surfaces.
- Builder continuation must call `AvantageBrief.applyRecommendation` before moving to `#brief`.
- Preserve the existing hero controller and its one-video scene ownership contract.

## Constraints

- Follow all Global Constraints and exact Task 9 steps.
- Preserve Tasks 1–8 and all verified content.
- No new runtime dependencies, backend, or production deploy in this task.
- Core document remains readable with JavaScript unavailable.
- No subagents.

## Verification and delivery

1. Record RED evidence for both new test files.
2. Run both focused tests, then `node --test tests/*.test.cjs` with localhost access as needed.
3. Run `git diff --check` and syntax checks.
4. Commit exactly `Integrate Connected Systems experience`.
5. Write `task-9-report.md` with ownership graph, evidence, results, commit, risks, and self review.

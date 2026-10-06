# Task 10 Brief — Responsive QA, Performance, and Production Delivery

Implement the code/test portion of Task 10 from the approved plan in the writable main checkout. The parent agent will perform in-app browser and production deployment checks after your commit.

## Contract

- Create `tests/connected-systems-performance.test.cjs`.
- Modify `dist/connected-systems.css` and `tests/hero-network.test.cjs` only as justified by verification defects.
- Assert lazy below-fold imagery, next-scene-only video loading, deferred scripts, retained hero poster, no new runtime dependencies, and complete functional fallback markup.
- Run the entire test suite and whitespace/syntax checks.
- Inspect responsive CSS and static markup for 390×844, 768×1024, 1440×900, and 1920×1080 risks: horizontal overflow, card readability, navigation containment, transformations, cases, qualifier, CTA/contact flow.
- Verify reduced-motion, missing GSAP/Lenis, slow/failed media contracts in tests. Do not claim browser checks you cannot perform.
- Do not deploy or push; parent owns deployment and live smoke tests.

## Constraints

- Follow all Global Constraints and exact Task 10 quality requirements.
- Preserve Tasks 1–9 and all accessibility/lifecycle guarantees.
- Avoid speculative styling changes; fix only concrete risks and add meaningful coverage.
- No new runtime dependencies and no subagents.

## Delivery

1. Record RED for new performance tests.
2. Run focused performance/network tests, then `node --test tests/*.test.cjs` with localhost access if needed.
3. Run `git diff --check` and JS syntax checks.
4. Commit exactly `Polish Connected Systems responsive experience`.
5. Write `task-10-report.md` with code changes, test evidence, static viewport audit, remaining browser/deploy work, risks, and self review.

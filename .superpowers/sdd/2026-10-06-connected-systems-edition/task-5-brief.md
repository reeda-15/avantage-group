# Task 5 Brief — Edition Capability Chapters

Implement Task 5 from the approved plan with TDD in the writable main checkout.

## Contract

- Create `dist/capability-chapters.js` and `tests/capability-chapters.test.cjs`.
- Modify `dist/cinematic-preview.html` and `dist/connected-systems.css`.
- Produce `window.AvantageChapters.create(root): {activate(id), refresh(), destroy()}`.
- Reusable contracts: `.edition-chapter`, `.edition-feature`, `.capability-card`, `.chapter-transition`.
- Fully implement five chapters: AI Agents, Automations, Custom Software, Data & Insights, Creative AI.
- Each chapter needs its approved headline, one major release demonstration, at least three smaller capability cards, one realistic scenario, one contextual CTA, correct heading order, static readability, and a cinematic handoff.
- Automation demonstration must show `Lead → Qualification → CRM → Follow-up → Report`.
- Use original Avantage interface/data-flow/studio visuals. Real labels stay in semantic HTML. Tool marks, if used, remain subordinate to Avantage.
- Repeated motion grammar: label, headline, demonstration, cards, connection lines, handoff.

## Constraints

- Follow every Global Constraint and exact Task 5 steps.
- Preserve Tasks 1–4 and avoid invented client results or unsupported metrics.
- Core content works without JS, GSAP, Lenis, or video.
- Reduced motion is static and complete; lifecycle cleanup is idempotent.
- No later task implementations and no subagents.

## Verification and delivery

1. Record RED evidence.
2. Run `node --test tests/capability-chapters.test.cjs tests/hero-network.test.cjs`.
3. Run full suite when practical and `git diff --check`.
4. Commit exactly `Add Connected Systems capability chapters`.
5. Write `task-5-report.md` in the SDD workspace with implementation, evidence, commit, risks, and self review.

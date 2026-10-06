# Avantage Connected Systems Edition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium Avantage AI landing experience that combines Shopify-style edition chapters with modular cinematic interludes and clear client-focused conversion paths.

**Architecture:** Keep the static HTML and Vercel deployment model. The existing hero remains isolated, a new scene controller coordinates modular Higgsfield clips with semantic HTML chapters, and focused JavaScript modules progressively enhance navigation, maps, comparisons, cases, and the lead qualifier. Every chapter exists as readable document content before motion loads.

**Tech Stack:** Semantic HTML, CSS, vanilla JavaScript, GSAP 3.15.0, ScrollTrigger, Lenis, Higgsfield-generated MP4 assets, Node.js built-in tests, Vercel static hosting.

**Spec:** `docs/superpowers/specs/2026-10-02-ai-operating-system-design.md`

## Global Constraints

- Preserve the existing Avantage identity, cinematic hero, lime signal color, editorial typography, dark visual world, contact sections, and static deployment model.
- Use original Avantage layouts and visuals; do not reproduce Shopify branding, copy, illustrations, or exact page composition.
- Public framing is **Avantage AI — The Connected Systems Edition** with a secondary **Systems 2026** marker.
- Use modular, visually matched clips for Intro, AI Agents, Automations, Custom Software, Data & Insights, Creative AI, Work, and Finale.
- Generated clips contain no readable generated text, company wordmarks, interface labels, or people; real text remains semantic HTML.
- Avantage remains visually dominant; third-party AI tool marks are secondary ingredients.
- Essential content works without GSAP, Lenis, video, or optional effects.
- Reduced motion removes scrubbing, pins, parallax, and continuous decorative motion without hiding content.
- Mobile loads only the next video interlude and uses normal vertical content flow.
- Do not add a CMS, authentication, live AI generation, backend form infrastructure, invented project results, or new production dependencies.

## Review Focus

- Slow or failed media loading leaves every chapter readable and navigable; Tasks 1 and 2 add no-video tests.
- Direct hashes and keyboard chapter navigation land below the sticky header and move focus correctly; Task 3 covers these paths.
- Separate cinematic clips appear continuous without eagerly loading all media; Task 2 covers scene metadata and lazy activation.
- Empty, repeated, and unknown qualifier inputs return safe deterministic recommendations; Task 8 covers these inputs.
- Reduced-motion and missing-library modes produce no scroll traps or uncaught errors; Task 9 covers both modes.

---

### Task 1: Connected Systems Semantic Shell

**Files:**
- Modify: `dist/cinematic-preview.html`
- Create: `dist/connected-systems.css`
- Test: `tests/connected-systems-shell.test.cjs`

**Interfaces:**
- Consumes: existing `.stage`, `#callback`, and `#brief` sections.
- Produces: `.connected-systems-main`, `.edition-marker`, `#system-overview`, seven capability section IDs, and `#systems-finale`.

- [ ] Write a failing shell test asserting the public title, **Systems 2026** marker, one semantic main region after the hero, all required section IDs, ordered headings, stylesheet loading, and chapter availability without video metadata.
- [ ] Run `node --test tests/connected-systems-shell.test.cjs`; expect missing-shell failures.
- [ ] Add the semantic page shell and exact public framing directly to HTML; keep current callback and brief sections intact after the new finale.
- [ ] Define color, spacing, typography, container, card, focus, and responsive tokens in `connected-systems.css`.
- [ ] Run `node --test tests/connected-systems-shell.test.cjs tests/hero-intro.test.cjs`; expect all PASS.
- [ ] Commit with message `Build Connected Systems Edition shell`.

### Task 2: Modular Cinematic Scene Spine

**Files:**
- Create: `dist/cinematic-scenes.js`
- Create: `dist/cinematic-scenes.css`
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/cinematic-preview.js`
- Test: `tests/cinematic-scenes.test.cjs`

**Interfaces:**
- Produces: `window.AvantageScenes.create(root, options): {goTo(id), preload(id), destroy()}`.
- Scene records use `{id, chapterId, srcDesktop, srcMobile, poster, startFrame, holdFrame, exitFrame}`.
- Emits `avantage:scene-enter`, `avantage:scene-hold`, and `avantage:scene-exit` with `{detail:{id, chapterId}}`.

- [ ] Write failing tests for the eight exact scene IDs, unique chapter mapping, frame ordering, one active video element, next-scene-only preload, media-error fallback, and cleanup.
- [ ] Run `node --test tests/cinematic-scenes.test.cjs`; expect module-not-found or interface failures.
- [ ] Implement pure scene validation and lookup before DOM behavior.
- [ ] Implement one reusable video surface that swaps matched clips, preloads only the next scene, shows posters during transitions, and emits the three lifecycle events.
- [ ] Integrate the existing Higgsfield Kling 3.0 clip as the initial visual prototype while retaining the current production hero asset as the stable fallback.
- [ ] Add content-to-video and video-to-content transition classes using matched transform, crop, opacity, and lighting values.
- [ ] Run `node --test tests/cinematic-scenes.test.cjs tests/cinematic-mobile-media.test.cjs tests/cinematic-time.test.cjs`; expect all PASS.
- [ ] Commit with message `Add modular cinematic scene spine`.

### Task 3: Edition Chapter Navigation

**Files:**
- Create: `dist/chapter-navigation.js`
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/connected-systems.css`
- Test: `tests/chapter-navigation.test.cjs`

**Interfaces:**
- Produces: `window.AvantageChapterNav.create(root, {offset, onSelect}): {setActive(id), destroy()}`.
- Targets: `system-overview`, `ai-agents`, `automations`, `custom-software`, `data-insights`, `creative-ai`, `our-work`.

- [ ] Write failing tests for exact labels and targets, active `aria-current`, hash loading, keyboard focus, sticky offset, mobile overflow containment, and callback execution.
- [ ] Run the focused test; expect missing navigation failures.
- [ ] Add sticky edition navigation immediately before the overview; desktop shows all labels and mobile uses an internally scrollable row.
- [ ] Implement observer-driven active state, hash restoration, Lenis integration when available, native fallback, and focus without a second scroll.
- [ ] Connect selection to `AvantageScenes.goTo(id)` without making navigation depend on video success.
- [ ] Run `node --test tests/chapter-navigation.test.cjs tests/smooth-scroll.test.cjs`; expect all PASS.
- [ ] Commit with message `Add edition chapter navigation`.

### Task 4: Avantage Operating System Map

**Files:**
- Create: `dist/system-map.js`
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/connected-systems.css`
- Test: `tests/system-map.test.cjs`

**Interfaces:**
- Produces: `window.AvantageSystemMap.create(root, {onSelect}): {select(id), destroy()}`.
- Capability verbs: `Think`, `Connect`, `Automate`, `Build`, `Understand`, `Create`.

- [ ] Write failing tests for the central Avantage node, six verbs, accessible controls, decorative SVG paths, static no-JS content, selection callbacks, and reduced-motion state.
- [ ] Run the focused test; expect missing-map failures.
- [ ] Add semantic map content and the exact statement **Your business already has the moving parts. We make them work as one.**
- [ ] Implement SVG connections, one selected node, viewport-aware lime signal motion, and chapter navigation callbacks.
- [ ] Run `node --test tests/system-map.test.cjs tests/chapter-navigation.test.cjs`; expect all PASS.
- [ ] Commit with message `Create Avantage operating system map`.

### Task 5: Edition Capability Chapters

**Files:**
- Create: `dist/capability-chapters.js`
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/connected-systems.css`
- Test: `tests/capability-chapters.test.cjs`

**Interfaces:**
- Produces: `window.AvantageChapters.create(root): {activate(id), refresh(), destroy()}`.
- Reusable contracts: `.edition-chapter`, `.edition-feature`, `.capability-card`, `.chapter-transition`.

- [ ] Write failing tests for all five approved chapter headlines, one major release demonstration per chapter, at least three smaller capability cards, one scenario, one contextual CTA, and correct heading order.
- [ ] Run the focused test; expect absent-content failures.
- [ ] Add AI Agents and Automations chapters; Automation uses `Lead → Qualification → CRM → Follow-up → Report`.
- [ ] Add Custom Software, Data & Insights, and Creative AI chapters with original interface, data-flow, and controlled-studio visuals.
- [ ] Implement one repeated motion grammar: label, headline, major demonstration, cards, connection lines, cinematic handoff.
- [ ] Ensure tool logos remain smaller than Avantage and all generated-video labels are replaced by HTML.
- [ ] Run `node --test tests/capability-chapters.test.cjs tests/hero-network.test.cjs`; expect all PASS.
- [ ] Commit with message `Add Connected Systems capability chapters`.

### Task 6: Business Transformation Comparison

**Files:**
- Create: `dist/system-transformation.js`
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/connected-systems.css`
- Test: `tests/system-transformation.test.cjs`

**Interfaces:**
- Produces: `window.AvantageTransformation.create(root): {setProgress(value), destroy()}` with progress clamped to `0..1`.

- [ ] Write failing tests for all five approved before/after pairs, clamping, keyboard input, complete DOM text at every state, contained desktop reveal, and stacked mobile fallback without horizontal overflow.
- [ ] Run the focused test; expect missing-comparison failures.
- [ ] Add semantic comparison content and an accessible progress control.
- [ ] Implement a single CSS custom property for pointer, keyboard, and optional scroll progress; never hide essential labels from assistive technology.
- [ ] Run `node --test tests/system-transformation.test.cjs`; expect PASS.
- [ ] Commit with message `Add connected business transformation`.

### Task 7: Work and Proof Stories

**Files:**
- Create: `dist/case-studies.js`
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/connected-systems.css`
- Test: `tests/case-studies.test.cjs`

**Interfaces:**
- Produces: `window.AvantageCaseStudies.create(root): {open(id), close(), destroy()}`.
- Consumes only verified project facts and imagery already present in the repository.

- [ ] Inventory verified project names, friction, solution, outcome wording, and available visuals in the test fixture; omit unsupported figures.
- [ ] Write failing tests for friction, connected solution, outcome, one-open-panel state, Escape close, focus return, and absence of unsupported metrics.
- [ ] Run the focused test; expect missing-story failures.
- [ ] Add edition-style project cards and in-page detail panels using existing imagery without cropping logos or distorting aspect ratios.
- [ ] Implement pointer, keyboard, focus, and history-safe deep-link behavior.
- [ ] Run `node --test tests/case-studies.test.cjs tests/hero-image-motion.test.cjs`; expect all PASS.
- [ ] Commit with message `Turn Avantage work into proof stories`.

### Task 8: Build Your System Qualifier

**Files:**
- Create: `dist/system-builder.js`
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/connected-systems.css`
- Modify: `dist/cinematic-content.js`
- Test: `tests/system-builder.test.cjs`

**Interfaces:**
- Produces: `recommend(problemIds): {title, components, summary}` and `create(root, {onContinue}): {reset(), destroy()}`.
- Problem IDs: `manual-work`, `disconnected-tools`, `slow-support`, `poor-reporting`, `custom-software`, `content-workflow`.

- [ ] Write failing tests for every problem mapping, combined selections, de-duplication, stable ordering, empty input, repeated IDs, unknown IDs, and safe text rendering.
- [ ] Run the focused test; expect missing-module failures.
- [ ] Implement the pure predefined recommendation mapping without network calls or HTML interpolation.
- [ ] Add an accessible fieldset, live recommendation region, reset control, and **Design this system with us** continuation action.
- [ ] Connect confirmed recommendations to matching existing brief checkboxes and a concise message summary.
- [ ] Run `node --test tests/system-builder.test.cjs tests/hero-intro.test.cjs`; expect all PASS.
- [ ] Commit with message `Add Build Your System qualifier`.

### Task 9: Finale, Lifecycle, and Accessibility

**Files:**
- Create: `dist/connected-systems.js`
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/connected-systems.css`
- Modify: `dist/smooth-scroll.js`
- Test: `tests/connected-systems-accessibility.test.cjs`
- Test: `tests/connected-systems-lifecycle.test.cjs`

**Interfaces:**
- Produces: `window.AvantageConnectedSystems.start(): {refresh(), destroy()}`.
- Consumes all `create(...)` factories and cinematic scene events from Tasks 2–8.

- [ ] Write failing tests for the skip link, one `h1`, heading order, visible focus, decorative ARIA treatment, exact finale message and CTAs, reduced motion, missing GSAP/Lenis, one-time initialization, and complete teardown.
- [ ] Run both focused tests; expect missing-coordinator failures.
- [ ] Add the cinematic finale with **Your business already has the moving parts. We make them work as one.**, **Design my system**, and **Explore our work**.
- [ ] Implement one coordinator that initializes components once, refreshes after layout-affecting media, suspends offscreen decoration, and destroys all listeners, observers, timelines, and instances.
- [ ] Ensure reduced motion replaces cinematic interludes with posters and immediate content; ensure missing libraries fall back to native navigation.
- [ ] Run `node --test tests/*.test.cjs`; expect all PASS.
- [ ] Commit with message `Integrate Connected Systems experience`.

### Task 10: Responsive QA, Performance, and Production Delivery

**Files:**
- Modify: `dist/connected-systems.css`
- Modify: `tests/hero-network.test.cjs`
- Create: `tests/connected-systems-performance.test.cjs`

**Interfaces:**
- Consumes the complete experience from Tasks 1–9.
- Produces verified local and deployed behavior at phone, tablet, laptop, and wide-screen sizes.

- [ ] Write performance tests for lazy below-fold imagery, next-scene-only video loading, deferred scripts, hero poster retention, no new runtime dependencies, and functional fallback markup.
- [ ] Run `node --test tests/connected-systems-performance.test.cjs tests/hero-network.test.cjs`; expect all PASS after focused fixes.
- [ ] Verify locally at `390×844`, `768×1024`, `1440×900`, and `1920×1080`: no horizontal overflow, correct video/content handoffs, readable cards, working navigation, qualifier, cases, and contact actions.
- [ ] Verify keyboard-only use, reduced motion, slow media, one failed interlude, missing GSAP, and browser console/network output.
- [ ] Run `node --test tests/*.test.cjs` and `git diff --check`; expect zero failures and zero whitespace errors.
- [ ] Commit verification fixes with message `Polish Connected Systems responsive experience`.
- [ ] Deploy with `pnpm dlx vercel@latest --prod --yes`; require `READY` and the `https://avantage-group-beryl.vercel.app/` alias.
- [ ] Repeat phone and desktop smoke tests against production, then push `codex/cinematic-hero` after explicit publish authorization remains valid.


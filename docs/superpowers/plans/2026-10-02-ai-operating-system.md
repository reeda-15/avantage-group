# Avantage AI Operating System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing cinematic landing page into a premium chapter-based sales experience that explains Avantage’s capabilities, proves its system-building approach, and leads visitors into the existing strategy-call and project-brief flows.

**Architecture:** Keep the static HTML and Vercel delivery model. Preserve the existing cinematic hero as an isolated component, add semantic chapter markup below it, and progressively enhance each interactive section with small focused JavaScript modules. A shared CSS file owns the editorial layout and responsive system; GSAP coordinates scroll motion only after the semantic page is fully usable.

**Tech Stack:** Semantic HTML, CSS, vanilla JavaScript, GSAP 3.15.0, ScrollTrigger, Lenis, Node.js built-in test runner, Vercel static hosting.

**Spec:** `docs/superpowers/specs/2026-10-02-ai-operating-system-design.md`

## Global Constraints

- Preserve the existing Avantage identity, cinematic hero, core statement, lime accent, dark visual world, contact sections, and static Vercel deployment model.
- Do not copy Shopify branding, content, illustrations, or exact layout.
- Avantage remains the visual center; third-party AI product marks are secondary ingredients.
- Essential content and navigation must work without GSAP, video, or optional visual effects.
- Reduced motion removes scrubbing, pins, parallax, and continuous decorative motion without removing content.
- Mobile uses native vertical flow, compact sticky navigation, direct video rendering, and fewer simultaneous moving elements.
- Claims and metrics must use verified information; do not invent project results.
- Do not add a CMS, authentication, live AI generation, new backend form infrastructure, or new production dependencies.

## Review Focus

- A visitor arriving before hero video metadata loads can still reach and use every chapter; Task 1 adds a no-media shell test.
- A sticky chapter link used by keyboard or direct URL updates focus without hiding the heading behind the header; Task 2 adds anchor and focus tests.
- Reduced-motion users receive static content without pinning or decorative animation; Task 8 adds a reduced-motion contract test.
- An unknown or empty lead-qualifier selection never produces an invalid recommendation; Task 7 adds empty and unmapped-input tests.
- A page running without GSAP or Lenis remains navigable and free of uncaught errors; Task 8 adds a progressive-enhancement browser check.

---

### Task 1: Semantic Page Shell and Hero Handoff

**Files:**
- Modify: `dist/cinematic-preview.html`
- Create: `dist/operating-system.css`
- Modify: `dist/cinematic-content.js`
- Modify: `dist/cinematic-preview.js`
- Test: `tests/operating-system-shell.test.cjs`

**Interfaces:**
- Consumes: existing `data-cinematic` stage and `jump(id)` navigation in `dist/cinematic-preview.js`.
- Produces: `#system-overview`, `.system-main`, `.hero-handoff`, and a `avantage:hero-complete` `CustomEvent` dispatched on `window` with `{detail:{progress:number}}`.

- [ ] **Step 1: Write the failing shell test**

Add `tests/operating-system-shell.test.cjs` assertions that the page contains one `.system-main` after the cinematic stage, semantic sections with headings, `#system-overview`, the stylesheet link, and no dependence on video metadata for the sections to exist.

- [ ] **Step 2: Run the shell test and verify failure**

Run: `node --test tests/operating-system-shell.test.cjs`  
Expected: FAIL because `.system-main` and `#system-overview` do not exist.

- [ ] **Step 3: Add the semantic shell and base visual tokens**

Add the main wrapper plus empty overview and closing-conversion containers directly to `dist/cinematic-preview.html`. Define color, spacing, type, container, focus, and breakpoint variables in `dist/operating-system.css`; do not move the existing contact sections yet.

- [ ] **Step 4: Add the hero completion boundary**

Dispatch `avantage:hero-complete` once when cinematic progress first reaches `0.98`. Add a `.hero-handoff` element that visually bridges the stage into the overview without changing the video timing API.

- [ ] **Step 5: Run focused and existing hero tests**

Run: `node --test tests/operating-system-shell.test.cjs tests/hero-intro.test.cjs tests/cinematic-mobile-media.test.cjs`  
Expected: all PASS.

- [ ] **Step 6: Commit the shell**

```bash
git add dist/cinematic-preview.html dist/operating-system.css dist/cinematic-content.js dist/cinematic-preview.js tests/operating-system-shell.test.cjs
git commit -m "Build operating system page shell"
```

### Task 2: Sticky Chapter Navigation

**Files:**
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/operating-system.css`
- Create: `dist/chapter-navigation.js`
- Test: `tests/chapter-navigation.test.cjs`

**Interfaces:**
- Consumes: section IDs `system-overview`, `ai-agents`, `automations`, `custom-software`, `data-insights`, `creative-ai`, and `our-work`.
- Produces: `window.AvantageChapterNav.create(root: HTMLElement, options?: {offset?: number}): {destroy(): void, setActive(id: string): void}`.

- [ ] **Step 1: Write failing navigation contract tests**

Assert the seven exact links and targets, `aria-current="location"` behavior, a keyboard-focus path, URL hash support, and an offset-aware `scrollToChapter(id)` implementation.

- [ ] **Step 2: Run the navigation test and verify failure**

Run: `node --test tests/chapter-navigation.test.cjs`  
Expected: FAIL because the navigation module and markup do not exist.

- [ ] **Step 3: Add the sticky navigation markup and layout**

Place the navigation immediately before `#system-overview`. Desktop displays all chapter labels; mobile uses a horizontally scrollable row with edge padding and no page-level horizontal overflow.

- [ ] **Step 4: Implement `AvantageChapterNav.create`**

Use `IntersectionObserver` for active state, preserve direct hashes, call `AvantageScroll.scrollTo` when available, use native scrolling otherwise, and focus the target heading after navigation without a second scroll.

- [ ] **Step 5: Run navigation and smooth-scroll tests**

Run: `node --test tests/chapter-navigation.test.cjs tests/smooth-scroll.test.cjs`  
Expected: all PASS.

- [ ] **Step 6: Commit chapter navigation**

```bash
git add dist/cinematic-preview.html dist/operating-system.css dist/chapter-navigation.js tests/chapter-navigation.test.cjs
git commit -m "Add sticky capability navigation"
```

### Task 3: Avantage System Overview Map

**Files:**
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/operating-system.css`
- Create: `dist/system-map.js`
- Test: `tests/system-map.test.cjs`

**Interfaces:**
- Consumes: chapter IDs from Task 2 and `AvantageChapterNav.create(...).setActive(id)`.
- Produces: `window.AvantageSystemMap.create(root: HTMLElement, options: {onSelect(id: string): void}): {destroy(): void, select(id: string): void}`.

- [ ] **Step 1: Write failing system-map tests**

Assert a central Avantage node, five capability buttons, accessible names, line elements marked decorative, selection callbacks, and a static usable state when JavaScript is unavailable.

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test tests/system-map.test.cjs`  
Expected: FAIL because the overview map is empty.

- [ ] **Step 3: Add semantic map content**

Add the approved overview message, central Avantage node, and five capability nodes directly to HTML. Use buttons for selectable nodes and links only where navigation is the sole action.

- [ ] **Step 4: Implement map selection and restrained motion**

Draw connections with SVG paths, animate only transforms, opacity, and stroke progress, and disable pulses when reduced motion is active or the map is outside the viewport.

- [ ] **Step 5: Verify system-map behavior**

Run: `node --test tests/system-map.test.cjs tests/chapter-navigation.test.cjs`  
Expected: all PASS.

- [ ] **Step 6: Commit the overview map**

```bash
git add dist/cinematic-preview.html dist/operating-system.css dist/system-map.js tests/system-map.test.cjs
git commit -m "Create Avantage system overview"
```

### Task 4: Capability Chapter Framework

**Files:**
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/operating-system.css`
- Create: `dist/capability-chapters.js`
- Test: `tests/capability-chapters.test.cjs`

**Interfaces:**
- Consumes: chapter section IDs and existing GSAP/ScrollTrigger globals when available.
- Produces: `window.AvantageChapters.create(root: HTMLElement): {destroy(): void, refresh(): void}` and reusable `.capability-chapter`, `.capability-demo`, and `.capability-card` contracts.

- [ ] **Step 1: Write failing chapter-content tests**

Assert all five approved chapter headings, at least three meaningful capability cards per chapter, one practical scenario per chapter, one contextual call to action per chapter, and heading-order consistency.

- [ ] **Step 2: Run the chapter test and verify failure**

Run: `node --test tests/capability-chapters.test.cjs`  
Expected: FAIL because chapter sections and content are absent.

- [ ] **Step 3: Add AI Agents and Automations chapters**

Use semantic HTML and the approved headline directions. The Automations demonstration shows the exact sequence `Lead → Qualification → CRM → Follow-up → Report`.

- [ ] **Step 4: Add Custom Software, Data & Insights, and Creative AI chapters**

Use interface-panel, data-flow, and controlled-studio demonstrations respectively. Keep third-party AI logos secondary and do not make unsupported product claims.

- [ ] **Step 5: Implement shared chapter enhancement**

Use one observer to activate chapters and one GSAP context per chapter only when GSAP exists and reduced motion is off. `destroy()` must disconnect observers and revert all GSAP contexts.

- [ ] **Step 6: Run chapter and accessibility tests**

Run: `node --test tests/capability-chapters.test.cjs tests/hero-network.test.cjs`  
Expected: all PASS.

- [ ] **Step 7: Commit capability chapters**

```bash
git add dist/cinematic-preview.html dist/operating-system.css dist/capability-chapters.js tests/capability-chapters.test.cjs
git commit -m "Add AI capability chapters"
```

### Task 5: Before and After Transformation

**Files:**
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/operating-system.css`
- Create: `dist/system-transformation.js`
- Test: `tests/system-transformation.test.cjs`

**Interfaces:**
- Consumes: five approved before/after pairs from the spec.
- Produces: `window.AvantageTransformation.create(root: HTMLElement): {destroy(): void, setProgress(value: number): void}` where `value` is clamped to `0..1`.

- [ ] **Step 1: Write failing transformation tests**

Assert all five before/after pairs, the range semantics of the comparison control, clamping for `-1`, `0`, `1`, and `2`, and a stacked mobile fallback without horizontal page scrolling.

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test tests/system-transformation.test.cjs`  
Expected: FAIL because the comparison does not exist.

- [ ] **Step 3: Add comparison markup and responsive presentation**

Desktop uses a contained reveal inside the section. Mobile presents the pairs as stacked before/after cards; it must not rely on swiping to access text.

- [ ] **Step 4: Implement progress enhancement**

Map input, pointer, and optional scroll progress to a single CSS custom property. Keep labels and full text in the DOM at every state.

- [ ] **Step 5: Run focused tests**

Run: `node --test tests/system-transformation.test.cjs`  
Expected: PASS.

- [ ] **Step 6: Commit transformation section**

```bash
git add dist/cinematic-preview.html dist/operating-system.css dist/system-transformation.js tests/system-transformation.test.cjs
git commit -m "Add business transformation comparison"
```

### Task 6: Work and Proof Stories

**Files:**
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/operating-system.css`
- Create: `dist/case-studies.js`
- Test: `tests/case-studies.test.cjs`

**Interfaces:**
- Consumes: verified project content already present in `dist/cinematic-story.js`, `dist/cinematic-content.js`, and current project assets.
- Produces: `window.AvantageCaseStudies.create(root: HTMLElement): {destroy(): void, open(id: string): void, close(): void}`.

- [ ] **Step 1: Inventory verified project facts**

Document available names, visuals, friction statements, solution descriptions, and results in test fixtures; omit any metric or result not supported by repository content supplied by the user.

- [ ] **Step 2: Write failing case-study tests**

Assert each card includes friction, connected solution, result wording, and an accessible expansion control. Assert only one in-page panel opens, Escape closes it, focus returns to its trigger, and unsupported numeric metrics are absent.

- [ ] **Step 3: Run the test and verify failure**

Run: `node --test tests/case-studies.test.cjs`  
Expected: FAIL because transformation story markup and behavior do not exist.

- [ ] **Step 4: Add project cards and in-page panels**

Reuse existing imagery, preserve its aspect ratio, and keep project details in semantic article elements. Use `hidden` and ARIA state for collapsed panels.

- [ ] **Step 5: Implement expansion behavior**

Support pointer, Enter, Space, Escape, focus return, history-safe deep links, and one-open-panel state.

- [ ] **Step 6: Run focused tests**

Run: `node --test tests/case-studies.test.cjs tests/hero-image-motion.test.cjs`  
Expected: all PASS.

- [ ] **Step 7: Commit proof stories**

```bash
git add dist/cinematic-preview.html dist/operating-system.css dist/case-studies.js tests/case-studies.test.cjs
git commit -m "Turn project work into proof stories"
```

### Task 7: Build Your System Lead Qualifier

**Files:**
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/operating-system.css`
- Create: `dist/system-builder.js`
- Modify: `dist/cinematic-content.js`
- Test: `tests/system-builder.test.cjs`

**Interfaces:**
- Consumes: problem IDs `manual-work`, `disconnected-tools`, `slow-support`, `poor-reporting`, `custom-software`, and `content-workflow`.
- Produces: `window.AvantageSystemBuilder.recommend(problemIds: string[]): {title: string, components: string[], summary: string}` and `create(root: HTMLElement, options: {onContinue(result): void}): {destroy(): void, reset(): void}`.

- [ ] **Step 1: Write failing recommendation tests**

Assert deterministic mappings for every approved problem, de-duplicated components for multiple selections, stable ordering, a helpful empty state for `[]`, ignored unknown IDs, and no HTML generated from input strings.

- [ ] **Step 2: Run the builder test and verify failure**

Run: `node --test tests/system-builder.test.cjs`  
Expected: FAIL because `AvantageSystemBuilder` does not exist.

- [ ] **Step 3: Implement the pure recommendation engine**

Keep the mapping local and explicit. Return plain strings and arrays; rendering code must assign user-facing content with `textContent`.

- [ ] **Step 4: Add the accessible selection interface**

Use a fieldset of six selectable problems, a live result region, reset control, and `Design this system` continuation button.

- [ ] **Step 5: Connect recommendations to the existing brief**

On continue, move to `#brief`, select matching existing service checkboxes where applicable, and prepend a concise recommendation summary to the message only after the visitor confirms the action.

- [ ] **Step 6: Run builder and existing form tests**

Run: `node --test tests/system-builder.test.cjs tests/hero-intro.test.cjs`  
Expected: all PASS.

- [ ] **Step 7: Commit the lead qualifier**

```bash
git add dist/cinematic-preview.html dist/operating-system.css dist/system-builder.js dist/cinematic-content.js tests/system-builder.test.cjs
git commit -m "Add build your system qualifier"
```

### Task 8: Closing Conversion, Motion Coordination, and Accessibility

**Files:**
- Modify: `dist/cinematic-preview.html`
- Modify: `dist/operating-system.css`
- Create: `dist/operating-system.js`
- Modify: `dist/smooth-scroll.js`
- Test: `tests/operating-system-accessibility.test.cjs`
- Test: `tests/operating-system-lifecycle.test.cjs`

**Interfaces:**
- Consumes: all `create(...)` factories from Tasks 2–7 and the `avantage:hero-complete` event from Task 1.
- Produces: `window.AvantageOperatingSystem.start(): {destroy(): void, refresh(): void}` and one initialized page lifecycle.

- [ ] **Step 1: Write failing lifecycle and accessibility tests**

Assert a skip link, one `h1`, ordered chapter headings, visible focus styles, decorative ARIA treatment, reduced-motion CSS, component teardown on `pagehide`, initialization without GSAP/Lenis, and no duplicate initialization after `pageshow`.

- [ ] **Step 2: Run the tests and verify failure**

Run: `node --test tests/operating-system-accessibility.test.cjs tests/operating-system-lifecycle.test.cjs`  
Expected: FAIL because the coordinator and complete accessibility contract do not exist.

- [ ] **Step 3: Add the approved closing conversion scene**

Add the exact two-line closing message, `Design my system` primary action, and `Explore our work` secondary action before the existing callback and brief sections.

- [ ] **Step 4: Implement the page coordinator**

Initialize each component once, refresh ScrollTrigger only after layout-affecting assets settle, suspend decorative motion while hidden, and destroy all observers, listeners, GSAP contexts, and component instances on non-persisted `pagehide`.

- [ ] **Step 5: Complete reduced-motion and failure fallbacks**

Ensure the page remains readable with JS disabled; ensure the JS path starts when GSAP and Lenis are undefined; ensure reduced-motion mode removes sticky pin effects and continuous visual pulses.

- [ ] **Step 6: Run the full automated suite**

Run: `node --test tests/*.test.cjs`  
Expected: all PASS with zero failures.

- [ ] **Step 7: Commit integration and accessibility**

```bash
git add dist/cinematic-preview.html dist/operating-system.css dist/operating-system.js dist/smooth-scroll.js tests/operating-system-accessibility.test.cjs tests/operating-system-lifecycle.test.cjs
git commit -m "Integrate operating system experience"
```

### Task 9: Responsive, Performance, and Production Verification

**Files:**
- Modify: `dist/operating-system.css` (phone, tablet, laptop, and wide-screen corrections)
- Modify: `tests/hero-network.test.cjs`
- Create: `tests/operating-system-performance.test.cjs`

**Interfaces:**
- Consumes: the complete page from Tasks 1–8.
- Produces: verified local and production behavior at phone, tablet, laptop, and wide-screen sizes.

- [ ] **Step 1: Add performance contract tests**

Assert below-the-fold images use lazy loading, optional demonstration media is not eager-loaded, scripts use `defer`, the hero retains its poster, and no new third-party runtime dependency is introduced.

- [ ] **Step 2: Run the performance test and resolve failures**

Run: `node --test tests/operating-system-performance.test.cjs tests/hero-network.test.cjs`  
Expected: all PASS.

- [ ] **Step 3: Verify local responsive behavior**

Use the in-app browser at `390×844`, `768×1024`, `1440×900`, and `1920×1080`. At each size verify navigation, hero handoff, text fit, no horizontal overflow, section interaction, contact actions, and console/network errors.

- [ ] **Step 4: Verify keyboard and reduced motion**

Navigate the full page with keyboard only. Emulate reduced motion and verify no pinned scroll traps, essential hidden content, or continuous decorative movement.

- [ ] **Step 5: Run the full suite and inspect the diff**

Run: `node --test tests/*.test.cjs`  
Run: `git diff --check`  
Expected: all tests PASS and no whitespace errors.

- [ ] **Step 6: Commit verification fixes**

```bash
git add dist tests
git commit -m "Polish responsive operating system experience"
```

- [ ] **Step 7: Deploy to production**

Run: `pnpm dlx vercel@latest --prod --yes`  
Expected: deployment reaches `READY` and aliases to `https://avantage-group-beryl.vercel.app/`.

- [ ] **Step 8: Verify production and push the branch**

Repeat phone and desktop smoke tests against the aliased production URL, confirm zero console errors, then push `codex/cinematic-hero` to `origin`.

# Cinematic hero integration

## Scope and repository findings
The supplied repository is static HTML/CSS/JavaScript, not Next.js. Work within it without a framework migration. Replace the homepage hero and its introductory overlay; preserve navigation, media logos, and all subsequent sections/pages. Use the existing GSAP dependency plus its matching ScrollTrigger distribution.

## Intended behavior
One pinned, reversible scroll timeline maps its first 82 percent to Phase 1–5 video currentTime. Phase 6 draws four pastel SVG connections over the held final frame and reveals a pearl. Phase 7 retracts the connections and expands a horizontal signal. Phase 8 reveals real HTML brand text, the service line, and the existing contact destination, then unpins. No autoplay, time-driven animation, or new generated videos.

## Asset evidence and limitation
The retrieved clips have nonmatching boundary frames, including Phase 3 restarting at an empty landscape and Phase 4 changing robot scale. Exact source continuity is blocked pending replacement assets. Preserve the supplied clips by default; do not describe the current source footage as seamless. Freeze the actual final Phase 5 frame for the SVG handoff. No generative spending is authorized here.

## Implementation and verification
- [x] Prepare silent H.264 720p media with frequent keyframes and fast-start metadata, plus a lightweight poster and source manifest.
- [x] Add and run failing behavior tests for phase selection, time clamping, backwards movement, and coalescing seeks while a decoder is busy.
- [x] Implement an isolated media/time module, homepage cinematic controller, and scoped styles. Request current and adjacent clips on demand. Fail to a usable brand/CTA hero on missing media, missing scripts, reduced motion, or data saver.
- [x] Add local byte-range serving so seeks can be exercised in preview. Verify partial/invalid range and HEAD responses.
- [x] Check forward/reverse traversal, skipping, mobile composition, error/reduced-motion/no-JavaScript fallback in the Chromium preview; run the repository test suite. Source boundaries remain visually imperfect as documented.

## Verification and review record
Ten automated checks pass, including a 50-second simulated continuous scrub with active decoding followed by a real stall. Independent review found stale-frame and watchdog edge cases, both addressed and re-reviewed: decode into permanently hidden videos, commit only ready targets to canvas, and reset the stall timer on actual decoder progress. Browser inspection found no console errors in the working preview. Real iOS Safari, network throttling on physical mobile hardware, and corrected source footage remain outside this verification.

User chose both softened handoffs and explicit flags: the preview uses reversible 0.3-second dissolves and optional `?cinematic-review=1` notes. No framework migration, additional generated video, or unrelated page redesign.

## Follow-up: screen recording fix
The supplied 9.37-second recording exposed double-exposed/shrinking robots at the Phase 3 → 4 boundary and stop-start seeking. Exact-latest-target presentation starved during continuous scrolling. The renderer now copies every completed same-direction frame into a separate canvas before starting another seek; obsolete reversed seeks are rejected. Source windows trim the repeated reveal/rise and robot dissolves are removed; only clouds crossfade. A 0.18-second ScrollTrigger catch-up softens wheel steps without autoplay.

Four additional regression checks cover source trims, presentation during uninterrupted scrolling, tiny reverse increments, and exact endpoint seeking. All 14 tests pass. A browser fixture simulates eight seconds of uninterrupted forward and reverse scrolling and verifies that frames are rendered throughout, all videos remain paused, and the cinematic stays active. Source camera compositions still differ at cuts; this update does not claim to regenerate or exactly match the footage.

## Review conditions
Rapid scroll reversal must converge to the latest target, not stale seek completions. SVG overlays must wait for the final video frame to be presented. Hidden CTAs must be unfocusable. Reduced motion must avoid pinning and video downloads. A media failure must release the pin and preserve navigation and CTA access. Existing sections must remain unchanged.

## Follow-up: matched framing and transparent navigation
The user authorized cropping and enlargement to improve continuity. Re-mastered sources replace the earlier runtime source windows: landscape crops are registered, robot visor size/position is matched, repeated reveal footage is trimmed and ten-frame optical-flow bridges connect all four boundaries. Runtime maps the new full clip durations, with no additional crossfade. Full-screen cover and matching SVG slice replace letterboxing; navigation is transparent with readable foreground text. See cinematic-assets.md and assets/cinematic/edit.json for the current edit and verification record; earlier notes above describe superseded versions.

## Follow-up: sky color, detail and smoothness
The user recording exposed a blue-to-orange sky transition and softness from excessive crops. Rebuilt from originals with lower magnification, limited spatial color matching, 18-frame bridges, 48fps motion interpolation and CRF17 encoding. The timeline now uses the new frame counts and 0.65s GSAP scrub. Metadata rounding regression is fixed so the SVG stage holds the actual last frame. Header refined to translucent ivory/charcoal. All 16 checks pass; the continuous browser fixture rendered 359 frames during eight seconds of forward/reverse motion, with all videos paused. Source 720p detail and generated geometric inconsistencies remain intrinsic limits.

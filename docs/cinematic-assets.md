# Cinematic assets and review

The homepage uses five re-mastered clips with matched crops, enlarged robot framing and short encoded motion bridges. Every outgoing clip ends on the incoming clip's first image. Scroll position drives paused video seeking in both directions; no runtime crossfade or autoplay is used. Optional `?cinematic-review=1` displays phase labels.

## Source and edit

All five sources came from the linked Phase 4 Video Check conversation. Base URL: `https://d8j0ntlcm91z4.cloudfront.net/user_3EdTduYv5mfMZSQzNpiN6aeXHIG/`.

| Phase | Source filename | Original frames | Master frames |
| --- | --- | ---: | ---: |
| 1 | hf_20260921_104553_8e056685-4edd-472f-b896-aadad1f8a857.mp4 | 145 | 229 |
| 2 | hf_20260921_105244_fc282862-f308-4d2e-9c74-5e3be725c241.mp4 | 169 | 271 |
| 3 | hf_20260921_171343_cb09d4b4-5774-4eee-a0ec-8fea02a4704e.mp4 | 169 | 97 |
| 4 | hf_20260921_171822_0796fc46-63b4-4900-be4a-a5ff766377be.mp4 | 193 | 421 |
| 5 | hf_20260921_172324_3d794490-e520-40e2-93d3-4651ec081520.mp4 | 169 | 337 |

`dist/assets/cinematic/edit.json` records the source in/out seconds, start/end affine crop transforms (scale, x, y), 48fps master frame counts and decoded join measurements. Source windows are end-exclusive. Transforms interpolate with smoothstep and clamp to cover the canvas. Eighteen source-rate bidirectional optical-flow transition frames are appended to each of Phases 1–4. The final bridge image is the next phase's first frame. These are edited bridges between separately generated scenes, not newly generated footage; background/pose differences are interpolated. Lossy compression makes adjacent encoded join frames near-identical rather than byte-identical (mean absolute RGB error 0.93–2.05 out of 255).

Phase 5 returns to its original final composition for the four SVG anchors and pearl at (640,408). The actual decoded final image remains on the canvas during the live SVG phases.

## Encoding and framing

Self-hosted 1280×720, 48fps H.264/yuv420p with no audio, CRF17, four-frame keyframes, no B frames, and fast-start metadata. Five masters total 47.23 MB. The original 24fps material is motion-interpolated; this is not native 48fps footage or recovered high-resolution detail. Robot crops are reduced from roughly 2.5–3.1× to roughly 1.6–2.0×. The larger encode prioritizes quality over the previous 21 MB delivery. Current and adjacent clips load on demand; a WebP poster supplies the opening image. The renderer copies completed frames before requesting the next seek, presents during uninterrupted scrolling and rejects stale frames after direction changes.

Video canvas/poster use centered `object-fit: cover`; the SVG uses matching `xMidYMid slice`. This fills the screen and crops the edges on portrait screens. A dedicated portrait composition would be needed to keep all four robot faces fully visible on narrow phones. The header uses charcoal text, a translucent ivory surface, a muted green CTA and an ivory mobile dropdown. Background blur is limited to the header to protect text contrast over moving footage. The gradient fades away during the HTML brand reveal.

When replacing assets, update frame counts in `dist/cinematic-time.js`, regenerate the poster and edit manifest, and inspect the outgoing last/incoming first frames. Preserve the final Phase 5 composition or update the SVG anchors.

## Running and verification

`npm start` serves at port 8765; set `PORT` to override. `npm test` runs timing, seeking, markup and HTTP byte-range checks. Production hosting must support MP4 byte-range requests. Reduced motion, data saver, missing GSAP and video failure show the usable brand/CTA fallback. The skip link moves focus beyond the cinematic.

All 16 tests pass. Chromium desktop and mobile previews checked full-screen framing and header readability. The continuous forward/reverse browser fixture produced 359 frames while scrolling; every video remained paused and the cinematic remained active. Decoded master frame counts and all four adjacent joins were checked independently. Physical iOS/Safari is not verified.

## Color and scroll refinement
Sky hue/exposure is matched using a low-frequency Lab correction at the beginning of each shot, released gradually through that shot. The correction is limited and weighted toward warmer pixels to avoid turning ceramic and already-blue sky cyan. Global chroma is reduced to 86 percent. Phase 3 ends at source second 6 and Phase 4 starts at second 0, using the pair with closer face/shoulder poses. Bridges remain edited approximations: generated geometry, clouds and robot poses are not identical. GSAP ScrollTrigger uses a 0.65-second scrub catch-up, while all videos remain paused and reversible. Seek quantization uses 48fps and rounds metadata to frame counts before selecting the final frame. Versioned media/script URLs prevent stale prior masters being combined with the new timeline.

## Smooth page scrolling
The homepage self-hosts Lenis 1.3.26 (MIT license in dist/vendor). Lenis and ScrollTrigger share GSAP's ticker; wheel smoothing uses lerp 0.1 and wheel multiplier 0.9, while touch remains native. The cinematic catch-up is reduced to 0.12 seconds when page smoothing is available, avoiding stacked delays. Reduced-motion changes tear down smoothing, pagehide removes the ticker, and pageshow starts at most one instance. Skip introduction uses an immediate Lenis jump to cancel momentum and then focuses the destination. Other pages retain their existing scrolling. The integration follows https://github.com/darkroomengineering/lenis#gsap-scrolltrigger. All 18 automated checks pass.

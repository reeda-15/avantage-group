# Cinematic assets and review

The homepage uses five re-mastered clips with matched crops, enlarged robot framing and short encoded motion bridges. Every outgoing clip ends on the incoming clip's first image. Scroll position drives paused video seeking in both directions; no runtime crossfade or autoplay is used. Optional `?cinematic-review=1` displays phase labels.

## Source and edit

All five sources came from the linked Phase 4 Video Check conversation. Base URL: `https://d8j0ntlcm91z4.cloudfront.net/user_3EdTduYv5mfMZSQzNpiN6aeXHIG/`.

| Phase | Source filename | Original frames | Master frames |
| --- | --- | ---: | ---: |
| 1 | hf_20260921_104553_8e056685-4edd-472f-b896-aadad1f8a857.mp4 | 145 | 107 |
| 2 | hf_20260921_105244_fc282862-f308-4d2e-9c74-5e3be725c241.mp4 | 169 | 128 |
| 3 | hf_20260921_171343_cb09d4b4-5774-4eee-a0ec-8fea02a4704e.mp4 | 169 | 41 |
| 4 | hf_20260921_171822_0796fc46-63b4-4900-be4a-a5ff766377be.mp4 | 193 | 203 |
| 5 | hf_20260921_172324_3d794490-e520-40e2-93d3-4651ec081520.mp4 | 169 | 169 |

`dist/assets/cinematic/edit.json` records the source in/out seconds, start/end affine crop transforms (scale, x, y), 24fps master frame counts and decoded join measurements. Source windows are end-exclusive. Transforms interpolate with smoothstep and clamp to cover the canvas. Ten bidirectional optical-flow transition frames are appended to each of Phases 1–4. The final bridge image is the next phase's first frame. These are edited bridges between separately generated scenes, not newly generated footage; background/pose differences are interpolated. Lossy compression makes adjacent encoded join frames near-identical rather than byte-identical (mean absolute RGB error 1.46–2.84 out of 255).

Phase 5 returns to its original final composition for the four SVG anchors and pearl at (640,408). The actual decoded final image remains on the canvas during the live SVG phases.

## Encoding and framing

Self-hosted 1280×720, 24fps H.264/yuv420p with no audio, CRF21, three-frame keyframes, no B frames, and fast-start metadata. Five masters total 21.12 MB. Current and adjacent clips load on demand; a WebP poster supplies the opening image. The renderer copies completed frames before requesting the next seek, presents during uninterrupted scrolling and rejects stale frames after direction changes.

Video canvas/poster use centered `object-fit: cover`; the SVG uses matching `xMidYMid slice`. This fills the screen and crops the edges on portrait screens. A dedicated portrait composition would be needed to keep all four robot faces fully visible on narrow phones. Transparent navigation uses white text over a top gradient, with a dark mobile dropdown. The gradient fades away during the HTML brand reveal.

When replacing assets, update frame counts in `dist/cinematic-time.js`, regenerate the poster and edit manifest, and inspect the outgoing last/incoming first frames. Preserve the final Phase 5 composition or update the SVG anchors.

## Running and verification

`npm start` serves at port 8765; set `PORT` to override. `npm test` runs timing, seeking, markup and HTTP byte-range checks. Production hosting must support MP4 byte-range requests. Reduced motion, data saver, missing GSAP and video failure show the usable brand/CTA fallback. The skip link moves focus beyond the cinematic.

All 14 tests pass. Chromium desktop and mobile previews checked full-screen framing and transparent navigation. The continuous forward/reverse browser fixture produced 276 frames while scrolling; every video remained paused and the cinematic remained active. Decoded master frame counts and all four adjacent joins were checked independently. Physical iOS/Safari is not verified.

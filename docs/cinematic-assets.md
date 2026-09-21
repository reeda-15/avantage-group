# Cinematic assets and review

Open `/?cinematic-review=1` for phase labels and source-boundary warnings. The normal homepage omits these notes. Robot transitions are single-image cuts through edited source windows: Phase 2 ends at 5.25s, Phase 3 starts at 4.75s, and Phase 4 starts at 2.5s. This removes the repeated reveal and much of the reset/rise. Only the cloud-to-cloud Phase 4 → 5 transition retains a 0.3s reversible dissolve. Source files remain intact. Different generated camera compositions still prevent exact source continuity.

## Sources
All five outputs came from the linked “Phase 4 Video Check” conversation. Base URL: `https://d8j0ntlcm91z4.cloudfront.net/user_3EdTduYv5mfMZSQzNpiN6aeXHIG/`.

| Phase | Source filename | Frames at 24 fps |
| --- | --- | ---: |
| 1 | hf_20260921_104553_8e056685-4edd-472f-b896-aadad1f8a857.mp4 | 145 |
| 2 | hf_20260921_105244_fc282862-f308-4d2e-9c74-5e3be725c241.mp4 | 169 |
| 3, corrected | hf_20260921_171343_cb09d4b4-5774-4eee-a0ec-8fea02a4704e.mp4 | 169 |
| 4, corrected | hf_20260921_171822_0796fc46-63b4-4900-be4a-a5ff766377be.mp4 | 193 |
| 5 | hf_20260921_172324_3d794490-e520-40e2-93d3-4651ec081520.mp4 | 169 |

## Source defects requiring replacement for exact continuity
- 1 → 2: the camera resets to the original wider landscape instead of continuing the final pushed-in view.
- 2 → 3: the giant robot disappears at the start of Phase 3; the corrected clip repeats the reveal.
- 3 → 4: the robot starts smaller and the landscape composition resets.
- 4 → 5: an opaque soft cloud frame changes to a distinct sunlit cloud composition.
- Phase 5 contains four principal faces plus partial robots at the bottom edges and an existing central light. SVG paths use the four principal faces; the pearl aligns with the existing light at (640, 408).

## Encoding and replacement
Files in `dist/assets/cinematic/` are self-hosted 1280×720, 24fps H.264/yuv420p without audio. Encode with `-c:v libx264 -preset fast -crf 22 -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 -an -movflags +faststart`. This reduces these five files from 82.2 MB to 30.7 MB while limiting seek work to six frames per keyframe interval. Current and adjacent clips are requested on demand; initial rendering uses a WebP poster.

When replacing footage, update the source in/out windows in `dist/cinematic-time.js` and regenerate the reference `agents.webp` from the last decodable frame of the optimized Phase 5 video. Runtime rendering copies completed frames into per-video canvas buffers before requesting the next seek, and renders these buffers during continuous scrolling. Direction generations reject obsolete reverse/forward seeks. Seek targets are quantized to the source's 24fps frame starts. The actual final Phase 5 bitmap is held throughout the SVG phases; the reference image is not substituted at runtime. Update SVG face anchors if composition changes. Compare every outgoing last/incoming first frame before calling a replacement continuous.

The 16:9 source remains fully visible at all aspect ratios, so portrait screens use letterboxing rather than cropping out agents. A portrait source is needed for an edge-to-edge mobile version.

## Running
`npm start` serves the existing site at port 8765. Set `PORT` for another port. `npm test` runs time/seek, markup, and HTTP byte-range checks. Production hosting must preserve the relative asset paths and support MP4 byte-range requests. Reduced motion, data saver, missing GSAP, and video failure show the brand/CTA without pinning. A skip link moves focus beyond the cinematic.

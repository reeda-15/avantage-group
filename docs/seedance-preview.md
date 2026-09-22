# Approved storyboard cinematic preview

Open `/cinematic-preview.html` locally. The original homepage remains unchanged.

## Current HD edit

`avantage-journey-1080p.mp4` is 1920 x 1080, 48 fps, 1,511 frames / 31.479167 seconds, 106,736,017 bytes. This is upscaled from the original 1280 x 720 sources, not native 1080p generation. Lanczos scaling and restrained luma sharpening preserve available detail. No generation credits were used for this revision.

The repeated doorway approach was in the footage: chapter 3 restarted the camera movement already shown at the end of chapter 2. Chapter 3 source frames 0-65 (2.75 seconds) are removed. The chapter now begins just before the sculpture reveal. Its excessive 1.407x alignment crop was replaced by a modest 1.08x crop, plus the shared 1.065x edge crop. Ten source-frame eased dissolves bridge chapter joins. The edited source has 757 frames at 24 fps.

Motion interpolation precedes HD scaling. H.264 CRF 16, all-intra frames, no B frames and faststart support forward/reverse seeking. The canvas takes its dimensions from video metadata and avoids redrawing an unchanged frame. One GSAP ScrollTrigger timeline controls paused video time. There is no autoplay or looping. Reduced motion uses the manual slider. Cached metadata initialization and slider feedback are handled.

Generated backgrounds and architecture differ between chapters, so short dissolves remain visible. Upscaling cannot restore native detail absent from the footage. Portrait screens use a centered cover crop; the landscape video retains the full composition.

The previous `avantage-journey-smooth.mp4` is retained for comparison. Its alignment reduced a frame-difference metric but did not remove the repeated approach; it is no longer active.

Validation: full HD video decode passed; 11 seeking tests and script syntax passed. Browser confirmed video and canvas are 1920 x 1080. Forward/reverse seeking returned 21.916666 to 23.375 to 21.916666 seconds, paused throughout. Final seek reached 31.458333 seconds. No browser warnings/errors.

## Original generation

Generated with Higgsfield Seedance 2.0, fast mode, 720p, silent, high bitrate. The user approved that quality/cost option. Original chapters are 12.0417, 11.0417 and 12.0417 seconds at 24 fps. Source generation IDs in playback order:

- b4b916a7-5c05-421b-a2c5-87c51c8b8df9
- f047b4ea-c418-4584-8443-e0c5689ab247
- 561e17a3-9041-408f-b9b8-76539280676f

The third job succeeded despite a transport error and was recovered from generation history with explicit permission, not resubmitted. Observed generation cost was 87.5 credits, leaving 33.5 at that time.

The original footage contains generated billboard designs. Tracked local project screenshots now cover their photograph areas; team photos, copy, stats, and testimonials are integrated as website layers.

## Approved website content and scroll chapters

The cinematic preview now contains the approved hero, brand message, benefits/stats, four projects, team, process, six services, five client quotes, and final callback/contact sections and footer. Copy, team photos, testimonial portraits, and project screenshots come from avantageai.com and its embedded `/claude-design/` page. The published stats retain their original labels: 23 clients, INR 37L+ revenue moved, 177+ tasks automated, 11 industries served. Testimonial excerpts retain the client attribution; Tickat's 70% is explicitly client-reported.

`cinematic-story.js` is the deterministic scroll-to-video mapping. Each beat now uses monotone cubic interpolation with positive, continuous boundary velocity. The previously added reading holds were removed at the user’s request. Video time advances throughout forward scrolling and reverses deterministically. `cinematic-content.js` supplies actual HTML headings, links, portraits, and paused GSAP reveal timelines. Inactive panels are inert and aria-hidden. Reduced motion presents complete text using the manual story slider. All calls to action use internal chapter navigation. There are no outbound anchors, mailto or telephone links. The email and telephone number are plain text in the contact chapter/footer. The old website is reference material only.

`cinematic-content.css` controls responsive typography, the legibility overlay, founder layouts, transparent navigation, and section treatments. The existing cinematic video and cursor-star layer remain in place. Homepage files are untouched. Nothing has been deployed.

Checks: 14 timeline/seek tests pass, including monotonic video time, reading holds, and deterministic reverse navigation. Browser checks cover narrow-screen founder fit, loaded portraits, project navigation, services, and final contact links.

Latest verification: 15 seeking/story tests pass, including positive boundary velocity and no mid-chapter freezes. Browser confirms zero anchors and advancing decoded times through the previous hold region.

## Tracked project billboard images

The five billboard photograph areas display local screenshots of BTP Travel CRM, Harshad Steel ERP, VRC Plasto PLM, and Tickat CRM (Harshad appears on two faces). Screenshots were downloaded from the corresponding public `claude-design/assets/` references. No website navigation or live embedding is used.

`cinematic-billboards.js` maps the local screenshots into perspective using frame-indexed quadrilaterals in `assets/cinematic-content/billboard-tracks.json`. Tracking was generated from the current 1080p master at 24 samples per second, anchored at video time 14.5 seconds; adjacent samples interpolate at decoded-frame time. The replacement is limited to the photograph areas above the robots. Original frame borders and robot foreground remain intact. The layer fades with the gallery emergence and exit. ResizeObserver keeps its cover crop aligned with the pinned video during responsive changes. This is a website layer; the original downloadable MP4 itself is unchanged.

Validation: five local images load, no browser warnings/errors, forward/reverse checks at 13.770833 and 15.8125 seconds, desktop and narrow-screen alignment checked, existing 15 timeline tests pass.

## Contact forms and delivery

The header and hero strategy-call buttons navigate to a local callback form (phone required; name and business optional). A separate project brief form includes service selection. Both match the cinematic theme. Submit buttons remain disabled until a user-provided form-service endpoint is configured; neither form sends data to the old website.

Five attributed testimonial excerpts include Harshad, Faizan, Siraj, Shubham, and Sadiya, with local portraits. Scroll distance scales with total chapter weight so added testimonials retain reading space without freezing the video. All 22 repository tests pass.

Videos in assets/cinematic-v2 use Git LFS. Run git lfs pull after cloning to obtain the media. The cinematic preview is at /cinematic-preview.html; the existing homepage is preserved.

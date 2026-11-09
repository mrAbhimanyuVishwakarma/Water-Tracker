# Website redesign review

final result: passed

## Scope and reference

- Website only: all nine pages in `website/`. The Expo application is outside this change.
- Design contract: [`DESIGN.md`](DESIGN.md), the Oasis Health system selected by the user.
- Source gallery: https://opendesignmd.com/designs/oasishealth-app/
- Source visual: https://opendesignmd.com/shots/oasishealth-app/8461.webp
- Locally opened source: `%TEMP%/brownie-oasis-8461.webp`.
- Implementation reviewed at `http://127.0.0.1:4173/` using headless installed Chrome through Playwright, with the user's permission.

## Visual evidence

Local review artifacts are in the ignored `.cache/website-redesign/` directory:

- `previews/desktop.png`: final homepage at 1712 × 1314 CSS pixels, device scale factor 1.
- `previews/mobile.png`: final homepage at 390 × 1500 CSS pixels, device scale factor 1.
- `small-phone.png`: final homepage at 320 × 844 CSS pixels.
- `comparison.png`: source and implementation displayed together at equal scale. Both underlying images measure 1712 × 1314 pixels; no density normalization was necessary. The comparison board is 1800 pixels wide.
- `comparison-focus.png`: an original-scale source card crop and implementation card capture displayed together to inspect typography, icon scale, and padding. Shadow fidelity was checked in the full composition because element screenshots clip exterior shadows.
- Full-page desktop and phone captures of the homepage, features, downloads, support, and privacy pages.

State: default light appearance, consent previously declined, navigation and FAQs collapsed. Source brand, product content, and screenshot are intentionally adapted to Brownie. The source does not document mobile screenshots; responsive behavior is assessed against the supplied written guide and the rendered site.

## Findings and comparison history

1. Initial full-view comparison: the warm canvas, centered heading, central phone, six floating cards, simple typography, and restrained semantic accents follow the chosen system. Brownie's own app screenshot and mascot assets replace the source product imagery. The download actions reflect the available Android beta instead of showing unavailable store badges.
2. Mobile review identified small card captions and a 40 px header action. Captions were increased, the narrowest layout now stacks cards, and the mobile header action and brand target are at least 44 px high. Final 390 px and 320 px captures confirm readable wrapping and no overflow.
3. Accessibility review identified three inherited red table cells on the account-deletion page with insufficient contrast (3.67:1). These now use the darker coral text token. The legal notice surfaces also use the new palette. Post-fix accessibility scans pass.
4. Final full-view and focused comparisons show no actionable P0/P1/P2 visual findings. Retaining the full Android device image, a two-line Brownie headline, product-specific card widths, and the original mascot artwork are intentional adaptations rather than an exact clone of Oasis.

## Required fidelity surfaces

- **Fonts and typography:** local Lato Regular and Bold load successfully. Browser-computed body font is `Lato, Arial, sans-serif`; desktop headline is 48 px with tight tracking. Headings reduce on phones. No external font request is needed.
- **Spacing and layout:** centered 1200 px content container, generous section spacing, 12 px cards, pill actions, and pronounced shadows confined to floating or transient surfaces. Cards move below the phone on small screens. Static content cards have no pronounced shadow.
- **Colors and tokens:** computed canvas is `rgb(254, 252, 249)` (`#FEFCF9`). Primary text and actions use `#131313`, surfaces white, with green and coral accents. Darkened semantic text tokens improve small-text contrast. No gradient backgrounds are used.
- **Image quality and assets:** existing high-resolution Android frame, real app screenshot, and mascot images remain undistorted. Icons are locally served Phosphor assets with their MIT license. Lato includes its SIL Open Font License. No placeholder art or handcrafted icon substitutes were introduced.
- **Copy and content:** wording describes Brownie's actual habits, drinks, companions, guest usage, and Android beta. No fabricated testimonials or unavailable store links. App drink multipliers are described as tracking estimates. Privacy, terms, and deletion article text was compared with baseline commit `2c83a8e` and is unchanged.

## Verification

- Initial browser run: all nine pages at 1440, 1024, 768, 390, and 320 px widths, with no horizontal overflow, missing images, font failures, or JavaScript exceptions.
- Post-fix browser run: all nine pages at 1440, 390, and 320 px, plus the interaction checks below. Results: `.cache/website-redesign/browser-results.json`; initial results: `browser-results-initial.json`.
- Mobile menu opens, follows links, closes on Escape, and returns keyboard focus.
- FAQs expand and collapse with the keyboard using native disclosures.
- Drink demo checks all five presets, their combined 1908 ml result from the initial 500 ml, the goal limit, and reset.
- Release lookup success updates the APK URL and metadata; lookup failure retains the official GitHub Releases link. Success and failure were simulated without downloading an APK.
- With JavaScript disabled, mobile navigation, FAQs, and official release links remain usable.
- Cookie preferences open and close; deliberate opening receives focus and closing restores it. Initial banner appearance does not take focus.
- All local asset references, local page links, fragment targets, and duplicate IDs were checked.
- Axe-core 4.10.3: 19 scans (all nine pages at desktop and phone widths, plus open cookie preferences), using WCAG 2 A/AA and WCAG 2.1 A/AA rules; zero final violations. Results: `.cache/website-redesign/accessibility-results.json`.
- `npm run lint -- --no-cache -- --cache-location <temporary path>`: zero errors; 27 existing warnings in the unchanged Expo application.
- `npm run typecheck`: passed. Website JavaScript syntax checks passed.

## Limits and follow-up

Automated accessibility scans do not establish complete WCAG compliance. Checks used desktop Chrome and responsive viewports; physical Android/iOS browser and screen-reader testing were not performed. No live deployment was requested. The redesign is saved separately on `website-redesign`; rollback information is in `website/README.md`.

## Follow-up: text outlines and mascot animations

The user requested black outlines only on the three Support text cards and approved replacing the five Pro mascot images on Home and Features with the app's sipping MP4s, with green backgrounds removed.

- The Support cards now have a 1 px near-black outline. The mascot cards and video elements have no borders or frames.
- The original app MP4s are preserved. A reproducible FFmpeg script derives cropped 512 × 512, 24 fps website clips and WebP posters. RGB color keying preserves the light-green turtle; a broader chroma-only key was rejected during visual review because it washed out his body.
- MP4 playback uses white matching the existing card surface. Transparent WebM alternatives and small transparent WebP posters are also included. The five posters total approximately 135 KB.
- Videos are muted, load on entering the viewport, pause offscreen or when the document is hidden, and honor reduced motion. Each gallery includes a keyboard-accessible play/pause control. With JavaScript disabled, clean posters remain visible and the inactive control is hidden.
- Visual evidence: `.cache/website-redesign/mascot-update/support-text-outlines.png`, `index-desktop.png`, `features-desktop.png`, phone captures at 390 and 320 px, and `video-comparison.png`. The latter displays Turbo's original and processed video at the same 4.5-second frame, normalized to the same centered square crop, showing preserved foreground color with the backdrop removed.
- The browser test passed 24 checks covering both galleries, the support cards, media decode and background pixels, pause/play, offscreen pause, reduced motion, no-JavaScript fallback, mobile overflow, and accessibility scans of all three affected pages. Both formats were sampled at 0.5, 4.5, and 8.5 seconds for every character. WebM background alpha is within 2/255 codec tolerance; sampled foreground remains opaque. There were no JavaScript exceptions or failed local resources. Results: `.cache/website-redesign/mascot-update/results.json`.
- Typecheck and JavaScript syntax checks pass. Lint has zero errors and the same 27 existing mobile-app warnings.

Follow-up final result: passed. No actionable P0/P1/P2 visual findings remain. Physical-device and non-Chrome playback checks remain outside the performed verification.

## Follow-up: System / Dark / Light appearance

The user requested a clickable appearance selector beside the header's Get the app action, with System as the default. The existing Phosphor icon family supplies monitor, moon, and sun icons; no new icon dependency or user-supplied artwork is needed.

- The control appears on all nine pages. A native disclosure contains a labeled radio group with System, Dark, and Light choices. The selected icon and label identify the preference; phone headers use the icon to preserve space. Keyboard arrow selection, Escape with focus return, and outside-click dismissal work.
- A small blocking `theme.js` script applies the saved preference before the stylesheet paints. Missing or invalid storage values select System. System tracks device appearance changes; explicit choices override them. Preferences persist across pages and synchronize across tabs. Blocked storage does not prevent current-page switching. CSS follows the system when JavaScript is unavailable.
- Dark mode retains Lato, spacing, radii, icon weights, and hierarchy. Warm charcoal backgrounds, lighter text, adjusted status colors, theme-aware buttons, progress tracks, legal text, and a dark footer preserve readable contrast.
- Matching dark MP4 variants blend into mascot cards without relying on transparent-video browser support. Existing light clips and original app media remain unchanged. Visible clips update when the theme changes. Small decoded matte differences of up to three RGB levels are accepted as codec rounding; no outlines or frames were added to media.
- Initial visual review found a brief low-contrast midpoint while button colors animated between themes, and touching header controls at 320 px. Color interpolation was removed from buttons, and spacing was retained between the compact controls. Post-fix checks confirm immediate CTA contrast and separated controls in all three modes at 1440, 390, and 320 px.
- Browser verification passed 60 checks, including every page in Light and Dark at 1440, 390, and 320 px; preference persistence, live system changes, overrides, keyboard operation, cross-tab synchronization, blocked storage, no-JavaScript fallback, and matching video playback. All 21 accessibility scans passed, covering every page in both themes, open appearance controls, and dark cookie preferences. There were no JavaScript exceptions or failed local resources. GitHub release requests were stubbed during this appearance test.
- Final visual evidence and results are in `.cache/website-redesign/theme-update/`: `system-final-1440.png`, `dark-final-1440.png`, `light-final-1440.png`, phone captures, Light/Dark gallery captures, and `results.json`. The header comparisons use matching viewport sizes and default page states with the appearance disclosure open. The theme variants intentionally share the same typography, control sizes, and layout.
- Typecheck and JavaScript syntax checks pass. Lint has zero errors and the same 27 existing mobile-app warnings. Legal article text was compared with the previous commit and is unchanged.

Appearance final result: passed. No actionable P0/P1/P2 issues remain. Desktop Chrome with responsive viewports was used; physical-device testing was not performed.

## Follow-up: icon-only appearance cycle

The appearance disclosure was replaced at the user's request by one icon-only button. Each click cycles System → Dark → Light → System, displaying the monitor, moon, and sun respectively. Visible names, the dropdown, its chevron, and radio controls were removed from all nine headers. The button retains a 44 × 44 px target, a current/next accessible name, a tooltip, and a visually hidden live announcement. Enter and Space activate the native button.

Browser verification passed 16 checks: the complete cycle on every page, no visible button text or dropdown controls, keyboard activation, saved preferences, navigation, live system changes, cross-tab updates, responsive layouts at 1440/390/320 px, and the no-JavaScript System fallback. All three mode-specific accessibility scans passed, with no JavaScript exceptions or failed local resources. Palette and media behavior remain as verified above. Screenshots and results: `.cache/website-redesign/theme-cycle/`. Lint has zero errors and the same 27 existing warnings; typecheck and syntax checks pass.

Icon-only cycle final result: passed. No actionable P0/P1/P2 findings remain.

## Follow-up: phone framing, resolution, Brownie, and additional outlines

The user clarified that the dashboard reference demonstrates a correctly filled phone frame, requested an animated dashboard, sharper assets across devices, the newly supplied capybara animation, and outlines around the feature cards, drink demo, mascot cards, routine steps, and FAQ disclosures.

- The homepage retains the supplied 1183 px Android frame and 1080 px app screenshot. Its inner display now has white status and navigation areas, local vector status icons, and the actual camera cropped from the frame asset. The former black bands are removed. Manny animates inside the illustration area; the original metrics, goal badge, drink controls, and app navigation remain screenshot pixels. The app display stays white in both website themes. A visible pause button also controls the galleries.
- Brownie's original green-screen MP4 is preserved in the app assets. The existing RGB keying pipeline now derives Brownie's standard media and native 720 px variants of all six mascots. Both Home and Features animate all six companions. Transparent 720 px posters support reduced motion and no-JavaScript fallback.
- Playback chooses 512 or 720 px MP4 from the rendered width and device pixel ratio, and rechecks on resize. Supplied SVGs replace small raster Brownie and pool-float illustrations on the remaining pages. The actual source video is 720 px high, which is the maximum native video detail; the pipeline does not invent higher resolution.
- Requested surfaces have 1 px near-black outlines in light mode and light outlines in dark mode. Each step and FAQ is an individual rounded surface. The mascot video elements themselves remain borderless. FAQ padding and focus treatment keep the disclosure usable inside its outline.
- Browser verification passed 79 checks: all nine pages at 1440, 768, 390, and 320 px in Light and Dark, plus phone geometry, original image resolution, adaptive video at 1x through 4x pixel densities, all six gallery videos, theme changes, pause/resume, offscreen pause, reduced motion, no-JavaScript fallback, keyboard FAQ operation, and the drink demo. All 18 accessibility scans passed, covering all nine pages in both themes. No JavaScript exceptions or failed local resources were recorded. GitHub release requests were simulated during this run.
- A focused Features check confirmed all six 720 px dark animations at a 390 px viewport with 4x pixel density. Background samples at 0.5, 4.5, and 8.5 seconds match the dark surface within codec rounding tolerance, with no green backdrop. The shared pause control also passed.
- Visual review covered the phone at 3x density, light and dark mobile phone previews, both mascot galleries, vector illustrations, and the outlined feature, demo, step, and FAQ surfaces. Evidence: `.cache/website-redesign/dashboard-update/`, including `results.json` and `features-hd-results.json`. The reference informed device framing; the Android frame, Manny animation, and actual app UI are retained intentionally.
- JavaScript syntax and typecheck passed. Lint has zero errors and the same 27 pre-existing mobile-app warnings. Physical-device and non-Chrome playback testing were not performed. No deployment was requested.

Phone, resolution, and outline final result: passed. No actionable P0/P1/P2 findings remain.

## Follow-up: background grid

Added a 32 px grid with 1 px lines: black at 12% opacity in Light and white at 8% in Dark. Existing canvas and surface colors are unchanged. Browser checks confirmed both theme values, 320 px layouts, and the no-JavaScript dark System fallback. Visual evidence: `.cache/grid-light.png` and `.cache/grid-dark.png`. Typecheck passed; lint has zero errors and the same 27 existing mobile-app warnings.

## Follow-up: autoplay by default

At the user's request, animations now start playing by default, replacing the earlier initial pause based on reduced motion. Visible videos remain muted and looping; manual pause/resume, offscreen pause, and hidden-page pause remain available. Browser checks passed on Home and Features with both normal and reduced-motion settings, including all six gallery videos, dashboard autoplay, swimming autoplay, and shared pause/resume. Typecheck passed; lint has zero errors and the same 27 existing mobile-app warnings.

## Follow-up: full-width swimming strips

Replaced the static Brownie image above the closing call to action on Home and Features with the existing swimming animation. The homepage hero and both closing strips span the entire page width; text and phone content retain their original container widths. A shared observer manages each strip independently, so the visible pool plays while offscreen pools pause. The same pause controls continue to affect all animations.

Browser verification passed 20 scenarios across Home and Features, Light and Dark, and 1920, 1440, 768, 390, and 320 px widths. Each strip reaches both page edges without horizontal overflow. Replacement, automatic playback, independent visibility, and mouse/keyboard pause/resume passed. All eight accessibility scans passed, with no JavaScript exceptions or failed local resources. Final screenshots and results are in `.cache/website-redesign/fullwidth-pools/`. Visual review covered the desktop and phone closing sections and full-width hero. Syntax and typecheck passed; lint has zero errors and the same 27 existing warnings.

Full-width swimming final result: passed. No actionable P0/P1/P2 findings remain. The user-supplied replacement phone artwork and newly generated swimming clip remain pending; this update reuses the current swimming assets.

## Follow-up: steady offscreen swim path

Removed the visible return and turn. Brownie now travels in one direction at a constant 45 pixels per second, beginning fully beyond the left edge and ending fully beyond the right edge before the animation resets. The duration is calculated from each pool's rendered width, which keeps the speed consistent across devices.

Browser geometry checks passed at 1920, 1440, 768, 390, and 320 px: the character is fully clipped at both endpoints, retains the same orientation throughout, advances monotonically, measures 45 px/s at every width, and causes no horizontal overflow. Results and midpoint captures are in `.cache/website-redesign/swim-path/`. Syntax and typecheck passed; lint has zero errors and the same 27 existing warnings.

## Follow-up: water-filled closing section

The entire closing call-to-action section on Home and Features now uses one continuous pool surface, rather than ending the water above the copy. Heading, supporting copy, eyebrow, and fine print use #131313 in both website themes. The download action uses a #131313 background with white text. The animation and pause control remain active over the same water surface.

Browser verification passed 12 responsive scenarios across Home and Features, Light and Dark, and 1440, 390, and 320 px widths. The section reaches both viewport edges with no overflow; computed colors and background artwork match the specification. All eight representative accessibility scans passed. Visual evidence is in `.cache/website-redesign/water-closing/`.

## Follow-up: stabilized swimming source

The user's screen recording showed visible frame-to-frame wobble in the original 18 fps cutout. The swimmer was rebuilt from the cleaner `assets/capibara swimming right to left.mp4` source at 24 fps. A smooth tracking curve stabilizes the body, and color keying with green despill produces softer transparent edges. The external page movement remains the verified constant 45 px/s offscreen path.

Measured median character-center movement between decoded frames fell from 5.82 px to 0.93 px; the 95th percentile fell from 10.45 px to 2.39 px. Browser captures at 1440 and 390 px show clean edges over the pool, with at most one residual green-classified pixel in the full 320 × 240 source frame. Chrome produced ten distinct consecutive rendered frames, confirming active playback. Screenshots and comparison artifacts are in `.cache/website-redesign/smooth-swimmer/` and `.cache/swim-smooth-review/`.

## Follow-up: resolution-independent water

Replaced the stretched raster pool background and its uneven wave edge with a CSS-rendered water surface. The water uses the existing #6bd6e1 color and a precise 32 px grid made from 1 px translucent white lines. It now remains crisp at every pixel density, has a straight top edge, and matches the scale of the website background grid without changing either theme's page background colors.

Browser verification passed 16 layouts across Home and Features, Light and Dark, 1440, 390, and 320 px widths, and 1×, 2×, and 3× device pixel ratios. The checks confirmed there are no raster water elements or background URLs, the grid remains exactly 32 px, all sections span the viewport without overflow, and swimming continues automatically. Eight representative accessibility scans passed. High-density visual evidence is in `.cache/website-redesign/vector-water/`.

## Follow-up: complete card outlines

Added the established 1 px theme-ink outline to every content surface shown in the supplied references. Existing download and goal panels now have outlines; the beverage table has become one rounded, outlined surface; and the About philosophy, values, and open-source areas now use purpose-built padded cards. Matching floating cards, notices, contact panels, and legal information surfaces received the same treatment for visual consistency. Mobile card padding reduces to 24 px.

Browser verification passed 30 responsive page layouts across Download, Features, About, Support, Privacy, and Terms in Light and Dark at 1440, 390, and 320 px. Every target has a visible solid 1 px outline and rounded corners, with no horizontal overflow. Six representative accessibility scans passed. Visual evidence is in `.cache/website-redesign/card-outlines/`.

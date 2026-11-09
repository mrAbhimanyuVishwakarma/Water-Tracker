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

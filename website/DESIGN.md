---
name: Brownie Water Tracker
description: A calm, playful hydration companion built around small daily wins and friendly animal mascots.
colors:
  canvas: "#fefcf9"
  surface: "#ffffff"
  ink: "#131313"
  muted-ink: "#737373"
  positive: "#3cb371"
  positive-ink: "#25754a"
  coral: "#fe6f61"
  danger-ink: "#b54036"
  line: "#e9e6e1"
  pool-blue: "#6bd6e1"
  footer: "#131313"
  button-hover: "#353535"
  dark-canvas: "#161615"
  dark-surface: "#232321"
  dark-ink: "#f4f2ed"
  dark-muted-ink: "#b4b1aa"
  dark-line: "#41403b"
  dark-footer: "#0e0f0d"
typography:
  display:
    fontFamily: "Lato, Arial, sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Lato, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Lato, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.45
  body:
    fontFamily: "Lato, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Lato, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  caption:
    fontFamily: "Lato, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Lato, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.09em"
rounded:
  control: "8px"
  focus-inset: "10px"
  surface: "12px"
  brand: "9px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
    height: "46px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
    height: "46px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "28px"
  navigation:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    height: "80px"
---

# Design System: Brownie Water Tracker

## Overview

**Creative North Star: "The Friendly Poolside Field Guide"**

Brownie Water Tracker combines the clarity of a practical wellness tool with the companionship of a small illustrated world. The warm paper-like canvas, visible square grid, near-black outlines, and compact Lato typography make information feel trustworthy and easy to scan. Animated animal mascots, turquoise water bands, and short encouraging copy keep that utility from becoming clinical.

The system is deliberately flat and legible at rest. White surfaces sit directly on the gridded canvas with crisp dark outlines; elevation is reserved for floating or temporary elements. The homepage may be theatrical—Brownie swims across the pool and feature cards orbit the phone preview—but interior pages return to straightforward grids, panels, tables, and reading columns.

**Key Characteristics:**

- Warm, gridded canvas with clean white surfaces and ink-black structure
- Friendly illustrated mascots used as product companions, never decoration alone
- Turquoise water as the signature environmental motif
- Green and coral reserved for meaningful positive and caution states
- Compact, bold Lato hierarchy with plain-spoken, reassuring copy
- Light and dark themes that retain the same hierarchy and semantic color roles

## Colors

The palette is a warm neutral foundation punctuated by water blue and small semantic accents. The YAML tokens above are normative.

### Primary

- **Pool Blue:** The signature environmental color for swimming bands, moving shorelines, and the closing call-to-action field. It is an atmospheric brand color, not the default button color.
- **Deep Hydration Green:** Used for readable positive labels, links, completed states, and success feedback.
- **Fresh Hydration Green:** Used for icons, progress fills, and compact positive indicators where the larger shape supplies enough contrast.

### Secondary

- **Alert Coral:** Draws attention to warnings, critical borders, and caution icons without turning the interface into an alarm state.
- **Deep Alert Coral:** Carries warning and error text where stronger contrast is required.

### Neutral

- **Warm Paper:** The light-theme canvas and grid field.
- **Clean Surface:** Cards, menus, panels, and contained reading surfaces.
- **Soft Ink:** Headings, outlines, focus rings, filled actions, and the light-theme footer.
- **Quiet Gray:** Supporting copy, metadata, indexes, and secondary navigation.
- **Warm Divider:** Low-emphasis separators inside tables and lists.
- **Night Canvas / Night Surface / Chalk Ink:** Dark-theme equivalents that preserve warmth rather than shifting to blue-gray.

**The Ink-First Rule.** Primary actions and structural borders use ink; Pool Blue belongs to the water world, not every control.

**The Semantic Accent Rule.** Green communicates progress or availability and coral communicates caution. Do not use either merely to decorate a neutral section.

**The Closing Shore Rule.** The turquoise closing section keeps fixed dark text and controls in both themes so it remains a stable branded shoreline.

## Typography

**Display Font:** Lato (Arial and generic sans-serif fallback)

**Body Font:** Lato (Arial and generic sans-serif fallback)

**Character:** Lato keeps the product approachable without looking childish. Bold weights create the hierarchy; regular text stays open and calm. Tight headline tracking gives the friendly copy enough authority to anchor illustrated scenes.

### Hierarchy

- **Display** (700, 48px, 1.04 leading, -0.025em tracking): Homepage and interior-page hero headlines. Reduce to 36px below 700px and 32px below 380px.
- **Headline** (700, 30px, 1.2 leading, -0.025em tracking): Section headings. Reduce to 28px below 700px.
- **Title** (700, 18px, 1.45 leading): Card titles and compact subsection headings.
- **Body Large** (400, 20px, 1.4 leading): Hero subtitles and page leads; reduce to 18px with 1.5 leading on mobile.
- **Body** (400, 16px, 1.5 leading): Default prose and interactive labels.
- **Small Body** (400, 14–15px, 1.5–1.65 leading): Cards, installation steps, table content, and supporting explanations.
- **Eyebrow** (400, 11–12px, 1.5 leading, 0.09–0.12em tracking, uppercase): Section context and quiet metadata.
- **Button** (700, 14px, 20px leading): Primary and secondary actions.

**The One-Family Rule.** Use Lato for every interface role. Hierarchy comes from weight, scale, spacing, and case—not a second display face.

**The Quiet Metadata Rule.** Small labels use muted color and measured tracking; they never compete with the next heading.

## Layout

The site uses a centered fluid container capped at 1200px. Desktop gutters are 48px per side, compress to 32px below 1100px, 20px below 700px, and 16px below 380px. The background carries a persistent 32px square grid made from one-pixel lines, so components should align to a practical 4px/8px rhythm without forcing every edge onto a grid line.

Standard sections use 64px vertical padding and compress to 48px on mobile. Common desktop compositions include three-column feature and mascot grids, two-column 1:1 editorial splits with 100px gaps, and focused reading columns around 780px. At 860px, navigation collapses and multi-column card layouts begin to simplify. At 700px, editorial splits become one column; at 380px, dense two-column card grids become single-column when necessary.

The homepage hero is the intentional exception: a centered phone preview is surrounded by six floating cards within a 1080px scene. Below 700px, the phone becomes the first grid item and the six cards flow into a two-column list; below 380px they stack. Do not reuse this orbital composition for ordinary interior content.

Interactive targets are at least 44px high. Sticky navigation is 80px on desktop and 72px at tablet/mobile widths. Long-form legal content stays within a 780px reading column, and wide tables scroll horizontally rather than compressing into illegibility.

**The Grid-and-Gutter Rule.** The 32px background grid sets the atmosphere; the responsive container sets actual alignment.

**The Mobile-Reflow Rule.** Recompose, do not merely shrink: floating objects enter normal flow, paired layouts stack, and essential actions become full width only when space demands it.

## Elevation & Depth

Brownie is flat by default. Cards, panels, accordions, and tables use a one-pixel ink border on a surface-colored fill with no shadow. Depth appears when an element literally floats over the composition or temporarily overlays the page.

### Shadow Vocabulary

- **Floating:** `0 25px 50px -12px rgb(0 0 0 / 25%)` in light mode and `0 25px 50px -12px rgb(0 0 0 / 50%)` in dark mode. Use for hero callout cards, the mobile navigation popover, and the consent banner.
- **Mobile Floating Card:** `0 12px 28px -14px rgb(0 0 0 / 24%)`. Use only after hero callouts enter the mobile document flow.
- **Hover Lift:** Floating hero cards move upward 4px over 200ms; static cards underline their title instead of lifting.

**The Flat-by-Default Rule.** If a surface participates in normal document flow, prefer an ink border over a shadow.

**The Honest Elevation Rule.** Shadows indicate overlap or temporary layering, not importance.

## Shapes

The system uses sturdy, gently rounded geometry. Standard cards, popovers, panels, and accordions use a 12px radius. Compact notices and row controls use 8px. The square brand icon uses 9px. Buttons, theme controls, progress tracks, and status capsules are fully pill-shaped.

Borders are usually one pixel and ink-colored, producing a field-guide or illustrated-card quality. Low-emphasis internal dividers use the line token. Avoid stacked borders around every nested region; internal spacing and the 32px grid should do most of the grouping work.

Water bands are the major organic countershape. Repeating masked waves cap the turquoise field, while mascot art remains soft, rounded, and free of decorative frames.

**The Twelve-Pixel Surface Rule.** New standalone cards and panels start at a 12px radius unless their small scale clearly calls for 8px.

**The Pill-for-Actions Rule.** Filled and outlined calls to action are pills; content containers are not.

## Components

### Buttons

- **Shape:** Full pill with a one-pixel ink border, 12px × 20px padding, 10px content gap, and a 46px minimum height.
- **Primary:** Ink fill with canvas-colored text; hover shifts to the theme's button-hover neutral.
- **Secondary:** Transparent fill with ink text; hover inverts to ink fill and canvas text.
- **Compact Header Action:** 40px minimum height, 9px × 16px padding, and 13px type; returns to a 44px touch target on mobile.
- **Focus:** Two-pixel ink outline with a 5px offset. Footer focus rings switch to white.
- **Motion:** Color changes are restrained. Do not add scale, bounce, or glow to standard actions.

### Cards / Containers

- **Style:** Clean surface fill, one-pixel ink border, 12px corners, and 24–32px internal padding.
- **Static Cards:** No shadow. On linked feature cards, underline the heading on hover.
- **Floating Callouts:** 248px desktop width, 20px padding, ambient shadow, and a 4px hover lift. Positive and coral variants color only their icon and title.
- **Information Panels:** Use internal line-token dividers for repeated rows rather than separate nested cards.
- **Critical Panels:** Keep the normal surface and change only the relevant border/accent to coral.

### Navigation

- **Desktop:** Sticky canvas-colored header, 80px tall. The brand sits left, quiet 14px links occupy the center, and theme/download actions sit right. Active links become ink and bold.
- **Mobile:** At 860px and below, replace desktop links with a native disclosure menu. The popover is a 12px surface with floating shadow; rows are at least 48px high.
- **Brand:** 36px rounded icon plus the full “Brownie Water Tracker” name. At 700px the icon is 32px; at 380px it is 28px and the text tightens rather than truncating.

### Hydration Demo

The demo panel pairs a large numeric total with a native semantic progress element. Drink rows are 64px minimum height, have an 8px radius, and reveal a soft canvas fill plus line border on hover. Keep calculations and feedback in text; color is reinforcement, not the only signal.

### Mascot Cards and Swimming Pools

Mascot cards follow the standard bordered surface pattern and center a square, object-contained animation or poster. Motion loads only near the viewport and exposes a shared pause/play control. Swimming pools use Pool Blue, the 32px grid, masked wave edges, and horizontal travel at roughly 45px per second. The mascot flips at each edge instead of jumping back.

Honor `prefers-reduced-motion`: remove wave animation, reduce all animation/transition durations to effectively zero, and keep a useful static poster. Animation must never be required to understand or operate the page.

### FAQ Accordion

Use native disclosure semantics. Each item is a 12px bordered surface; the summary is at least 72px high with 24px padding. Rotate the caret 180 degrees when open and place the answer within the same surface, not a nested card.

### Footer

The footer is the strongest tonal inversion: near-black in light mode and deeper black in dark mode, with white primary text and quiet gray supporting copy. It uses four columns on desktop and two below 700px. Links expand to 44px touch targets on mobile.

## Do's and Don'ts

### Do:

- **Do** preserve the warm canvas, visible 32px grid, ink outlines, and white surfaces as the system's default field.
- **Do** use mascots to demonstrate companionship, progress, or product behavior.
- **Do** keep card padding generous and content hierarchy plain enough to scan at a glance.
- **Do** reserve shadows for elements that overlap or temporarily float above the page.
- **Do** provide light/dark token pairs and verify fixed-color water sections in both themes.
- **Do** keep controls keyboard-visible, touch-friendly, and understandable without motion or color.

### Don't:

- **Don't** turn Pool Blue, green, or coral into general-purpose decoration across ordinary controls.
- **Don't** add gradients, glassmorphism, blurred panels, or glossy app-store styling; they conflict with the illustrated field-guide character.
- **Don't** place shadows on every card or use elevation as a substitute for grouping.
- **Don't** introduce a second font family or novelty display lettering.
- **Don't** preserve desktop orbital positioning on mobile; move floating content into a readable grid or stack.
- **Don't** animate continuously without viewport pausing, a user control, and a reduced-motion fallback.

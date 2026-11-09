# Brownie Water Tracker - Official Website 💧

Official website for **Brownie Water Tracker**, a calm, friendly Android hydration app starring Brownie the Zen Capybara and collectible animal friends.

- **Production Domain:** [https://watertrackerbrownie.vercel.app](https://watertrackerbrownie.vercel.app)
- **GitHub Repository:** [mrAbhimanyuVishwakarma/Water-Tracker](https://github.com/mrAbhimanyuVishwakarma/Water-Tracker)
- **Latest Release:** [GitHub Releases](https://github.com/mrAbhimanyuVishwakarma/Water-Tracker/releases/latest)

---

## Website Architecture

- **Stack:** Semantic HTML5, Modern CSS, Dependency-free Vanilla JavaScript.
- **Privacy First:** No advertising cookies, no trackers loaded without explicit user consent.
- **Progressive Enhancement:** Downloads fall back statically to GitHub Releases and dynamically query the GitHub Releases API to resolve direct `.apk` downloads, file size, and publication dates.
- **Accessibility:** Semantic landmarks, native disclosure menus and FAQs, visible keyboard focus, responsive layouts, and reduced-motion support. Browser and accessibility check results are recorded in the repository's `design-qa.md`.

## Pages

1. `index.html` - Main landing page with hero, interactive hydration calculator demo, feature pillars, mascot gallery, and download CTA.
2. `features.html` - Complete technical and design breakdown of the 11 beverage multipliers, personalized goal calculations, and sleeping-hours reminders.
3. `download.html` - Android APK download instructions, architecture details (ARM64/x86_64), sideloading guide, and Google Play status.
4. `privacy.html` - Complete privacy disclosures for local storage, Supabase cloud backup, RevenueCat billing, and data rights.
5. `terms.html` - Terms of use, wellness disclaimer, and intellectual property terms.
6. `delete-account.html` - In-app and public web account deletion instructions satisfying Google Play User Data policies.
7. `support.html` - Android notification troubleshooting, FAQ accordion, and GitHub Issues support routing.
8. `about.html` - Origin story of Brownie the Zen Capybara, design philosophy, and open-source architecture.
9. `404.html` - Branded error screen with return navigation.

## Design

The website follows the Oasis Health design guide in the repository's `DESIGN.md`: a warm `#FEFCF9` canvas, near-black text and actions, Lato typography, white cards, green success indicators, and restrained coral accents. The homepage adapts its floating-card composition to Brownie's real Android screenshot and existing mascot artwork. Mobile layouts place the feature cards below the phone preview.

Lato Regular and Bold are served locally from `assets/fonts/` under the included SIL Open Font License. The locally served Phosphor icons in `assets/icons/` include their MIT license. There are no external font or icon requests.

The site stays dependency-free. Navigation, FAQs, and official release links work without JavaScript. JavaScript enhances the sample hydration log, cookie preferences, and latest-release download metadata. Google Play is shown as coming soon until a real listing is configured.

### Appearance

The header's appearance control offers **System**, **Dark**, and **Light**, with **System** as the default. It uses the same Phosphor icon family as the rest of the site. The selected preference is saved locally, shared across pages and tabs, and applied by `theme.js` before the stylesheet paints. System mode follows device appearance changes automatically. If storage is unavailable, the control still works for the current page. Without JavaScript, CSS follows the system preference.

Dark mode uses warm charcoal surfaces, lighter text, and matching semantic accents. The appearance button displays only its monitor, moon, or sun icon. Each click cycles **System → Dark → Light → System**. The native button also works with Enter and Space, identifies the current and next choices through its accessible name and tooltip, and announces selections to screen readers.

### Mascot animations

Home and Features use all six sipping clips from the app's `assets/` directory, including Brownie. Website-ready derivatives live in `assets/mascots/`: H.264 MP4 matching the white card surface, `.dark.mp4` versions matching the dark card surface (`#232321`), transparent WebM alternatives, and transparent WebP posters. Theme changes select the matching MP4 automatically. The RGB background key preserves Turbo's light-green body. Source MP4s remain unchanged.

The player selects a 512 px or native 720 px (`.hd`) MP4 using the rendered size and device pixel ratio, and rechecks on resize. This keeps high-density displays sharp while smaller displays use the lighter rendition. Posters use the 720 px version. Supplied SVG artwork is used for still Brownie and pool-float illustrations; the phone frame and dashboard UI retain their original 1183 px and 1080 px widths.

The homepage phone preview fills the frame's inner display with white status and navigation areas. Its camera is cropped from the real frame asset; status icons use local vector assets. Manny's animation sits in the original dashboard illustration area, while the goal badge, metrics, drink shortcuts, and navigation retain their original screenshot pixels. The phone has a visible animation pause control, and its app display stays light in either website theme.

Animations start playing automatically. Videos load and play only while their cards are visible and pause when the page is hidden. Each gallery has a keyboard-accessible play/pause control. Without JavaScript, clean posters remain visible.

Regenerate the website media with a full FFmpeg build:

```bash
node scripts/prepare-website-mascots.cjs
```

Run from the repository root. Use `--ffmpeg <executable-path>` if FFmpeg is not on PATH, `--posters-only` to review the key, `--dark-only` to regenerate dark card variants, `--size 720` to create HD renditions, or `--only brownie` to process one mascot. HD output includes MP4 and WebP; standard output also includes transparent WebM. If the dark surface color changes, update the matching matte in the script and regenerate those variants.

Support cards, feature cards, the drink demo, mascot cards, routine steps, and individual FAQ disclosures use a 1 px outline: near-black in light mode and light in dark mode. The video elements themselves have no border.

### Swimming pools

The homepage hero and the closing sections on Home and Features use swimming pool strips spanning the full page width. The text remains inside the usual content container. The water surface is rendered with resolution-independent CSS using a crisp 32 px grid, so it stays sharp on high-density displays and has a clean straight edge. The transparent 24 fps swimmer is stabilized and keyed from `assets/capibara swimming right to left.mp4`; the original source is preserved.

Brownie swims from beyond the left edge to beyond the right edge at a constant 45 pixels per second. The loop resets while fully offscreen, so no turn is visible. Each strip starts automatically when visible and pauses when offscreen or when the page is hidden. The shared pause controls affect the pool strips and mascot videos together. Without JavaScript, a still pool and capybara remain visible.

Regenerate the swimming assets with `node scripts/prepare-website-swimming.cjs`, adding `--ffmpeg <executable-path>` if FFmpeg is not on PATH. Website derivatives are in `website/assets/swimming/`. The legacy raster pool derivative may still be generated for reference, but the website does not load it.

## Redesign branch and rollback

The redesign is isolated on `website-redesign`. The pre-redesign baseline is commit `2c83a8e570925df35f35bbd91fde353d7d88ba20`, also the starting point of `main` when this work began.

To review the redesign:

```bash
git switch website-redesign
```

To return to the original version while `main` still points to the baseline:

```bash
git switch main
```

Commit or stash unrelated work before switching branches. If the redesign is later merged, use `git revert` on its commit to undo it while retaining history.

## Local Preview

You can preview the site locally using any static web server:

```bash
# Using Python
python -m http.server 3000

# Using Node / npx
npx serve .
```

Open `http://localhost:3000` in your web browser.

## Deployment to Vercel

```bash
# Deploy to production
npx vercel --prod
```

Configure `watertrackerbrownie.vercel.app` as the production domain.

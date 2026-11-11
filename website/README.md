# Brownie Water Tracker - Official Website 💧

Official website for **Brownie Water Tracker**, a calm, friendly Android hydration app starring Brownie the Zen Capybara and collectible animal friends.

- **Production Domain:** [https://watertrackerbrownie.vercel.app](https://watertrackerbrownie.vercel.app)
- **GitHub Repository:** [mrAbhimanyuVishwakarma/Water-Tracker](https://github.com/mrAbhimanyuVishwakarma/Water-Tracker)
- **Latest Release:** [GitHub Releases](https://github.com/mrAbhimanyuVishwakarma/Water-Tracker/releases/latest)

New to websites? Follow [How to create a website](<../how to create a website>) for a small practice project and step-by-step instructions for working on this site.

---

## Website Architecture

- **Stack:** Semantic HTML5, Modern CSS, Dependency-free Vanilla JavaScript.
- **Hosting:** Static pages on Vercel, with an optional Node.js download redirect at `api/download.js`.
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
10. `donate.html` - Sponsor, Donate, and Pro Member options, including UPI donation details and in-app Pro guidance.

### Supporting Brownie

The Donate navigation entry opens `donate.html`. Every footer links to Sponsor, Donate, and Pro Member, and About links to the support page. Navigation switches to the mobile menu at 860 px to keep all five links usable.

The page uses the approved developer accounts from the AxePower reference: [GitHub Sponsors](https://github.com/sponsors/mrAbhimanyuVishwakarma), [Buy Me a Coffee](https://buymeacoffee.com/mrabhimanyu), and UPI `abhimanyuvishwakarma5120@sbi` for Abhimanyu Vishwakarma. The original QR image is preserved in `assets/support/upi-qr.png`. The displayed `upi-qr.svg` encodes that image's exact decoded payment payload with a four-module quiet zone, so the code stays sharp at phone sizes. Its payee matches the displayed UPI ID and payment link. Update the QR, displayed address, and payment link together when changing the payee. External payments happen on the chosen service or UPI app; the website contains no checkout or payment-status handling.

The UPI copy button uses the browser clipboard with an announced success or manual-copy message. The selectable address, payment links, and QR remain available without JavaScript. Pro is described separately from donations: the core app stays free, and Pro adds five companions. Prices come from the Android app and Google Play, rather than being hard-coded on the website. Pro instructions state that purchases will be available in the Google Play release.

The Sponsor, Donate, and Pro Member cards, payment-details panel, and Free/Pro comparison table have a 1 px theme-ink outline with rounded corners. About's open-source panel and Support's contact panel remain transparent and borderless.

## Design

The website follows the Oasis Health design guide in the repository's `DESIGN.md`: a warm `#FEFCF9` canvas, near-black text and actions, Lato typography, white cards, green success indicators, and restrained coral accents. The homepage adapts its floating-card composition to Brownie's real Android screenshot and existing mascot artwork. Mobile layouts place the feature cards below the phone preview.

Lato Regular and Bold are served locally from `assets/fonts/` under the included SIL Open Font License. The locally served Phosphor icons in `assets/icons/` include their MIT license. There are no external font or icon requests.

The site stays dependency-free. Navigation, FAQs, and official release links work without JavaScript. JavaScript enhances the sample hydration log, cookie preferences, and latest-release download metadata. Google Play is shown as coming soon until a real listing is configured.

### Appearance

The header's appearance control offers **Light**, **Dark**, and **System**, with **Light** as the default regardless of device appearance. It uses the same Phosphor icon family as the rest of the site. The selected preference is saved locally, shared across pages and tabs, and applied by `theme.js` before the stylesheet paints. System mode follows device appearance changes automatically. If storage is unavailable, the control still works for the current page. Without JavaScript, CSS also defaults to Light.

Dark mode uses warm charcoal surfaces, lighter text, and matching semantic accents. The appearance button displays only its sun, moon, or monitor icon. Each click cycles **Light → Dark → System → Light**. The native button also works with Enter and Space, identifies the current and next choices through its accessible name and tooltip, and announces selections to screen readers.

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

Support cards, feature cards, the drink demo, mascot cards, routine steps, and individual FAQ disclosures use a 1 px outline: near-black in light mode and light in dark mode. The video elements themselves have no border. The same treatment covers interior-page content panels: download and goal-calculation panels, beverage tables, About philosophy and value panels, notices, and legal information boxes. About's open-source panel and Support's contact panel have transparent backgrounds and no border, allowing the page grid to show through. They leave 64 px before the water section on desktop and 32 px on phones.

### Swimming pools

The homepage hero and the closing section immediately above the black footer on every page use swimming pool strips spanning the full page width, including About, Support, Download, legal pages, and 404. The text remains inside the usual content container. The water surface uses a crisp 32 px CSS grid. The hero water meets the header directly and has an animated wave along its bottom edge; every closing water section has an animated wave along its top edge. Small local SVG masks keep the curves sharp at any pixel density. The transparent 24 fps swimmer is stabilized and keyed from `assets/capibara swimming right to left.mp4`; the original source is preserved.

Brownie swims left to right, turns to face left at the right edge, and swims back in a continuous loop at 45 pixels per second. The complete swimmer stays within the pool at both ends. Translation and facing animations share the same duration and pause state. Each strip starts automatically when visible and pauses when offscreen or when the page is hidden. The shared pause controls affect the pool strips and mascot videos together, and also work on pages without mascot videos. Without JavaScript, a still pool and capybara remain visible.

The shoreline moves independently of the stationary water grid in a seamless ten-second loop. Only the narrow edge is animated. Waves follow the same pause, visibility, and hidden-page state as their swimmer, and stay static with reduced motion or without JavaScript. The page's background grid shows through the curved edges in both appearances.

Regenerate the swimming assets with `node scripts/prepare-website-swimming.cjs`, adding `--ffmpeg <executable-path>` if FFmpeg is not on PATH. Website derivatives are in `website/assets/swimming/`. The legacy raster pool derivative may still be generated for reference, but the website does not load it.

## Branches and history

`main` includes the website redesign, the shared swimming closing section, and the Light appearance default. The `website-redesign` branch preserves the implementation history. The pre-redesign baseline is commit `2c83a8e570925df35f35bbd91fde353d7d88ba20`; switching to `main` does not restore that old design.

Review earlier versions with Git history. For a shared branch, use a reviewed revert commit when a change must be undone, so later work remains in the history.

## Where to edit

| File | Purpose |
| --- | --- |
| `index.html` | Homepage copy, sample drink log, and phone preview |
| `about.html`, `features.html`, and other HTML files | Individual pages and their navigation/footer markup |
| `styles.css` | Shared colors, layout, responsive rules, and swimming path/facing animations |
| `theme.js` | Light default, saved appearance, and appearance button |
| `script.js` | Drink demo, release lookup, animation visibility, speed, and pause controls |
| `site-config.js` | Public repository, store, and demo configuration; some HTML links and metadata are also written directly in the pages |
| `assets/` | Website fonts, icons, illustrations, and prepared animation files |
| `vercel.json` | Clean URLs, caching, and response headers |

Each HTML page contains its own navigation, closing section, and footer. When changing shared markup, update all ten pages. Shared CSS and JavaScript changes apply across pages automatically.

## Local Preview

On Windows, double-click `testlocal.bat` in the repository root. It starts the server before opening `http://localhost:3000` in your browser. Double-clicking again reopens the same preview if it is already running. Keep its window open while working, and press Ctrl+C to stop it. If another application uses that port, run `testlocal.bat --port 3001`. Python 3 is required.

Run this from the repository root with Python installed:

```bash
python -m http.server 3000 --bind 127.0.0.1 --directory website
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser. Keep the terminal running, save edits, and refresh the page. Press Ctrl+C in the terminal to stop the preview. No website dependency installation or build command is needed.

Python serves the static files. It does not execute `api/download.js` or apply Vercel's clean URLs, headers, and cache settings. Use paths such as `/about.html` locally. The pages' GitHub release links and browser-side release lookup remain available.

Before committing, run `npm run lint` and `npm run typecheck` from the repository root with the project dependencies installed. Check the changed pages at desktop and phone widths. Verify appearance choices, both swimming directions, pause/resume, navigation, and download links. Results from the latest browser checks are in [design-qa.md](../design-qa.md).

## Deployment to Vercel

Import the GitHub repository into a Vercel project, or open the existing project's settings. Use these settings for this repository:

| Setting | Value |
| --- | --- |
| Root Directory | `website` |
| Framework Preset | `Other` |
| Build Command | Enable Override and leave empty |
| Output Directory | `.` (the selected website root) |
| Production branch | `main` |

These static build settings follow [Vercel's build configuration guide](https://vercel.com/docs/builds/configure-a-build). Production branch tracking is configured under **Settings → Environments → Production → Branch Tracking**; see [Vercel's Git deployment guide](https://vercel.com/docs/git#production-branch).

With the Git integration enabled, pushing changes to the configured production branch starts a deployment. Other branches normally receive preview deployments. A local commit becomes available to Vercel after it is pushed to GitHub.

The configured public URL is `https://watertrackerbrownie.vercel.app`. A separate project or fork receives its own URL. If changing the public domain or repository, also review the HTML canonical/social metadata, `robots.txt`, `sitemap.xml`, and hard-coded links alongside `site-config.js`.

The basic website and the current GitHub release resolver do not need database credentials. Keep local environment files and authentication tokens out of public source.

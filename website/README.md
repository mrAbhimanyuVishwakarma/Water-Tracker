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

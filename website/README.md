# Brownie Water Tracker - Official Website 💧

Official production website for **Brownie Water Tracker**, a playful, mindful Android hydration app starring Brownie the Zen Capybara and collectible animal friends.

- **Production Domain:** [https://watertrackerbrownie.vercel.app](https://watertrackerbrownie.vercel.app)
- **GitHub Repository:** [mrAbhimanyuVishwakarma/Water-Tracker](https://github.com/mrAbhimanyuVishwakarma/Water-Tracker)
- **Latest Release:** [GitHub Releases](https://github.com/mrAbhimanyuVishwakarma/Water-Tracker/releases/latest)

---

## Website Architecture

- **Stack:** Semantic HTML5, Modern CSS, Dependency-free Vanilla JavaScript.
- **Privacy First:** No advertising cookies, no trackers loaded without explicit user consent.
- **Progressive Enhancement:** Downloads fall back statically to GitHub Releases and dynamically query the GitHub Releases API to resolve direct `.apk` downloads, file size, and publication dates.
- **Accessibility:** WCAG 2.2 AA compliant, skip-to-content landmark, semantic heading hierarchy, visible focus rings, responsive font scaling, and `prefers-reduced-motion` support.

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

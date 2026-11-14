<p align="center">
  <img src="assets/icon.png" width="120" alt="Brownie Water Tracker app icon" />
</p>

<h1 align="center">Brownie Water Tracker 💧</h1>

<p align="center">
  A playful hydration tracker starring Brownie the capybara and friends.
</p>

## About

Brownie Water Tracker makes drinking enough water feel a little more fun. Set a personal daily goal, quickly log drinks, follow your progress, build healthy habits, and unlock a pool full of friendly mascots.

This repository is being prepared for Google Play. Login, cloud backups and premium billing require the external configuration in [the launch setup guide](docs/GOOGLE_PLAY_SETUP.md). Public release and real payments are not yet verified.

## Features

- Personalized 1,000–6,000 ml daily hydration goals with a smooth drag control
- Quick logging for water, tea, coffee, juice, milk, milkshakes, cold drinks, and electrolytes
- Effective hydration accounting so each drink contributes a realistic amount toward the goal
- A private user profile for body details, health context, medication, and appointment notes
- Daily history, progress, and streak tracking
- Hydration habit prompts and a calendar of logged goal days
- Six animated mascots and an interactive pool party
- Millilitre and fluid-ounce support
- Optional account backup with Supabase
- Google Play premium purchases and restore through RevenueCat (configuration required)

## Download

Download the latest Android APK from [GitHub Releases](https://github.com/mrAbhimanyuVishwakarma/Water-Tracker/releases).

The beta APK supports ARM64 Android devices and x86_64 emulators. The GitHub build can check official Releases, download a newer signed APK, and open Android's installer. Android may ask you to allow installation from Brownie. On Samsung, Auto Blocker can prevent sideloading; the app provides plain-language instructions. See [GitHub APK updates](docs/GITHUB_APK_UPDATES.md).

## Website

The [Brownie website](https://watertrackerbrownie.vercel.app) has its own HTML, CSS, JavaScript, and media in `website/`. It can be previewed without installing the mobile app's dependencies.

Run `npm run website:preview`, or on Windows double-click `scripts/windows/preview-website.bat`, to start the preview and open [http://localhost:3000](http://localhost:3000) in your browser. Python 3 must be installed. Keep the preview window open; press Ctrl+C to stop it.

From the repository root, with Python installed:

```bash
python -m http.server 3000 --bind 127.0.0.1 --directory website
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Stop the preview with Ctrl+C in the terminal.

The website defaults to Light appearance and remembers explicit Light, Dark, or System choices. Brownie swims left to right and back above the black footer on all ten pages, including About. Animation controls pause and resume the pool and mascot videos together. The homepage also has a working sample drink log and an animated phone preview.

The [Support Brownie page](website/donate.html) offers GitHub sponsorship, Buy Me a Coffee, a UPI QR code and copyable address, and a free-versus-Pro comparison. Donations support development; Pro is a separate purchase through the Android app's Google Play release.

Start with the [beginner website guide](docs/development/website-guide.md) for a first HTML/CSS/JavaScript project, local preview instructions, and GitHub/Vercel publishing steps. See the [website README](website/README.md) for file locations, animation assets, and hosting settings. Browser verification is recorded in the [website design review](docs/qa/website-design-review.md).

## Run locally

You need Node.js, npm, and the Android or iOS tools required by Expo.

```bash
git clone https://github.com/mrAbhimanyuVishwakarma/Water-Tracker.git
cd Water-Tracker
npm install
npx expo start
```

Copy `.env.example` to `.env` and fill the public configuration values. Use a development build for Google login, reminders, and purchases; Expo Go does not verify those flows. See [Google Play setup](docs/GOOGLE_PLAY_SETUP.md).

## Checks

```bash
npm test
npm run lint
npm run typecheck
npx expo-doctor
```

After installing a candidate APK on the Android test emulator, run `npm run test:android` for native gesture smoke checks. Add `-- --completed` when the local test character has reached its goal. See [character interactions](docs/character-interactions.md) for the test setup.

## Build

Create an installable Android preview with EAS:

```bash
npx eas-cli@latest build --platform android --profile preview
```

Create the GitHub-distributed APK with the in-app update flow enabled:

```bash
npx eas-cli@latest build --platform android --profile github-apk
```

The Google Play production profile intentionally excludes the package-install permission:

```bash
npx eas-cli@latest build --platform android --profile production
```

## Built with

Expo SDK 58, React Native 0.88, React 19, TypeScript, Reanimated, AsyncStorage, and Supabase.

## Project structure

```text
assets/          Runtime artwork, videos, character sources and prompt packs
docs/            Setup guides, QA records, release notes and archived research
plugins/         Expo config plugins
scripts/
  dev/           Local development helpers
  media/         Offline character and website media preparation
  qa/            Android runtime smoke checks
  release/       Build configuration validation
  windows/       Windows launchers and device helpers
  legacy/        Historical one-off authoring tools
src/             Application components, screens, hooks, services and utilities
tests/           Automated regression tests
supabase/        Backend configuration and migrations
website/         Public website and its independent deployment configuration
```

The native `android/` and `ios/` projects are generated by Expo and are intentionally excluded from version control. Build artifacts and APK files are also excluded; published APKs belong in GitHub Releases.

Keep runtime media in Git: Metro needs them when bundling the app. Original character sources and prompt packs remain alongside each character for reproducible authoring. `.easignore` excludes authoring inputs, website files and research from mobile build uploads. `.env.example`, lockfiles, project skills and shared design configuration remain versioned; local environment values, signing credentials, caches and machine-specific integrations do not.

The working draft `idea.txt` stays at its current path so open-editor notes are preserved. Start with the [documentation index](docs/README.md) and [script reference](scripts/README.md) for maintained commands. Historical project logs retain the paths used at the time they were written.

For build history and platform-specific notes, see [docs/PROJECT_LOG.md](docs/PROJECT_LOG.md).

## License

See [LICENSE](LICENSE) for license details.

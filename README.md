<p align="center">
  <img src="assets/icon.png" width="120" alt="Brownie Water Tracker app icon" />
</p>

<h1 align="center">Brownie Water Tracker 💧</h1>

<p align="center">
  A playful hydration tracker starring Brownie the capybara and friends.
</p>

## About

Brownie Water Tracker makes drinking enough water feel a little more fun. Set a personal daily goal, quickly log drinks, follow your progress, build healthy habits, and unlock a pool full of friendly mascots.

This repository currently contains the developer beta, with every mascot unlocked for testing.

## Features

- Personalized daily hydration goals
- Quick logging for water, tea, coffee, juice, milk, and electrolytes
- Daily history, progress, and streak tracking
- Hydration challenges and achievements
- Six animated mascots and an interactive pool party
- Millilitre and fluid-ounce support
- Optional account backup with Supabase
- In-app APK update checks through GitHub Releases

## Download

Download the latest Android APK from [GitHub Releases](https://github.com/mrAbhimanyuVishwakarma/Water-Tracker/releases).

The beta APK supports ARM64 Android devices and x86_64 emulators. Android may ask you to allow installation from your browser or file manager.

## Run locally

You need Node.js, npm, and the Android or iOS tools required by Expo.

```bash
git clone https://github.com/mrAbhimanyuVishwakarma/Water-Tracker.git
cd Water-Tracker
npm install
npx expo start
```

Then open the project in Expo Go or press `a` to launch Android. Native modules require a development build for full functionality.

## Checks

```bash
npx expo lint
npx tsc --noEmit
npx expo-doctor
```

## Build

Create an installable Android preview with EAS:

```bash
npx eas-cli@latest build --platform android --profile preview
```

## Built with

Expo SDK 58, React Native 0.88, React 19, TypeScript, Reanimated, AsyncStorage, and Supabase.

## License

See [LICENSE](LICENSE) for license details.

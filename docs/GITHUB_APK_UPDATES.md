# GitHub APK updates

Brownie has two Android distribution modes. Keep them separate because Google Play restricts use of `REQUEST_INSTALL_PACKAGES` for apps whose core purpose is not package installation.

## GitHub APK build

```powershell
npx eas-cli@latest build --platform android --profile github-apk
```

This profile sets `GITHUB_APK_UPDATES=true`. `app.config.js` then includes `android.permission.REQUEST_INSTALL_PACKAGES` and exposes the updater in Settings. The app checks only the latest release from `mrAbhimanyuVishwakarma/Water-Tracker`, accepts only `.apk` assets under that repository's official release-download URL, and rejects unexpectedly large files.

The user explicitly chooses **Download and install**. Android owns the final confirmation; Brownie cannot silently install an APK.

Use a newer semantic release tag such as `v0.0.2` and upload an APK with a clear name such as `WaterTrackerBrownie-v0.0.2.apk`.

## Samsung guidance

Some Samsung devices enable Auto Blocker, which blocks apps installed outside approved stores. Brownie explains the issue, but the user must make the security decision.

1. Open **Settings**.
2. Open **Security and privacy**.
3. Open **Auto Blocker** and temporarily turn it off if it blocks the install.
4. Return to Brownie, allow installation from this source when Android asks, and tap **Try installation again**.
5. Turn Auto Blocker back on after installing if desired.

Menu wording varies by device and One UI version. Brownie never changes this setting itself.

## Google Play build

```powershell
npx eas-cli@latest build --platform android --profile production
```

The production profile does not set `GITHUB_APK_UPDATES`. `app.config.js` blocks `REQUEST_INSTALL_PACKAGES`, and the updater UI stays hidden. Publish this AAB to Play rather than the GitHub APK.

## Release checklist

1. Bump the Expo version, Android `versionCode`, and package version.
2. Run tests, lint, typecheck, Expo dependency checks, and Expo Doctor.
3. Build with the `github-apk` profile.
4. Install it over the previous GitHub build and confirm the signing key matches.
5. Verify update detection against a test release.
6. Upload the APK and publish the prepared release notes.

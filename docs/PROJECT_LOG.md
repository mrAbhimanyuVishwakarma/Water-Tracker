# Water Tracker Project Log & Technical Master Handover

> **Last Updated:** 2026-10-27  
> **Project Name:** Water Tracker (Brownie the Capybara Water Tracker)  
> **Framework:** Expo SDK 58 / React Native 0.88 (New Architecture / Fabric / TurboModules Enabled)  
> **Package ID:** `com.brownie.watertracker`  
> **Repository:** `https://github.com/mrAbhimanyuVishwakarma/Water-Tracker`  
> **Releases URL:** `https://github.com/mrAbhimanyuVishwakarma/Water-Tracker/releases`

---

## 1. Project Overview & Architecture

### 1.1 Concept & Brand Identity
- **The Mascot**: **Brownie the Capybara** — a cheerful, chubby capybara swimming joyfully in crystal-clear turquoise pool water with rosy cheeks and a yellow yuzu citrus on his head.
- **Companion Mascots**:
  1. `brownie` — Brownie the Capybara (Original / Default)
  2. `dodo` — Dodo the Bird (Donut Float)
  3. `mammoth` — Mammoth the Elephant (Donut Float)
  4. `sloth` — Sloth the Buddy (Donut Float)
  5. `turtle` — Turtle the Tortoise (Donut Float)
  6. `penguin` — Penguin the Cool (Donut Float)
- **Visual Design**: Vibrant aqua/sky-blue palette (`#38BDF8`), sunlight water caustics, wobbly pool tile grout, wave shaders, and playful haptic feedback.

### 1.2 Technology Stack
- **Core**: Expo SDK ~58.0.19, React Native 0.88.0, TypeScript 5.9.2
- **State & Local Storage**: `@react-native-async-storage/async-storage` via [`src/utils/storage.ts`](../src/utils/storage.ts)
- **Cloud Backend & Sync**: Supabase (`@supabase/supabase-js`) via [`src/services/supabase.ts`](../src/services/supabase.ts)
- **Animation & Gestures**: `react-native-reanimated`, `react-native-gesture-handler`, `react-native-worklets`
- **Feedback & Sensors**: `expo-haptics`, `expo-sensors`
- **File System & Updates**: `expo-file-system/legacy`, `expo-intent-launcher`, `expo-constants`
- **Vector Graphics**: `react-native-svg`

---

## 2. Application Architecture & Screen Flow

### 2.1 Navigation & Screen Registry
The app uses screen routing managed in [`App.tsx`](../App.tsx):
- **`onboarding`** ([`src/components/OnboardingFlow.tsx`](../src/components/OnboardingFlow.tsx)):
  - 3-step onboarding flow: Introduction to Brownie, Health Profile setup (weight, activity level, climate), and Daily Water Target calculation.
  - Interactive pool preview background ([`src/components/InteractivePoolScreen.tsx`](../src/components/InteractivePoolScreen.tsx)).
- **`today`** ([`src/screens/DashboardScreen.tsx`](../src/screens/DashboardScreen.tsx)):
  - Main hydration dashboard.
  - Dynamic hydration visualization ([`src/components/CapybaraVessel.tsx`](../src/components/CapybaraVessel.tsx)).
  - Quick-log cup presets (200ml, 250ml, 330ml, 500ml) and custom beverage selector (water, coffee, tea, juice, milk, electrolyte).
- **`history`** ([`src/screens/HistoryScreen.tsx`](../src/screens/HistoryScreen.tsx)):
  - Weekly/monthly consumption graphs, streak counter, log editing, and hydration analytics.
- **`challenges`** ([`src/screens/ChallengesScreen.tsx`](../src/screens/ChallengesScreen.tsx)):
  - Hydration challenges (e.g. Caffeine Free, 30-Day Master, 8 Glasses a Day) with milestone badges.
- **`pool_party`** ([`src/components/InteractivePoolScreen.tsx`](../src/components/InteractivePoolScreen.tsx)):
  - Fun interactive playground where all unlocked mascots float on water donuts with realistic water physics, dragging, and splash sounds.
- **`settings`** ([`src/screens/SettingsScreen.tsx`](../src/screens/SettingsScreen.tsx)):
  - Measurement units (ml/oz), reminder schedule, sound/haptic toggles, account login/cloud backup, mascot picker, and GitHub In-App Updates.
- **`paywall`** ([`src/screens/PricingPaywallScreen.tsx`](../src/screens/PricingPaywallScreen.tsx)):
  - Premium subscription options (bypassed in the Developer Beta build).

---

## 3. UI/UX Bugfixes & Visual Polish

### 3.1 Seamless Pool Screen Bottom Fill
- **Issue**: On modern Android devices with gesture navigation bars, `Dimensions.get('window').height` excludes the system navigation inset. This caused fixed SVG coordinates to clip 60–100px before the screen bottom, revealing a blank, darker horizontal blue line below the "Get Started" button.
- **File**: [`src/components/InteractivePoolScreen.tsx`](../src/components/InteractivePoolScreen.tsx)
- **Fix**:
  1. Rendered dynamic SVG fill using `<Rect x="0" y="0" width="100%" height="100%" fill="url(#poolWaterGradient)" />` inside `<Svg style={StyleSheet.absoluteFill}>`.
  2. Expanded caustics and tile grout line rendering to `REAL_HEIGHT = Math.max(WINDOW, SCREEN) + 160`.
  3. Styled the "Get Started" button container to float at `bottom: Math.max(insets.bottom + 16, 28)` without an artificial opaque bar.

### 3.2 Onboarding "Get Started" Button Touch Responder Collision
- **Issue**: Tapping the "Get Started" button caused the floating mascot on the pool surface to drag instead of firing button clicks.
- **Fix**: Implemented `isTouchInInteractiveUI(e)` in [`InteractivePoolScreen.tsx`](../src/components/InteractivePoolScreen.tsx) checking button coordinates on `onStartShouldSetPanResponderCapture` so that interactive buttons always receive touch events without interference from the floating mascot's pan responder.

### 3.3 High-Resolution App Icon & Branding Assets
All required adaptive and static icons were generated and configured in [`assets/`](../assets) and [`app.json`](../app.json):
- `assets/icon.png`: 1024×1024 full-bleed square icon.
- `assets/favicon.png`: 192×192 web favicon.
- `assets/splash-icon.png`: 512×512 launch splash icon.
- `assets/android-icon-foreground.png`: Android 13+ adaptive icon foreground centered within the 66% safe zone.
- `assets/android-icon-background.png`: Adaptive background with turquoise pool water texture.
- `assets/android-icon-monochrome.png`: Monochrome silhouette for Android dynamic Material You theming.
- Floating donut floats:
  - `assets/dodo_donut_float.png`
  - `assets/mammoth_donut_float.png`
  - `assets/penguin_donut_float.png`
  - `assets/sloth_donut_float.png`
  - `assets/turtle_donut_float.png`

---

## 4. Developer Beta & Feature Unlocking

To facilitate testing and development without subscription friction:
- **Mascots**: All 6 mascots (`brownie`, `dodo`, `mammoth`, `sloth`, `turtle`, `penguin`) set to unlocked in [`src/constants/beverages.ts`](../src/constants/beverages.ts).
- **Settings & Storage**: Forced `isPremium: true` in default settings and in [`src/utils/storage.ts`](../src/utils/storage.ts) during settings load.
- **Paywall Bypass**: Mascot selector allows selecting any mascot without triggering paywall screens.

---

## 5. GitHub In-App Auto-Update System

### 5.1 Architecture & Workflow
1. **Release Check**:
   - Query endpoint: `https://api.github.com/repos/{repo}/releases/latest`.
   - Compares remote tag/version with installed `Constants.expoConfig.version` via `compareSemver`.
   - Filters release assets to locate `.apk` download URL.
2. **Background Download**:
   - Handled via `expo-file-system/legacy` using `createDownloadResumable`.
   - Progress callback updates state in real-time `0%` -> `100%`.
3. **Installer Trigger**:
   - Resolves local file URI to Android Content URI with `FileSystem.getContentUriAsync()`.
   - Launches Android system package installer via `expo-intent-launcher`:
     - Action: `android.intent.action.VIEW`
     - Flags: `FLAG_GRANT_READ_URI_PERMISSION (1)`
     - Type: `application/vnd.android.package-archive`

### 5.2 Implementation Files
- [`src/utils/updater.ts`](../src/utils/updater.ts): Core updater engine, semver logic, downloader, intent launcher.
- [`src/components/UpdateModal.tsx`](../src/components/UpdateModal.tsx): Modal UI presenting release notes, progress bar, and install action.
- [`src/screens/SettingsScreen.tsx`](../src/screens/SettingsScreen.tsx): Added "In-App Updates" card with manual "Check for Updates" trigger and customizable repository input.
- [`App.tsx`](../App.tsx): Background check on launch and modal rendering.
- [`app.json`](../app.json): Added `"android.permission.REQUEST_INSTALL_PACKAGES"`.

---

## 6. Android Native Build Engineering & Windows Path Workarounds

When building React Native with CMake and Ninja on Windows, several fatal hurdles occur:

### 6.1 Windows MAX_PATH (260 Character Limit) in Ninja
- **Error**: `ninja: error: Stat(...): Filename longer than 260 characters` or `ninja: error: mkdir(...): No such file or directory`.
- **Cause**: CMake generates escaped object file paths that include drive and directory names (e.g., `D_/Projects/Mobile_Apps/Water_Tracker/node_modules/...`) whenever source files live outside the `android/` subfolder.
- **Solution**: Created NTFS Directory Junctions inside each module's native directory:
  - `node_modules/react-native-worklets/android/Common` -> `../Common`
  - `node_modules/react-native-reanimated/android/Common` -> `../Common`
  - `node_modules/react-native-reanimated/Common/NativeView/codegen` -> `../../android/build/generated/source/codegen/jni`
  - `node_modules/react-native-gesture-handler/android/shared` -> `../shared`
  - `node_modules/react-native-svg/android/src/main/jni/common` -> `../../../../common`
  - `node_modules/react-native-safe-area-context/android/src/main/jni/common` -> `../../../../common`
  - Updated CMake files to reference local junctions: `${CMAKE_CURRENT_SOURCE_DIR}/...`.

### 6.2 `expo-modules-autolinking` Drive Root Crash
- **Error**: `Error: Couldn't find "package.json" up from path "W:\"`.
- **Cause**: In `autolinkingOptions.js` and `exports.js`, directory traversal upwards failed when reaching drive root `W:\`.
- **Fix**: Patched `node_modules/expo-modules-autolinking/build/commands/autolinkingOptions.js` and `exports.js` to guard against drive root boundaries.

### 6.3 `@react-native/gradle-plugin` Cross-Root Exception
- **Error**: `java.lang.IllegalArgumentException: this and base files have different roots: W:\... and D:\...`.
- **Cause**: Gradle files across substituted drive `W:\` and physical drive `D:\` caused Kotlin's `File.relativeTo(base)` to crash.
- **Fix**: In `node_modules/@react-native/gradle-plugin/shared/src/main/kotlin/com/facebook/react/utils/Os.kt`, wrapped relative path conversion in a `try / catch` fallback to `absolutePath`.

### 6.4 `react-native-worklets` Spotless Plugin
- **Error**: `Unresolved reference 'spotless'` in `react-native-worklets/android/build.gradle.kts`.
- **Fix**: Removed `id("com.diffplug.spotless")` and the `spotless { ... }` block.

### 6.5 R8 Proguard Missing Rules
- **Error**: Missing classes `expo.modules.core.interfaces.services.KeepAwakeManager`, `expo.modules.kotlin.types.AnyTypeProvider`, `expo.modules.kotlin.types.LazyKType`.
- **Fix**: Added suppressions in [`android/app/proguard-rules.pro`](../android/app/proguard-rules.pro):
  ```proguard
  -dontwarn expo.modules.core.interfaces.services.KeepAwakeManager
  -dontwarn expo.modules.kotlin.types.AnyTypeProvider
  -dontwarn expo.modules.kotlin.types.LazyKType
  -dontwarn expo.**
  ```

---

## 7. The 0.5-Second Startup Crash Analysis

### 7.1 Captured Logcat Trace
```text
10-27 19:28:33.111 24681 24681 E AndroidRuntime: FATAL EXCEPTION: main
10-27 19:28:33.111 24681 24681 E AndroidRuntime: Process: com.brownie.watertracker, PID: 24681
10-27 19:28:33.111 24681 24681 E AndroidRuntime: fa3: couldn't find DSO to load: libreactnative.so
10-27 19:28:33.111 24681 24681 E AndroidRuntime: 	existing SO sources: 
10-27 19:28:33.111 24681 24681 E AndroidRuntime: 		SoSource 0: ApplicationSoSource[DirectorySoSource[root = /data/app/.../lib/arm64 flags = 0]]
10-27 19:28:33.111 24681 24681 E AndroidRuntime: 		SoSource 1: DirectApkSoSource[root = [/data/app/.../base.apk!/lib/x86_64]]
10-27 19:28:33.111 24681 24681 E AndroidRuntime: 	at com.facebook.soloader.SoLoader.b(...)
10-27 19:28:33.111 24681 24681 E AndroidRuntime: 	at com.facebook.react.internal.featureflags.ReactNativeFeatureFlagsCxxInterop.<clinit>(...)
10-27 19:28:33.111 24681 24681 E AndroidRuntime: 	at com.brownie.watertracker.MainApplication.onCreate(...)
```

### 7.2 Root Cause
- In [`android/gradle.properties`](../android/gradle.properties), `reactNativeArchitectures=arm64-v8a` was specified.
- The build only generated binaries for `arm64-v8a`.
- When tested on an `x86_64` system (Android Studio Emulator, Chromebooks, or Intel/AMD virtual devices), Android launches the 64-bit x86 runtime. `SoLoader` looked for `libreactnative.so` inside `/lib/x86_64`, which was missing from the APK, causing the app to crash in 0.5s.
- Similarly, on older 32-bit ARM phones (`armeabi-v7a`), an `arm64-v8a`-only APK cannot load native libraries.

### 7.3 Resolution
Update `android/gradle.properties` to support the required targets:
- For emulator + modern devices: `reactNativeArchitectures=arm64-v8a,x86_64`
- For universal release: `reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64`

---

### 7.4 Additional confirmed startup failure (2026-10-27)

Emulator testing reproduced the original missing `libreactnative.so` failure.
After enabling ARM64 and x86_64, startup exposed a second failure:
`UnsatisfiedLinkError` loading `libexpo-av.so`, referencing the missing JSI
symbol `_ZNKR8facebook3jsi5Value8asObjectERNS0_7RuntimeE`.

`expo-av` 16.0.8 was unused by the application and incompatible with the current
native runtime. Removed it from dependencies and removed its Expo Doctor exclusion.
The architecture setting is also preserved by `plugins/withAndroidArchitectures.js`
and registered in `app.json`, since the native Android directory is gitignored.
Fixed the unescaped apostrophe in `UpdateModal.tsx` that caused lint to fail.

Final verification: release build succeeded; APK v2 signature verified;
both ARM64 and x86_64 React Native libraries are included, and `libexpo-av.so`
is absent. Installed the replacement over the original APK on the Pixel_10_Pro
x86_64 emulator. Completed onboarding, logged 250 ml of water, force-stopped
and relaunched the app, and verified the 250 ml entry persisted. Main tabs
opened without AndroidRuntime or ReactNativeJS errors. Physical ARM64 device
testing, cloud account flows, notifications, and in-app APK updates were not
verified. Typecheck passed; lint passed with 34 existing warnings and no errors;
Expo dependency compatibility check passed. Replaced `watertracker_beta.apk`
with the verified release output (63,964,871 bytes), retaining the existing
beta debug signing identity.

Build on Windows through the short `W:` path to avoid Ninja path-length failures.
Use the Android Studio bundled JDK (`C:\Program Files\Android\Android Studio\jbr`)
for this build. In PowerShell, use `npx.cmd` if execution policy blocks `npx.ps1`.

## 8. Artifact Locations

| Artifact | Location | Details |
| :--- | :--- | :--- |
| **Beta APK** | [`watertracker_beta.apk`](../watertracker_beta.apk) | Standalone release build with unlocked features and auto-update |
| **Gradle Output APK** | `android/app/build/outputs/apk/release/app-release.apk` | Generated binary location |
| **Log & Handover** | [`docs/PROJECT_LOG.md`](PROJECT_LOG.md) | Technical master document |

---

## 9. Runbook: How to Rebuild & Run

### 9.1 Development Mode (Expo Go / Dev Client)
```bash
npx expo start
```

### 9.2 Typecheck & Health Check
```bash
npx tsc --noEmit
npx expo-doctor
```

### 9.3 Build Standalone Release APK (PowerShell)
```powershell
# 1. Mount virtual drive W: to keep paths short:
subst W: "D:\Projects\Mobile Apps\Water Tracker"

# 2. Run Gradle assembleRelease:
cmd.exe /c "cd /d W:\android && gradlew.bat assembleRelease"

# 3. Copy APK to project root:
Copy-Item "W:\android\app\build\outputs\apk\release\app-release.apk" -Destination "D:\Projects\Mobile Apps\Water Tracker\watertracker_beta.apk" -Force

# 4. Unmount virtual drive:
subst W: /d
```

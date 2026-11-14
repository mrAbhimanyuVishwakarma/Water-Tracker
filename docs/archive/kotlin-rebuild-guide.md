# Brownie Water Tracker: Kotlin Build Guide

Archived alternative-platform proposal. The maintained application uses Expo/React Native.

This guide explains how to rebuild Brownie Water Tracker for Android and iOS using Kotlin Multiplatform and Compose Multiplatform.

Keep the existing Expo application as a working reference. Create the Kotlin version as a separate project; this is a manual rebuild, not an automatic conversion.

## Important limitation

Android development and testing can be done on Windows. Building, signing, testing, and publishing the iOS application requires a Mac with Xcode.

## 1. Learn Kotlin basics

Learn these topics first:

- `val` and `var`
- Strings, numbers, and booleans
- `if`, `when`, and loops
- Functions
- Null safety
- Lists and maps
- Data classes and enums
- Interfaces
- Coroutines
- `Flow` and `StateFlow`

Practice with simple hydration models:

```kotlin
enum class BeverageType {
    WATER,
    TEA,
    COFFEE,
    JUICE,
    MILK,
    ELECTROLYTES
}

data class Drink(
    val amountMl: Int,
    val beverage: BeverageType
)

fun calculateProgress(consumedMl: Int, goalMl: Int): Float {
    if (goalMl <= 0) return 0f
    return (consumedMl.toFloat() / goalMl).coerceIn(0f, 1f)
}
```

Do not begin with authentication, purchases, notifications, or animations.

## 2. Learn Jetpack Compose on Android

Before creating the multiplatform application, build a small Android-only practice application.

Learn:

- `@Composable`
- `Text`, `Button`, `Row`, and `Column`
- `LazyColumn`
- `Modifier`
- `remember`
- State lifting
- Material 3
- ViewModels
- Navigation

The practice application should contain:

- A `Today: 0 / 2500 ml` label
- An `Add 250 ml` button
- A progress bar
- A list of logged drinks

## 3. Create a Kotlin Multiplatform project

Install:

1. The latest stable Android Studio
2. Android SDK and an Android emulator
3. The Kotlin Multiplatform IDE plugin
4. Git

In Android Studio:

1. Select **New Project**.
2. Select **Kotlin Multiplatform**.
3. Select Android and iOS targets.
4. Select **Share UI**.
5. Use Gradle with Kotlin DSL.
6. Name the project `BrownieKMP` or something similar.
7. Let Gradle finish syncing.
8. Run the unmodified Android application before adding features.

Use the current official setup instructions: [Kotlin Multiplatform quickstart](https://kotlinlang.org/docs/multiplatform/multiplatform-setup.html).

## 4. Understand the project structure

A typical project will contain:

```text
composeApp/
  src/
    commonMain/
      kotlin/
    androidMain/
      kotlin/
    iosMain/
      kotlin/

iosApp/
```

- `commonMain`: shared screens, models, calculations, and most UI
- `androidMain`: Android notifications, sensors, billing, and other Android APIs
- `iosMain`: iOS notifications, sensors, billing, and other Apple APIs
- `iosApp`: the iOS launcher and Xcode configuration

## 5. Create shared data models

Start with plain Kotlin models:

```kotlin
data class DrinkLog(
    val id: String,
    val amountMl: Int,
    val beverage: BeverageType,
    val timestampMillis: Long
)

data class UserSettings(
    val dailyGoalMl: Int = 2500,
    val useFluidOunces: Boolean = false
)
```

Implement and test:

- Total consumed today
- Remaining amount
- Progress percentage
- Daily goal completion
- Consecutive-day streak
- Millilitre/fluid-ounce conversion

## 6. Build the Today screen

Rebuild the dashboard without animations or permanent storage.

Include:

- Daily total
- Daily goal
- Progress indicator
- Quick drink buttons
- Today's drink list
- Delete or undo action
- Temporary in-memory state

Example state:

```kotlin
data class DashboardState(
    val goalMl: Int = 2500,
    val drinks: List<DrinkLog> = emptyList()
) {
    val consumedMl: Int
        get() = drinks.sumOf { it.amountMl }
}
```

## 7. Add navigation

Create the application's main sections:

- Today
- History
- Habits
- Mascots
- Settings

Initially, the unfinished screens can display only their titles. Use Compose Multiplatform Navigation.

## 8. Add local storage

Persist:

- Drink logs
- Daily goal
- Unit preference
- Visible beverages
- Reminder settings
- Active challenge
- Unlocked mascots

Keep storage behind an interface:

```kotlin
interface HydrationRepository {
    suspend fun addDrink(drink: DrinkLog)
    suspend fun deleteDrink(id: String)
    suspend fun getDrinks(): List<DrinkLog>
    suspend fun saveSettings(settings: UserSettings)
}
```

The UI and ViewModels should use this repository instead of accessing the database directly.

## 9. Build History

Add one feature at a time:

1. Today's logs
2. Previous-day logs
3. Seven-day totals
4. Completed-goal days
5. Streak calculation
6. Calendar presentation
7. Beverage breakdown

Write unit tests for totals and streaks before adding charts.

## 10. Build Settings

Add:

- Daily goal
- Millilitres or fluid ounces
- Beverage selection
- Sound and haptic preferences
- Wake and sleep times
- Appearance settings
- Reset local data

Ask for confirmation before removing local data.

## 11. Build Habits and Challenges

Implement:

- Challenge list
- Selected challenge
- Activate and deactivate actions
- Daily completion
- Streak display

Keep challenges local until the offline application is complete.

## 12. Add mascots

Start with static images using shared Compose resources.

Then add:

- Locked and unlocked states
- Unlock rules
- Mascot selection
- Goal celebration

Add complex animation, video, pool physics, and tilt controls only after the basic mascot system works.

## 13. Add platform-specific services

Define common interfaces:

```kotlin
interface HapticService {
    fun success()
    fun lightTap()
}

interface ReminderService {
    suspend fun requestPermission(): Boolean
    suspend fun scheduleReminders()
    suspend fun cancelReminders()
}
```

Implement these interfaces separately in `androidMain` and `iosMain`.

Add services in this order:

1. Haptic feedback
2. Local notifications
3. Deep links
4. Device sensors
5. Platform-specific video behavior

Test notifications and sensors on physical devices.

## 14. Add accounts and cloud backup

Only start cloud integration after the application works completely offline.

Add:

- Account state
- Sign-in
- Session persistence
- Upload backup
- Download backup
- Conflict handling
- Account deletion

Keep guest data separate from signed-in data. Never commit private service credentials.

## 15. Add purchases last

Android purchases use Google Play Billing, while iOS purchases use StoreKit. A service such as RevenueCat can coordinate entitlements, but each platform still requires store configuration.

First build:

- The free application experience
- A premium entitlement model
- A paywall using fake products
- Fake success and failure flows

Connect real stores only after these flows work. Premium access must come from verified entitlement state.

## 16. Test on iOS

When a Mac is available:

1. Install and open Xcode.
2. Complete Xcode's initial setup.
3. Clone the Kotlin project.
4. Open it in Android Studio or IntelliJ IDEA.
5. Run the generated iOS configuration.
6. Test on an iPhone simulator.
7. Test notifications, authentication, sensors, and purchases on a physical iPhone.

## Recommended build order

```text
Kotlin basics
    -> Tiny Android Compose app
    -> New Kotlin Multiplatform project
    -> Drink models and calculations
    -> Today screen
    -> Navigation
    -> Local storage
    -> History
    -> Settings
    -> Challenges
    -> Static mascots
    -> Notifications and haptics
    -> Animations and sensors
    -> Cloud accounts
    -> Purchases
    -> iOS verification
```

## First major milestone

The first useful release should allow a user to:

1. Set a daily hydration goal.
2. Log a drink.
3. See today's progress.
4. Close and reopen the application.
5. Find the saved progress still available.

Once that works on Android and iOS, the project is already a genuine Kotlin Multiplatform application suitable for demonstrating on a resume. Add the complicated Brownie features afterward.

## Official references

- [Kotlin Multiplatform quickstart](https://kotlinlang.org/docs/multiplatform/multiplatform-setup.html)
- [Compose Multiplatform overview](https://kotlinlang.org/docs/multiplatform/compose-multiplatform.html)
- [Create a Compose Multiplatform app](https://kotlinlang.org/docs/multiplatform/compose-multiplatform-getting-started.html)
- [Android and iOS application entry points](https://kotlinlang.org/docs/multiplatform/compose-multiplatform-entry-points.html)

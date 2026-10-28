# Google Play launch setup

The implementation is prepared locally. Publishing is still blocked on provider setup, backend deployment, real-device verification, public legal pages, and store/merchant setup. No production backend or store settings have been changed.

## 1. App configuration

Copy `.env.example` to `.env` for local development. Use the same public values in the appropriate EAS environment. The production build profile uses the `production` environment; local `.env` files are not uploaded by Git.

| Variable | Value |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Your project's HTTPS API URL |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Its public publishable key, never a secret/service-role key |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | The RevenueCat Google Play public SDK key beginning `goog_` |
| `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT` | `premium`, matching the RevenueCat entitlement identifier |
| `EXPO_PUBLIC_PRIVACY_URL` | Published privacy policy URL |
| `EXPO_PUBLIC_TERMS_URL` | Published terms URL |
| `EXPO_PUBLIC_ACCOUNT_DELETION_URL` | Published deletion-request instructions URL |

The owner-provided website is `https://watertrackerbrownie.vercel.app`. It returned HTTP 404 during this review. Suggested paths are `/privacy`, `/terms`, and `/delete-account`, but they must be published and checked before putting them in a release build. The developer's public name and support email are still needed; do not invent them.

`npm run release:check` rejects missing public configuration. The same check runs in the EAS production post-install hook. This checks configuration values only; it cannot certify that providers, products, policies or payouts work.

## 2. Enable Supabase authentication

The owner confirmed that neither Google nor SMS login is configured yet.

For Google:

1. Configure a Google OAuth application and its consent screen for the intended release audience.
2. Add the Supabase-provided OAuth callback URL to Google's authorized redirect URIs.
3. Enable Google in Supabase Auth and enter the Google client ID and secret there. The secret belongs in Supabase, never in the app or `EXPO_PUBLIC_*` variables.
4. Add the exact `browniewater://auth/callback` URL to Supabase Auth's allowed redirect URLs. The mobile app uses browser OAuth with PKCE, including callback recovery after a cold start.
5. Test with a real Android development/preview build, including cancellation, restart, session refresh and sign-out. Expo Go cannot stand in for this native configuration.

For SMS:

1. Enable Phone Auth and configure a supported SMS provider, credentials, allowed regions, and spending/rate limits in Supabase.
2. Configure six-digit SMS codes to match this app. The current phone entry UI accepts Indian `+91` ten-digit numbers.
3. Test valid, invalid, expired and reused codes, provider failure and resending. Test credentials must never create a production bypass.

Supabase's official guides: [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google), [phone login](https://supabase.com/docs/guides/auth/phone-login), [mobile deep linking](https://supabase.com/docs/guides/auth/native-mobile-deep-linking).

## 3. Deploy the database and deletion function

The migration creates new `hydration_profiles` and `hydration_logs` tables. It does not change or migrate the old beta `profiles`/`drink_logs` tables. Inspect those separately before launch; old production data, policies or premium flags are not covered by this migration.

Use a scoped Supabase access token limited to the intended project and the required operations. Discover current CLI commands with `--help` before use. The following commands were checked against the installed CLI:

```powershell
npx.cmd supabase link --project-ref YOUR_PROJECT_REF
npx.cmd supabase migration list --linked
npx.cmd supabase db push --linked --dry-run
```

Review the project identity and migration history. If the remote project has migrations not represented locally, reconcile that history first; do not use force/include-all to bypass a mismatch. When the dry run contains only the intended migration:

```powershell
npx.cmd supabase db push --linked --skip-vault
npx.cmd supabase functions deploy delete-account
npx.cmd supabase db advisors --linked --type all
```

Keep `verify_jwt = true` for `delete-account`. The function additionally looks up the current user with Auth and deletes only that user, using the server-side admin client. Foreign-key cascades delete that user's hydration profile and drinks. No service key is shipped in the mobile app.

Verify through the deployed API with two test users: each must see only their own data; profile ownership changes and cross-user inserts must fail; clients must not update logs or write premium flags. Then test deletion and confirm the rows are gone. The embedded Postgres tests do not replace this deployment check or Supabase advisors.

## 4. Configure RevenueCat and Google Play products

RevenueCat supplies purchase validation, customer entitlements and store lifecycle tracking. Google Play processes customer payments; it is the merchant/payments profile in Play Console that determines your payouts.

1. Create a RevenueCat project and connect its Android app to the **same** Play package, `com.brownie.watertracker`.
2. Configure Google Play credentials and the recommended store notification integration in RevenueCat. Confirm the connection is healthy.
3. Create your intended products/base plans in Play Console. Monthly/yearly subscriptions and an optional one-time non-consumable lifetime product are supported by the app. Do not use a consumable for lifetime access.
4. Import those products into RevenueCat, attach them to the `premium` entitlement, and add the desired packages to a current Offering. The app uses the Offering's packages and Google's localized prices; no product IDs or trial periods are hardcoded.
5. Choose RevenueCat restore behavior deliberately. Keeping purchases with their original App User ID prevents a different app account from taking an existing account's purchase. Document the support process for account changes or account deletion.
6. Set the Android public SDK key in the app environment. The app requires sign-in before purchase and uses the Supabase UUID as its RevenueCat App User ID.
7. Use a Play testing track and license-test accounts to test purchases. A button press, a local settings flag and a successful Supabase profile write do not grant premium.

The SDK checks trusted entitlement signatures. Premium requires active, unexpired, verified entitlement information. It refreshes on launch/foreground, periodically while open, and after purchase/restore; SDK customer updates are observed too. Network failures do not grant new access. Refund/revocation visibility follows RevenueCat/store synchronization and SDK caching, so test that timing on a real build.

Official setup: [RevenueCat Expo](https://www.revenuecat.com/docs/getting-started/installation/expo), [Google Play configuration](https://www.revenuecat.com/docs/getting-started/entitlements/android-products), [trusted entitlements](https://www.revenuecat.com/docs/customers/trusted-entitlements).

## 5. Data and recovery behavior

- Each signed-in account has its own local workspace. Account display comes from the Supabase session, not from saved beta account objects. Tokens persist through the Supabase storage adapter; passwords are not saved by the app.
- Guest data stays on the device and is not silently uploaded or transferred to another account. Signing out returns to that guest workspace. Legacy beta data migrates only into the guest workspace; legacy premium unlocks and demo identities are discarded.
- Drinks are immutable, keyed by user and drink ID. Pending drinks retry without duplicating records. Only pending drinks are uploaded. Cloud history downloads are paginated.
- Preference changes are saved locally first. Unsynced local preferences win over downloaded preferences; otherwise the cloud snapshot is restored. Concurrent preference edits on different devices use last successful upload, rather than merging each preference independently.
- New edits made during a sync remain pending. Account changes invalidate old UI updates. Sync runs after changes, on foreground, on manual request, and periodically while the app is active. Closed-app background sync is not implemented.
- The backup status reports success only after network operations and local persistence succeed. Offline/server failures retain local data and report that backup is unavailable.
- Account deletion removes that account's Supabase data and local account workspace after the server confirms success. It does not cancel a Play subscription or erase store/RevenueCat purchase records. The deletion flow tells users to cancel subscriptions separately. Guest data has a separate confirmed reset action.
- Reminders are scheduled locally during waking hours, with a permission check and quiet/sound channels. OS delivery may be delayed. Turning them off cancels hydration reminders. No location, microphone or storage permission is needed.

## 6. Public pages and store disclosures

Publish a privacy policy, terms, and an external deletion-request page on the supplied website. Before doing so, obtain the real developer name and public support email. Describe the implemented behavior above and the actual retention/deletion practices of Supabase, RevenueCat, Google Play and your support process. Do not promise deletion of store billing records the app does not delete.

The external deletion page should name Brownie Water Tracker and its developer, explain in-app deletion, and provide a working way to request deletion without reinstalling the app, such as the monitored support address. Specify identity verification, handling times and any retained records using your real operational policy.

Complete Google Play Data safety and health-related declarations from the final app and the SDK providers' current disclosures, including account details, hydration/health preferences, drink history and purchase information. This review does not certify legal compliance. See [Google Play User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311).

## 7. Build and acceptance checks

```powershell
npm.cmd test
npx.cmd expo lint
npx.cmd tsc --noEmit
npx.cmd expo install --check
npx.cmd expo-doctor
npm.cmd run release:check
```

Configure EAS project identity, signing and public environment values before building:

```powershell
npx.cmd eas-cli@latest build --platform android --profile development
npx.cmd eas-cli@latest build --platform android --profile production
```

Use the production AAB in a Play testing track. Verify real login, reboot/session restoration, two-device recovery, account isolation, reminders, purchase completion/cancellation/pending state, restore after reinstall, renewal/expiry and refund/revocation. Check final merged manifest permissions in the actual AAB as well as app config. Production code removes APK self-updating and blocks its install permission.

Finally, verify the merchant payments profile, bank/tax details and transaction reports. Sandbox purchases do not generate a bank payout. An eventual real payout is a separate verification after merchant onboarding and real sales.

# Publishing readiness

Updated 2026-10-28. Target: **Google Play first**. Status: **implementation prepared locally; not approved for public release or real payments**.

Follow [GOOGLE_PLAY_SETUP.md](GOOGLE_PLAY_SETUP.md) to configure and verify the external services. No remote database migration, provider setup, store product creation, payment, deployment, or publication was performed.

## Implemented

- Replaced fake Google login with browser OAuth and PKCE, native secure randomness/SHA-256, callback validation, duplicate exchange protection and cold-start callback handling.
- Removed the OTP success fallback. SMS sending and verification now display real errors. A failed code cannot create a local signed-in account.
- Account identity follows the persisted Supabase session, with auth-state subscription, foreground token refresh and sign-out error handling. Local beta account objects cannot establish a session.
- Added separate guest/account workspaces, local-first saves, pending-drink uploads, paginated cloud recovery, retries, truthful backup status and protection against stale updates after account changes. Preference conflicts use unsynced-local-first/last-upload behavior, documented in the setup guide.
- Added a database migration with per-user RLS, explicit grants, immutable drink records, duplicate prevention and account-deletion cascades. Client backups cannot write premium or identity flags.
- Added authenticated account deletion, explicit confirmation, account-change protection and local cleanup. Google Play subscriptions and billing records remain separate and are disclosed in the flow.
- Removed beta premium defaults. Integrated RevenueCat Google Play offerings, localized prices, purchase, restore, account association and verified entitlement checks. Pending/cancelled/failed purchases do not unlock premium. No fixed trial eligibility is advertised.
- Added notification permission handling and daily reminders during waking hours, including overnight waking periods, quiet/sound channels and cancellation when reminders are off.
- Removed GitHub APK self-updating. Native config explicitly removes installation, microphone, external-storage and overlay permissions, and disables Android OS app backup.
- Added configurable legal-page actions and a production configuration gate. Incomplete payment/legal configuration blocks the EAS production post-install check.
- Replaced hardcoded streak/calendar achievements with saved hydration results. Challenges are presented as habit prompts, without fabricated completion milestones. Removed the currency preference that could not change Google Play pricing.
- Preserved the original public Supabase connection in ignored local `.env`; no secret/service-role key was introduced into the app. Added `.env.example` and the setup guide.

## Verification evidence

| Check | Result |
| --- | --- |
| `npm.cmd test` | 14 passed, including actual embedded Postgres ownership/grant/constraint/cascade tests |
| `npx.cmd tsc --noEmit` | Passed |
| `npx.cmd expo lint` | 0 errors; 28 remaining warnings in existing UI components, primarily unused variables/imports and animation hook dependencies |
| `npx.cmd expo install --check` | Passed after updating to Expo 58.0.20; see subsequent Expo Doctor result for final dependencies |
| `npx.cmd expo-doctor` | 20/20 checks passed with final native dependencies |
| `npx.cmd expo export --platform android --output-dir dist/release-check` | Passed; Android Hermes bundle exported |
| `npx.cmd expo config --type introspect --json` | Config marks the five blocked permissions for removal and Android `allowBackup=false` |
| Deno check of `delete-account/index.ts` | Passed against actual runtime dependency types |
| `npm.cmd run release:check` | Expected failure: RevenueCat Android key and all three legal URLs are unset |
| Existing Supabase public `/auth/v1/settings` | HTTP 200; Google disabled, phone disabled; read-only check sent no SMS and created no user |
| Owner-provided website | `https://watertrackerbrownie.vercel.app` returned HTTP 404 |
| Live login, two-device recovery, purchase, native AAB install and bank payout | Not verified |

The tests replace native SDK adapters for auth/billing scenarios; they do not charge a store account or prove native-device behavior. Database tests run the migration in PGlite with test Auth roles/functions, not in the deployed Supabase project. Docker was not running, so the full local Supabase stack/advisors were unavailable. The Deno check validates types; the Edge Function still needs deployment and live invocation tests.

The network-backed npm audit reported eight unresolved transitive advisories (five low, three high), propagated through Expo tooling from `deepmerge` and `zod`. The current `deepmerge` release was 4.3.1, covered by its advisory. Patched Zod 4.6.7 exists, but Expo CLI depends on Zod `^3.25.76`; forcing that major change or accepting npm's suggested Expo 51 downgrade would bypass SDK compatibility. No forced dependency changes were applied. Review upstream fixes and these advisories before release; do not interpret Expo Doctor as a security audit.

## Required external work

1. Enable Google and/or SMS authentication in Supabase. Configure Google consent/credentials and the mobile callback URL, or a real SMS provider with six-digit codes and operational rate/spend limits.
2. Deploy the prepared migration and `delete-account` function. Inspect the old beta tables separately, run Supabase advisors, and verify RLS and deletion through the deployed API with two test users.
3. Configure RevenueCat, Google Play products/current Offering/`premium` entitlement, store credentials/notifications, restore behavior and the app's public SDK key.
4. Publish working privacy, terms and external deletion-request pages. The developer name and monitored support email remain unspecified. Complete Play Data safety and relevant health disclosures using the actual app/SDK behavior.
5. Configure production EAS environment/project/signing. Build an AAB and test real login, persistence, offline retry, two-device recovery, reminders, purchase completion/cancellation/pending state, restore, renewal, expiry and refund/revocation through a Play test track. Inspect final AAB permissions.
6. Complete the merchant payments profile, bank/tax setup and financial-report checks. Sandbox purchase success does not prove an eventual real bank payout.

## References

- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/) and [in-app purchases](https://docs.expo.dev/guides/in-app-purchases/)
- [Supabase React Native authentication](https://supabase.com/docs/guides/auth/quickstarts/react-native), [mobile callbacks](https://supabase.com/docs/guides/auth/native-mobile-deep-linking) and [Edge Function authentication](https://supabase.com/docs/guides/functions/auth)
- [RevenueCat Expo integration](https://www.revenuecat.com/docs/getting-started/installation/expo) and [trusted entitlements](https://www.revenuecat.com/docs/customers/trusted-entitlements)
- [Google Play payments profile](https://support.google.com/googleplay/android-developer/answer/3092739), [payouts](https://support.google.com/paymentscenter/answer/7159355), [package-install permission](https://support.google.com/googleplay/android-developer/answer/12085295) and [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311)

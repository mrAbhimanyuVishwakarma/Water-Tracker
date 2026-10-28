const fs = require('node:fs');

function validateReleaseEnvironment(env) {
  const issues = [];
  const https = (name) => {
    try {
      const url = new URL(env[name]);
      if (url.protocol !== 'https:' || /(^|\.)example\.(com|org)$/.test(url.hostname) || /YOUR_|REPLACE/i.test(env[name])) throw new Error();
    } catch { issues.push(`${name} must be a real public HTTPS URL.`); }
  };
  https('EXPO_PUBLIC_SUPABASE_URL');
  if (!/^(sb_publishable_|eyJ)/.test(env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '')) issues.push('Set EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your public client key.');
  if (!/^goog_/.test(env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '')) issues.push('Set the Google Play RevenueCat public SDK key (goog_).');
  if (!env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT) issues.push('Set EXPO_PUBLIC_REVENUECAT_ENTITLEMENT to the configured entitlement identifier.');
  for (const name of ['EXPO_PUBLIC_PRIVACY_URL', 'EXPO_PUBLIC_TERMS_URL', 'EXPO_PUBLIC_ACCOUNT_DELETION_URL']) https(name);
  return issues;
}

if (require.main === module) {
  if (process.argv.includes('--eas') && process.env.EAS_BUILD_PROFILE !== 'production') process.exit(0);
  if (fs.existsSync('.env')) process.loadEnvFile('.env');
  const issues = validateReleaseEnvironment(process.env);
  if (issues.length) {
    console.error(`Production configuration is incomplete:\n${issues.map(issue => `- ${issue}`).join('\n')}`);
    process.exitCode = 1;
  } else console.log('Production environment values are present. Live provider, purchase, deletion, legal-page and payout verification are still required.');
}
module.exports = { validateReleaseEnvironment };

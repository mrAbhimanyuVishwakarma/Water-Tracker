const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { PGlite } = require('@electric-sql/pglite');
const root = path.resolve(__dirname, '..');

// Run application TypeScript with native adapters replaced, without changing the production bundle.
function loader(mocks = {}) {
  const cache = new Map();
  function load(file) {
    const absolute = path.resolve(root, file);
    if (cache.has(absolute)) return cache.get(absolute).exports;
    const module = { exports: {} };
    cache.set(absolute, module);
    const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const localRequire = name => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (/\.png$/.test(name)) return name;
      if (name.startsWith('.')) {
        const target = path.resolve(path.dirname(absolute), name);
        return load(fs.existsSync(target) ? target : `${target}.ts`);
      }
      return require(name);
    };
    new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
    return module.exports;
  }
  return load;
}

function memoryStorage() {
  const map = new Map();
  return { map, getItem: async key => map.get(key) || null, setItem: async (key, value) => map.set(key, value),
    removeItem: async key => map.delete(key), getAllKeys: async () => [...map.keys()],
    multiGet: async keys => keys.map(key => [key, map.get(key) || null]),
    multiRemove: async keys => keys.forEach(key => map.delete(key)) };
}
const log = (id = 'drink-1') => ({ id, type: 'water', amount: 250, effectiveAmount: 250, color: '#00C3E3', timestamp: Date.now() });

test('beta account and premium flags never survive restoration or backup', () => {
  const load = loader();
  const { safeSettings, backupSettings } = load('src/utils/accountData.ts');
  const restored = safeSettings({ isPremium: true, userAccount: { id: 'fake' }, unlockedCharacters: ['dodo'], dailyTarget: 3000 });
  assert.equal(restored.isPremium, false);
  assert.equal(restored.userAccount, null);
  assert.deepEqual(restored.unlockedCharacters, ['brownie']);
  assert.equal(restored.dailyTarget, 3000);
  assert.equal('isPremium' in backupSettings(restored), false);
  assert.equal('userAccount' in backupSettings(restored), false);
  assert.equal('unlockedCharacters' in backupSettings(restored), false);
  const malformed = safeSettings({ dailyTarget: -10, healthProfile: { wakeTime: '99:99' }, visibleBeverages: ['__proto__'], hasCompletedOnboarding: 'yes' });
  assert.equal(malformed.dailyTarget, 2200);
  assert.equal(malformed.hasCompletedOnboarding, false);
  assert.notEqual(malformed.healthProfile.wakeTime, '99:99');
  assert.deepEqual(malformed.visibleBeverages, []);
});

test('guest migration and signed-in workspaces remain isolated; reset removes every legacy day', async () => {
  const storage = memoryStorage();
  const load = loader({ '@react-native-async-storage/async-storage': storage });
  const { loadLocalData, saveLocalData, resetGuestData } = load('src/utils/storage.ts');
  storage.map.set('@brownie_settings', JSON.stringify({ isPremium: true, userAccount: { id: 'google_demo' }, dailyTarget: 3000 }));
  storage.map.set('@brownie_logs_2026-01-01', JSON.stringify([log()]));
  const guest = await loadLocalData(null);
  assert.equal(guest.logs.length, 1);
  assert.equal(guest.settings.isPremium, false);
  assert.equal(guest.settings.userAccount, null);
  assert.equal((await loadLocalData('user-a')).logs.length, 0);
  await saveLocalData('user-a', { ...guest, logs: [log('a')] });
  await saveLocalData('user-b', { ...guest, logs: [log('b')] });
  assert.equal((await loadLocalData('user-a')).logs[0].id, 'a');
  assert.equal((await loadLocalData('user-b')).logs[0].id, 'b');
  await resetGuestData();
  assert.equal((await loadLocalData(null)).logs.length, 0);
  assert.equal((await loadLocalData('user-a')).logs[0].id, 'a');
});

test('repeated log merges are idempotent and preserve negative effective hydration', () => {
  const { mergeLogs } = loader()('src/utils/accountData.ts');
  const alcohol = { ...log('alcohol'), type: 'alcohol', effectiveAmount: -125 };
  const result = mergeLogs([log('one'), alcohol], [log('one'), log('two'), { ...log('bad'), amount: -1 }]);
  assert.equal(result.length, 3);
  assert.equal(result.find(item => item.id === 'alcohol').effectiveAmount, -125);
  assert.deepEqual(mergeLogs(result, result), result);
});

test('reminders exclude sleep hours, support overnight waking hours, and reject invalid settings', () => {
  const { reminderTimes } = loader()('src/utils/reminderTimes.ts');
  assert.deepEqual(reminderTimes('08:00', '12:00', 90), [{ hour: 9, minute: 30 }, { hour: 11, minute: 0 }]);
  assert.deepEqual(reminderTimes('22:00', '02:00', 60), [{ hour: 23, minute: 0 }, { hour: 0, minute: 0 }, { hour: 1, minute: 0 }]);
  assert.deepEqual(reminderTimes('08:00', '08:00', 60), []);
  assert.throws(() => reminderTimes('99:00', '10:00', 60));
  assert.throws(() => reminderTimes('08:00', '10:00', 0));
});

function authHarness() {
  process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'public-test-key';
  let exchanges = 0;
  const auth = {
    signInWithOtp: async () => ({ error: new Error('SMS unavailable') }),
    verifyOtp: async () => ({ error: new Error('Invalid OTP'), data: {} }),
    signInWithOAuth: async () => ({ data: { url: 'https://provider.example/login' }, error: null }),
    exchangeCodeForSession: async () => { exchanges++; return { error: null }; },
    signOut: async () => ({ error: new Error('Sign-out failed') }),
  };
  const browser = { maybeCompleteAuthSession() {}, openAuthSessionAsync: async () => ({ type: 'cancel' }) };
  const storage = memoryStorage();
  const api = loader({
    'react-native-url-polyfill/auto': {}, '@react-native-async-storage/async-storage': storage,
    '@supabase/supabase-js': { createClient: () => ({ auth }), processLock() {} },
    'react-native': { Platform: { OS: 'android' }, AppState: {}, Alert: {} },
    'expo-web-browser': browser, 'expo-linking': {},
    './pkceCrypto': { installPkceCrypto() {} },
  })('src/services/supabase.ts');
  return { api, auth, browser, storage, exchanges: () => exchanges };
}

test('OTP errors and cancelled Google sign-in cannot create a successful account', async () => {
  const { api } = authHarness();
  assert.equal((await api.sendPhoneOtp('+919876543210')).success, false);
  assert.equal((await api.verifyPhoneOtp('+919876543210', '123456')).success, false);
  assert.equal(await api.signInWithGoogle(), undefined);
  await assert.rejects(api.signOutCloudUser(), /Sign-out failed/);
});

test('OAuth validates callback origin and deduplicates browser/deep-link code exchange', async () => {
  const { api, exchanges } = authHarness();
  await assert.rejects(api.completeGoogleCallback('https://attacker.example/callback?code=secret'), /Unexpected/);
  await assert.rejects(api.completeGoogleCallback('browniewater://auth/callback?error_description=Denied'), /Denied/);
  await Promise.all([api.completeGoogleCallback('browniewater://auth/callback?code=once'), api.completeGoogleCallback('browniewater://auth/callback?code=once')]);
  assert.equal(exchanges(), 1);
});

test('native PKCE crypto uses the RFC 7636 SHA-256 challenge and preserves existing crypto', async () => {
  const { webcrypto } = require('node:crypto');
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  try {
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true });
    const { installPkceCrypto } = loader({
      'react-native': { Platform: { OS: 'android' } },
      'expo-crypto': { getRandomValues: value => webcrypto.getRandomValues(value),
        digest: (algorithm, data) => webcrypto.subtle.digest(algorithm, data), CryptoDigestAlgorithm: { SHA256: 'SHA-256' } },
    })('src/services/pkceCrypto.ts');
    installPkceCrypto();
    const installed = globalThis.crypto;
    const verifier = new TextEncoder().encode('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');
    const hash = await installed.subtle.digest('SHA-256', verifier);
    assert.equal(Buffer.from(hash).toString('base64url'), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
    const random = new Uint8Array(16);
    assert.equal(installed.getRandomValues(random), random);
    await assert.rejects(installed.subtle.digest('SHA-1', verifier), /SHA-256/);
    installPkceCrypto();
    assert.equal(globalThis.crypto, installed);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'crypto', descriptor);
    else delete globalThis.crypto;
  }
});

test('deletion binds the request to the confirmed account and clears its stale login after logout failure', async () => {
  const { api, auth, storage } = authHarness();
  const session = { user: { id: 'user-a' }, access_token: 'session-a' };
  auth.getSession = async () => ({ data: { session }, error: null });
  let request;
  api.supabase.functions = { invoke: async (_name, options) => { request = options; return { data: { deleted: true }, error: null }; } };
  const key = '@brownie-auth:https://example.supabase.co';
  storage.map.set(key, 'stale-session');
  await api.deleteCloudAccount('user-a');
  assert.equal(request.headers.Authorization, 'Bearer session-a');
  assert.equal(request.body.expectedUserId, 'user-a');
  assert.equal(storage.map.has(key), false);
  await assert.rejects(api.deleteCloudAccount('user-b'), /Sign in again/);
});

function billingHarness() {
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY = 'goog_test_public';
  const events = [];
  const info = { entitlements: { active: {} } };
  const sdk = {
    VERIFICATION_RESULT: { VERIFIED: 'VERIFIED', VERIFIED_ON_DEVICE: 'VERIFIED_ON_DEVICE' },
    ENTITLEMENT_VERIFICATION_MODE: { INFORMATIONAL: 'INFORMATIONAL' },
    configure: config => events.push(`configure:${config.appUserID}`),
    logIn: async user => { events.push(`login:${user}`); return { customerInfo: info }; },
    getCustomerInfo: async () => info,
    purchasePackage: async () => { events.push('purchase'); return { customerInfo: info }; },
    restorePurchases: async () => { events.push('restore'); return info; },
    getOfferings: async () => ({ current: { availablePackages: [] } }),
  };
  const api = loader({ 'react-native': { Platform: { OS: 'android' } }, 'expo-constants': { appOwnership: 'standalone' }, 'react-native-purchases': sdk })('src/services/billing.ts');
  return { api, sdk, events };
}

test('premium requires active, unexpired and cryptographically verified entitlement', () => {
  const { api } = billingHarness();
  const info = access => ({ entitlements: { active: { premium: access } } });
  assert.equal(api.hasPremium(info({ isActive: true, verification: 'VERIFIED', expirationDate: null })), true);
  assert.equal(api.hasPremium(info({ isActive: true, verification: 'VERIFIED', expirationDate: '2000-01-01' })), false);
  assert.equal(api.hasPremium(info({ isActive: true, verification: 'FAILED', expirationDate: null })), false);
  assert.equal(api.hasPremium(info({ isActive: true, verification: 'NOT_REQUESTED', expirationDate: null })), false);
  assert.equal(api.hasPremium(info({ isActive: false, verification: 'VERIFIED', expirationDate: null })), false);
});

test('billing serializes user changes, leaves pending purchases locked, and propagates cancellation', async () => {
  const { api, sdk, events } = billingHarness();
  const [purchase, restore] = await Promise.all([api.buyPackage('user-a', {}), api.restorePurchases('user-b')]);
  assert.equal(api.hasPremium(purchase), false);
  assert.equal(api.hasPremium(restore), false);
  assert.deepEqual(events, ['configure:user-a', 'purchase', 'login:user-b', 'restore']);
  sdk.purchasePackage = async () => { throw { userCancelled: true }; };
  await assert.rejects(api.buyPackage('user-b', {}), error => error.userCancelled === true);
});

test('account deletion requires authentication and confirmation and ignores supplied target ids', async () => {
  const { handleDeleteAccount } = loader()('supabase/functions/delete-account/handler.ts');
  const deleted = [];
  const deps = { authenticatedUser: async () => 'user-a', deleteUser: async id => deleted.push(id) };
  const request = body => new Request('https://example.test/delete-account', { method: 'POST', body: JSON.stringify(body) });
  assert.equal((await handleDeleteAccount(request({ confirmation: 'DELETE' }), { ...deps, authenticatedUser: async () => null })).status, 401);
  assert.equal((await handleDeleteAccount(request({ confirmation: 'NO' }), deps)).status, 400);
  assert.equal((await handleDeleteAccount(request({ confirmation: 'DELETE', expectedUserId: 'user-b' }), deps)).status, 409);
  assert.equal((await handleDeleteAccount(request({ confirmation: 'DELETE', expectedUserId: 'user-a', userId: 'user-b' }), deps)).status, 200);
  assert.deepEqual(deleted, ['user-a']);
  assert.equal((await handleDeleteAccount(request({ confirmation: 'DELETE', expectedUserId: 'user-a' }), { ...deps, deleteUser: async () => { throw new Error('private server details'); } })).status, 500);
});

test('cloud retries are idempotent, preserve offline edits and upload only pending drinks', async () => {
  let profile = null;
  let fail = false;
  let logUploads = 0;
  const rows = new Map();
  const remote = log('remote');
  rows.set('remote', { id: remote.id, beverage_type: remote.type, amount: remote.amount, effective_amount: remote.effectiveAmount,
    color: remote.color, logged_at: new Date(remote.timestamp).toISOString() });
  const backend = { from(table) {
    const query = {
      mode: 'read', payload: null, start: 0, end: 499,
      select() { return this; }, eq() { return this; }, order() { return this; },
      maybeSingle() { return this; }, range(start, end) { this.start = start; this.end = end; return this; },
      upsert(payload) { this.mode = 'write'; this.payload = payload; return this; },
      then(resolve, reject) {
        if (fail) return Promise.resolve({ data: null, error: new Error('offline') }).then(resolve, reject);
        if (this.mode === 'write') {
          if (table === 'hydration_profiles') profile = this.payload;
          else { logUploads += this.payload.length; for (const row of this.payload) if (!rows.has(row.id)) rows.set(row.id, row); }
          return Promise.resolve({ data: null, error: null }).then(resolve, reject);
        }
        const data = table === 'hydration_profiles' ? profile : [...rows.values()].slice(this.start, this.end + 1);
        return Promise.resolve({ data, error: null }).then(resolve, reject);
      },
    };
    return query;
  } };
  const load = loader({ './supabase': { supabase: backend } });
  const { syncAccount, reconcileSync } = load('src/services/cloudSync.ts');
  const { safeSettings } = load('src/utils/accountData.ts');
  const local = { settings: safeSettings({ dailyTarget: 3000 }), logs: [log('pending')], pendingLogIds: ['pending'], settingsRevision: 1 };
  const synced = await syncAccount('user-a', local);
  assert.equal(logUploads, 1);
  assert.equal(synced.logs.length, 2);
  assert.equal(synced.settingsRevision, 0);
  assert.deepEqual(synced.pendingLogIds, []);
  assert.equal('isPremium' in profile.settings, false);
  await syncAccount('user-a', synced);
  assert.equal(logUploads, 1);
  const newer = { ...local, settings: safeSettings({ dailyTarget: 4000 }), settingsRevision: 2,
    logs: [...local.logs, log('new')], pendingLogIds: ['pending', 'new'] };
  const reconciled = reconcileSync(local, newer, synced);
  assert.equal(reconciled.settings.dailyTarget, 4000);
  assert.equal(reconciled.settingsRevision, 2);
  assert.deepEqual(reconciled.pendingLogIds, ['new']);
  assert.equal(reconciled.logs.length, 3);
  fail = true;
  await assert.rejects(syncAccount('user-a', newer), /offline/);
  assert.equal(newer.settingsRevision, 2);
  assert.deepEqual(newer.pendingLogIds, ['pending', 'new']);
});

test('production gate rejects missing configuration and non-production payment keys', () => {
  const { validateReleaseEnvironment } = require('./check-release.cjs');
  assert.ok(validateReleaseEnvironment({}).length >= 6);
  const environment = {
    EXPO_PUBLIC_SUPABASE_URL: 'https://project.supabase.co', EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_public',
    EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: 'goog_public', EXPO_PUBLIC_REVENUECAT_ENTITLEMENT: 'premium',
    EXPO_PUBLIC_PRIVACY_URL: 'https://brownie.test/privacy', EXPO_PUBLIC_TERMS_URL: 'https://brownie.test/terms',
    EXPO_PUBLIC_ACCOUNT_DELETION_URL: 'https://brownie.test/delete',
  };
  assert.equal(validateReleaseEnvironment(environment).length, 0);
  assert.ok(validateReleaseEnvironment({ ...environment, EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: 'test_fake' }).length > 0);
});

test('Postgres enforces account ownership, immutable logs, premium protection, idempotent retries and deletion cascade', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; grant usage on schema auth to authenticated;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      insert into auth.users values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222');
    `);
    await db.exec(fs.readFileSync(path.join(root, 'supabase/migrations/20261028033220_account_backups.sql'), 'utf8'));
    const userA = '11111111-1111-4111-8111-111111111111';
    const userB = '22222222-2222-4222-8222-222222222222';
    const asUser = async id => { await db.exec('reset role; set role authenticated'); await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]); };
    await asUser(userA);
    await db.query('insert into public.hydration_profiles(user_id, settings) values ($1, $2)', [userA, { dailyTarget: 2200 }]);
    const insertLog = 'insert into public.hydration_logs(user_id,id,beverage_type,amount,effective_amount,color,logged_at) values ($1,$2,\'water\',250,250,\'#00C3E3\',now()) on conflict(user_id,id) do nothing';
    await db.query(insertLog, [userA, 'drink']);
    await db.query(insertLog, [userA, 'drink']);
    assert.equal((await db.query('select count(*)::int as n from public.hydration_logs')).rows[0].n, 1);
    await assert.rejects(db.query('update public.hydration_logs set amount=999'), /permission denied/);
    await assert.rejects(db.query('update public.hydration_profiles set settings=$1', [{ isPremium: true }]), /check constraint/);
    await assert.rejects(db.query('update public.hydration_profiles set user_id=$1', [userB]), /row-level security/);
    await asUser(userB);
    assert.equal((await db.query('select * from public.hydration_profiles')).rows.length, 0);
    assert.equal((await db.query('select * from public.hydration_logs')).rows.length, 0);
    await assert.rejects(db.query(insertLog, [userA, 'forged']), /row-level security/);
    await assert.rejects(db.query('insert into public.hydration_profiles(user_id) values ($1)', [userA]), /row-level security/);
    await db.exec('reset role; set role anon');
    await assert.rejects(db.query('select * from public.hydration_logs'), /permission denied/);
    await db.exec('reset role');
    await db.query('delete from auth.users where id=$1', [userA]);
    assert.equal((await db.query('select * from public.hydration_profiles')).rows.length, 0);
    assert.equal((await db.query('select * from public.hydration_logs')).rows.length, 0);
    await asUser(userA);
    await assert.rejects(db.query(insertLog, [userA, 'after-deletion']), /foreign key/);
  } finally { await db.close(); }
});

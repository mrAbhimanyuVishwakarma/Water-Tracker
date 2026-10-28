import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, User } from '@supabase/supabase-js';
import { Alert, AppState, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { UserAccount } from '../types';
import { installPkceCrypto } from './pkceCrypto';

installPkceCrypto();

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const isCloudConfigured = Boolean(url && key);
const authStorageKey = `@brownie-auth:${url || 'unconfigured'}`;
const fetchWithTimeout: typeof fetch = async (input, options) => {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = setTimeout(abort, 20_000);
  options?.signal?.addEventListener('abort', abort);
  if (options?.signal?.aborted) controller.abort();
  try { return await fetch(input, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); options?.signal?.removeEventListener('abort', abort); }
};
export const supabase = createClient(url || 'https://not-configured.supabase.co', key || 'not-configured', {
  global: { fetch: fetchWithTimeout },
  auth: { storage: AsyncStorage, storageKey: authStorageKey, autoRefreshToken: true, persistSession: true,
    detectSessionInUrl: false, flowType: 'pkce', lock: processLock },
});
WebBrowser.maybeCompleteAuthSession();

export function startSessionRefresh() {
  if (!isCloudConfigured || Platform.OS === 'web') return () => {};
  const update = (state: string | null | undefined) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  };
  update(AppState.currentState);
  const subscription = AppState.addEventListener('change', update);
  return () => { subscription.remove(); supabase.auth.stopAutoRefresh(); };
}

export function accountFromUser(user: User): UserAccount {
  return { id: user.id, email: user.email, phone: user.phone,
    name: user.user_metadata?.full_name || user.user_metadata?.name || 'Hydration Pal',
    authProvider: user.app_metadata.provider === 'google' ? 'google' : 'phone',
    createdAt: new Date(user.created_at).getTime() };
}

function requireConfiguration() {
  if (!isCloudConfigured) throw new Error('Sign-in is not available yet. Please try again later.');
}

const redirectTo = 'browniewater://auth/callback';
const exchanges = new Map<string, Promise<void>>();

export async function completeGoogleCallback(callbackUrl: string): Promise<void> {
  requireConfiguration();
  const callback = new URL(callbackUrl);
  if (callback.protocol !== 'browniewater:' || callback.hostname !== 'auth' || callback.pathname !== '/callback') {
    throw new Error('Unexpected sign-in callback.');
  }
  const providerError = callback.searchParams.get('error_description');
  if (providerError) throw new Error(providerError);
  const code = callback.searchParams.get('code');
  if (!code) throw new Error('Sign-in did not return a verification code.');
  if (!exchanges.has(code)) exchanges.set(code, (async () => {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
  })());
  await exchanges.get(code);
}

export function startAuthCallbacks() {
  let active = true;
  const receive = (url: string | null) => {
    if (!active || !url?.startsWith(redirectTo)) return;
    void completeGoogleCallback(url).catch(() => {
      if (active) Alert.alert('Sign-in incomplete', 'Please try signing in again.');
    });
  };
  void Linking.getInitialURL().then(receive).catch(() => {});
  const listener = Linking.addEventListener('url', event => receive(event.url));
  return () => { active = false; listener.remove(); };
}

export async function signInWithGoogle(): Promise<void> {
  requireConfiguration();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true } });
  if (error) throw error;
  if (!data.url) throw new Error('Google sign-in could not be started.');
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return;
  await completeGoogleCallback(result.url);
}

export async function sendPhoneOtp(phone: string) {
  try {
    requireConfiguration();
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
    return { success: true };
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Could not send code.' }; }
}

export async function verifyPhoneOtp(phone: string, token: string) {
  try {
    requireConfiguration();
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) throw error;
    if (!data.session) throw new Error('Verification did not create a session.');
    return { success: true };
  } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Verification failed.' }; }
}

export async function signOutCloudUser() {
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}

export async function deleteCloudAccount(expectedUserId: string) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (sessionError || !session || session.user.id !== expectedUserId) throw new Error('Sign in again before deleting your account.');
  const { data, error } = await supabase.functions.invoke('delete-account', {
    headers: { Authorization: `Bearer ${session.access_token}` }, body: { confirmation: 'DELETE', expectedUserId },
  });
  if (error) throw error;
  if (!data?.deleted) throw new Error('Account deletion was not confirmed. Please try again.');
  const current = (await supabase.auth.getSession()).data.session;
  if (current?.user.id === expectedUserId) {
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
    // A completed deletion must not leave a persisted login if the logout request loses connectivity.
    if (signOutError) await AsyncStorage.multiRemove([authStorageKey, `${authStorageKey}-code-verifier`]);
  }
}

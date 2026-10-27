import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { DrinkLog, UserAccount, UserSettings } from '../types';

// Supabase project URL derived from project ref: gyekroobfguapigewibo (Mumbai region)
export const SUPABASE_URL = 'https://gyekroobfguapigewibo.supabase.co';

// Publishable anon key (safe in mobile client with Row Level Security enabled)
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZWtyb29iZmd1YXBpZ2V3aWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwODY0MjksImV4cCI6MjEwODY2MjQyOX0.l_QjFPgBjJYUMmWgVTyoJrBDAA1MfTonzlgOyd71IGU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Send 6-digit SMS OTP to user's phone number
 */
export async function sendPhoneOtp(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send OTP' };
  }
}

/**
 * Verify 6-digit OTP code entered by user
 */
export async function verifyPhoneOtp(
  phoneNumber: string,
  token: string
): Promise<{ success: boolean; account?: UserAccount; error?: string }> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token,
      type: 'sms',
    });
    if (error || !data.user) {
      return { success: false, error: error?.message || 'Verification failed' };
    }

    const account: UserAccount = {
      id: data.user.id,
      phone: data.user.phone || phoneNumber,
      name: data.user.user_metadata?.name || 'Hydration Pal',
      authProvider: 'phone',
      createdAt: new Date(data.user.created_at).getTime(),
      lastSyncAt: Date.now(),
    };

    return { success: true, account };
  } catch (err: any) {
    return { success: false, error: err.message || 'OTP verification error' };
  }
}

/**
 * Sync hydration progress and pro status to Supabase profile
 */
export async function syncUserProfile(
  userId: string,
  settings: UserSettings
): Promise<boolean> {
  try {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      daily_target: settings.dailyTarget,
      unit: settings.unit,
      is_premium: settings.isPremium,
      active_character: settings.activeCharacter,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Save drink log to cloud
 */
export async function syncDrinkLog(userId: string, log: DrinkLog): Promise<boolean> {
  try {
    const { error } = await supabase.from('drink_logs').upsert({
      id: log.id,
      user_id: userId,
      beverage_type: log.type,
      amount: log.amount,
      effective_amount: log.effectiveAmount,
      color: log.color,
      logged_at: new Date(log.timestamp).toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Sign out user from cloud
 */
export async function signOutCloudUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('Sign out warning:', e);
  }
}

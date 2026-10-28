import { supabase } from './supabase';
import { LocalData } from '../utils/storage';
import { backupSettings, mergeLogs, safeSettings } from '../utils/accountData';
import { DrinkLog } from '../types';

export function reconcileSync(snapshot: LocalData, current: LocalData, synced: LocalData): LocalData {
  return {
    settings: current.settingsRevision === snapshot.settingsRevision ? synced.settings : current.settings,
    logs: mergeLogs(current.logs, synced.logs),
    pendingLogIds: current.pendingLogIds.filter(id => !snapshot.pendingLogIds.includes(id)),
    settingsRevision: current.settingsRevision === snapshot.settingsRevision ? 0 : current.settingsRevision,
  };
}

export async function syncAccount(userId: string, local: LocalData): Promise<LocalData> {
  // Preferences: unsynced local edits win; otherwise use the saved cloud preferences.
  const { data: profile, error: profileError } = await supabase.from('hydration_profiles')
    .select('settings').eq('user_id', userId).maybeSingle();
  if (profileError) throw profileError;
  let settings = local.settings;
  if (local.settingsRevision || !profile) {
    const { error } = await supabase.from('hydration_profiles').upsert({
      user_id: userId, settings: backupSettings(settings), updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  } else settings = safeSettings(profile.settings);

  // Logs are immutable and identified by (user_id, id). Retries never create duplicates.
  const pendingIds = new Set(local.pendingLogIds);
  const pending = local.logs.filter(log => pendingIds.has(log.id));
  for (let offset = 0; offset < pending.length; offset += 250) {
    const rows = pending.slice(offset, offset + 250).map(log => ({
      user_id: userId, id: log.id, beverage_type: log.type, amount: log.amount,
      effective_amount: log.effectiveAmount, color: log.color, logged_at: new Date(log.timestamp).toISOString(),
    }));
    const { error } = await supabase.from('hydration_logs').upsert(rows, { onConflict: 'user_id,id', ignoreDuplicates: true });
    if (error) throw error;
  }
  const remote: DrinkLog[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from('hydration_logs').select('*').eq('user_id', userId)
      .order('id').range(offset, offset + 499);
    if (error) throw error;
    remote.push(...data.map(row => ({ id: row.id, type: row.beverage_type, amount: row.amount,
      effectiveAmount: row.effective_amount, color: row.color, timestamp: new Date(row.logged_at).getTime() })));
    if (data.length < 500) break;
  }
  return { settings, logs: mergeLogs(local.logs, remote), pendingLogIds: [], settingsRevision: 0 };
}

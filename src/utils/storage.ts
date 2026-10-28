import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrinkLog, UserSettings, DayData } from '../types';
import { backupSettings, dayKey, mergeLogs, safeSettings } from './accountData';

export interface LocalData { settings: UserSettings; logs: DrinkLog[]; pendingLogIds: string[]; settingsRevision: number; }
const keyFor = (userId: string | null) => `@brownie_v2:${userId || 'guest'}`;
export const getTodayKey = dayKey;

export async function loadLocalData(userId: string | null): Promise<LocalData> {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  if (raw) {
    const parsed = JSON.parse(raw);
    const logs = mergeLogs(parsed.logs || [], []);
    return { settings: safeSettings(parsed.settings), logs,
      pendingLogIds: Array.isArray(parsed.pendingLogIds) ? parsed.pendingLogIds.filter((id: unknown) => typeof id === 'string') : logs.map(log => log.id),
      settingsRevision: parsed.settingsRevision || 0 };
  }
  // Old beta data belongs to the guest workspace; never attach it to a signed-in account silently.
  if (!userId) {
    const oldSettings = await AsyncStorage.getItem('@brownie_settings');
    const logKeys = (await AsyncStorage.getAllKeys()).filter(key => key.startsWith('@brownie_logs_'));
    const oldLogs = await AsyncStorage.multiGet(logKeys);
    const logs = oldLogs.flatMap(([, value]) => value ? JSON.parse(value) : []);
    const data = { settings: safeSettings(oldSettings ? JSON.parse(oldSettings) : {}), logs: mergeLogs(logs, []), pendingLogIds: [] as string[], settingsRevision: 0 };
    await saveLocalData(null, data);
    return data;
  }
  return { settings: safeSettings({}), logs: [], pendingLogIds: [], settingsRevision: 0 };
}

export async function saveLocalData(userId: string | null, data: LocalData) {
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify({
    settings: backupSettings(data.settings), logs: data.logs, pendingLogIds: data.pendingLogIds, settingsRevision: data.settingsRevision,
  }));
}

export async function removeLocalAccount(userId: string) { await AsyncStorage.removeItem(keyFor(userId)); }

export async function resetGuestData() {
  const legacy = (await AsyncStorage.getAllKeys()).filter(key => key === '@brownie_settings' || key.startsWith('@brownie_logs_'));
  await AsyncStorage.multiRemove([...legacy, keyFor(null)]);
}

export function historyFromLogs(logs: DrinkLog[], settings: UserSettings, numDays = 14, today = dayKey()): DayData[] {
  const result: DayData[] = [];
  const now = new Date(`${today}T12:00:00`);
  const byDay = new Map<string, DrinkLog[]>();
  for (const log of logs) {
    const key = dayKey(log.timestamp);
    const entries = byDay.get(key) || [];
    entries.push(log);
    byDay.set(key, entries);
  }
  for (let index = numDays - 1; index >= 0; index--) {
    const date = new Date(now);
    date.setDate(date.getDate() - index);
    const dateStr = dayKey(date.getTime());
    const entries = byDay.get(dateStr) || [];
    const totalAmount = entries.reduce((sum, log) => sum + log.amount, 0);
    const totalEffectiveAmount = entries.reduce((sum, log) => sum + log.effectiveAmount, 0);
    result.push({ date: dateStr, logs: entries, totalAmount, totalEffectiveAmount,
      target: settings.dailyTarget, achieved: totalAmount >= settings.dailyTarget });
  }
  return result;
}

export const calculateStreak = (history: DayData[]): number => {
  let streak = 0;
  for (let index = history.length - 1; index >= 0; index--) {
    if (history[index].achieved) streak++;
    else if (index !== history.length - 1) break;
  }
  return streak;
};

export const formatVolume = (ml: number, unit: 'ml' | 'oz'): string =>
  unit === 'oz' ? `${Math.round(ml * 0.033814)}oz` : `${Math.round(ml)}ml`;

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrinkLog, UserSettings, DayData } from '../types';
import { DEFAULT_SETTINGS } from '../constants/beverages';

const STORAGE_KEYS = {
  SETTINGS: '@brownie_settings',
  LOGS_PREFIX: '@brownie_logs_',
  STREAK: '@brownie_streak',
};

export const getTodayKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const loadSettings = async (): Promise<UserSettings> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        healthProfile: {
          ...DEFAULT_SETTINGS.healthProfile,
          ...(parsed.healthProfile || {}),
        },
      };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = async (settings: UserSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const loadTodayLogs = async (): Promise<DrinkLog[]> => {
  try {
    const today = getTodayKey();
    const raw = await AsyncStorage.getItem(`${STORAGE_KEYS.LOGS_PREFIX}${today}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load today logs:', e);
  }
  return [];
};

export const saveTodayLogs = async (logs: DrinkLog[]): Promise<void> => {
  try {
    const today = getTodayKey();
    await AsyncStorage.setItem(`${STORAGE_KEYS.LOGS_PREFIX}${today}`, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save today logs:', e);
  }
};

export const loadHistoryDays = async (numDays = 7): Promise<DayData[]> => {
  const result: DayData[] = [];
  const settings = await loadSettings();
  const now = new Date();

  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    try {
      const raw = await AsyncStorage.getItem(`${STORAGE_KEYS.LOGS_PREFIX}${dateStr}`);
      const logs: DrinkLog[] = raw ? JSON.parse(raw) : [];
      const totalAmount = logs.reduce((sum, l) => sum + l.amount, 0);
      const totalEffectiveAmount = logs.reduce((sum, l) => sum + (l.effectiveAmount ?? l.amount), 0);
      result.push({
        date: dateStr,
        logs,
        totalAmount,
        totalEffectiveAmount,
        target: settings.dailyTarget,
        achieved: totalAmount >= settings.dailyTarget,
      });
    } catch {
      result.push({
        date: dateStr,
        logs: [],
        totalAmount: 0,
        totalEffectiveAmount: 0,
        target: settings.dailyTarget,
        achieved: false,
      });
    }
  }
  return result;
};

export const calculateStreak = (history: DayData[]): number => {
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].achieved || history[i].totalAmount > 0) {
      streak++;
    } else if (i !== history.length - 1) {
      break;
    }
  }
  return Math.max(1, streak);
};

export const formatVolume = (ml: number, unit: 'ml' | 'oz'): string => {
  if (unit === 'oz') {
    const oz = Math.round(ml * 0.033814);
    return `${oz}oz`;
  }
  return `${Math.round(ml)}ml`;
};

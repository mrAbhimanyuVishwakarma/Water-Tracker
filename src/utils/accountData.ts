import { BEVERAGES, CHALLENGES, DEFAULT_SETTINGS, MASCOTS } from '../constants/beverages';
import { DrinkLog, UserSettings } from '../types';

// Only these preferences cross the network. Identity and purchase access never come from backups.
export function backupSettings(settings: UserSettings) {
  return {
    dailyTarget: settings.dailyTarget, unit: settings.unit, currency: settings.currency,
    soundEnabled: settings.soundEnabled, hapticEnabled: settings.hapticEnabled,
    hasCompletedOnboarding: settings.hasCompletedOnboarding, activeChallengeId: settings.activeChallengeId,
    activeCharacter: settings.activeCharacter, cupPresets: settings.cupPresets,
    visibleBeverages: settings.visibleBeverages, healthProfile: settings.healthProfile,
    reminderIntervalMinutes: settings.reminderIntervalMinutes, smartRemindersEnabled: settings.smartRemindersEnabled,
    mascotTrialStartedAt: settings.mascotTrialStartedAt, hasUsedMascotTrial: settings.hasUsedMascotTrial,
  };
}

export function safeSettings(value: unknown): UserSettings {
  const raw = value && typeof value === 'object' ? value as Partial<UserSettings> : {};
  const profile = raw.healthProfile && typeof raw.healthProfile === 'object' ? raw.healthProfile : DEFAULT_SETTINGS.healthProfile;
  const member = <T extends string>(candidate: unknown, choices: readonly T[], fallback: T): T =>
    choices.includes(candidate as T) ? candidate as T : fallback;
  const boolean = (candidate: unknown, fallback: boolean) => typeof candidate === 'boolean' ? candidate : fallback;
  const time = (candidate: unknown, fallback: string) => typeof candidate === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(candidate) ? candidate : fallback;
  return { ...DEFAULT_SETTINGS,
    dailyTarget: Number.isFinite(raw.dailyTarget) && raw.dailyTarget! >= 250 && raw.dailyTarget! <= 10000 ? raw.dailyTarget! : DEFAULT_SETTINGS.dailyTarget,
    unit: raw.unit === 'oz' ? 'oz' : 'ml',
    currency: member(raw.currency, ['INR', 'USD', 'EUR', 'GBP'], 'INR'),
    soundEnabled: boolean(raw.soundEnabled, true), hapticEnabled: boolean(raw.hapticEnabled, true),
    hasCompletedOnboarding: boolean(raw.hasCompletedOnboarding, false),
    activeChallengeId: CHALLENGES.some(challenge => challenge.id === raw.activeChallengeId) ? raw.activeChallengeId! : null,
    activeCharacter: MASCOTS.some(mascot => mascot.id === raw.activeCharacter) ? raw.activeCharacter! : 'brownie',
    cupPresets: Array.isArray(raw.cupPresets) && raw.cupPresets.length ? raw.cupPresets.filter(amount => Number.isFinite(amount) && amount >= 10 && amount <= 2000).slice(0, 12) : DEFAULT_SETTINGS.cupPresets,
    visibleBeverages: Array.isArray(raw.visibleBeverages) ? [...new Set(raw.visibleBeverages.filter(type => Object.hasOwn(BEVERAGES, type)))].slice(0, 11) : DEFAULT_SETTINGS.visibleBeverages,
    healthProfile: {
      gender: member(profile.gender, ['male', 'female', 'other'], DEFAULT_SETTINGS.healthProfile.gender),
      weight: Number.isFinite(profile.weight) && profile.weight >= 20 && profile.weight <= 500 ? profile.weight : DEFAULT_SETTINGS.healthProfile.weight,
      weightUnit: profile.weightUnit === 'lbs' ? 'lbs' : 'kg',
      activityLevel: member(profile.activityLevel, ['low', 'moderate', 'high', 'athlete'], 'moderate'),
      climate: member(profile.climate, ['mild', 'hot', 'dry'], 'mild'),
      primaryGoal: member(profile.primaryGoal, ['energy', 'skin', 'weight', 'focus'], 'energy'),
      wakeTime: time(profile.wakeTime, DEFAULT_SETTINGS.healthProfile.wakeTime),
      sleepTime: time(profile.sleepTime, DEFAULT_SETTINGS.healthProfile.sleepTime),
    },
    smartRemindersEnabled: boolean(raw.smartRemindersEnabled, true),
    reminderIntervalMinutes: [60, 90, 120].includes(raw.reminderIntervalMinutes!) ? raw.reminderIntervalMinutes! : 90,
    mascotTrialStartedAt: typeof raw.mascotTrialStartedAt === 'number' && Number.isFinite(raw.mascotTrialStartedAt) && raw.mascotTrialStartedAt > 0 ? raw.mascotTrialStartedAt : null,
    hasUsedMascotTrial: boolean(raw.hasUsedMascotTrial, false),
    isPremium: false, userAccount: null, unlockedCharacters: ['brownie'] };
}

export function validLog(value: unknown): value is DrinkLog {
  if (!value || typeof value !== 'object') return false;
  const log = value as DrinkLog;
  return typeof log.id === 'string' && log.id.length > 0 && log.id.length <= 120 &&
    typeof log.type === 'string' && Object.hasOwn(BEVERAGES, log.type) && typeof log.color === 'string' && log.color.length <= 32 &&
    Number.isFinite(log.amount) && log.amount > 0 && log.amount <= 10000 &&
    Number.isFinite(log.effectiveAmount) && log.effectiveAmount >= -10000 && log.effectiveAmount <= 20000 &&
    Number.isFinite(log.timestamp) && log.timestamp > 0;
}

export function mergeLogs(local: DrinkLog[], remote: DrinkLog[]): DrinkLog[] {
  const byId = new Map<string, DrinkLog>();
  for (const log of [...(Array.isArray(remote) ? remote : []), ...(Array.isArray(local) ? local : [])]) if (validLog(log)) byId.set(log.id, log);
  return [...byId.values()].sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));
}

export function dayKey(timestamp = Date.now()): string {
  const day = new Date(timestamp);
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
}

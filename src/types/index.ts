export type BeverageType =
  | 'water'
  | 'green_tea'
  | 'herbal_tea'
  | 'coffee'
  | 'espresso'
  | 'juice'
  | 'smoothie'
  | 'milk'
  | 'electrolyte'
  | 'soda'
  | 'alcohol';

export type MeasurementUnit = 'ml' | 'oz';
export type WeightUnit = 'kg' | 'lbs';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export type MascotId = 'brownie' | 'dodo' | 'mammoth' | 'sloth' | 'turtle' | 'penguin';

export interface MascotConfig {
  id: MascotId;
  name: string;
  species: string;
  title: string;
  quote: string;
  badge: string;
  accentColor: string;
  isPro: boolean;
  avatarImage?: any;
}

export interface BeverageConfig {
  type: BeverageType;
  label: string;
  color: string;
  waveColor: string;
  defaultAmount: number; // in ml
  icon: string;
  hydrationMultiplier: number; // 1.0 = 100%, coffee = 0.8, alcohol = -0.5
  caffeineMg?: number;
  category: 'water' | 'tea' | 'coffee' | 'juice' | 'healthy' | 'other';
}

export interface DrinkLog {
  id: string;
  type: BeverageType;
  amount: number; // in ml
  effectiveAmount: number; // amount * hydrationMultiplier
  timestamp: number; // Unix ms
  color: string;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  logs: DrinkLog[];
  totalAmount: number; // in ml raw
  totalEffectiveAmount: number; // in ml effective
  target: number; // in ml
  achieved: boolean;
}

export interface UserHealthProfile {
  gender: 'male' | 'female' | 'other';
  weight: number; // value in weightUnit
  weightUnit: WeightUnit;
  activityLevel: 'low' | 'moderate' | 'high' | 'athlete';
  climate: 'mild' | 'hot' | 'dry';
  wakeTime: string; // HH:mm
  sleepTime: string; // HH:mm
  primaryGoal: 'energy' | 'skin' | 'weight' | 'focus';
}

export interface UserAccount {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  avatarUrl?: string;
  authProvider?: 'google' | 'phone' | 'guest';
  createdAt: number;
  lastSyncAt?: number;
}

export interface UserSettings {
  dailyTarget: number; // in ml
  unit: MeasurementUnit;
  currency: CurrencyCode;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  hasCompletedOnboarding: boolean;
  activeChallengeId: string | null;
  activeCharacter: MascotId;
  unlockedCharacters: MascotId[];
  isPremium: boolean;
  cupPresets: number[]; // e.g. [200, 250, 330, 500] in ml
  visibleBeverages: string[]; // e.g. ['water', 'green_tea', 'herbal_tea']
  healthProfile: UserHealthProfile;
  reminderIntervalMinutes: number; // 60, 90, 120
  smartRemindersEnabled: boolean;
  // 1-Minute Pro Mascot Trial (Single Use)
  mascotTrialStartedAt: number | null; // Unix timestamp in ms when trial was triggered
  hasUsedMascotTrial: boolean; // Persisted flag so trial can only be used once
  // User Account & Cloud Sync
  userAccount?: UserAccount | null;
}

export interface Challenge {
  id: string;
  name: string;
  character: string;
  badge: string;
  color: string;
  durationDays: number;
  currentDay: number;
  description: string;
  benefits: string[];
  active: boolean;
}

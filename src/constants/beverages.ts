import {
  BeverageConfig,
  Challenge,
  CurrencyCode,
  MascotConfig,
  UserHealthProfile,
  UserSettings,
} from '../types';

export const BEVERAGES: Record<string, BeverageConfig> = {
  water: {
    type: 'water',
    label: 'Water',
    color: '#00C3E3',
    waveColor: '#00A8C5',
    defaultAmount: 250,
    icon: 'water-outline',
    hydrationMultiplier: 1.0,
    category: 'water',
  },
  green_tea: {
    type: 'green_tea',
    label: 'Green Tea',
    color: '#76C62C',
    waveColor: '#65AF21',
    defaultAmount: 300,
    icon: 'leaf-outline',
    hydrationMultiplier: 0.95,
    caffeineMg: 35,
    category: 'tea',
  },
  herbal_tea: {
    type: 'herbal_tea',
    label: 'Herbal Tea',
    color: '#14B8A6',
    waveColor: '#0D9488',
    defaultAmount: 300,
    icon: 'flower-outline',
    hydrationMultiplier: 0.95,
    caffeineMg: 0,
    category: 'tea',
  },
  coffee: {
    type: 'coffee',
    label: 'Coffee',
    color: '#8A5844',
    waveColor: '#724330',
    defaultAmount: 200,
    icon: 'cafe-outline',
    hydrationMultiplier: 0.8,
    caffeineMg: 95,
    category: 'coffee',
  },
  espresso: {
    type: 'espresso',
    label: 'Espresso',
    color: '#5C3828',
    waveColor: '#452A1E',
    defaultAmount: 60,
    icon: 'flash-outline',
    hydrationMultiplier: 0.75,
    caffeineMg: 64,
    category: 'coffee',
  },
  juice: {
    type: 'juice',
    label: 'Juice',
    color: '#FFA100',
    waveColor: '#E68E00',
    defaultAmount: 250,
    icon: 'nutrition-outline',
    hydrationMultiplier: 0.85,
    category: 'juice',
  },
  smoothie: {
    type: 'smoothie',
    label: 'Smoothie',
    color: '#B044CB',
    waveColor: '#9633AE',
    defaultAmount: 350,
    icon: 'ice-cream-outline',
    hydrationMultiplier: 0.9,
    category: 'healthy',
  },
  milk: {
    type: 'milk',
    label: 'Milk',
    color: '#F48E77',
    waveColor: '#DB745D',
    defaultAmount: 250,
    icon: 'color-filter-outline',
    hydrationMultiplier: 0.9,
    category: 'healthy',
  },
  electrolyte: {
    type: 'electrolyte',
    label: 'Electrolyte',
    color: '#38BDF8',
    waveColor: '#0284C7',
    defaultAmount: 500,
    icon: 'fitness-outline',
    hydrationMultiplier: 1.0,
    category: 'healthy',
  },
  soda: {
    type: 'soda',
    label: 'Soda',
    color: '#EF4444',
    waveColor: '#DC2626',
    defaultAmount: 330,
    icon: 'sparkles-outline',
    hydrationMultiplier: 0.7,
    category: 'other',
  },
  alcohol: {
    type: 'alcohol',
    label: 'Alcohol',
    color: '#A855F7',
    waveColor: '#9333EA',
    defaultAmount: 250,
    icon: 'wine-outline',
    hydrationMultiplier: -0.5,
    category: 'other',
  },
};

export const DEFAULT_VISIBLE_BEVERAGES = ['water', 'green_tea', 'herbal_tea'];

export const MASCOTS: MascotConfig[] = [
  {
    id: 'brownie',
    name: 'Brownie',
    species: 'Capybara',
    title: 'The Zen Hydrator',
    quote: 'Stay cool, calm, and sip gently like a pool day.',
    badge: '🦫',
    accentColor: '#8A5844',
    isPro: false,
    avatarImage: require('../../assets/brownie_sipping.png'),
  },
  {
    id: 'dodo',
    name: 'Dotti',
    species: 'Dodo Bird',
    title: 'Extinct Legend',
    quote: 'Extinct in the wild, but thriving in hydration!',
    badge: '🦤',
    accentColor: '#8B5CF6',
    isPro: true,
    avatarImage: require('../../assets/dodo_sipping.png'),
  },
  {
    id: 'mammoth',
    name: 'Manny',
    species: 'Woolly Mammoth',
    title: 'Ice Age Titan',
    quote: 'Big trunk, giant hydration goals! Keep sipping.',
    badge: '🦣',
    accentColor: '#D97706',
    isPro: true,
    avatarImage: require('../../assets/mammoth_sipping.png'),
  },
  {
    id: 'sloth',
    name: 'Sid',
    species: 'Sloth',
    title: 'Mindful Sipper',
    quote: 'Take your time. Slow sips build lasting habits.',
    badge: '🦥',
    accentColor: '#10B981',
    isPro: true,
    avatarImage: require('../../assets/sloth_sipping.png'),
  },
  {
    id: 'turtle',
    name: 'Turbo',
    species: 'Turtle',
    title: 'Endurance Legend',
    quote: 'Slow and steady wins the hydration streak.',
    badge: '🐢',
    accentColor: '#14B8A6',
    isPro: true,
    avatarImage: require('../../assets/turtle_sipping.png'),
  },
  {
    id: 'penguin',
    name: 'Pip',
    species: 'Penguin',
    title: 'Ice Fresh Voyager',
    quote: 'Crisp cold water makes every wave effortless!',
    badge: '🐧',
    accentColor: '#3B82F6',
    isPro: true,
    avatarImage: require('../../assets/penguin_sipping.png'),
  },
];

export const DEFAULT_HEALTH_PROFILE: UserHealthProfile = {
  gender: 'female',
  weight: 65,
  weightUnit: 'kg',
  activityLevel: 'moderate',
  climate: 'mild',
  wakeTime: '07:30',
  sleepTime: '23:00',
  primaryGoal: 'energy',
};

export function calculatePersonalizedGoal(profile: UserHealthProfile): number {
  const weightKg = profile.weightUnit === 'lbs' ? profile.weight * 0.453592 : profile.weight;
  let baseMl = weightKg * 35;

  switch (profile.activityLevel) {
    case 'low':
      baseMl += 0;
      break;
    case 'moderate':
      baseMl += 350;
      break;
    case 'high':
      baseMl += 700;
      break;
    case 'athlete':
      baseMl += 1100;
      break;
  }

  switch (profile.climate) {
    case 'mild':
      break;
    case 'hot':
      baseMl += 400;
      break;
    case 'dry':
      baseMl += 300;
      break;
  }

  const rounded = Math.round(baseMl / 50) * 50;
  return Math.min(Math.max(rounded, 1500), 4500);
}

export interface PricingPlanConfig {
  yearlyPrice: string;
  yearlyMonthlyEquiv: string;
  monthlyPrice: string;
  lifetimePrice: string;
  currencySymbol: string;
}

export const PRICING_BY_CURRENCY: Record<CurrencyCode, PricingPlanConfig> = {
  INR: {
    yearlyPrice: '₹999/yr',
    yearlyMonthlyEquiv: '₹83/mo',
    monthlyPrice: '₹199/mo',
    lifetimePrice: '₹1,999',
    currencySymbol: '₹',
  },
  USD: {
    yearlyPrice: '$19.99/yr',
    yearlyMonthlyEquiv: '$1.66/mo',
    monthlyPrice: '$3.99/mo',
    lifetimePrice: '$39.99',
    currencySymbol: '$',
  },
  EUR: {
    yearlyPrice: '€19.99/yr',
    yearlyMonthlyEquiv: '€1.66/mo',
    monthlyPrice: '€3.99/mo',
    lifetimePrice: '€39.99',
    currencySymbol: '€',
  },
  GBP: {
    yearlyPrice: '£17.99/yr',
    yearlyMonthlyEquiv: '£1.49/mo',
    monthlyPrice: '£3.49/mo',
    lifetimePrice: '£34.99',
    currencySymbol: '£',
  },
};

export const DEFAULT_SETTINGS: UserSettings = {
  dailyTarget: 2200,
  unit: 'ml',
  currency: 'INR',
  soundEnabled: true,
  hapticEnabled: true,
  hasCompletedOnboarding: false,
  activeChallengeId: 'caffeine_free',
  activeCharacter: 'brownie',
  unlockedCharacters: ['brownie'],
  isPremium: false,
  cupPresets: [200, 250, 330, 500],
  visibleBeverages: DEFAULT_VISIBLE_BEVERAGES,
  healthProfile: DEFAULT_HEALTH_PROFILE,
  reminderIntervalMinutes: 90,
  smartRemindersEnabled: true,
  mascotTrialStartedAt: null,
  hasUsedMascotTrial: false,
  userAccount: null,
};

export const CHALLENGES: Challenge[] = [
  {
    id: 'caffeine_free',
    name: 'Caffeine-Free Capy',
    character: 'Brownie',
    badge: '☕🚫',
    color: '#8A5844',
    durationDays: 10,
    currentDay: 2,
    description: 'Swap one afternoon coffee for crisp water or relaxing herbal tea.',
    benefits: [
      'Deeper and more restful night sleep',
      'Smoother sustained daytime energy',
      'Reduced afternoon anxiety and jitters',
      'Noticeably clearer skin hydration',
    ],
    active: true,
  },
  {
    id: 'weight_loss_sloth',
    name: 'Weight Loss Sloth',
    character: 'Sid',
    badge: '🦥💧',
    color: '#10B981',
    durationDays: 10,
    currentDay: 1,
    description: 'Drink a full glass of water 20 minutes before every meal.',
    benefits: [
      'Boosts natural metabolic rate by up to 24%',
      'Calms false hunger pangs and stress eating',
      'Aids digestion and nutrient absorption',
    ],
    active: false,
  },
  {
    id: 'vitamin_puffin',
    name: 'Vitamin Booster',
    character: 'Pip',
    badge: '🐧🍊',
    color: '#F59E0B',
    durationDays: 10,
    currentDay: 0,
    description: 'Infuse your water with fresh lemon, cucumber, or citrus slices.',
    benefits: [
      'Natural vitamin C and antioxidant intake',
      'Gentle natural electrolyte balancing',
      'Delicious crisp refreshment without sugar',
    ],
    active: false,
  },
  {
    id: 'morning_wave',
    name: 'Morning Wakeup Glass',
    character: 'Turbo',
    badge: '🐢☀️',
    color: '#0284C7',
    durationDays: 10,
    currentDay: 0,
    description: 'Drink 350ml of room-temperature water immediately upon waking.',
    benefits: [
      'Rehydrates brain and body after 8h sleep',
      'Kicks off morning metabolism',
      'Increases immediate morning alertness',
    ],
    active: false,
  },
];

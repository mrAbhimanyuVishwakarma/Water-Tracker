import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InteractivePoolScreen } from './InteractivePoolScreen';
import { CrispVectorMascot } from './CrispVectorMascot';
import { UserHealthProfile, UserSettings } from '../types';
import { feedback } from '../utils/feedback';
import { formatVolume } from '../utils/storage';
import {
  DEFAULT_HEALTH_PROFILE,
  calculatePersonalizedGoal,
} from '../constants/beverages';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  onComplete: (settings: Partial<UserSettings>) => void;
}

export const OnboardingFlow: React.FC<Props> = ({ onComplete }) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<number>(1);
  const [unit, setUnit] = useState<'ml' | 'oz'>('ml');
  const [profile, setProfile] = useState<UserHealthProfile>(DEFAULT_HEALTH_PROFILE);
  const [reminders, setReminders] = useState<boolean>(true);
  const [intervalMin, setIntervalMin] = useState<number>(90);

  // Bobbing animation for mascot
  const bobbing = useSharedValue(0);
  React.useEffect(() => {
    bobbing.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1400 }),
        withTiming(0, { duration: 1400 })
      ),
      -1,
      true
    );
  }, []);

  const bobbingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bobbing.value }],
  }));

  // Target volume computed in real-time from health profile
  const calculatedTarget = calculatePersonalizedGoal(profile);

  // Step 1: The Interactive Swimming Pool Hero (Notion Build 3)
  if (step === 1) {
    return (
      <InteractivePoolScreen
        onGetStarted={() => {
          feedback.triggerHaptic('medium');
          setStep(2);
        }}
      />
    );
  }

  // Step 2: Meet Brownie (Notion Build 2 reference)
  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <Text style={styles.stepBadge}>STEP 1 OF 5</Text>
            <Text style={styles.title}>Track your intake</Text>
            <Text style={styles.subtitle}>
              Meet your mindful, friendly hydration companion!
            </Text>
          </Animated.View>

          <Animated.View style={[styles.characterCard, bobbingStyle]} entering={FadeIn.delay(200)}>
            <CrispVectorMascot
              type="sipping"
              mascotId="brownie"
              width={160}
              height={160}
            />
            <Text style={styles.characterName}>Brownie</Text>
            <Text style={styles.characterBio}>
              Loves crisp cool water and chill pool days.
            </Text>
          </Animated.View>

          <View style={styles.footer}>
            <View style={styles.langPill}>
              <Text style={styles.langText}>🇺🇸 EN · English</Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={() => {
                feedback.triggerHaptic('medium');
                feedback.playWaterDropSound();
                setStep(3);
              }}
            >
              <Text style={styles.primaryButtonText}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Step 3: Motivation & Gender
  if (step === 3) {
    const goals: { id: UserHealthProfile['primaryGoal']; title: string; icon: string; desc: string }[] = [
      { id: 'skin', title: 'Glowing Skin', icon: '🌸', desc: 'Moisturized, radiant complexion' },
      { id: 'energy', title: 'Sustained Energy', icon: '⚡', desc: 'Zero afternoon brain fog crashes' },
      { id: 'weight', title: 'Weight Balance', icon: '⚖️', desc: 'Control cravings & boost metabolism' },
      { id: 'focus', title: 'Sharp Focus', icon: '🎯', desc: 'Peak cognitive memory & clarity' },
    ];

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <Text style={styles.stepBadge}>STEP 2 OF 5</Text>
            <Text style={styles.title}>What drives you?</Text>
            <Text style={styles.subtitle}>
              Brownie will tailor your hydration rhythms to your focus.
            </Text>
          </Animated.View>

          {/* Gender Selector */}
          <Text style={styles.sectionLabel}>YOUR GENDER</Text>
          <View style={styles.pillRow}>
            {[
              { id: 'female', label: 'Female 👩' },
              { id: 'male', label: 'Male 👨' },
              { id: 'other', label: 'Other ✨' },
            ].map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.selectorPill,
                  profile.gender === g.id && styles.selectorPillActive,
                ]}
                onPress={() => {
                  feedback.triggerHaptic('light');
                  setProfile({ ...profile, gender: g.id as any });
                }}
              >
                <Text
                  style={[
                    styles.selectorPillText,
                    profile.gender === g.id && styles.selectorPillTextActive,
                  ]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Motivation Cards */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>PRIMARY GOAL</Text>
          <View style={styles.cardList}>
            {goals.map((g) => {
              const active = profile.primaryGoal === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.goalCard, active && styles.goalCardActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    feedback.triggerHaptic('light');
                    setProfile({ ...profile, primaryGoal: g.id });
                  }}
                >
                  <Text style={styles.goalIcon}>{g.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.goalCardTitle, active && styles.goalCardTitleActive]}>
                      {g.title}
                    </Text>
                    <Text style={styles.goalCardDesc}>{g.desc}</Text>
                  </View>
                  <View style={[styles.radioCircle, active && styles.radioCircleActive]} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footerGap}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={() => {
                feedback.triggerHaptic('medium');
                setStep(4);
              }}
            >
              <Text style={styles.primaryButtonText}>NEXT STEP</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step 4: Body Weight & Activity Calculator
  if (step === 4) {
    const activityLevels: { id: UserHealthProfile['activityLevel']; title: string; icon: string }[] = [
      { id: 'low', title: 'Sedentary', icon: '🛋️' },
      { id: 'moderate', title: 'Moderate', icon: '🚶' },
      { id: 'high', title: 'High', icon: '🏃' },
      { id: 'athlete', title: 'Athlete', icon: '🏅' },
    ];

    const climates: { id: UserHealthProfile['climate']; title: string; icon: string }[] = [
      { id: 'mild', title: 'Mild 🌤️', icon: '🌤️' },
      { id: 'hot', title: 'Hot ☀️', icon: '☀️' },
      { id: 'dry', title: 'Dry 🏜️', icon: '🏜️' },
    ];

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <Text style={styles.stepBadge}>STEP 3 OF 5</Text>
            <Text style={styles.title}>Body & Lifestyle</Text>
            <Text style={styles.subtitle}>
              Precision formula calculates your exact physiological intake.
            </Text>
          </Animated.View>

          {/* Weight Stepper */}
          <View style={styles.weightBox}>
            <View style={styles.weightBoxHeader}>
              <Text style={styles.sectionLabel}>BODY WEIGHT</Text>
              <View style={styles.unitToggleMini}>
                <TouchableOpacity
                  style={[styles.unitToggleBtn, profile.weightUnit === 'kg' && styles.unitToggleBtnActive]}
                  onPress={() => {
                    feedback.triggerHaptic('light');
                    setProfile({ ...profile, weightUnit: 'kg' });
                  }}
                >
                  <Text style={[styles.unitToggleText, profile.weightUnit === 'kg' && styles.unitToggleTextActive]}>kg</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.unitToggleBtn, profile.weightUnit === 'lbs' && styles.unitToggleBtnActive]}
                  onPress={() => {
                    feedback.triggerHaptic('light');
                    setProfile({ ...profile, weightUnit: 'lbs' });
                  }}
                >
                  <Text style={[styles.unitToggleText, profile.weightUnit === 'lbs' && styles.unitToggleTextActive]}>lbs</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.weightControls}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  feedback.triggerHaptic('light');
                  setProfile({ ...profile, weight: Math.max(35, profile.weight - 2) });
                }}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.weightNumber}>
                {profile.weight} <Text style={styles.weightUnitText}>{profile.weightUnit}</Text>
              </Text>

              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => {
                  feedback.triggerHaptic('light');
                  setProfile({ ...profile, weight: Math.min(200, profile.weight + 2) });
                }}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Activity Level */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>DAILY ACTIVITY</Text>
          <View style={styles.activityGrid}>
            {activityLevels.map((act) => {
              const active = profile.activityLevel === act.id;
              return (
                <TouchableOpacity
                  key={act.id}
                  style={[styles.activityCard, active && styles.activityCardActive]}
                  onPress={() => {
                    feedback.triggerHaptic('light');
                    setProfile({ ...profile, activityLevel: act.id });
                  }}
                >
                  <Text style={styles.activityIcon}>{act.icon}</Text>
                  <Text style={[styles.activityText, active && styles.activityTextActive]}>
                    {act.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Climate */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>TYPICAL CLIMATE</Text>
          <View style={styles.pillRow}>
            {climates.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.selectorPill,
                  profile.climate === c.id && styles.selectorPillActive,
                ]}
                onPress={() => {
                  feedback.triggerHaptic('light');
                  setProfile({ ...profile, climate: c.id });
                }}
              >
                <Text
                  style={[
                    styles.selectorPillText,
                    profile.climate === c.id && styles.selectorPillTextActive,
                  ]}
                >
                  {c.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Real-time Calculation Preview Card */}
          <View style={styles.calcPreviewCard}>
            <Ionicons name="sparkles" size={20} color="#0284C7" />
            <Text style={styles.calcPreviewText}>
              Estimated daily requirement: <Text style={styles.calcPreviewBold}>{formatVolume(calculatedTarget, unit)}</Text>
            </Text>
          </View>

          <View style={styles.footerGap}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={() => {
                feedback.triggerHaptic('medium');
                setStep(5);
              }}
            >
              <Text style={styles.primaryButtonText}>NEXT: REMINDERS</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step 5: Schedule & Smart Reminders
  if (step === 5) {
    const intervals = [
      { min: 60, label: 'Every 1 Hour' },
      { min: 90, label: 'Every 1.5 Hours' },
      { min: 120, label: 'Every 2 Hours' },
    ];

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <Text style={styles.stepBadge}>STEP 4 OF 5</Text>
            <Text style={styles.title}>Smart Reminders</Text>
            <Text style={styles.subtitle}>
              Friendly nudges from Brownie so you never fall behind.
            </Text>
          </Animated.View>

          {/* Active Reminder Toggle Card */}
          <View style={styles.reminderCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reminderTitle}>Friendly Reminders</Text>
              <Text style={styles.reminderDesc}>
                Sound and gentle vibration alerts during your wake hours
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleSwitch, reminders && styles.toggleSwitchActive]}
              onPress={() => {
                feedback.triggerHaptic('light');
                setReminders(!reminders);
              }}
            >
              <View style={[styles.toggleCircle, reminders && styles.toggleCircleActive]} />
            </TouchableOpacity>
          </View>

          {/* Frequency Options */}
          {reminders && (
            <Animated.View entering={FadeInUp.duration(400)}>
              <Text style={[styles.sectionLabel, { marginTop: 24 }]}>REMINDER FREQUENCY</Text>
              <View style={styles.cardList}>
                {intervals.map((inv) => {
                  const active = intervalMin === inv.min;
                  return (
                    <TouchableOpacity
                      key={inv.min}
                      style={[styles.goalCard, active && styles.goalCardActive]}
                      onPress={() => {
                        feedback.triggerHaptic('light');
                        setIntervalMin(inv.min);
                      }}
                    >
                      <Ionicons
                        name={active ? 'alarm' : 'alarm-outline'}
                        size={24}
                        color={active ? '#0284C7' : '#64748B'}
                      />
                      <Text style={[styles.goalCardTitle, active && styles.goalCardTitleActive]}>
                        {inv.label}
                      </Text>
                      <View style={[styles.radioCircle, active && styles.radioCircleActive]} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Quiet Hours Card */}
              <View style={styles.quietHoursCard}>
                <Ionicons name="moon" size={20} color="#8A5844" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.quietHoursTitle}>Quiet Hours Protected</Text>
                  <Text style={styles.quietHoursSub}>
                    No notifications sent between {profile.sleepTime} and {profile.wakeTime}.
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          <View style={styles.footerGap}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={() => {
                feedback.triggerHaptic('success');
                feedback.playWaterDropSound();
                setStep(6);
              }}
            >
              <Text style={styles.primaryButtonText}>REVEAL MY TARGET</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Step 6: Grand Celebration & Target Reveal
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Text style={styles.stepBadge}>TARGET READY</Text>
          <Text style={styles.title}>Your Daily Goal</Text>
          <Text style={styles.subtitle}>
            Based on your body, climate, and active lifestyle.
          </Text>
        </Animated.View>

        {/* Big Volume Metric Display */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.goalDisplayContainer}>
          <Text style={styles.goalNumberText}>{formatVolume(calculatedTarget, unit)}</Text>
          <Text style={styles.goalSubText}>per day</Text>

          {/* Unit Toggle Pill */}
          <View style={styles.unitToggleContainer}>
            <TouchableOpacity
              style={[styles.unitButton, unit === 'ml' && styles.unitButtonActive]}
              onPress={() => {
                feedback.triggerHaptic('light');
                setUnit('ml');
              }}
            >
              <Text style={[styles.unitText, unit === 'ml' && styles.unitTextActive]}>ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, unit === 'oz' && styles.unitButtonActive]}
              onPress={() => {
                feedback.triggerHaptic('light');
                setUnit('oz');
              }}
            >
              <Text style={[styles.unitText, unit === 'oz' && styles.unitTextActive]}>oz</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Mascot encouraging quote */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.quoteCard}>
          <Text style={styles.quoteEmoji}>🦫</Text>
          <Text style={styles.quoteText}>
            {`"Every glass counts! Drink consistently throughout the day and watch your energy soar."`}
          </Text>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => {
              feedback.triggerHaptic('success');
              feedback.playPourSound();
              onComplete({
                dailyTarget: calculatedTarget,
                unit,
                hasCompletedOnboarding: true,
                healthProfile: profile,
                reminderIntervalMinutes: intervalMin,
                smartRemindersEnabled: reminders,
              });
            }}
          >
            <Text style={styles.primaryButtonText}>START HYDRATING</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stepBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  characterCard: {
    alignItems: 'center',
    marginVertical: 16,
  },
  characterImage: {
    width: 250,
    height: 250,
  },
  characterName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#8A5844',
    marginTop: 12,
  },
  characterBio: {
    fontSize: 14,
    color: '#829AB1',
    fontWeight: '500',
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  selectorPill: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  selectorPillActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  selectorPillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  selectorPillTextActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  cardList: {
    gap: 10,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  goalCardActive: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  goalIcon: {
    fontSize: 28,
  },
  goalCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  goalCardTitleActive: {
    color: '#0284C7',
  },
  goalCardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  radioCircleActive: {
    borderColor: '#0284C7',
    borderWidth: 7,
  },
  weightBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  weightBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitToggleMini: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 2,
  },
  unitToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  unitToggleBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  unitToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  unitToggleTextActive: {
    color: '#0284C7',
  },
  weightControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepBtnText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0284C7',
    marginTop: -2,
  },
  weightNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F172A',
  },
  weightUnitText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748B',
  },
  activityGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  activityCardActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  activityIcon: {
    fontSize: 24,
  },
  activityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 6,
  },
  activityTextActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  calcPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    marginTop: 20,
    gap: 12,
  },
  calcPreviewText: {
    fontSize: 13,
    color: '#0369A1',
    fontWeight: '600',
    flex: 1,
  },
  calcPreviewBold: {
    fontWeight: '900',
    color: '#0284C7',
    fontSize: 16,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  reminderDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CBD5E1',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#0284C7',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  quietHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginTop: 16,
  },
  quietHoursTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  quietHoursSub: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
    fontWeight: '500',
  },
  goalDisplayContainer: {
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 32,
    paddingVertical: 36,
    borderWidth: 1.5,
    borderColor: '#BAE3FF',
    marginVertical: 12,
  },
  goalNumberText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#0284C7',
    letterSpacing: -1,
  },
  goalSubText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0369A1',
    marginTop: 4,
  },
  unitToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    borderRadius: 20,
    padding: 3,
    marginTop: 18,
  },
  unitButton: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
  },
  unitButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  unitTextActive: {
    color: '#0284C7',
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  quoteEmoji: {
    fontSize: 32,
  },
  quoteText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    marginBottom: 24,
    gap: 12,
  },
  footerGap: {
    marginTop: 28,
  },
  langPill: {
    alignSelf: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  primaryButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 18,
    borderRadius: 36,
    alignItems: 'center',
    shadowColor: 'rgba(30, 41, 59, 0.3)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

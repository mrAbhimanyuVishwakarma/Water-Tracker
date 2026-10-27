import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MASCOTS } from '../constants/beverages';
import { MascotConfig, MascotId, UserSettings } from '../types';
import { feedback } from '../utils/feedback';
import { CrispVectorMascot } from '../components/CrispVectorMascot';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  settings: UserSettings;
  onSelectMascot: (mascotId: MascotId) => void;
  onOpenPaywall: () => void;
  onOpenPoolParty: () => void;
  onStartTrial: () => void;
  onBack: () => void;
}

export const MascotLockerScreen: React.FC<Props> = ({
  settings,
  onSelectMascot,
  onOpenPaywall,
  onOpenPoolParty,
  onStartTrial,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [currentTime, setCurrentTime] = React.useState(() => Date.now());

  // 1-second interval to drive live trial countdown
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const trialStarted = settings.mascotTrialStartedAt;
  const isTrialActive =
    trialStarted !== null &&
    currentTime - trialStarted < 60_000 &&
    !settings.isPremium;
  const secondsLeft = isTrialActive
    ? Math.max(0, Math.ceil((60_000 - (currentTime - trialStarted)) / 1000))
    : 0;

  const canStartTrial =
    !settings.isPremium && !settings.hasUsedMascotTrial && !isTrialActive;

  const activeMascot =
    MASCOTS.find((m) => m.id === settings.activeCharacter) || MASCOTS[0];

  // Bobbing animation for mascot spotlight
  const bobbing = useSharedValue(0);
  React.useEffect(() => {
    bobbing.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [bobbing]);

  // When 1-minute trial expires, automatically revert back to Brownie
  React.useEffect(() => {
    if (trialStarted !== null && !settings.isPremium && currentTime - trialStarted >= 60_000) {
      if (settings.activeCharacter !== 'brownie') {
        onSelectMascot('brownie');
      }
    }
  }, [currentTime, trialStarted, settings.isPremium, settings.activeCharacter, onSelectMascot]);

  const bobbingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bobbing.value }],
  }));

  const handleEquip = (m: MascotConfig) => {
    // 1. Free or already premium -> equip immediately
    if (!m.isPro || settings.isPremium) {
      feedback.triggerHaptic('success');
      feedback.playWaterDropSound();
      onSelectMascot(m.id);
      return;
    }

    // 2. 1-Minute Pro Trial is active -> allow equipping any pro mascot
    if (isTrialActive) {
      feedback.triggerHaptic('success');
      feedback.playWaterDropSound();
      onSelectMascot(m.id);
      return;
    }

    // 3. Trial is available (never used) -> clicking any pro mascot starts the 1-minute trial and equips it!
    if (canStartTrial) {
      feedback.triggerHaptic('success');
      feedback.playWaterDropSound();
      onStartTrial();
      onSelectMascot(m.id);
      return;
    }

    // 4. Trial expired and user is not pro -> strictly locked, open paywall
    feedback.triggerHaptic('medium');
    onOpenPaywall();
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 24) }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            feedback.triggerHaptic('light');
            onBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mascot Locker</Text>
        <TouchableOpacity
          style={styles.poolShortcutBtn}
          onPress={() => {
            feedback.triggerHaptic('light');
            onOpenPoolParty();
          }}
        >
          <Text style={styles.poolShortcutText}>🏊 POOL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Active Mascot Spotlight Hero */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.heroCard}>
          <Animated.View style={[styles.mascotDisplay, bobbingStyle]}>
            <CrispVectorMascot
              type="sipping"
              mascotId={activeMascot.id}
              width={84}
              height={84}
            />
          </Animated.View>

          <View style={styles.activePill}>
            <Text style={styles.activePillText}>ACTIVE COMPANION</Text>
          </View>

          <Text style={styles.heroName}>{activeMascot.name}</Text>
          <Text style={styles.heroSpecies}>{activeMascot.species} · {activeMascot.title}</Text>

          <View style={styles.quoteBubble}>
            <Text style={styles.quoteText}>{`"${activeMascot.quote}"`}</Text>
          </View>
        </Animated.View>

        {/* 1-Minute Pro Mascot Trial Banner / Countdown */}
        {isTrialActive && (
          <View style={styles.trialActiveBanner}>
            <View style={styles.trialActivePulse}>
              <Text style={{ fontSize: 20 }}>⏳</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.trialActiveTitle}>
                1-Minute Pro Trial Active: {secondsLeft}s left!
              </Text>
              <Text style={styles.trialActiveSub}>
                All Pro companions are unlocked! Equip Dotti, Manny, Sid, Turbo or Pip now.
              </Text>
            </View>
          </View>
        )}

        {canStartTrial && (
          <TouchableOpacity
            style={styles.trialStartBanner}
            activeOpacity={0.88}
            onPress={() => {
              feedback.triggerHaptic('medium');
              onStartTrial();
            }}
          >
            <View style={styles.trialStartLeft}>
              <View style={styles.trialStarCircle}>
                <Text style={{ fontSize: 22 }}>⚡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.trialStartTitle}>1-Minute Mascot Free Trial</Text>
                  <View style={styles.oneTimeTag}>
                    <Text style={styles.oneTimeTagText}>ONCE ONLY</Text>
                  </View>
                </View>
                <Text style={styles.trialStartSub}>
                  Try Dotti the Dodo, Manny & all Pro companions free for 60 seconds!
                </Text>
              </View>
            </View>
            <View style={styles.trialStartBtn}>
              <Text style={styles.trialStartBtnText}>START 🚀</Text>
            </View>
          </TouchableOpacity>
        )}

        {settings.hasUsedMascotTrial && !isTrialActive && !settings.isPremium && (
          <View style={styles.trialUsedBadge}>
            <Text style={styles.trialUsedText}>✓ 1-Minute Preview Trial Completed</Text>
          </View>
        )}

        {/* Mascot Roster Section (Brownie Free, Extinct Dodo & Mammoth Pro) */}
        <Text style={styles.sectionTitle}>Choose Your Hydration Buddy</Text>

        <View style={styles.grid}>
          {MASCOTS.map((m) => {
            const isEquipped = settings.activeCharacter === m.id;
            const isLocked = m.isPro && !settings.isPremium && !isTrialActive;

            return (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.mascotCard,
                  isEquipped && styles.mascotCardEquipped,
                ]}
                activeOpacity={0.85}
                onPress={() => handleEquip(m)}
              >
                {/* Pro Lock or Free */}
                {m.isPro ? (
                  <View style={[styles.proBadge, !isLocked && styles.proBadgeUnlocked]}>
                    <Text style={styles.proBadgeText}>
                      {isTrialActive ? '⏳ TRIAL' : isLocked ? '🔒 PRO' : '👑 PRO'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>FREE</Text>
                  </View>
                )}

                <CrispVectorMascot
                  type="sipping"
                  mascotId={m.id}
                  width={56}
                  height={56}
                  style={{ marginTop: 4, marginBottom: 8 }}
                />
                <Text style={styles.cardName}>{m.name}</Text>
                <Text style={styles.cardSpecies}>{m.species}</Text>

                <View
                  style={[
                    styles.equipButton,
                    isEquipped && styles.equipButtonActive,
                    isTrialActive && m.isPro && !isEquipped && styles.equipButtonTrial,
                    isLocked && styles.equipButtonLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.equipButtonText,
                      isEquipped && styles.equipButtonTextActive,
                      isTrialActive && m.isPro && !isEquipped && styles.equipButtonTextTrial,
                    ]}
                  >
                    {isEquipped
                      ? 'EQUIPPED'
                      : isTrialActive && m.isPro
                      ? 'EQUIP (TRIAL)'
                      : isLocked
                      ? 'UNLOCK (PRO)'
                      : 'SELECT'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pro Banner Teaser */}
        {!settings.isPremium && (
          <TouchableOpacity
            style={styles.proTeaser}
            activeOpacity={0.85}
            onPress={() => {
              feedback.triggerHaptic('medium');
              onOpenPaywall();
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.proTeaserTitle}>👑 Unlock Sid, Turbo & Pip</Text>
              <Text style={styles.proTeaserSub}>
                Start your 3-Day Free Trial to unlock all premium companions.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FEF08A" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  poolShortcutBtn: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  poolShortcutText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 24,
  },
  mascotDisplay: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BAE6FD',
    marginBottom: 12,
  },
  heroBadgeEmoji: {
    fontSize: 54,
  },
  activePill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  heroName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
  },
  heroSpecies: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  quoteBubble: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
  },
  quoteText: {
    fontSize: 13,
    color: '#475569',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  mascotCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  mascotCardEquipped: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  proBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  proBadgeUnlocked: {
    backgroundColor: '#FEF08A',
    borderColor: '#EAB308',
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },
  freeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  freeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  cardEmoji: {
    fontSize: 44,
    marginTop: 6,
    marginBottom: 8,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSpecies: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 12,
  },
  equipButton: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  equipButtonActive: {
    backgroundColor: '#0284C7',
  },
  equipButtonLocked: {
    backgroundColor: '#FEF08A',
  },
  equipButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.3,
  },
  equipButtonTextActive: {
    color: '#FFFFFF',
  },
  equipButtonTrial: {
    backgroundColor: '#0284C7',
  },
  equipButtonTextTrial: {
    color: '#FFFFFF',
  },
  trialActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    shadowColor: 'rgba(2, 132, 199, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  trialActivePulse: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialActiveTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  trialActiveSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: 2,
  },
  trialStartBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    padding: 16,
    marginBottom: 20,
    shadowColor: 'rgba(217, 119, 6, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  trialStartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  trialStarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialStartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
  },
  oneTimeTag: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  oneTimeTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  trialStartSub: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '500',
    marginTop: 2,
  },
  trialStartBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  trialStartBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  trialUsedBadge: {
    backgroundColor: '#F1F5F9',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  trialUsedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  proTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 22,
    padding: 18,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  proTeaserTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FEF08A',
  },
  proTeaserSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import { CapybaraVessel } from '../components/CapybaraVessel';
import { BeverageDock } from '../components/BeverageDock';
import { CupSelectorModal } from '../components/CupSelectorModal';
import { BEVERAGES, CHALLENGES, MASCOTS } from '../constants/beverages';
import { DrinkLog, UserSettings, BeverageConfig, DayData } from '../types';
import { feedback } from '../utils/feedback';
import { calculateStreak, formatVolume } from '../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  settings: UserSettings;
  logs: DrinkLog[];
  history: DayData[];
  onAddDrink: (beverage: BeverageConfig, amount: number) => void;
  onOpenSettings: () => void;
  onOpenChallenges: () => void;
  onOpenPoolParty: () => void;
  onOpenMascotLocker: () => void;
  onUpdateVisibleBeverages: (keys: string[]) => void;
}

export const DashboardScreen: React.FC<Props> = ({
  settings,
  logs,
  history,
  onAddDrink,
  onOpenSettings,
  onOpenChallenges,
  onOpenPoolParty,
  onOpenMascotLocker,
  onUpdateVisibleBeverages,
}) => {
  const insets = useSafeAreaInsets();
  const [activeBeverage, setActiveBeverage] = useState<BeverageConfig | null>(null);

  // Total raw and effective hydration
  const totalMl = logs.reduce((sum, item) => sum + item.amount, 0);
  const totalEffective = logs.reduce((sum, item) => sum + (item.effectiveAmount ?? item.amount), 0);
  const percent = Math.min(Math.round((totalMl / Math.max(settings.dailyTarget, 1)) * 100), 100);
  const isGoalReached = totalMl >= settings.dailyTarget;

  // Active mascot config
  const activeMascot =
    MASCOTS.find((m) => m.id === settings.activeCharacter) || MASCOTS[0];

  // Active challenge
  const activeChallenge =
    CHALLENGES.find((c) => c.id === settings.activeChallengeId) || CHALLENGES[0];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 24) }]}>
      {/* 1. Top Bar */}
      <View style={styles.topBar}>
        {/* Streak Pill */}
        <TouchableOpacity
          style={styles.streakPill}
          activeOpacity={0.8}
          onPress={() => {
            feedback.triggerHaptic('light');
            onOpenChallenges();
          }}
        >
          <View style={styles.streakCircle}>
            <Text style={styles.streakNumber}>{calculateStreak(history)}</Text>
          </View>
          <Text style={styles.streakLabel}>days</Text>
        </TouchableOpacity>

        {/* Mascot Locker Switcher */}
        <TouchableOpacity
          style={styles.mascotPill}
          activeOpacity={0.8}
          onPress={() => {
            feedback.triggerHaptic('light');
            onOpenMascotLocker();
          }}
        >
          <Text style={styles.mascotEmoji}>{activeMascot.badge}</Text>
          <Text style={styles.appTitle}>{activeMascot.name}</Text>
          <Ionicons name="chevron-down" size={14} color="#64748B" />
        </TouchableOpacity>

        {/* Action Buttons: Pool Party & Settings */}
        <View style={styles.topRightIcons}>
          <TouchableOpacity
            style={styles.poolTopPill}
            activeOpacity={0.8}
            onPress={() => {
              feedback.triggerHaptic('medium');
              onOpenPoolParty();
            }}
          >
            <Text style={styles.poolTopPillEmoji}>🏊</Text>
            <Text style={styles.poolTopPillText}>Pool</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => {
              feedback.triggerHaptic('light');
              onOpenSettings();
            }}
          >
            <Ionicons name="options-outline" size={20} color="#0284C7" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. Big Hydration Metric Indicator */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.metricSection}>
          <Text style={styles.bigVolumeText}>
            {formatVolume(totalMl, settings.unit)}
          </Text>
          <Text style={styles.hydrationSubtitle}>
            Hydration · {percent}% of your {formatVolume(settings.dailyTarget, settings.unit)} goal {isGoalReached ? '🎉' : '💧'}
          </Text>
          {totalEffective !== totalMl && (
            <Text style={styles.effectiveSubtitle}>
              Net effective hydration: {formatVolume(totalEffective, settings.unit)}
            </Text>
          )}
        </Animated.View>

        {/* 3. Centerpiece Mascot Fluid Vessel */}
        <View style={styles.vesselWrapper}>
          <CapybaraVessel
            logs={logs}
            dailyTarget={settings.dailyTarget}
            mascotId={settings.activeCharacter}
            width={SCREEN_WIDTH * 0.72}
            height={SCREEN_WIDTH * 0.88}
          />
        </View>

        {/* 4. Active Challenge Mini Card */}
        <TouchableOpacity
          style={[styles.challengeCard, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}
          activeOpacity={0.85}
          onPress={() => {
            feedback.triggerHaptic('light');
            onOpenChallenges();
          }}
        >
          <View style={styles.challengeCardLeft}>
            <Text style={styles.challengeBadgeEmoji}>{activeChallenge.badge}</Text>
            <View>
              <Text style={styles.challengeCardTitle}>
                {activeChallenge.name}
              </Text>
              <Text style={styles.challengeCardSub}>
                Tap for your daily habit prompt
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#EA580C" />
        </TouchableOpacity>

        {/* 5. Interactive Pool Party Banner Card */}
        <TouchableOpacity
          style={styles.poolPartyBanner}
          activeOpacity={0.88}
          onPress={() => {
            feedback.triggerHaptic('medium');
            onOpenPoolParty();
          }}
        >
          <View style={styles.poolBannerLeft}>
            <View style={styles.poolBannerEmojiBox}>
              <Text style={{ fontSize: 24 }}>🍩</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.poolBannerTitle}>{"Brownie's Pool Party"}</Text>
              <Text style={styles.poolBannerSub}>
                Keep flat to calm water · Tilt to make waves & float!
              </Text>
            </View>
          </View>
          <View style={styles.poolBannerBadge}>
            <Text style={styles.poolBannerBadgeText}>SWIM 🏊</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* 5. Bottom Beverage Dock with Customizable Drinks */}
      <BeverageDock
        visibleBeverages={settings.visibleBeverages || ['water', 'green_tea', 'herbal_tea']}
        onSelectBeverage={(bev) => setActiveBeverage(bev)}
        onUpdateVisibleBeverages={onUpdateVisibleBeverages}
      />

      {/* 6. Interactive Cup Selector Modal */}
      {activeBeverage && (
        <CupSelectorModal
          visible={!!activeBeverage}
          beverage={activeBeverage}
          unit={settings.unit}
          cupPresets={settings.cupPresets}
          onClose={() => setActiveBeverage(null)}
          onAddDrink={(amount) => {
            onAddDrink(activeBeverage, amount);
            setActiveBeverage(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingLeft: 4,
    paddingRight: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  streakCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  streakLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  mascotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  mascotEmoji: {
    fontSize: 16,
  },
  appTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  topRightIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  metricSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  bigVolumeText: {
    fontSize: 52,
    fontWeight: '900',
    color: '#0284C7',
    letterSpacing: -1,
  },
  hydrationSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  effectiveSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
  },
  vesselWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  challengeCard: {
    width: SCREEN_WIDTH - 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    marginTop: 6,
  },
  challengeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  challengeBadgeEmoji: {
    fontSize: 26,
  },
  challengeCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#9A3412',
  },
  challengeCardSub: {
    fontSize: 12,
    color: '#C2410C',
    fontWeight: '500',
    marginTop: 2,
  },
  poolTopPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#7DD3FC',
    gap: 4,
  },
  poolTopPillEmoji: {
    fontSize: 14,
  },
  poolTopPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
  },
  poolPartyBanner: {
    width: SCREEN_WIDTH - 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    padding: 16,
    marginTop: 10,
    shadowColor: 'rgba(2, 132, 199, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  poolBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  poolBannerEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poolBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0369A1',
  },
  poolBannerSub: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '500',
    marginTop: 2,
  },
  poolBannerBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  poolBannerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

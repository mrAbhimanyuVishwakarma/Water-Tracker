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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CapybaraVessel } from '../components/CapybaraVessel';
import { BeverageDock } from '../components/BeverageDock';
import { CupSelectorModal } from '../components/CupSelectorModal';
import { MASCOTS } from '../constants/beverages';
import { DrinkLog, UserSettings, BeverageConfig, DayData } from '../types';
import { feedback } from '../utils/feedback';
import { calculateStreak, formatVolume } from '../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GOAL_HABITS = {
  skin: { title: 'Glowing Skin', icon: 'sparkles-outline', subtitle: 'Steady hydration through the day', color: '#DB2777', tint: '#FCE7F3' },
  energy: { title: 'Sustained Energy', icon: 'flash-outline', subtitle: 'Keep afternoon energy steady', color: '#D97706', tint: '#FEF3C7' },
  weight: { title: 'Weight Balance', icon: 'scale-outline', subtitle: 'Hydrate before cravings arrive', color: '#059669', tint: '#D1FAE5' },
  focus: { title: 'Sharp Focus', icon: 'locate-outline', subtitle: 'Support clarity throughout the day', color: '#7C3AED', tint: '#EDE9FE' },
} as const;

interface Props {
  settings: UserSettings;
  logs: DrinkLog[];
  history: DayData[];
  onAddDrink: (beverage: BeverageConfig, amount: number) => void;
  onOpenChallenges: () => void;
  onOpenHydrationCalendar: () => void;
  onOpenPoolParty: () => void;
  onUpdateVisibleBeverages: (keys: string[]) => void;
}

export const DashboardScreen: React.FC<Props> = ({
  settings,
  logs,
  history,
  onAddDrink,
  onOpenChallenges,
  onOpenHydrationCalendar,
  onOpenPoolParty,
  onUpdateVisibleBeverages,
}) => {
  const insets = useSafeAreaInsets();
  const [activeBeverage, setActiveBeverage] = useState<BeverageConfig | null>(null);

  // Total raw and effective hydration
  const totalMl = logs.reduce((sum, item) => sum + item.amount, 0);
  const totalEffective = logs.reduce((sum, item) => sum + (item.effectiveAmount ?? item.amount), 0);
  const effectiveHydration = Math.max(0, totalEffective);
  const percent = Math.min(Math.round((effectiveHydration / Math.max(settings.dailyTarget, 1)) * 100), 100);
  const [showHydrationInfo, setShowHydrationInfo] = useState(false);

  // Active mascot config
  const activeMascot =
    MASCOTS.find((m) => m.id === settings.activeCharacter) || MASCOTS[0];
  const selectedGoalHabits = (settings.healthProfile.primaryGoals || ['energy']).map(goal => ({
    id: goal,
    ...GOAL_HABITS[goal],
  }));
  const dashboardHabits = [
    { id: 'morning_wave', title: 'Morning Wake-Up Glass', icon: 'sunny-outline', subtitle: '350 ml after waking', color: '#0284C7', tint: '#E0F2FE' },
    ...selectedGoalHabits,
  ];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 24) }]}>
      {/* 1. Top Bar */}
      <View style={styles.topBar}>
        {/* Current mascot identifies the dashboard without duplicating Mascots navigation. */}
        <View style={styles.mascotIdentity} accessibilityLabel={`Current character: ${activeMascot.name}`}>
          <Text style={styles.mascotEmoji}>{activeMascot.badge}</Text>
          <Text style={styles.appTitle}>{activeMascot.name}</Text>
        </View>

        {/* Only dashboard-relevant actions stay in the top bar. */}
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.streakPill}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${calculateStreak(history)} day streak. Open hydration calendar`}
            onPress={() => {
              feedback.triggerHaptic('light');
              onOpenHydrationCalendar();
            }}
          >
            <View style={styles.streakCircle}>
              <Text style={styles.streakNumber}>{calculateStreak(history)}</Text>
            </View>
            <Text style={styles.streakLabel}>days</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.poolTopPill}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open Pool Party"
            onPress={() => {
              feedback.triggerHaptic('medium');
              onOpenPoolParty();
            }}
          >
            <Ionicons name="water-outline" size={16} color="#0284C7" />
            <Text style={styles.poolTopPillText}>Pool</Text>
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
            {formatVolume(effectiveHydration, settings.unit)}
          </Text>
          <View style={styles.hydrationSummaryRow}>
            <Text style={styles.hydrationSubtitle}>
              {percent}% of your {formatVolume(settings.dailyTarget, settings.unit)} hydration goal
            </Text>
            <TouchableOpacity
              style={styles.hydrationInfoButton}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="How effective hydration is calculated"
              accessibilityState={{ expanded: showHydrationInfo }}
              onPress={() => {
                feedback.triggerHaptic('light');
                setShowHydrationInfo((visible) => !visible);
              }}
            >
              <Ionicons name="information-circle-outline" size={20} color="#0369A1" />
            </TouchableOpacity>
          </View>
          {showHydrationInfo && (
            <View style={styles.hydrationInfoPanel}>
              <Text style={styles.hydrationInfoTitle}>How your hydration adds up</Text>
              <Text style={styles.hydrationInfoText}>
                Drinks count by their hydration value. For example, 250 ml of coffee at 80% adds 200 ml toward your goal.
              </Text>
              <Text style={styles.hydrationInfoTotals}>
                You logged {formatVolume(totalMl, settings.unit)} · {formatVolume(effectiveHydration, settings.unit)} counts toward today
              </Text>
            </View>
          )}
        </Animated.View>

        {/* 3. Centerpiece Mascot Fluid Vessel */}
        <View style={styles.vesselWrapper}>
          <CapybaraVessel
            logs={logs}
            dailyTarget={settings.dailyTarget}
            mascotId={settings.activeCharacter}
            soundEnabled={settings.soundEnabled}
            width={SCREEN_WIDTH * 0.72}
            height={SCREEN_WIDTH * 0.88}
          />
        </View>

        {/* 4. Daily hydration habit stack */}
        <View style={styles.habitStack}>
          {dashboardHabits.map((habit, index) => {
            const isActive = settings.activeChallengeId === habit.id;

            return (
              <TouchableOpacity
                key={habit.id}
                style={[styles.habitRow, index < dashboardHabits.length - 1 && styles.habitRowDivider]}
                activeOpacity={0.78}
                accessibilityRole="button"
                accessibilityLabel={`${habit.title}. ${habit.subtitle}`}
                onPress={() => {
                  feedback.triggerHaptic('light');
                  onOpenChallenges();
                }}
              >
                <View style={[styles.habitIcon, { backgroundColor: habit.tint }]}>
                  <Ionicons name={habit.icon as keyof typeof Ionicons.glyphMap} size={22} color={habit.color} />
                </View>
                <View style={styles.habitCopy}>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  <Text style={styles.habitSubtitle}>{habit.subtitle}</Text>
                </View>
                {isActive ? (
                  <View style={styles.activeHabitBadge}>
                    <Text style={styles.activeHabitText}>Active</Text>
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color="#64748B" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* 5. Bottom Beverage Dock with Customizable Drinks */}
      <BeverageDock
        visibleBeverages={settings.visibleBeverages || ['water', 'green_tea', 'herbal_tea']}
        unit={settings.unit}
        onQuickAdd={(beverage) => onAddDrink(beverage, beverage.defaultAmount)}
        onEditAmount={setActiveBeverage}
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
    gap: 12,
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
  mascotIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    textAlign: 'center',
  },
  hydrationSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 2,
    paddingHorizontal: 20,
  },
  hydrationInfoButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hydrationInfoPanel: {
    width: SCREEN_WIDTH - 40,
    marginTop: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
  },
  hydrationInfoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  hydrationInfoText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    color: '#334155',
  },
  hydrationInfoTotals: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '800',
    color: '#0369A1',
    fontVariant: ['tabular-nums'],
  },
  vesselWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  habitStack: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginTop: 6,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  habitRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  habitIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitCopy: {
    flex: 1,
    marginLeft: 12,
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  habitSubtitle: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    marginTop: 2,
  },
  activeHabitBadge: {
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  activeHabitText: {
    color: '#0369A1',
    fontSize: 11,
    fontWeight: '800',
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
  poolTopPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
  },
});

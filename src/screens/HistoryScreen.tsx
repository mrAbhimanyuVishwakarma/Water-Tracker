import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { DayData, DrinkLog, UserSettings } from '../types';
import { BEVERAGES } from '../constants/beverages';
import { feedback } from '../utils/feedback';
import { formatVolume } from '../utils/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  settings: UserSettings;
  history: DayData[];
  todayLogs: DrinkLog[];
  onBack: () => void;
  onOpenChallenges: () => void;
}

export const HistoryScreen: React.FC<Props> = ({
  settings,
  history,
  todayLogs,
  onBack,
  onOpenChallenges,
}) => {
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Compute metrics for today
  const totalRaw = todayLogs.reduce((sum, l) => sum + l.amount, 0);
  const totalEffective = todayLogs.reduce((sum, l) => sum + (l.effectiveAmount ?? l.amount), 0);
  const totalCaffeine = todayLogs.reduce((sum, l) => {
    const bev = BEVERAGES[l.type];
    return sum + (bev?.caffeineMg ? (bev.caffeineMg * (l.amount / (bev.defaultAmount || 250))) : 0);
  }, 0);

  // Beverage distribution today
  const bevDistribution: Record<string, number> = {};
  todayLogs.forEach((l) => {
    bevDistribution[l.type] = (bevDistribution[l.type] || 0) + l.amount;
  });

  // 7-day display data
  const days7 = history.slice(-7);
  const maxBarVolume = Math.max(settings.dailyTarget * 1.3, ...days7.map((d) => d.totalAmount), 2500);

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
        <Text style={styles.headerTitle}>Hydration Analytics</Text>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => {
            feedback.triggerHaptic('light');
            onOpenChallenges();
          }}
        >
          <Ionicons name="trophy-outline" size={20} color="#0284C7" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Metric Cards Row */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.metricRow}>
          {/* Card 1: Effective Hydration */}
          <View style={[styles.metricCard, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
            <Text style={styles.metricCardLabel}>NET HYDRATION</Text>
            <Text style={[styles.metricCardValue, { color: '#0284C7' }]}>
              {formatVolume(totalEffective, settings.unit)}
            </Text>
            <Text style={styles.metricCardSub}>
              Raw: {formatVolume(totalRaw, settings.unit)}
            </Text>
          </View>

          {/* Card 2: Caffeine Level */}
          <View style={[styles.metricCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
            <Text style={styles.metricCardLabel}>CAFFEINE</Text>
            <Text style={[styles.metricCardValue, { color: '#B45309' }]}>
              {Math.round(totalCaffeine)} <Text style={{ fontSize: 13 }}>mg</Text>
            </Text>
            <Text style={styles.metricCardSub}>Max 400 mg/day</Text>
          </View>
        </Animated.View>

        {/* 7-Day Hydration Bar Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.cardTitle}>7-Day Intake Trend</Text>
              <Text style={styles.cardSubtitle}>Target: {formatVolume(settings.dailyTarget, settings.unit)}</Text>
            </View>
            <View style={styles.goalTargetLegend}>
              <View style={styles.legendLine} />
              <Text style={styles.legendText}>Goal Line</Text>
            </View>
          </View>

          {/* Bar Chart Canvas */}
          <View style={styles.barChartContainer}>
            {days7.map((day, idx) => {
              const heightPercent = Math.min((day.totalAmount / maxBarVolume) * 100, 100);
              const isTargetMet = day.totalAmount >= settings.dailyTarget;
              const dateObj = new Date(day.date);
              const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()] || `D${idx+1}`;

              return (
                <View key={day.date} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${Math.max(heightPercent, 4)}%` },
                        isTargetMet ? styles.barFillMet : styles.barFillMissed,
                      ]}
                    />
                  </View>
                  <Text style={[styles.dayLabel, idx === days7.length - 1 && styles.dayLabelToday]}>
                    {dayName}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Beverage Breakdown Distribution */}
        <View style={styles.distributionCard}>
          <Text style={styles.cardTitle}>{"Today's Drink Breakdown"}</Text>
          <Text style={styles.cardSubtitle}>
            Hydration factor impacts how much each sip hydrates your cells.
          </Text>

          {todayLogs.length === 0 ? (
            <View style={styles.emptyLogsState}>
              <Text style={styles.emptyEmoji}>💧</Text>
              <Text style={styles.emptyText}>No drinks logged yet today. Take your first sip!</Text>
            </View>
          ) : (
            <View style={styles.breakdownList}>
              {Object.entries(bevDistribution).map(([type, amount]) => {
                const bev = BEVERAGES[type] || BEVERAGES.water;
                const percent = Math.round((amount / Math.max(totalRaw, 1)) * 100);
                return (
                  <View key={type} style={styles.breakdownItem}>
                    <View style={[styles.bevDot, { backgroundColor: bev.color }]} />
                    <Text style={styles.bevLabel}>{bev.label}</Text>
                    <Text style={styles.bevFactorBadge}>
                      {bev.hydrationMultiplier > 0 ? `${Math.round(bev.hydrationMultiplier * 100)}% Hydration` : 'Dehydrating'}
                    </Text>
                    <Text style={styles.bevAmountText}>
                      {formatVolume(amount, settings.unit)} ({percent}%)
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Today's Chronological Feed */}
        <View style={styles.feedCard}>
          <Text style={styles.cardTitle}>Activity Log</Text>
          {todayLogs.length === 0 ? (
            <Text style={styles.noLogsText}>Your intake activity will appear here as you log.</Text>
          ) : (
            <View style={styles.feedList}>
              {[...todayLogs].reverse().map((log) => {
                const bev = BEVERAGES[log.type] || BEVERAGES.water;
                const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <View key={log.id} style={styles.feedItem}>
                    <View style={[styles.feedIconCircle, { backgroundColor: bev.color }]}>
                      <Ionicons name={bev.icon as any} size={18} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.feedTitle}>{bev.label}</Text>
                      <Text style={styles.feedTime}>{timeStr}</Text>
                    </View>
                    <Text style={styles.feedAmount}>
                      +{formatVolume(log.amount, settings.unit)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
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
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  scroll: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  metricCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  metricCardValue: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  metricCardSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  goalTargetLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendLine: {
    width: 14,
    height: 3,
    backgroundColor: '#0284C7',
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 22,
    height: 125,
    backgroundColor: '#F1F5F9',
    borderRadius: 11,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 11,
  },
  barFillMet: {
    backgroundColor: '#0284C7',
  },
  barFillMissed: {
    backgroundColor: '#38BDF8',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 8,
  },
  dayLabelToday: {
    color: '#0284C7',
    fontWeight: '900',
  },
  distributionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  emptyLogsState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  breakdownList: {
    marginTop: 14,
    gap: 10,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    gap: 10,
  },
  bevDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  bevLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  bevFactorBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bevAmountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
  },
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  noLogsText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 8,
  },
  feedList: {
    marginTop: 14,
    gap: 10,
  },
  feedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  feedIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  feedTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  feedAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0284C7',
  },
});

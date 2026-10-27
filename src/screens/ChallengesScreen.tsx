import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CHALLENGES } from '../constants/beverages';
import { Challenge, DayData, UserSettings } from '../types';
import { feedback } from '../utils/feedback';
import { formatVolume } from '../utils/storage';

interface Props {
  settings: UserSettings;
  history: DayData[];
  onBack: () => void;
  onSelectChallenge: (challengeId: string) => void;
}

export const ChallengesScreen: React.FC<Props> = ({
  settings,
  history,
  onBack,
  onSelectChallenge,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(
    settings.activeChallengeId || CHALLENGES[0].id
  );

  const selectedChallenge =
    CHALLENGES.find((c) => c.id === selectedChallengeId) || CHALLENGES[0];

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

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
        <Text style={styles.headerTitle}>Healthy Challenges</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Horizontal Challenge Mascot Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.challengeTabs}
        >
          {CHALLENGES.map((ch) => {
            const isSelected = ch.id === selectedChallengeId;
            return (
              <TouchableOpacity
                key={ch.id}
                style={[
                  styles.tabChip,
                  isSelected && { backgroundColor: ch.color, borderColor: ch.color },
                ]}
                onPress={() => {
                  feedback.triggerHaptic('light');
                  setSelectedChallengeId(ch.id);
                }}
              >
                <Text style={styles.tabBadge}>{ch.badge}</Text>
                <Text
                  style={[
                    styles.tabTitle,
                    isSelected && { color: '#FFFFFF' },
                  ]}
                >
                  {ch.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Challenge Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: selectedChallenge.color }]}>
          <View style={styles.badgeRow}>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{selectedChallenge.durationDays} DAYS</Text>
            </View>
            <Text style={styles.mascotEmoji}>{selectedChallenge.badge}</Text>
          </View>

          <Text style={styles.challengeHeroTitle}>{selectedChallenge.name}</Text>
          <Text style={styles.challengeDesc}>{selectedChallenge.description}</Text>

          {/* 10-Day Milestone Progress Circles */}
          <View style={styles.milestoneRow}>
            {Array.from({ length: selectedChallenge.durationDays }).map((_, idx) => {
              const dayNum = idx + 1;
              const isDone = dayNum <= selectedChallenge.currentDay;
              return (
                <View
                  key={dayNum}
                  style={[
                    styles.milestoneDot,
                    isDone && styles.milestoneDotDone,
                  ]}
                >
                  <Text style={[styles.milestoneText, isDone && styles.milestoneTextDone]}>
                    {isDone ? '✓' : dayNum}
                  </Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.challengeActionBtn}
            activeOpacity={0.85}
            onPress={() => {
              feedback.triggerHaptic('medium');
              feedback.playWaterDropSound();
              onSelectChallenge(selectedChallenge.id);
            }}
          >
            <Text style={styles.challengeActionText}>
              {settings.activeChallengeId === selectedChallenge.id
                ? 'CURRENT ACTIVE CHALLENGE'
                : 'START THIS CHALLENGE'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Streak History Matrix */}
        <View style={styles.calendarCard}>
          <View style={styles.streakBadgeContainer}>
            <View style={styles.streakCircle}>
              <Text style={styles.streakNumber}>2</Text>
              <Text style={styles.streakLabel}>DAY STREAK</Text>
            </View>
          </View>

          <Text style={styles.sectionHeading}>Challenge Calendar</Text>
          <View style={styles.calendarGrid}>
            {daysInMonth.map((d) => {
              const isToday = d === 27;
              const isAchieved = d === 26 || d === 27;
              return (
                <View
                  key={d}
                  style={[
                    styles.calDay,
                    isAchieved && styles.calDayAchieved,
                    isToday && styles.calDayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.calDayText,
                      isAchieved && styles.calDayTextAchieved,
                    ]}
                  >
                    {d}
                  </Text>
                  {isAchieved && <View style={styles.calCheckDot} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* Benefits Card */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Benefits</Text>
          {selectedChallenge.benefits.map((b, idx) => (
            <View key={idx} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
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
  scroll: {
    paddingBottom: 40,
  },
  challengeTabs: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  tabBadge: {
    fontSize: 16,
  },
  tabTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 30,
    padding: 24,
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  mascotEmoji: {
    fontSize: 32,
  },
  challengeHeroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 12,
    letterSpacing: -0.5,
  },
  challengeDesc: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
    lineHeight: 22,
    fontWeight: '500',
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  milestoneDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneDotDone: {
    backgroundColor: '#FFFFFF',
  },
  milestoneText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  milestoneTextDone: {
    color: '#0F172A',
  },
  challengeActionBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  challengeActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  calendarCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  streakBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  streakCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(16, 185, 129, 0.35)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  streakNumber: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  calDay: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calDayAchieved: {
    backgroundColor: '#E0F2FE',
    borderColor: '#38BDF8',
  },
  calDayToday: {
    borderWidth: 2,
    borderColor: '#0284C7',
  },
  calDayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  calDayTextAchieved: {
    color: '#0284C7',
    fontWeight: '800',
  },
  calCheckDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0284C7',
  },
  benefitsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
});

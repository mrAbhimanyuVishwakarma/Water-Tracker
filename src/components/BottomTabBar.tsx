import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { feedback } from '../utils/feedback';

export type TabId = 'dashboard' | 'history' | 'challenges' | 'mascots' | 'settings';

interface Props {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'dashboard', label: 'Today', icon: 'water-outline', iconActive: 'water' },
  { id: 'history', label: 'History', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
  { id: 'challenges', label: 'Habits', icon: 'trophy-outline', iconActive: 'trophy' },
  { id: 'mascots', label: 'Mascots', icon: 'paw-outline', iconActive: 'paw' },
  { id: 'settings', label: 'Settings', icon: 'options-outline', iconActive: 'options' },
];

export const BottomTabBar: React.FC<Props> = ({ activeTab, onSelectTab }) => {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              activeOpacity={0.7}
              onPress={() => {
                feedback.triggerHaptic('light');
                onSelectTab(tab.id);
              }}
            >
              <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={22}
                  color={isActive ? '#0284C7' : '#94A3B8'}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingBottom: 22,
    paddingTop: 8,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    minWidth: 58,
  },
  tabButtonActive: {},
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: '#E0F2FE',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
});

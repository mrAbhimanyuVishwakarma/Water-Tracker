import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserSettings } from '../types';
import { feedback } from '../utils/feedback';
import { formatVolume } from '../utils/storage';
import Constants from 'expo-constants';
import { openLegalPage } from '../services/legal';
interface Props {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onBack: () => void;
  onOpenPoolParty: () => void;
  onOpenPaywall: () => void;
  onOpenAuth: () => void;
  onResetData: () => void;
  reminderStatus: string;
}

export const SettingsScreen: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onBack,
  onOpenPoolParty,
  onOpenPaywall,
  onOpenAuth,
  onResetData,
  reminderStatus,
}) => {
  const insets = useSafeAreaInsets();
  const { dailyTarget, unit, soundEnabled: sound, hapticEnabled: haptic } = settings;
  const saveGoal = (val: number) => {
    onUpdateSettings({ dailyTarget: val });
    feedback.triggerHaptic('light');
  };

  const toggleUnit = (newUnit: 'ml' | 'oz') => {
    onUpdateSettings({ unit: newUnit });
    feedback.triggerHaptic('light');
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Premium plans */}
        <TouchableOpacity
          style={styles.proBanner}
          activeOpacity={0.85}
          onPress={() => {
            feedback.triggerHaptic('medium');
            onOpenPaywall();
          }}
        >
          <View style={styles.proBannerLeft}>
            <Text style={styles.proBannerTitle}>👑 Brownie Premium</Text>
            <Text style={styles.proBannerSub}>
              {settings.isPremium ? 'Active Pro Member' : 'Unlock every mascot'}
            </Text>
          </View>
          <View style={styles.upgradeBadge}>
            <Text style={styles.upgradeBadgeText}>{settings.isPremium ? 'PRO' : 'VIEW PLANS'}</Text>
          </View>
        </TouchableOpacity>

        {/* Section: Account & Cloud Sync */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account & Cloud Backup</Text>
          <Text style={styles.sectionSubtitle}>
            Back up hydration logs and preferences to your account. Guest data stays on this device.
          </Text>
          <TouchableOpacity
            style={styles.accountCard}
            activeOpacity={0.85}
            onPress={() => {
              feedback.triggerHaptic('light');
              onOpenAuth();
            }}
          >
            <View style={styles.accountCardLeft}>
              <View style={[styles.accountAvatar, settings.userAccount ? styles.accountAvatarConnected : null]}>
                <Ionicons
                  name={settings.userAccount ? 'cloud-done' : 'cloud-outline'}
                  size={20}
                  color={settings.userAccount ? '#059669' : '#0284C7'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.accountTitle}>
                  {settings.userAccount ? settings.userAccount.name || 'Cloud Connected' : 'Sign In / Connect Cloud'}
                </Text>
                <Text style={styles.accountSub}>
                  {settings.userAccount ? (settings.userAccount.email || settings.userAccount.phone) : 'Google Sign-In or Mobile OTP'}
                </Text>
              </View>
            </View>
            <View style={styles.accountCardRight}>
              <Text style={styles.accountActionText}>
                {settings.userAccount ? 'MANAGE' : 'SIGN IN'}
              </Text>
              <Ionicons name="chevron-forward" size={14} color="#0284C7" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Hydration Reminders</Text>
          <Text style={styles.sectionSubtitle}>{reminderStatus}</Text>
          <View style={styles.settingRow}>
            <Text style={styles.rowLabel}>Enable daily reminders</Text>
            <Switch value={settings.smartRemindersEnabled} onValueChange={value => onUpdateSettings({ smartRemindersEnabled: value })} />
          </View>
          <Text style={styles.sectionSubtitle}>Wake {settings.healthProfile.wakeTime} / Sleep {settings.healthProfile.sleepTime}</Text>
          <Text style={styles.rowLabel}>Wake time</Text>
          <View style={styles.chipRow}>
            {['06:00', '07:00', '08:00', '09:00'].map(time => <TouchableOpacity key={time}
              style={[styles.chip, settings.healthProfile.wakeTime === time && styles.chipActive]}
              onPress={() => onUpdateSettings({ healthProfile: { ...settings.healthProfile, wakeTime: time } })}>
              <Text style={styles.chipText}>{time}</Text>
            </TouchableOpacity>)}
          </View>
          <Text style={styles.rowLabel}>Sleep time</Text>
          <View style={styles.chipRow}>
            {['21:00', '22:00', '23:00', '00:00'].map(time => <TouchableOpacity key={time}
              style={[styles.chip, settings.healthProfile.sleepTime === time && styles.chipActive]}
              onPress={() => onUpdateSettings({ healthProfile: { ...settings.healthProfile, sleepTime: time } })}>
              <Text style={styles.chipText}>{time}</Text>
            </TouchableOpacity>)}
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[60, 90, 120].map(minutes => <TouchableOpacity key={minutes} style={styles.actionBtn}
              onPress={() => onUpdateSettings({ reminderIntervalMinutes: minutes })}>
              <Text style={styles.actionBtnText}>{settings.reminderIntervalMinutes === minutes ? '* ' : ''}{minutes} min</Text>
            </TouchableOpacity>)}
          </View>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { Linking.openSettings().catch(() => Alert.alert('Open device settings', 'Allow notifications for Brownie Water Tracker.')); }}>
            <Text style={styles.actionBtnText}>Notification Permission</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Daily Hydration Target */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Daily Target</Text>
          <Text style={styles.sectionSubtitle}>
            Current goal: {formatVolume(dailyTarget, unit)}
          </Text>

          {/* Quick preset chips */}
          <View style={styles.chipRow}>
            {[1500, 2000, 2500, 3000].map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.chip, dailyTarget === v && styles.chipActive]}
                onPress={() => saveGoal(v)}
              >
                <Text style={[styles.chipText, dailyTarget === v && styles.chipTextActive]}>
                  {formatVolume(v, unit)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section: Measurement Unit */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Measurement Unit</Text>
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitBtn, unit === 'ml' && styles.unitBtnActive]}
              onPress={() => toggleUnit('ml')}
            >
              <Text style={[styles.unitBtnText, unit === 'ml' && styles.unitBtnTextActive]}>
                Milliliters (ml)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.unitBtn, unit === 'oz' && styles.unitBtnActive]}
              onPress={() => toggleUnit('oz')}
            >
              <Text style={[styles.unitBtnText, unit === 'oz' && styles.unitBtnTextActive]}>
                Fluid Ounces (oz)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Sound & Haptics */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Audio & Haptics</Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.rowLabel}>Reminder Sounds</Text>
              <Text style={styles.rowSub}>Play a sound with scheduled reminders</Text>
            </View>
            <Switch
              value={sound}
              onValueChange={(val) => {
                onUpdateSettings({ soundEnabled: val });
                feedback.triggerHaptic('light');
              }}
              trackColor={{ false: '#CBD5E1', true: '#0284C7' }}
            />
          </View>

          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 14 }]}>
            <View>
              <Text style={styles.rowLabel}>Haptic Feedback</Text>
              <Text style={styles.rowSub}>Gentle Android native vibration on buttons</Text>
            </View>
            <Switch
              value={haptic}
              onValueChange={(val) => {
                onUpdateSettings({ hapticEnabled: val });
                feedback.triggerHaptic('light');
              }}
              trackColor={{ false: '#CBD5E1', true: '#0284C7' }}
            />
          </View>
        </View>

        {/* Section: Interactive Pool Party */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Interactive Pool</Text>
          <Text style={styles.sectionSubtitle}>
            Play with the tilt-physics swimming pool hero screen!
          </Text>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.85}
            onPress={() => {
              feedback.triggerHaptic('medium');
              onOpenPoolParty();
            }}
          >
            <Text style={styles.actionBtnText}>🏊 OPEN SWIMMING POOL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Privacy & Terms</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={() => void openLegalPage('privacy')}><Text style={styles.actionBtnText}>Privacy Policy</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => void openLegalPage('terms')}><Text style={styles.actionBtnText}>Terms of Use</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => void openLegalPage('deletion')}><Text style={styles.actionBtnText}>Account Deletion Help</Text></TouchableOpacity>
        </View>

        {/* Section: App Data */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>App Data & Reset</Text>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
            onPress={() => {
              feedback.triggerHaptic('heavy');
              Alert.alert('Reset guest data?', 'This removes all guest history and preferences on this device.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reset', style: 'destructive', onPress: onResetData },
              ]);
            }}
          >
            <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>
              RESET DATA & REPLAY ONBOARDING
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Brownie Water Tracker v{Constants.expoConfig?.version || '1.0.0'}</Text>

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
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  proBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  proBannerLeft: {
    flex: 1,
  },
  proBannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FEF08A',
  },
  proBannerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  upgradeBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  upgradeBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    gap: 6,
    marginTop: 6,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  unitBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  unitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  unitBtnTextActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  rowSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    marginTop: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.3,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  accountCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarConnected: {
    backgroundColor: '#D1FAE5',
  },
  accountTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  accountSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  accountCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 8,
  },
  accountActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 10,
  },
  versionPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  versionPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
  },
  repoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  repoInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    padding: 0,
  },
  repoText: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  repoEditBtn: {
    padding: 4,
  },
  updateStatusBox: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  updateStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
    textAlign: 'center',
  },
});

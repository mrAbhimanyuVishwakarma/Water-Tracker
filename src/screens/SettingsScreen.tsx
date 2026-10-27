import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CurrencyCode, UserSettings } from '../types';
import { feedback } from '../utils/feedback';
import { formatVolume } from '../utils/storage';
import {
  CURRENT_APP_VERSION,
  DEFAULT_GITHUB_REPO,
  checkGitHubRelease,
  UpdateCheckResult,
} from '../utils/updater';
import { UpdateModal } from '../components/UpdateModal';

interface Props {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onBack: () => void;
  onOpenPoolParty: () => void;
  onOpenPaywall: () => void;
  onOpenAuth: () => void;
  onResetData: () => void;
}

export const SettingsScreen: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onBack,
  onOpenPoolParty,
  onOpenPaywall,
  onOpenAuth,
  onResetData,
}) => {
  const insets = useSafeAreaInsets();
  const [dailyTarget, setDailyTarget] = useState(settings.dailyTarget);
  const [unit, setUnit] = useState(settings.unit);
  const [currency, setCurrency] = useState<CurrencyCode>(settings.currency || 'INR');
  const [sound, setSound] = useState(settings.soundEnabled);
  const [haptic, setHaptic] = useState(settings.hapticEnabled);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [githubRepo, setGithubRepo] = useState(settings.githubRepo || DEFAULT_GITHUB_REPO);
  const [isEditingRepo, setIsEditingRepo] = useState(false);
  const [autoCheckUpdates, setAutoCheckUpdates] = useState(settings.autoCheckUpdates !== false);

  const handleCheckForUpdates = async () => {
    try {
      setCheckingUpdate(true);
      setUpdateStatus('Checking GitHub for updates...');
      feedback.triggerHaptic('light');

      const result = await checkGitHubRelease(githubRepo);
      setCheckingUpdate(false);

      if (result.available) {
        setUpdateStatus(`✨ New version ${result.latestVersion} found!`);
        setUpdateResult(result);
        setShowUpdateModal(true);
      } else {
        setUpdateStatus(`✅ You are on the latest version (${result.currentVersion})`);
        Alert.alert(
          'Up to Date',
          `You are running the latest version (${result.currentVersion}). No update is available on GitHub.`,
          [{ text: 'OK' }]
        );
      }
    } catch (err: any) {
      setCheckingUpdate(false);
      setUpdateStatus('Failed to check for updates');
      Alert.alert('Update Check Failed', err?.message || 'Could not connect to GitHub.');
    }
  };

  const saveGoal = (val: number) => {
    setDailyTarget(val);
    onUpdateSettings({ dailyTarget: val });
    feedback.triggerHaptic('light');
  };

  const toggleUnit = (newUnit: 'ml' | 'oz') => {
    setUnit(newUnit);
    onUpdateSettings({ unit: newUnit });
    feedback.triggerHaptic('light');
  };

  const selectCurrency = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    onUpdateSettings({ currency: newCurrency });
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
        {/* Pro Banner with 3-Day Trial */}
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
              {settings.isPremium ? 'Active Pro Member' : '3-Day Free Trial · Unlock Sid, Turbo, Pip'}
            </Text>
          </View>
          <View style={styles.upgradeBadge}>
            <Text style={styles.upgradeBadgeText}>{settings.isPremium ? 'PRO' : '3-DAY TRIAL'}</Text>
          </View>
        </TouchableOpacity>

        {/* Section: Account & Cloud Sync */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account & Cloud Backup</Text>
          <Text style={styles.sectionSubtitle}>
            Save streak, logs & Pro purchases across all devices.
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

        {/* Section: Currency Preference */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pricing Currency</Text>
          <Text style={styles.sectionSubtitle}>
            Display store and subscription prices in your local currency.
          </Text>
          <View style={styles.chipRow}>
            {[
              { code: 'INR', label: '₹ INR' },
              { code: 'USD', label: '$ USD' },
              { code: 'EUR', label: '€ EUR' },
              { code: 'GBP', label: '£ GBP' },
            ].map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[styles.chip, currency === c.code && styles.chipActive]}
                onPress={() => selectCurrency(c.code as CurrencyCode)}
              >
                <Text style={[styles.chipText, currency === c.code && styles.chipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section: Sound & Haptics */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Audio & Haptics</Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.rowLabel}>Water Pouring Sounds</Text>
              <Text style={styles.rowSub}>Plays relaxing water droplet sounds</Text>
            </View>
            <Switch
              value={sound}
              onValueChange={(val) => {
                setSound(val);
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
                setHaptic(val);
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

        {/* Section: GitHub In-App Updates */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="cloud-download-outline" size={22} color="#0284C7" />
              <Text style={styles.sectionTitle}>GitHub In-App Updates</Text>
            </View>
            <View style={styles.versionPill}>
              <Text style={styles.versionPillText}>v{CURRENT_APP_VERSION} (BETA)</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            Automatically downloads and installs updates directly from your GitHub releases.
          </Text>

          {/* Repository Display & Edit */}
          <View style={styles.repoBox}>
            <Ionicons name="logo-github" size={18} color="#0F172A" />
            {isEditingRepo ? (
              <TextInput
                style={styles.repoInput}
                value={githubRepo}
                onChangeText={setGithubRepo}
                onBlur={() => {
                  setIsEditingRepo(false);
                  onUpdateSettings({ githubRepo });
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            ) : (
              <Text style={styles.repoText} numberOfLines={1}>
                {githubRepo}
              </Text>
            )}
            <TouchableOpacity
              onPress={() => {
                if (isEditingRepo) {
                  onUpdateSettings({ githubRepo });
                }
                setIsEditingRepo(!isEditingRepo);
              }}
              style={styles.repoEditBtn}
            >
              <Ionicons name={isEditingRepo ? 'checkmark' : 'pencil'} size={16} color="#0284C7" />
            </TouchableOpacity>
          </View>

          {/* Auto Check Toggle */}
          <View style={[styles.settingRow, { marginTop: 12, marginBottom: 8 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Check on Launch</Text>
              <Text style={styles.rowSub}>Auto-check for updates whenever the app opens</Text>
            </View>
            <Switch
              value={autoCheckUpdates}
              onValueChange={(val) => {
                setAutoCheckUpdates(val);
                onUpdateSettings({ autoCheckUpdates: val });
                feedback.triggerHaptic('light');
              }}
              trackColor={{ false: '#CBD5E1', true: '#0284C7' }}
            />
          </View>

          {/* Status Message */}
          {updateStatus && (
            <View style={styles.updateStatusBox}>
              <Text style={styles.updateStatusText}>{updateStatus}</Text>
            </View>
          )}

          {/* Check Button */}
          <TouchableOpacity
            style={[styles.actionBtn, { marginTop: 8 }]}
            activeOpacity={0.85}
            disabled={checkingUpdate}
            onPress={handleCheckForUpdates}
          >
            {checkingUpdate ? (
              <ActivityIndicator size="small" color="#0284C7" />
            ) : (
              <Text style={styles.actionBtnText}>🔍 CHECK FOR UPDATES</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Section: App Data */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>App Data & Reset</Text>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
            onPress={() => {
              feedback.triggerHaptic('heavy');
              onResetData();
            }}
          >
            <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>
              RESET DATA & REPLAY ONBOARDING
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Brownie Water Tracker v1.0.0 (Beta All Unlocked)</Text>

        <UpdateModal
          visible={showUpdateModal}
          updateInfo={updateResult}
          onClose={() => setShowUpdateModal(false)}
        />
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

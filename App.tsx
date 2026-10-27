import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingFlow } from './src/components/OnboardingFlow';
import { InteractivePoolScreen } from './src/components/InteractivePoolScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { ChallengesScreen } from './src/screens/ChallengesScreen';
import { MascotLockerScreen } from './src/screens/MascotLockerScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { PricingPaywallScreen } from './src/screens/PricingPaywallScreen';
import { AuthModal } from './src/screens/AuthModal';
import { BottomTabBar, TabId } from './src/components/BottomTabBar';
import {
  loadSettings,
  saveSettings,
  loadTodayLogs,
  saveTodayLogs,
  loadHistoryDays,
} from './src/utils/storage';
import {
  UserSettings,
  DrinkLog,
  DayData,
  BeverageConfig,
  MascotId,
  CurrencyCode,
  UserAccount,
} from './src/types';
import { DEFAULT_SETTINGS } from './src/constants/beverages';
import { feedback } from './src/utils/feedback';

type Screen = TabId | 'onboarding' | 'pool_party' | 'paywall';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [todayLogs, setTodayLogs] = useState<DrinkLog[]>([]);
  const [history, setHistory] = useState<DayData[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize app state from persistent storage
  useEffect(() => {
    const init = async () => {
      const storedSettings = await loadSettings();
      const logs = await loadTodayLogs();
      const hist = await loadHistoryDays(14);

      // Verify mascot trial status: if not premium and trial has expired, ensure active mascot reverts to brownie
      const trialActive =
        storedSettings.mascotTrialStartedAt !== null &&
        Date.now() - storedSettings.mascotTrialStartedAt < 60_000 &&
        !storedSettings.isPremium;

      let effectiveSettings = storedSettings;
      if (!storedSettings.isPremium && !trialActive && storedSettings.activeCharacter !== 'brownie') {
        effectiveSettings = { ...storedSettings, activeCharacter: 'brownie' };
        await saveSettings(effectiveSettings);
      }

      setSettings(effectiveSettings);
      setTodayLogs(logs);
      setHistory(hist);

      if (effectiveSettings.hasCompletedOnboarding) {
        setCurrentScreen('dashboard');
      } else {
        setCurrentScreen('onboarding');
      }
      setIsReady(true);
    };

    init();
  }, []);

  // 1-Minute Pro Mascot Trial Watchdog
  // Automatically reverts to brownie after 60 seconds unless user is premium
  useEffect(() => {
    if (!settings.mascotTrialStartedAt || settings.isPremium) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (settings.mascotTrialStartedAt || 0)) / 1000);
      if (elapsed >= 60) {
        if (settings.activeCharacter !== 'brownie') {
          handleUpdateSettings({ activeCharacter: 'brownie' });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.mascotTrialStartedAt, settings.isPremium, settings.activeCharacter]);

  const handleUpdateSettings = async (partial: Partial<UserSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleStartMascotTrial = async () => {
    const updated = {
      ...settings,
      mascotTrialStartedAt: Date.now(),
      hasUsedMascotTrial: true,
    };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleLoginSuccess = async (userAccount: UserAccount) => {
    await handleUpdateSettings({ userAccount });
    setShowAuthModal(false);
  };

  const handleSignOut = async () => {
    await handleUpdateSettings({ userAccount: null });
    setShowAuthModal(false);
  };

  const handleOnboardingComplete = async (onboardingData: Partial<UserSettings>) => {
    const updated = {
      ...settings,
      ...onboardingData,
      hasCompletedOnboarding: true,
    };
    setSettings(updated);
    await saveSettings(updated);
    setCurrentScreen('dashboard');
  };

  const handleAddDrink = async (beverage: BeverageConfig, amount: number) => {
    const effectiveAmount = Math.round(amount * beverage.hydrationMultiplier);
    const newEntry: DrinkLog = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: beverage.type,
      amount,
      effectiveAmount,
      timestamp: Date.now(),
      color: beverage.color,
    };
    const updatedLogs = [...todayLogs, newEntry];
    setTodayLogs(updatedLogs);
    await saveTodayLogs(updatedLogs);

    // Refresh history
    const hist = await loadHistoryDays(14);
    setHistory(hist);
  };

  const handleSelectMascot = async (mascotId: MascotId) => {
    await handleUpdateSettings({ activeCharacter: mascotId });
  };

  const handleResetData = async () => {
    const freshSettings = { ...DEFAULT_SETTINGS, hasCompletedOnboarding: false };
    setSettings(freshSettings);
    setTodayLogs([]);
    await saveSettings(freshSettings);
    await saveTodayLogs([]);
    setCurrentScreen('onboarding');
  };

  if (!isReady) {
    return <View style={styles.loadingContainer} />;
  }

  const isTabScreen =
    currentScreen === 'dashboard' ||
    currentScreen === 'history' ||
    currentScreen === 'challenges' ||
    currentScreen === 'mascots' ||
    currentScreen === 'settings';

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar
          style={currentScreen === 'pool_party' || currentScreen === 'onboarding' ? 'light' : 'dark'}
        />

        <View style={styles.screenWrapper}>
          {currentScreen === 'onboarding' && (
            <OnboardingFlow onComplete={handleOnboardingComplete} />
          )}

          {currentScreen === 'dashboard' && (
            <DashboardScreen
              settings={settings}
              logs={todayLogs}
              history={history}
              onAddDrink={handleAddDrink}
              onOpenSettings={() => setCurrentScreen('settings')}
              onOpenChallenges={() => setCurrentScreen('challenges')}
              onOpenPoolParty={() => setCurrentScreen('pool_party')}
              onOpenMascotLocker={() => setCurrentScreen('mascots')}
              onUpdateVisibleBeverages={(keys) => handleUpdateSettings({ visibleBeverages: keys })}
            />
          )}

          {currentScreen === 'history' && (
            <HistoryScreen
              settings={settings}
              history={history}
              todayLogs={todayLogs}
              onBack={() => setCurrentScreen('dashboard')}
              onOpenChallenges={() => setCurrentScreen('challenges')}
            />
          )}

          {currentScreen === 'challenges' && (
            <ChallengesScreen
              settings={settings}
              history={history}
              onBack={() => setCurrentScreen('dashboard')}
              onSelectChallenge={(chId) => {
                handleUpdateSettings({ activeChallengeId: chId });
                setCurrentScreen('dashboard');
              }}
            />
          )}

          {currentScreen === 'mascots' && (
            <MascotLockerScreen
              settings={settings}
              onSelectMascot={handleSelectMascot}
              onStartTrial={handleStartMascotTrial}
              onOpenPaywall={() => setCurrentScreen('paywall')}
              onOpenPoolParty={() => setCurrentScreen('pool_party')}
              onBack={() => setCurrentScreen('dashboard')}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onBack={() => setCurrentScreen('dashboard')}
              onOpenPoolParty={() => setCurrentScreen('pool_party')}
              onOpenPaywall={() => setCurrentScreen('paywall')}
              onOpenAuth={() => setShowAuthModal(true)}
              onResetData={handleResetData}
            />
          )}

          {currentScreen === 'pool_party' && (
            <InteractivePoolScreen
              isStandalone={true}
              characterId={settings.activeCharacter}
              onBack={() => {
                feedback.triggerHaptic('light');
                setCurrentScreen('dashboard');
              }}
              onGetStarted={() => {
                feedback.triggerHaptic('light');
                setCurrentScreen('dashboard');
              }}
            />
          )}

          {currentScreen === 'paywall' && (
            <PricingPaywallScreen
              settings={settings}
              onClose={() => setCurrentScreen('settings')}
              onUpgradeSuccess={() => {
                handleUpdateSettings({ isPremium: true });
                setCurrentScreen('dashboard');
              }}
              onUpdateCurrency={(curr: CurrencyCode) => {
                handleUpdateSettings({ currency: curr });
              }}
            />
          )}
        </View>

        {/* 5-Tab Bottom Navigation Bar displayed on all main app screens */}
        {isTabScreen && (
          <BottomTabBar
            activeTab={currentScreen as TabId}
            onSelectTab={(tab) => setCurrentScreen(tab)}
          />
        )}

        {/* Auth & Cloud Backup Modal */}
        <AuthModal
          visible={showAuthModal}
          userAccount={settings.userAccount}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
          onSignOut={handleSignOut}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#43B4F5',
  },
  screenWrapper: {
    flex: 1,
  },
});

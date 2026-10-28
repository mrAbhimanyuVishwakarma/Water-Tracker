import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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
import { UserSettings, MascotId } from './src/types';
import { feedback } from './src/utils/feedback';
import { useAccountData } from './src/hooks/useAccountData';
import { useReminders } from './src/hooks/useReminders';

type Screen = TabId | 'onboarding' | 'pool_party' | 'paywall';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const {
    settings, todayLogs, history, ready: isReady, syncStatus, updateSettings: handleUpdateSettings,
    addDrink: handleAddDrink, refreshPremium, syncNow, resetGuest, clearDeletedAccount,
  } = useAccountData();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const reminderStatus = useReminders(settings, isReady);

  useEffect(() => { feedback.configure(settings.soundEnabled, settings.hapticEnabled); }, [settings.soundEnabled, settings.hapticEnabled]);

  useEffect(() => {
    if (isReady) setCurrentScreen(settings.hasCompletedOnboarding ? 'dashboard' : 'onboarding');
  }, [isReady, settings.hasCompletedOnboarding]);

  useEffect(() => {
    if (!settings.mascotTrialStartedAt || settings.isPremium) return;
    const timer = setInterval(() => {
      if (Date.now() - (settings.mascotTrialStartedAt || 0) >= 60_000 && settings.activeCharacter !== 'brownie') {
        void handleUpdateSettings({ activeCharacter: 'brownie' });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.mascotTrialStartedAt, settings.isPremium, settings.activeCharacter, handleUpdateSettings]);

  const handleStartMascotTrial = () => {
    if (!settings.hasUsedMascotTrial) void handleUpdateSettings({ mascotTrialStartedAt: Date.now(), hasUsedMascotTrial: true });
  };
  const handleOnboardingComplete = async (onboardingData: Partial<UserSettings>) => {
    await handleUpdateSettings({ ...onboardingData, hasCompletedOnboarding: true });
  };
  const handleSelectMascot = (mascotId: MascotId) => {
    const trial = settings.mascotTrialStartedAt;
    if (mascotId !== 'brownie' && !settings.isPremium && !(trial && Date.now() - trial < 60_000) && settings.hasUsedMascotTrial) {
      setCurrentScreen('paywall');
      return;
    }
    void handleUpdateSettings({ activeCharacter: mascotId });
  };
  const handleResetData = async () => { await resetGuest(); };

  if (!isReady) {
    return <View style={styles.loadingContainer}><ActivityIndicator /><Text>{syncStatus.includes('Could not load') ? syncStatus : 'Loading your saved data…'}</Text></View>;
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
              reminderStatus={reminderStatus}
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
              key={settings.userAccount?.id || 'guest'}
              settings={settings}
              onClose={() => setCurrentScreen('settings')}
              onOpenAuth={() => setShowAuthModal(true)}
              onEntitlementsChanged={refreshPremium}
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
        {showAuthModal && <AuthModal
          visible={showAuthModal}
          userAccount={settings.userAccount}
          onClose={() => setShowAuthModal(false)}
          syncStatus={syncStatus}
          onSync={syncNow}
          onDeleted={clearDeletedAccount}
        />}

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

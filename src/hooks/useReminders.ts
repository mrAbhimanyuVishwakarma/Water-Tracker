import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { UserSettings } from '../types';
import { configureReminders } from '../services/reminders';

export function useReminders(settings: UserSettings, ready: boolean) {
  const [status, setStatus] = useState('Checking reminders…');
  const enabled = settings.smartRemindersEnabled;
  const completed = settings.hasCompletedOnboarding;
  const wakeTime = settings.healthProfile.wakeTime;
  const sleepTime = settings.healthProfile.sleepTime;
  const interval = settings.reminderIntervalMinutes;
  const sound = settings.soundEnabled;
  const userId = settings.userAccount?.id;
  useEffect(() => {
    let active = true;
    const apply = () => {
      const snapshot = { hasCompletedOnboarding: completed, smartRemindersEnabled: enabled,
        healthProfile: { wakeTime, sleepTime }, reminderIntervalMinutes: interval, soundEnabled: sound } as UserSettings;
      void configureReminders(ready ? snapshot : null).then(message => { if (active) setStatus(message); })
        .catch(() => { if (active) setStatus('Reminders could not be scheduled. Try again after restarting the app.'); });
    };
    apply();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') apply(); });
    return () => { active = false; subscription.remove(); };
  }, [ready, enabled, completed, wakeTime, sleepTime, interval, sound, userId]);
  return status;
}

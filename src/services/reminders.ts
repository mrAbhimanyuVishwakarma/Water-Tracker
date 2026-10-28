import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';
import { UserSettings } from '../types';
import { reminderTimes } from '../utils/reminderTimes';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});
let queue: Promise<unknown> = Promise.resolve();

export function configureReminders(settings: UserSettings | null): Promise<string> {
  const next = queue.then(async () => {
    if (Platform.OS === 'web') return 'Reminders are available in the mobile app.';
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const item of scheduled) if (item.identifier.startsWith('brownie-reminder-')) {
      await Notifications.cancelScheduledNotificationAsync(item.identifier);
    }
    if (!settings?.hasCompletedOnboarding || !settings.smartRemindersEnabled) return 'Reminders are off.';
    const channelId = settings.soundEnabled ? 'hydration-sound' : 'hydration-quiet';
    if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync(channelId, {
      name: settings.soundEnabled ? 'Hydration reminders' : 'Quiet hydration reminders',
      importance: AndroidImportance.DEFAULT, sound: settings.soundEnabled ? 'default' : null,
    });
    let permission = await Notifications.getPermissionsAsync();
    if (permission.status === 'undetermined') permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) return 'Reminders need notification permission. Enable it in device settings.';
    const times = reminderTimes(settings.healthProfile.wakeTime, settings.healthProfile.sleepTime, settings.reminderIntervalMinutes);
    for (const { hour, minute } of times) await Notifications.scheduleNotificationAsync({
      identifier: `brownie-reminder-${hour}-${minute}`,
      content: { title: 'Time for a water break', body: 'Brownie is ready for a sip. Log a drink when you can.', sound: settings.soundEnabled ? 'default' : false },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, channelId, hour, minute },
    });
    return times.length ? 'Daily reminders scheduled during your waking hours. Delivery times may vary.' : 'Choose different wake and sleep times to schedule reminders.';
  });
  queue = next.catch(() => {});
  return next;
}

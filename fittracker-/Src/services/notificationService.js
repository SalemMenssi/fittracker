import {
  savePushTokenToBackend,
  removePushTokenFromBackend,
  sendTestNotificationApi,
} from './NotificationApiService';

const noop = async () => null;
const noopVoid = async () => {};

export const configureNotificationHandler = noopVoid;
export const registerForPushNotificationsAsync = noop;
export const requestNotificationPermission = noop;
export const createAndroidNotificationChannel = noopVoid;
export const scheduleLocalNotification = noop;
export const scheduleDailyQuestReminder = noop;
export const scheduleStreakProtectionNotification = noop;
export const scheduleTaskNotification = noop;
export const cancelNotification = noopVoid;
export const cancelTaskNotification = noopVoid;
export const cancelAllNotifications = noopVoid;

export const sendTestNotification = async () => {
  try {
    return await sendTestNotificationApi();
  } catch (e) {
    return { sent: false, message: e.message || 'Push notifications are disabled on this build.' };
  }
};

export const notifyDailyQuestReady = noop;
export const notifyQuestProgress = noop;
export const notifyDailyQuestComplete = noop;
export const notifyBadgeUnlock = noop;
export const notifyIntelligenceWeakness = noop;
export const notifyLevelUp = noop;
export const notifyAvatarEvolution = noop;
export const notifyAiCoach = noop;
export const notifyChallengeReminder = noop;

export { savePushTokenToBackend, removePushTokenFromBackend };

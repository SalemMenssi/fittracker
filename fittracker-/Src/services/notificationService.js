import { Platform, Alert } from 'react-native';

export const requestNotificationPermission = async () => {
  console.log("Mock: requestNotificationPermission");
  return true;
};

export const createAndroidNotificationChannel = async () => {
  console.log("Mock: createAndroidNotificationChannel");
};

export const scheduleTaskNotification = async (task) => {
  console.log("Mock: scheduleTaskNotification", task);
  return `mock-id-${Date.now()}`;
};

export const cancelTaskNotification = async (notificationId) => {
  console.log("Mock: cancelTaskNotification", notificationId);
};

export const scheduleStreakProtectionNotification = async (tasks) => {
  console.log("Mock: scheduleStreakProtectionNotification", tasks?.length);
};

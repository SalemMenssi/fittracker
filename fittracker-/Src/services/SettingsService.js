import { getCurrentUser, updateUser } from "./AuthService";

// ---- Notification Settings ----

export const getNotificationSettings = async () => {
    const user = await getCurrentUser();
    return user?.notificationSettings || {};
};

export const saveNotificationSettings = async (settings) => {
    const updated = await updateUser({ notificationSettings: settings });
    return updated.notificationSettings;
};

// ---- Privacy Settings ----

export const getPrivacySettings = async () => {
    const user = await getCurrentUser();
    return user?.privacySettings || {};
};

export const savePrivacySettings = async (settings) => {
    const updated = await updateUser({ privacySettings: settings });
    return updated.privacySettings;
};

export default {
  getNotificationSettings,
  saveNotificationSettings,
  getPrivacySettings,
  savePrivacySettings,
};

// Notification Settings Model

export const createNotificationSettings = ({
  workoutReminders = true,
  weeklyReport = true,
  achievements = true,
  newCourses = false,
  socialActivity = false,
} = {}) => ({
  workoutReminders,
  weeklyReport,
  achievements,
  newCourses,
  socialActivity,
});

export default createNotificationSettings;

// Course Model
// Represents a fitness course with tasks

export const createCourse = ({
  id = Date.now().toString(),
  title = "",
  description = "",
  creator = "",
  workoutType = "Strength", // Strength, Yoga, HIIT, Cardio
  duration = "30 Minutes",
  image = "",
  rules = [],
  Tasks = [],
  Status = false, // false = not joined, true = joined
} = {}) => ({
  id,
  title,
  description,
  creator,
  workoutType,
  duration,
  image,
  rules,
  Tasks,
  Status,
});

export const createTask = ({
  id = Date.now(),
  title = "",
  description = "",
  status = "pending",        // "pending" | "done"
  // ── Extended optional fields ────────────────
  time = null,             // e.g. "07:30 AM" reminder time
  streak = 0,              // consecutive days completed
  notificationId = null,   // expo-notifications scheduled id
  lastCompletedDate = null, // ISO date string of last completion
} = {}) => ({
  id,
  title,
  description,
  status,
  time,
  streak,
  notificationId,
  lastCompletedDate,
});

export default createCourse;

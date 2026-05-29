const Activity = require('../Models/Activity');
const User = require('../Models/User');

// @desc    Log a new activity
// @route   POST /api/activity
const logActivity = async (req, res) => {
  try {
    const { type, duration, calories, steps } = req.body;

    const activity = await Activity.create({
      user: req.user._id,
      type,
      duration,
      calories,
      steps,
    });

    if (activity) {
      // Optionally update user stats/XP here
      const user = await User.findById(req.user._id);
      if (user) {
          user.xp += 10; // Simple XP gain
          await user.save();
      }
      res.status(201).json(activity);
    } else {
      res.status(400).json({ message: 'Invalid activity data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all activities for a user
// @route   GET /api/activity
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).sort({ date: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get activity summary
// @route   GET /api/activity/summary
const getActivitySummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activities = await Activity.find({
            user: req.user._id,
            date: { $gte: today }
        });

        const summary = activities.reduce((acc, curr) => {
            acc.calories += curr.calories;
            acc.steps += curr.steps;
            acc.duration += curr.duration;
            return acc;
        }, { calories: 0, steps: 0, duration: 0 });

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { logActivity, getActivities, getActivitySummary };

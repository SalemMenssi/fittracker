const StatHistory = require('../Models/StatHistory');

const recordStatChange = async ({
  userId,
  statType,
  statGroup,
  oldValue,
  newValue,
  source = 'daily_quest_task',
  questId,
  taskTitle,
}) => {
  const delta = Math.round((newValue - oldValue) * 100) / 100;
  if (Math.abs(delta) < 0.01) return null;
  return StatHistory.create({
    user: userId,
    statType,
    statGroup,
    oldValue,
    newValue,
    delta,
    source,
    questId,
    taskTitle,
  });
};

module.exports = { recordStatChange };

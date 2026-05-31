const StatHistory = require('../Models/StatHistory');
const DailyQuest = require('../Models/DailyQuest');

const getHistory = async (req, res) => {
  try {
    const { statGroup, statType, limit = 30 } = req.query;
    const filter = { user: req.user._id };
    if (statGroup) filter.statGroup = statGroup;
    if (statType) filter.statType = statType;

    const history = await StatHistory.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(parseInt(limit, 10) || 30, 100));

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const { statGroup = 'intelligence' } = req.query;
    const history = await StatHistory.find({ user: req.user._id, statGroup })
      .sort({ createdAt: -1 })
      .limit(200);

    const byType = {};
    history.forEach((h) => {
      if (!byType[h.statType]) {
        byType[h.statType] = { statType: h.statType, totalGain: 0, entries: [], current: h.newValue };
      }
      byType[h.statType].totalGain += h.delta;
      if (byType[h.statType].entries.length < 10) {
        byType[h.statType].entries.push(h);
      }
    });

    const relatedQuests = await DailyQuest.find({
      user: req.user._id,
      status: 'completed',
      targetIntelligences: req.query.statType ? req.query.statType : { $exists: true },
    })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      summary: Object.values(byType),
      relatedQuests,
      totalRecords: history.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getHistory, getSummary };

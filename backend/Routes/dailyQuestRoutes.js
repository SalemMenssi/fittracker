const express = require('express');
const router = express.Router();
const { protect } = require('../Middlewares/authMiddleware');
const {
  getTodayQuest,
  generateQuest,
  completeTask,
  completeQuest,
  regenerateQuest,
  regenerateTodayQuest,
  getQuestHistory,
  activateQuest,
} = require('../Controllers/dailyQuestController');

router.get('/today', protect, getTodayQuest);
router.post('/generate', protect, generateQuest);
router.post('/regenerate-today', protect, regenerateTodayQuest);
router.get('/history', protect, getQuestHistory);
router.post('/:id/activate', protect, activateQuest);
router.post('/:id/complete-task/:taskId', protect, completeTask);
router.post('/:id/complete', protect, completeQuest);
router.post('/:id/regenerate', protect, regenerateQuest);

module.exports = router;

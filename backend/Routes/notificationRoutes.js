const express = require('express');
const router = express.Router();
const { protect } = require('../Middlewares/authMiddleware');
const {
  registerToken,
  removeToken,
  getSettings,
  updateSettings,
  sendTest,
} = require('../Controllers/notificationController');

router.post('/register-token', protect, registerToken);
router.delete('/remove-token', protect, removeToken);
router.get('/settings', protect, getSettings);
router.put('/settings', protect, updateSettings);
router.post('/test', protect, sendTest);

module.exports = router;

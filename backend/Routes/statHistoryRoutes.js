const express = require('express');
const router = express.Router();
const { protect } = require('../Middlewares/authMiddleware');
const { getHistory, getSummary } = require('../Controllers/statHistoryController');

router.get('/history', protect, getHistory);
router.get('/history/summary', protect, getSummary);

module.exports = router;

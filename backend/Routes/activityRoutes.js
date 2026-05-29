const express = require('express');
const { logActivity, getActivities, getActivitySummary } = require('../Controllers/activityController');
const { protect } = require('../Middlewares/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, logActivity)
    .get(protect, getActivities);

router.get('/summary', protect, getActivitySummary);

module.exports = router;

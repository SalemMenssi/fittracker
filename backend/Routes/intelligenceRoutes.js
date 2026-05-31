const express = require('express');
const router = express.Router();
const { protect } = require('../Middlewares/authMiddleware');
const { getIntelligenceProfile, updateIntelligenceProfile } = require('../Controllers/intelligenceController');

router.get('/profile', protect, getIntelligenceProfile);
router.put('/profile', protect, updateIntelligenceProfile);

module.exports = router;

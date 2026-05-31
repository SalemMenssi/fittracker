const express = require('express');
const router = express.Router();
const { protect } = require('../Middlewares/authMiddleware');
const { completeTest } = require('../Controllers/testController');

router.post('/complete', protect, completeTest);

module.exports = router;

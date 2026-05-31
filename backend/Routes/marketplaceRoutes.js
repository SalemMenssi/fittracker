const express = require('express');
const router = express.Router();
const { protect } = require('../Middlewares/authMiddleware');
const { getItems, purchaseItem, activateItem } = require('../Controllers/marketplaceController');

router.get('/items', protect, getItems);
router.post('/purchase/:itemId', protect, purchaseItem);
router.post('/activate/:itemId', protect, activateItem);

module.exports = router;

const { registerUser, authUser, getUserProfile, updateUserProfile, getUsers } = require('../Controllers/authController');
const { protect } = require('../Middlewares/authMiddleware');
const express = require('express');
const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', authUser);
router.get('/users', getUsers);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

module.exports = router;

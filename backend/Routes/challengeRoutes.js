const express = require('express');
const { protect } = require('../Middlewares/authMiddleware');
const { getChallenges, createChallenge, updateChallenge, deleteChallenge, joinChallenge, completeChallenge } = require('../Controllers/challengeController');

const router = express.Router();

router.route('/').get(getChallenges).post(protect, createChallenge);
router.route('/:id').put(protect, updateChallenge).delete(protect, deleteChallenge);
router.post('/:id/join', protect, joinChallenge);
router.post('/:id/complete', protect, completeChallenge);

module.exports = router;

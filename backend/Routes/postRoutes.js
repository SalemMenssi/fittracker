const express = require('express');
const { getPosts, createPost, toggleLike, addComment } = require('../Controllers/postController');
const { protect } = require('../Middlewares/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getPosts)
    .post(protect, createPost);

router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);

module.exports = router;

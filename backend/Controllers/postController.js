const Post = require('../Models/Post');

// @desc    Get all posts
// @route   GET /api/posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ date: -1 }).populate('user', 'fullName avatar');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a post
// @route   POST /api/posts
const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const post = new Post({
      user: req.user._id,
      userName: req.user.fullName,
      userAvatar: req.user.avatar,
      text,
      image,
    });

    const createdPost = await post.save();
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle like on a post
// @route   PUT /api/posts/:id/like
const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (post) {
            const alreadyLiked = post.likes.includes(req.user._id);
            if (alreadyLiked) {
                post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
            } else {
                post.likes.push(req.user._id);
            }
            await post.save();
            res.json(post);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        
        if (post) {
            const comment = {
                user: req.user._id,
                userName: req.user.fullName,
                text,
            };
            post.comments.push(comment);
            await post.save();
            res.status(201).json(post);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPosts, createPost, toggleLike, addComment };

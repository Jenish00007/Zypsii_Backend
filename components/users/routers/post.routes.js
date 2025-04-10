const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth');
const upload = require('../../../middleware/upload.middleware');
const postController = require('../controllers/post.controller');

// Create a new post
router.post('/', auth, upload.single('media'), postController.createPost);

// Get all posts (feed)
router.get('/', auth, postController.getFeed);

// Get a specific post
router.get('/:id', auth, postController.getPost);

// Update a post
router.patch('/:id', auth, postController.updatePost);

// Delete a post
router.delete('/:id', auth, postController.deletePost);

// Like/Unlike a post
router.post('/:id/like', auth, postController.toggleLike);

// Add a comment
router.post('/:id/comments', auth, postController.addComment);

// Share a post
router.post('/:id/share', auth, postController.sharePost);

module.exports = router; 
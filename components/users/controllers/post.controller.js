const { post: Post } = require('../../../models'); // Import the registered model from index.js
const cloudinary = require('../../../config/cloudinary');
const fs = require('fs');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
      folder: 'posts'
    });

    // Delete the local file after successful upload
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });

    const post = new Post({
      user: req.user._id,
      mediaUrl: result.secure_url,
      mediaType: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
      caption: req.body.caption,
      description: req.body.description
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    // Delete uploaded file if post creation fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// Get all posts (feed)
exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'userName profilePicture')
      .populate('comments.user', 'userName profilePicture');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'userName profilePicture')
      .populate('comments.user', 'userName profilePicture');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }
    
    // If new media is uploaded
    if (req.file) {
      // Delete old media from Cloudinary
      const oldPublicId = post.mediaUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`posts/${oldPublicId}`, {
        resource_type: post.mediaType === 'image' ? 'image' : 'video'
      });

      // Upload new media to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
        folder: 'posts'
      });

      // Delete the local file after successful upload
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting local file:', err);
      });

      post.mediaUrl = result.secure_url;
      post.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    }
    
    // Update other fields if provided
    if (req.body.caption) {
      post.caption = req.body.caption;
    }
    if (req.body.description) {
      post.description = req.body.description;
    }
    
    await post.save();
    res.json(post);
  } catch (error) {
    // Delete uploaded file if update fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(400).json({ message: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete media from Cloudinary
    if (post.mediaUrl) {
      const publicId = post.mediaUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`posts/${publicId}`, {
        resource_type: post.mediaType === 'image' ? 'image' : 'video'
      });
    }

    await Post.deleteOne({ _id: req.params.id });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/Unlike a post
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const likeIndex = post.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add a comment
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    post.comments.push({
      user: req.user._id,
      text: req.body.text
    });
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Share a post
exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (!post.shares.includes(req.user._id)) {
      post.shares.push(req.user._id);
      await post.save();
    }
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
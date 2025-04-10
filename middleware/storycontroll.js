const { stories } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/stories';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for story upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|mp4|mov/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image and video files are allowed!'));
    }
});

// Middleware to check if user has reached story limit (3 stories)
const checkStoryLimit = async (req, res, next) => {
    try {
        const userStories = await stories.find({
            userId: req.user._id,
            expiresAt: { $gt: new Date() }
        });

        if (userStories.length >= 3) {
            return res.status(400).json({
                message: 'You have reached the maximum limit of 3 active stories'
            });
        }
        next();
    } catch (error) {
        console.error('Error in checkStoryLimit:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Middleware to validate story ownership
const validateStoryOwnership = async (req, res, next) => {
    try {
        const { storyId } = req.params;
        const story = await stories.findOne({
            _id: storyId,
            userId: req.user._id
        });

        if (!story) {
            return res.status(404).json({ message: 'Story not found or unauthorized' });
        }

        req.story = story;
        next();
    } catch (error) {
        console.error('Error in validateStoryOwnership:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Middleware to check if story is expired
const checkStoryExpiration = async (req, res, next) => {
    try {
        const story = await stories.findOne({
            _id: req.params.storyId,
            expiresAt: { $gt: new Date() }
        });

        if (!story) {
            return res.status(404).json({ message: 'Story has expired or not found' });
        }

        req.story = story;
        next();
    } catch (error) {
        console.error('Error in checkStoryExpiration:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Middleware to track story views
const trackStoryView = async (req, res, next) => {
    try {
        const story = req.story;
        if (!story.views.includes(req.user._id)) {
            story.views.push(req.user._id);
            await story.save();
        }
        next();
    } catch (error) {
        console.error('Error in trackStoryView:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    upload,
    checkStoryLimit,
    validateStoryOwnership,
    checkStoryExpiration,
    trackStoryView
};

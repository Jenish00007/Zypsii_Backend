const { stories } = require('../../../models');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../../../config/cloudinary');

class StoryController {
    async uploadStory(req, res) {
        try {
            if (!req.user || !req.user._id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            console.log('User ID:', req.user._id);

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                resource_type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
                folder: 'stories'
            });

            // Delete the local file after successful upload
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting local file:', err);
            });

            const story = await stories.create({
                userId: req.user._id,
                mediaUrl: result.secure_url,
                mediaType: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
            });

            return res.status(201).json({
                message: 'Story uploaded successfully',
                story
            });
        } catch (error) {
            // Delete uploaded file if story creation fails
            if (req.file && req.file.path) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            }
            console.error('Error in uploadStory:', error);
            return res.status(500).json({ 
                message: 'Internal server error',
                error: error.message 
            });
        }
    }

    async getStories(req, res) {
        try {
            if (!req.user || !req.user._id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            const storiesList = await stories.find({
                expiresAt: { $gt: new Date() }
            })
            .populate('userId', 'name profilePicture')
            .sort({ createdAt: -1 });

            const groupedStories = storiesList.reduce((acc, story) => {
                if (!acc[story.userId._id]) {
                    acc[story.userId._id] = {
                        user: story.userId,
                        stories: []
                    };
                }
                acc[story.userId._id].stories.push(story);
                return acc;
            }, {});

            return res.status(200).json({
                message: 'Stories retrieved successfully',
                stories: Object.values(groupedStories)
            });
        } catch (error) {
            console.error('Error in getStories:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async deleteStory(req, res) {
        try {
            if (!req.user || !req.user._id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            // Delete from Cloudinary
            if (req.story.mediaUrl) {
                const publicId = req.story.mediaUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`stories/${publicId}`, {
                    resource_type: req.story.mediaType === 'image' ? 'image' : 'video'
                });
            }
            
            await req.story.deleteOne();
            return res.status(200).json({ message: 'Story deleted successfully' });
        } catch (error) {
            console.error('Error in deleteStory:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async viewStory(req, res) {
        try {
            if (!req.user || !req.user._id) {
                return res.status(401).json({ message: 'User not authenticated' });
            }

            return res.status(200).json({
                message: 'Story viewed successfully',
                story: req.story
            });
        } catch (error) {
            console.error('Error in viewStory:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new StoryController();

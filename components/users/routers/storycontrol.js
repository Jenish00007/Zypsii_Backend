const express = require('express');
const router = express.Router();
const storyController = require('../controllers/story');
const { upload, checkStoryLimit, validateStoryOwnership, checkStoryExpiration, trackStoryView } = require('../../../middleware/storycontroll');
const { AuthenticateUserToken } = require('../../../middleware/users-auth');

// Upload story (with story limit check)
router.post('/upload', AuthenticateUserToken, checkStoryLimit, upload.single('media'), storyController.uploadStory);

// Get all active stories
router.get('/all', AuthenticateUserToken, storyController.getStories);

// View a specific story (with expiration check and view tracking)
router.get('/:storyId', AuthenticateUserToken, checkStoryExpiration, trackStoryView, storyController.viewStory);

// Delete story (with ownership validation)
router.delete('/:storyId', AuthenticateUserToken, validateStoryOwnership, storyController.deleteStory);

module.exports = router;

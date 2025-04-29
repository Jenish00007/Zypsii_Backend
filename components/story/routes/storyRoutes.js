const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../../../middleware/users-auth');

//import the routers
const storyManage = require('../controller/storyManage');
const storyListing = require('../controller/storyListing');


router.post('/create', verifyUserToken, storyManage.createStory);
router.get('/list', verifyUserToken, storyListing.listStories);

module.exports = router;
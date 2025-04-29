const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../../../middleware/users-auth');

//import the routers
const storyManage = require('../controller/storyManage');


router.post('/create', verifyUserToken, storyManage.createStory);

module.exports = router;
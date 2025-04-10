const express = require('express');
const router = express.Router();
const validateFollowParams = require('../validators/followValidation');


const { FollowListing, FollowsManage } = require('../controllers');

router.post('/followUser/:userId/:loggedInUserId', validateFollowParams, FollowsManage.createFollows);
router.post('/unfollowUser/:userId/:loggedInUserId', validateFollowParams, FollowsManage.unFollow);
router.get('/getFollowers/:userId', FollowListing.getFollowers);
router.get('/getFollowing/:userId', FollowListing.getFollowings);

module.exports = router;
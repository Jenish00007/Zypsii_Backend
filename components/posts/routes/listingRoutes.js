const express = require('express');
const router = express.Router();
const PostListing = require('../controller/postListing');
const { verifyUserToken } = require('../../../middleware/users-auth');

router.get('/filter', verifyUserToken, PostListing.ListPostByFilter);

module.exports = router;
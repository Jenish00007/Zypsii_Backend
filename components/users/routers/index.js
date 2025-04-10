const express = require('express');
const router = express.Router();
const postRoutes = require('../routers/post.routes');
// import all the routs from this folder files.
const userAuthRoutes = require('./userAuth');
const storyControl = require('./storycontrol');

router.use('/user', userAuthRoutes);
router.use('/story', storyControl);
router.use('/post', postRoutes);

module.exports = router;
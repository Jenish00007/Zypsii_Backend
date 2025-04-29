const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../../../middleware/users-auth');

//import the routers
const storyRoutes = require('./storyRoutes');


router.use('/story', verifyUserToken, storyRoutes);

module.exports = router;
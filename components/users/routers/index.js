const express = require('express');
const router = express.Router();

// import all the routs from this folder files.
const userAuthRoutes = require('./userAuth');
const userProfile = require('./profile');

router.use('/user', userAuthRoutes);
router.use('/user', userProfile);

module.exports = router;
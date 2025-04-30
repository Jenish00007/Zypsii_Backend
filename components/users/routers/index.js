const express = require('express');
const router = express.Router();

// import all the routs from this folder files.
const userAuthRoutes = require('./userAuth');
const userProfile = require('./profile');
const userLocations = require('./location');

router.use('/user', userAuthRoutes);
router.use('/user', userProfile);
router.use('/user', userLocations);

module.exports = router;
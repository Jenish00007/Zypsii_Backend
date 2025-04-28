const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../../../middleware/users-auth');

//import the routers
const postRoutes = require('./postRoutes');
const ListingRoutes = require('./listingRoutes');


router.use('/shorts', verifyUserToken, postRoutes);
router.use('/shorts', verifyUserToken, ListingRoutes);

module.exports = router;
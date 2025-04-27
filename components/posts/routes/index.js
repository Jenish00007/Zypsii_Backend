const express = require('express');
const router = express.Router();

//import the routers
const postRoutes = require('./postRoutes');
const postListingRoutes = require('./listingRoutes');


router.use('/post', postRoutes);
router.use('/post/listing',postListingRoutes);

module.exports = router;
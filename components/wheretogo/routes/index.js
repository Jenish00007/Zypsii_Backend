const express = require('express');
const router = express.Router();

const wereToGoPost = require('./postRoutes');
const whereToGoListing = require('./listingRoutes');

router.use('/place', wereToGoPost);
router.use('/place', whereToGoListing);
module.exports = router;
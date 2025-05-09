const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../../../middleware/users-auth');

// import all the controllers
const ListingSchedules = require('../controllers/listingSchedules');
const ListPlaces = require('../controllers/listNearestPlace');

router.get('/filter', verifyUserToken, ListingSchedules.listingMySchedules);
router.get('/getNearest', verifyUserToken, ListPlaces.nearest);
router.get('/suggestedItinerary', verifyUserToken, ListPlaces.generateSuggestedItinerary);
router.get('/scheduleDescription/:scheduleId', verifyUserToken, ListingSchedules.scheduleDescription);

module.exports = router;
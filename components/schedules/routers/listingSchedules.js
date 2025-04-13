const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../../../middleware/users-auth');

// import all the controllers
const ListingSchedules = require('../controllers/listingSchedules');
const ListPlaces = require('../controllers/listNearestPlace');

router.get('/mySchedule', verifyUserToken, ListingSchedules.listingMySchedules);
router.get('/getUsers', verifyUserToken, ListingSchedules.listingSchedulesByUser);
router.get('/getNearest', verifyUserToken, ListPlaces.nearest);

module.exports = router;
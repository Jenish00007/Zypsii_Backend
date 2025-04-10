const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../../../middleware/users-auth');

// import all the controllers
const ListingSchedules = require('../controllers/listingSchedules');

router.get('/mySchedule', verifyUserToken, ListingSchedules.listingMySchedules);
router.get('/getUsers', verifyUserToken, ListingSchedules.listingSchedulesByUser);

module.exports = router;
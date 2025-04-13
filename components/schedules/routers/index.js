const express = require('express');
const router = express.Router();

const createSchedule = require('./postSchedules');
const ListingSchedules = require('./listingSchedules');

router.use('/schedule', createSchedule);
router.use('/schedule/listing', ListingSchedules);
router.use('/schedule/places', ListingSchedules)
module.exports = router;
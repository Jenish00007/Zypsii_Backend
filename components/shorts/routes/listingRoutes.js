const express = require('express');
const router = express.Router();

//import the controllers
const shortsListing = require('../controllers/shortsListing');


router.get('/listing', shortsListing.listShorts);


module.exports = router;
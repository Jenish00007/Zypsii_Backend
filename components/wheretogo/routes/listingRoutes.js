const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../../../middleware/users-auth');

const whereToGoListing = require('../controllers/placesListiing');

router.get('/listFavorite', verifyUserToken, whereToGoListing.favoritePlaceListing);

module.exports = router;
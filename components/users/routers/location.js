const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../../../middleware/users-auth');
const { updateLiveLocationValidation } = require('../validators/usersValidations');
const { handleValidationErrors } = require('../../../helpers')

const userLocationController = require('../controllers/location');

router.post('/update-live-location', updateLiveLocationValidation, handleValidationErrors, verifyUserToken, userLocationController.updateLiveLocation);

module.exports = router;
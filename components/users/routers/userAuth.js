const express = require('express');
const router = express.Router();
const { userRegistration, login } = require('../controllers/');
const { handleValidationErrors } = require('../../../helpers/');
const { validateUserRegistration, validateUserLogin } = require('../validators/userAuthValidation');

router.post('/signUp', validateUserRegistration, handleValidationErrors, userRegistration);
router.post('/login', validateUserLogin, handleValidationErrors, login);


module.exports = router;
const express = require('express');
const router = express.Router();
const { userRegistration, login } = require('../controllers/');
const { handleValidationErrors } = require('../../../helpers/');
const { validateUserRegistration, validateUserLogin } = require('../validators/userAuthValidation');
const PasswordController = require('../controllers/forgotpassword');

router.post('/signUp', validateUserRegistration, handleValidationErrors, userRegistration);
router.post('/login', validateUserLogin, handleValidationErrors, login);
router.post('/forgotPassword/getOTP/:email', PasswordController.getOTP);
router.post('/forgotPassword/updatePassword', PasswordController.resetPassword);


module.exports = router;
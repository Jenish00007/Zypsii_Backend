const express = require('express');
const router = express.Router();
const { userRegistration, login , passwordController} = require('../controllers/');
const { handleValidationErrors } = require('../../../helpers/');
const { validateUserRegistration, validateUserLogin } = require('../validators/userAuthValidation');
// const { forgetPassword } = require('../controllers/forgetpassword');


router.post('/signUp', validateUserRegistration, handleValidationErrors, userRegistration);
router.post('/login', validateUserLogin, handleValidationErrors, login);
router.post('/forget-password', passwordController.forgetPassword);
router.post('/reset-password', passwordController.resetPassword);

module.exports = router;
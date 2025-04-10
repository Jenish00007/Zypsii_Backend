const express = require('express');
const router = express.Router();
const validateSchedule = require('../validators/scheduleCreate');
const upload = require('../../../middleware/multerUpload');
const { handleValidationErrors } = require('../../../helpers/');
const { verifyUserToken } = require('../../../middleware/users-auth');

//import all the schedule related routes here
const createSchedule = require('../controllers/createSchedule');

router.post('/create', verifyUserToken, upload.single('bannerImage'), validateSchedule, handleValidationErrors, createSchedule);

module.exports = router;
const express = require('express');
const router = express.Router();
const { validateSchedule, validateJoinFields } = require('../validators/scheduleCreate');
const upload = require('../../../middleware/multerUpload');
const { handleValidationErrors } = require('../../../helpers/');
const { verifyUserToken } = require('../../../middleware/users-auth');

//import all the schedule related routes here
const ScheduleController = require('../controllers/createSchedule');

router.post('/create', verifyUserToken, upload.single('bannerImage'), validateSchedule, handleValidationErrors, ScheduleController.createSchedule);
router.post('/join-un-join', verifyUserToken, validateJoinFields, handleValidationErrors, ScheduleController.joinSchedule);
module.exports = router;
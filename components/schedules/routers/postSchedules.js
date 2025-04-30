const express = require('express');
const router = express.Router();
const {
    validateSchedule, validateJoinFields,
    validateScheduleDescription, editScheduleValidator,
    editScheduleDescriptionValidator
} = require('../validators/scheduleCreate');

const upload = require('../../../middleware/multerUpload');
const { handleValidationErrors } = require('../../../helpers/');
const { verifyUserToken } = require('../../../middleware/users-auth');

//import all the schedule related routes here
const ScheduleController = require('../controllers/createSchedule');

router.post('/create', verifyUserToken, upload.single('bannerImage'), validateSchedule, handleValidationErrors, ScheduleController.createSchedule);
router.post('/join-un-join', verifyUserToken, validateJoinFields, handleValidationErrors, ScheduleController.joinSchedule);
router.post('/add/descriptions/:scheduleId', verifyUserToken, validateScheduleDescription, handleValidationErrors, ScheduleController.addScheduleDescription);
router.put('/edit/:scheduleId', verifyUserToken, editScheduleValidator, handleValidationErrors, ScheduleController.editSchedule);
router.put('/edit/descriptions/:scheduleId/:descriptionId', verifyUserToken, editScheduleDescriptionValidator, handleValidationErrors, ScheduleController.editScheduleDescription);
router.delete('/delete/:scheduleId', verifyUserToken, ScheduleController.deleteSchedule);
router.delete('/delete/descriptions/:scheduleId/:descriptionId', verifyUserToken, ScheduleController.deleteScheduleDescription);

module.exports = router;
const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../../../middleware/users-auth');
const upload = require('../../../middleware/multerUpload');

const { profile } = require('../controllers');

router.put('/editProfile', verifyUserToken, upload.single('profilePicture'), profile.editProfile);
router.get('/getProfile', verifyUserToken, profile.getProfileDetails);


module.exports = router;

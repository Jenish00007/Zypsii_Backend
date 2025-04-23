const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const PostManage = require('../controller/postManage');
const { verifyUserToken } = require('../../../middleware/users-auth');
const { postValidation } = require('../validator/postValidators');
const { handleValidationErrors } = require('../../../helpers/')

router.post('/create', upload.none(),verifyUserToken, postValidation, handleValidationErrors, PostManage.createPost);

module.exports = router;
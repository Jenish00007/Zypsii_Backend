const express = require('express');
const router = express.Router();
const upload = require('../../../middleware/multerUpload');
const MediaUpload = require('../controllers/fileUpload');
const { validateMediaUpload } = require('../validators/fileUpload');
const { handleValidationErrors } = require('../../../helpers');

router.post('/uploadFile', validateMediaUpload, handleValidationErrors, upload.array('mediaFile'), MediaUpload.upload);


module.exports = router;
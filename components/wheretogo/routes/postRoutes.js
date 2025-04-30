const express = require('express');
const router = express.Router();
const { verifyUserToken } = require('../../../middleware/users-auth');

const wereToGoController = require('../controllers/whereToGoManage');

router.post('/addFavorite', verifyUserToken, wereToGoController.saveFavoritePlace);

module.exports = router;
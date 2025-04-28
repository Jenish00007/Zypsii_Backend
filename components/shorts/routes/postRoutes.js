const express = require('express');
const router = express.Router();

//import the controllers
const shortsManage = require('../controllers/shortsManages');


router.post('/create', shortsManage.createShorts);


module.exports = router;
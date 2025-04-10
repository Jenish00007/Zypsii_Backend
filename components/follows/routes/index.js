const express = require('express');
const router = express.Router();

const follow = require('./follow');

router.use('/follow', follow);

module.exports = router;
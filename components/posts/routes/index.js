const express = require('express');
const router = express.Router();

//import the routers
const postRoutes = require('./postRoutes');


router.use('/post', postRoutes);

module.exports = router;
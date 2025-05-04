const express = require('express');
const { getUsersForSidebar, getMessages, sendMessage } = require('../controllers/message.controller');
const auth = require('../../../middleware/auth');

const router = express.Router();

router.get("/api/messages/", auth, getUsersForSidebar);
router.get("/api/messages/:id", auth, getMessages);
router.post("/api/messages/send/:id", auth, sendMessage);

module.exports = router;
const multer = require('multer');

// Configure multer to store files in memory (temporary storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;

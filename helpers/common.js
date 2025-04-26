const path = require('path');
const { validationResult } = require("express-validator");
const { users } = require('../models/');
const { SUPPORTED_IMAGE_FORMATS, SUPPORTED_VIDEO_FORMATS, MAX_IMAGE_SIZE_MB, MAX_VIDEO_SIZE_MB } = require('../utils/constants');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

//common query for find the user
const getUserDetails = async ({ id, email, userName } = {}) => {
  // Ensure at least one identifier is provided
  if (!id && !email && !userName) return null;

  // Construct query dynamically
  const query = {
    isDeleted: false,
    ...(id && { _id: id }),
    ...(email && !id && { email }), // Prioritize 'id' over other identifiers
    ...(userName && !id && !email && { userName }) // Prioritize 'email' over 'userName'
  };

  // Fetch user details from the database
  return await users.findOne(query);
};

//used for upload image and video file {post shorts ...}
/**
 * Validate uploaded media file (image/video) from multer
 * @param {Object} file - Multer file object
 * @returns {Promise<{type: 'image' | 'video', sizeMB: number}>}
 */
const validateMulterMediaFile = (file) => {
  return new Promise((resolve, reject) => {
    const imageTypes = SUPPORTED_IMAGE_FORMATS;
    const videoTypes = SUPPORTED_VIDEO_FORMATS;

    if (!file || !file.mimetype || !file.size) {
      return reject(new Error('Invalid file input'));
    }

    const fileSizeInMB = file.size / (1024 * 1024); // Convert bytes to MB

    if (imageTypes.includes(file.mimetype)) {
      if (fileSizeInMB > MAX_IMAGE_SIZE_MB) {
        return reject(new Error(`Image file size should be under ${MAX_IMAGE_SIZE_MB}MB`));
      }
      return resolve({ type: 'image', sizeMB: fileSizeInMB });
    }

    if (videoTypes.includes(file.mimetype)) {
      if (fileSizeInMB > MAX_VIDEO_SIZE_MB) {
        return reject(new Error(`Video file size should be under ${MAX_VIDEO_SIZE_MB}MB`));
      }
      return resolve({ type: 'video', sizeMB: fileSizeInMB });
    }

    return reject(new Error('Unsupported file type'));
  });
};

module.exports = {
  handleValidationErrors,
  getUserDetails,
  validateMulterMediaFile

};
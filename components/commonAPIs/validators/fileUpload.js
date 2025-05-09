const { query } = require('express-validator');

const validateMediaUpload = [
    query('mediaType')
        .exists().withMessage('mediaType is required')
        .isString().withMessage('mediaType must be a string')
        .isIn(['post', 'shorts', 'story']) // add more valid types if needed
        .withMessage('mediaType must be one of: post, story, shorts')
];

module.exports = { validateMediaUpload }
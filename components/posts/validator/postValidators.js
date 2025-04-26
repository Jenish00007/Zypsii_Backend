const { body } = require('express-validator');

const postValidation = [
    body('postTitle')
        .trim()
        .notEmpty().withMessage('Post title is required.')
        .isString().withMessage('Post title must be a string.'),

    body('postType')
        .notEmpty().withMessage('Post type is required.')
        .isIn(['Public', 'FollowersOnly']).withMessage('Invalid post type.'),

    body('mediaType')
        .notEmpty().withMessage('Media type is required.')
        .isIn(['image', 'video']).withMessage('Invalid media type.'),

    body('mediaUrl')
        .isArray({ min: 1 }).withMessage('Media URLs must be an array with at least one item.'),
    body('mediaUrl.*')
        .isString().withMessage('Each media URL must be a string.')
        .isURL().withMessage('Each media URL must be a valid URL.'),

    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array of strings.'),
    body('tags.*')
        .optional()
        .isString().withMessage('Each tag must be a string.')
];

module.exports = { postValidation };

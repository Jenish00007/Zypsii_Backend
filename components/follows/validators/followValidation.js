const { param, validationResult } = require('express-validator');

const validateFollowParams = [
  param('userId')
    .notEmpty()
    .withMessage('userId is required'),

  param('loggedInUserId')
    .notEmpty()
    .withMessage('loggedInUserId is required'),

  // Custom validator to ensure userId !== loggedInUserId
  param('userId').custom((value, { req }) => {
    if (value === req.params.loggedInUserId) {
      throw new Error('userId and loggedInUserId cannot be the same');
    }
    return true;
  }),

  // Final middleware to catch and return validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

module.exports = validateFollowParams;


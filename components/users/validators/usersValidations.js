const { body } = require("express-validator");


exports.updateLiveLocationValidation = [
    body('latitude')
        .exists().withMessage('Latitude is required')
        .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a valid number between -90 and 90'),

    body('longitude')
        .exists().withMessage('Longitude is required')
        .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a valid number between -180 and 180')
];

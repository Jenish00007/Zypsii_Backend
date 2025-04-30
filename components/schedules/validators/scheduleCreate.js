const { body, param } = require("express-validator");
const moment = require('moment');

const validateSchedule = [

    body("tripName")
        .trim()
        .notEmpty().withMessage("Trip name is required")
        .isLength({ min: 3 }).withMessage("Trip name must be at least 3 characters long"),

    body("travelMode")
        .trim()
        .isIn(["Car", "Bike", "Cycle"]).withMessage("Travel mode must be 'Car', 'Bike', or 'Cycle'"),

    body("visible")
        .trim()
        .isIn(["Public", "Private", "FriendOnly"]).withMessage("Visible must be 'Public', 'Private', or 'FriendOnly'"),

    //validate location
    body("location.from.latitude")
        .notEmpty().withMessage("From location latitude is required"),
    body("location.from.longitude")
        .notEmpty().withMessage("From location longitude is required"),

    body("location.to.latitude")
        .notEmpty().withMessage("To location latitude is required"),
    body("location.to.longitude")
        .notEmpty().withMessage("To location longitude is required"),

    //validate dates
    body("dates.from")
        .notEmpty().withMessage("Date 'from' is required"),
    body("dates.end")
        .notEmpty().withMessage("Date 'end' is required"),

    body("numberOfDays")
        .isInt({ min: 1 }).withMessage("Number of days must be a positive integer"),

    body("planDescription")
        .optional()
        .custom((value) => {
            if (!Array.isArray(value)) {
                throw new Error("planDescription must be an array if provided");
            }

            value.forEach((item, index) => {
                // Validate Description
                if ("Description" in item && typeof item.Description !== "string") {
                    throw new Error(`planDescription[${index}].Description must be a string`);
                }

                // Validate date
                if ("date" in item && isNaN(Date.parse(item.date))) {
                    throw new Error(`planDescription[${index}].date must be a valid date`);
                }

                /** 
                 * we can comment this while testing using postman 
                **/
                // Validate location
                if ("location" in item) {
                    const loc = item.location;

                    if ("from" in loc) {
                        const from = loc.from;
                        if (
                            typeof from.latitude !== "number" ||
                            typeof from.longitude !== "number"
                        ) {
                            throw new Error(`planDescription[${index}].location.from must have numeric latitude and longitude`);
                        }
                    }

                    if ("to" in loc) {
                        const to = loc.to;
                        if (
                            typeof to.latitude !== "number" ||
                            typeof to.longitude !== "number"
                        ) {
                            throw new Error(`planDescription[${index}].location.to must have numeric latitude and longitude`);
                        }
                    }
                }
            });

            return true;
        }),

    // Custom validation for image upload
    body("bannerImage").custom((value, { req }) => {
        if (!req.file) {
            throw new Error("Banner image is required");
        }
        return true;
    })
];

const validateJoinFields = [
    body('scheduleId')
        .notEmpty().withMessage('scheduleId is required')
        .isMongoId().withMessage('scheduleId must be a valid MongoDB ObjectId'),

    body('scheduleCreatedBy')
        .notEmpty().withMessage('scheduleCreatedBy is required')
        .isMongoId().withMessage('scheduleCreatedBy must be a valid MongoDB ObjectId')
];

const validateScheduleDescription = [
    body('Description')
        .trim()
        .notEmpty().withMessage('Description is required'),

    body('date')
        .notEmpty().withMessage('Date is required'),
    //.isISO8601().withMessage('Date must be in ISO8601 format (e.g., 2025-05-01T10:00:00Z)'),

    body('location.from.latitude')
        .notEmpty().withMessage('From latitude is required'),
    //.isFloat({ min: -90, max: 90 }).withMessage('From latitude must be between -90 and 90'),

    body('location.from.longitude')
        .notEmpty().withMessage('From longitude is required')
        .isFloat({ min: -180, max: 180 }).withMessage('From longitude must be between -180 and 180'),

    body('location.to.latitude')
        .notEmpty().withMessage('To latitude is required')
        .isFloat({ min: -90, max: 90 }).withMessage('To latitude must be between -90 and 90'),

    body('location.to.longitude')
        .notEmpty().withMessage('To longitude is required')
        .isFloat({ min: -180, max: 180 }).withMessage('To longitude must be between -180 and 180')
];

const editScheduleValidator = [
    body('tripName')
        .optional()
        .isString().withMessage('Trip name must be a string'),

    body('travelMode')
        .optional()
        .isIn(['Car', 'Bike', 'Cycle']).withMessage('Invalid travel mode'),

    body('visible')
        .optional()
        .isIn(['Public', 'Private', 'FriendOnly']).withMessage('Invalid visibility option'),

    body('fromLatitude')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('Invalid fromLatitude'),

    body('fromLongitude')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('Invalid fromLongitude'),

    body('toLatitude')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('Invalid toLatitude'),

    body('toLongitude')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('Invalid toLongitude'),

    body('fromDate')
        .optional()
        .isISO8601().withMessage('Invalid from date'),

    body('toDate')
        .optional()
        .isISO8601().withMessage('Invalid to date'),

    body('numberOfDays')
        .optional()
        .isInt({ min: 1 }).withMessage('Number of days must be a positive integer'),

    body('bannerImage')
        .optional()
        .isURL().withMessage('Invalid banner image URL')
];

const editScheduleDescriptionValidator = [
    param('scheduleId')
        .isMongoId().withMessage('Invalid scheduleId'),

    param('descriptionId')
        .isMongoId().withMessage('Invalid descriptionId'),

    body('Description')
        .optional()
        .isString().withMessage('Description must be a string'),

    body('fromLatitude')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('fromLatitude must be a valid latitude'),

    body('fromLongitude')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('fromLongitude must be a valid longitude'),

    body('toLatitude')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('toLatitude must be a valid latitude'),

    body('toLongitude')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('toLongitude must be a valid longitude')
];

module.exports = {
    validateSchedule, validateJoinFields, validateScheduleDescription,
    editScheduleValidator, editScheduleDescriptionValidator
};

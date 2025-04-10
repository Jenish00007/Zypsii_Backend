const { body } = require("express-validator");

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

    body("location")
        .notEmpty().withMessage("Location is required")
        .custom(value => {
            try {
                const parsedLocation = JSON.parse(value);
                if (!parsedLocation.from || !parsedLocation.to) {
                    throw new Error();
                }
                return true;
            } catch (err) {
                throw new Error("Location must be a valid JSON object with 'from' and 'to'");
            }
        }),

    body("dates")
        .notEmpty().withMessage("Dates are required")
        .custom(value => {
            try {
                const parsedDates = JSON.parse(value);
                if (!parsedDates.from || !parsedDates.end) {
                    throw new Error();
                }
                return true;
            } catch (err) {
                throw new Error("Dates must be a valid JSON object with 'from' and 'end'");
            }
        }),

    body("numberOfDays")
        .isInt({ min: 1 }).withMessage("Number of days must be a positive integer"),

    body("planDescription")
        .notEmpty().withMessage("Plan description is required")
        .custom(value => {
            try {
                const parsedDescription = JSON.parse(value);
                if (!Array.isArray(parsedDescription) || parsedDescription.length === 0) {
                    throw new Error();
                }
                return true;
            } catch (err) {
                throw new Error("Plan description must be a valid JSON array with at least one item");
            }
        }),

    // Custom validation for image upload
    body("bannerImage").custom((value, { req }) => {
        if (!req.file) {
            throw new Error("Banner image is required");
        }
        return true;
    })
];

module.exports = validateSchedule;

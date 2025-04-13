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

    //validate location
    body("location.from")
        .notEmpty().withMessage("Location 'from' is required"),
    body("location.to")
        .notEmpty().withMessage("Location 'to' is required"),

    //validate dates
    body("dates.from")
        .notEmpty().withMessage("Date 'from' is required"),
    body("dates.end")
        .notEmpty().withMessage("Date 'end' is required"),

    body("numberOfDays")
        .isInt({ min: 1 }).withMessage("Number of days must be a positive integer"),

    body("planDescription")
        .custom(value => {
            if (!Array.isArray(value) || value.length === 0) {
                throw new Error("Plan description must be a non-empty array");
            }

            value.forEach((item, index) => {
                if (!item.Description || typeof item.Description !== "string") {
                    throw new Error(`planDescription[${index}].Description is required and must be a string`);
                }
                if (!item.date || typeof item.date !== "string") {
                    throw new Error(`planDescription[${index}].date is required and must be a string`);
                }

                const location = item.location;
                if (
                    !location ||
                    typeof location.latitude === "undefined" ||
                    typeof location.longitude === "undefined"
                ) {
                    throw new Error(`planDescription[${index}].location must include latitude and longitude`);
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

module.exports = validateSchedule;

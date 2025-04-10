const { body } = require("express-validator");

exports.validateUserRegistration = [
    body("fullName").notEmpty().withMessage("Full Name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    body("latitude")
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be a number between -90 and 90"),
    body("longitude")
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be a number between -180 and 180"),
];

exports.validateUserLogin = [
    // Validate userNameOrEmail (must be either a valid email or a non-empty string)
    body("userNameOrEmail")
        .trim()
        .notEmpty().withMessage("Username or Email is required")
        .bail()
        .isString().withMessage("Username or Email must be a string")
        .bail()
        .custom(value => {
            // Check if the input is either a valid email or a valid username (no spaces, only alphanumeric)
            const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
            const isUsername = /^[a-zA-Z0-9_]+$/.test(value);
            if (!isEmail && !isUsername) {
                throw new Error("Invalid email or username format");
            }
            return true;
        }),

    // Validate password (must be at least 6 characters)
    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .bail()
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
];
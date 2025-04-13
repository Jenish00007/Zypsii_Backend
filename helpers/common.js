const { validationResult } = require("express-validator");
const { users } = require('../models/');

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


module.exports = {
  handleValidationErrors,
  getUserDetails
};
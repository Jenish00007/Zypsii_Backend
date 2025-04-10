const mongoose = require('mongoose');

// Define the Comment Schema
const commentBoxSchema = new mongoose.Schema({
  text: {
    type: String,        // The type of data is a string
    required: true,      // This field is mandatory
    minlength: 1,        // Minimum length of the comment text is 1
  },
  createdAt: {
    type: Date,          // Store the timestamp of when the comment was created
    default: Date.now,   // Default value is the current time
  },
});

// Create the Comment model using the schema
const Commentbox = mongoose.model('Commentbox', commentBoxSchema);

// Export the Comment model to use in other files
module.exports = Commentbox;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        website: { type: String },
        bio: { type: String },
        location: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
        },
        isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true } // Enables createdAt & updatedAt
);

module.exports = userSchema;

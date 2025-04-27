const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
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
        placeDetails: {
            name: { type: String, required: true },
            address: { type: String, required: true }
        },
        otp: {
            value: { type: String },
            createdAt: { type: Date, default: null }
        },
        verifyOtp: {
            type: Boolean,
            default: false,
            createdAt: { type: Date, default: null }
        },
        isDeleted: { type: Boolean, default: false }
    },
    { timestamps: true } // Enables createdAt & updatedAt
);

module.exports = mongoose.model("users", userSchema);

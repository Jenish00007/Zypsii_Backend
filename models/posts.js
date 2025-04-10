const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema(
    {
        postType: {
            type: String,
            required: true,
            enum: ["Public", "FollowersOnly"]
        },
        postContent: {
            type: [String], // Define an explicit type for the array
            default: [] // Optional: Ensures an empty array is stored by default
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("posts", postSchema);

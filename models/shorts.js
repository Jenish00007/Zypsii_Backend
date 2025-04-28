const mongoose = require('mongoose');
const { Schema } = mongoose;

const shortsSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    videoUrl: {
        type: String,
        required: true,
    },
    thumbnailUrl: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", // assuming you have a users collection
        required: true
    },
    tags: [{ type: String, ref: 'users' }],
    viewsCount: {
        type: Number,
        default: 0
    },
    likesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // automatically adds createdAt and updatedAt
});

module.exports = mongoose.model("shorts", shortsSchema);

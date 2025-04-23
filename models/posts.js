const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema(
    {
        postTitle: {
            type: String,
            required: true
        },
        postType: {
            type: String,
            required: true,
            enum: ["Public", "FollowersOnly"]
        },
        mediaType: {
            type: String,
            required: true,
            enum: ["image", "video"]
        },
        mediaUrl: [{
            type: String,
            required: true,
        }],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        tags: [{ type: String, ref: 'users' }],
        likesCount: { type: Number, default: 0 },
        commentsCount: { type: Number, default: 0 },
        shareCount: { type: Number, default: 0 },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

postSchema.index({ createdBy: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("posts", postSchema);
const mongoose = require('mongoose');
const { Schema } = mongoose;

const storySchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
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
        ref: "users",
        required: true
    },
    tags: [{
        type: String,
        ref: 'users'
    }],
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
    sharesCount: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    expireAt: {   // 👈 TTL field
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
}, {
    timestamps: true
});

// ➡️ TTL Index: MongoDB will auto delete story after 24h
storySchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("story", storySchema);

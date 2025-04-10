const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    views: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Index for querying active stories
storySchema.index({ expiresAt: 1 });

module.exports = storySchema; 
const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const postLikes = new Schema({
    postId: { type: Schema.Types.ObjectId, required: true, ref: 'posts' },
    postCreatedBy: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
    likedBy: { type: Schema.Types.ObjectId, required: true, ref: 'users' }
}, { timestamps: true });

module.exports = mongoose.model("postLikes", postLikes);
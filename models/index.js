const mongoose = require('mongoose');
const userSchema = require('./users');
const storySchema = require('./story');
const postSchema = require('./post');
// Register models
const users = mongoose.model('users', userSchema);
const stories = mongoose.model('stories', storySchema);
const post = mongoose.model('post', postSchema);
module.exports = {
    users,
    stories,
    post
};
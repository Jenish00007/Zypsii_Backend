const mongoose = require('mongoose');
const { Schema } = mongoose;

const followSchema = new Schema({
    followedBy: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    following: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
},
    { timestamps: true }
);

module.exports = mongoose.model('follows', followSchema);  //export the model
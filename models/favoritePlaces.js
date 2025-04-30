const mongoose = require('mongoose');
const { Schema } = mongoose;

const favoritePlaceSchema = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    name: { type: String, required: true },
    image: { type: String },
    location: {
        latitude: { type: String, required: true },
        longitude: { type: String, required: true }
    },
    address: { type: String },
    rating: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('favoritePlaces', favoritePlaceSchema);
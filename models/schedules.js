const mongoose = require('mongoose');
const { Schema } = mongoose;

const schedulesSchema = new Schema({
    createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    bannerImage: { type: String, required: true },
    tripName: { type: String, required: true },
    travelMode: {
        type: String,
        enum: ['Car', 'Bike', 'Cycle'],
        required: true
    },
    visible: { type: String, enum: ["Public", "Private", "FriendOnly"], default: "Public" },
    location: {
        from: { type: Number, required: true },
        to: { type: Number, required: true }
    },
    Dates: {
        from: { type: Date, required: true },
        end: { type: Date, required: true }
    },
    numberOfDays: { type: Number, required: true },
    planDescription: [
        {
            Description: { type: String, required: true },
            date: { type: Date },
            location: {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true }
            }
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("schedules", schedulesSchema);
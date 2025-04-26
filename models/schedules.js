const mongoose = require('mongoose');
const { Schema } = mongoose;

const planDescriptionSchema = new Schema({
    Description: { type: String },
    date: { type: Date },
    location: {
        from: {
            latitude: { type: Number },
            longitude: { type: Number }
        },
        to: {
            latitude: { type: Number },
            longitude: { type: Number }
        }
    }
}, { _id: true }); // _id is true by default


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
        from: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true }
        },
        to: {
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true }
        },
    },
    Dates: {
        from: { type: Date, required: true },
        end: { type: Date, required: true }
    },
    numberOfDays: { type: Number, required: true },
    planDescription: [planDescriptionSchema],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("schedules", schedulesSchema);
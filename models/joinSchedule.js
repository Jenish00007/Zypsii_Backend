const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const joinScheduleSchema = new Schema(
    {
        scheduleId: { type: Schema.Types.ObjectId, ref: 'schedules', required: true },
        scheduleCreatedBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
        joinUserId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);


module.exports = mongoose.model('joinSchedules', joinScheduleSchema);
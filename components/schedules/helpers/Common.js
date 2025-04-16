const { schedules } = require('../../../models/');

const getSchedule = async (scheduleId) => {
    try {
        const schedule = await schedules.findOne({
            _id: scheduleId,
            isDeleted: false
        });

        if (!schedule) {
            throw new Error(false);
        };

        return schedule;
    } catch (error) {
        throw error;
    };
};

module.exports = { getSchedule };
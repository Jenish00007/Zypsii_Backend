const Moment = require('moment');
const { schedules, joinSchedule } = require('../../../models');
const upload = require('../../../middleware/multerUpload');
const { uploadCloudInAry, getUserDetails } = require('../../../helpers/');
const { getSchedule } = require('../helpers/Common');


class ScheduleController {

    static async createSchedule(req, res) {
        try {
            const { tripName, travelMode, visible, location, dates, numberOfDays, planDescription } = req.body;
            const createdBy = req.user.id;

            // Upload banner image to Cloudinary
            let bannerImageUrl = "";
            if (req.file) {
                const uploadedUrls = await uploadCloudInAry([req.file]);
                bannerImageUrl = uploadedUrls[0];

            } else {
                return res.status(400).json({
                    status: false,
                    message: "Banner image is required"
                });
            };

            // Create new schedule
            const newSchedule = new schedules({
                createdBy,
                bannerImage: bannerImageUrl,
                tripName,
                travelMode,
                visible,
                location,
                Dates: dates,
                numberOfDays,
                planDescription
            });

            // Save to database
            const savedSchedule = await newSchedule.save();

            return res.status(201).json({
                status: true,
                message: "Schedule created successfully",
                schedule: savedSchedule
            });

        } catch (error) {
            console.error("Error in creating schedule:", error);
            return res.status(500).json({
                status: false,
                message: "Internal Server Error"
            });
        };
    };

    static async joinSchedule(req, res) {
        try {
            const { scheduleId, scheduleCreatedBy } = req.body;

            //for invalid or deleted schedule
            const isSchedule = await getSchedule(scheduleId);

            if (!isSchedule) {
                return res.status(404).json({
                    status: false,
                    message: "Schedule not found"
                });
            };

            //for invalid or deleted user
            const isUser = await getUserDetails({ id: scheduleCreatedBy });
            if (!isUser) {
                return res.status(404).json({
                    status: false,
                    message: "User not found"
                });
            };

            const commonQuery = {
                scheduleId: scheduleId,
                scheduleCreatedBy: scheduleCreatedBy,
                joinUserId: req.user.id,
                isDeleted: false
            }
            //check if user is already joined
            const isAlreadyJoined = await joinSchedule.findOne(commonQuery);

            if (!isAlreadyJoined) {
                const newJoin = new joinSchedule(commonQuery);
                await newJoin.save();
                return res.status(201).json({
                    status: true,
                    message: "Schedule joined successfully",
                    schedule: newJoin
                });
            };

            //remove the schedule join  
            await joinSchedule.findOneAndDelete(commonQuery);
            return res.status(200).json({
                status: true,
                message: "Schedule un-join successfully",
                schedule: deleteJoin
            });

        } catch (error) {
            console.error("Error in creating schedule:", error);
            return res.status(500).json({
                status: false,
                message: "Internal Server Error"
            });
        };
    };

    static async addScheduleDescription(req, res) {
        try {
            const { scheduleId } = req.params;
            const { Description, date, location } = req.body;
            const parsedMoment = Moment(date, "D-M-YYYY", true);
            const dateData = parsedMoment.utc().startOf('day').toDate();

            //validate the schedule and description 
            const fetchSchedule = await getSchedule(scheduleId);

            if (fetchSchedule?.createdBy.toString() !== req.user.id) {
                return res.status(403).json({
                    status: false,
                    message: 'You are not authorized to modify this schedule.'
                })
            };


            // insert the description in the schedule
            const getScheduleAndUpdate = await schedules.findByIdAndUpdate(scheduleId, {
                $push: {
                    planDescription: {
                        Description,
                        date: dateData,
                        location
                    }
                }
            }, { new: true });

            if (!getScheduleAndUpdate) {
                return res.status(400).json({
                    status: false,
                    message: "Description not inserted successfully."
                })
            };

            return res.status(200).json({
                status: true,
                message: 'Schedule description added successfully.',
                data: getScheduleAndUpdate
            });

        } catch (error) {
            console.log('Error in the process of adding schedule description', error);
            return res.status(500).json({
                status: false,
                message: "Internal Server Error",
                error: error.message
            });
        };
    };
};


module.exports = ScheduleController;

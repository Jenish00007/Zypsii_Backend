const Moment = require('moment');
const { mongoose } = require('mongoose');
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

    static async editSchedule(req, res) {
        try {
            const scheduleId = req.params.scheduleId;
            const userId = req.user.id;
            const {
                tripName,
                travelMode,
                visible,
                fromLatitude,
                fromLongitude,
                toLatitude,
                toLongitude,
                fromDate,
                toDate,
                numberOfDays,
                bannerImage
            } = req.body;

            // Build update object only with provided fields
            const updateData = {};

            if (tripName !== undefined) updateData.tripName = tripName;
            if (travelMode !== undefined) updateData.travelMode = travelMode;
            if (visible !== undefined) updateData.visible = visible;
            if (fromLatitude && fromLongitude !== undefined) {
                updateData.location.from.latitude = fromLatitude;
                updateData.location.from.longitude = fromLongitude;
            };
            if (toLatitude && toLongitude !== undefined) {
                updateData.location.to.latitude = toLatitude;
                updateData.location.to.longitude = toLatitude;
            };
            if (fromDate !== undefined) {
                updateData.Dates.from = fromDate;
            };
            if (toDate !== undefined) {
                updateData.Dates.to = toDate;
            };
            if (numberOfDays !== undefined) updateData.numberOfDays = numberOfDays;
            if (bannerImage !== undefined) updateData.bannerImage = bannerImage;

            // Ensure there's at least one field to update
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    status: false,
                    message: "No data provided to update"
                });
            }

            const updatedSchedule = await schedules.findOneAndUpdate(
                { _id: scheduleId, createdBy: userId, isDeleted: false },
                updateData,
                { new: true }
            );

            if (!updatedSchedule) {
                return res.status(404).json({
                    status: false,
                    message: "Schedule not found or not authorized"
                });
            }

            return res.status(200).json({
                status: true,
                message: "Schedule updated successfully",
                schedule: updatedSchedule
            });

        } catch (error) {
            console.error("Error in editing schedule:", error);
            return res.status(500).json({
                status: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    };

    static async editScheduleDescription(req, res) {
        try {
            const { scheduleId, descriptionId } = req.params;
            const { Description, date, fromLatitude, fromLongitude, toLatitude, toLongitude } = req.body;

            let dateData;
            if (date) {
                const parsedMoment = Moment(date, "D-M-YYYY", true);
                if (!parsedMoment.isValid()) {
                    return res.status(400).json({
                        status: false,
                        message: "Invalid date format. Expected format: D-M-YYYY"
                    });
                }
                dateData = parsedMoment.utc().startOf('day').toDate();
            };


            // Validate schedule existence and authorization
            const fetchSchedule = await getSchedule(scheduleId);

            if (!fetchSchedule || fetchSchedule?.isDeleted) {
                return res.status(404).json({
                    status: false,
                    message: 'Schedule not found.'
                });
            }

            if (fetchSchedule?.createdBy.toString() !== req.user.id) {
                return res.status(403).json({
                    status: false,
                    message: 'You are not authorized to modify this schedule.'
                });
            }

            // Build the update object dynamically
            const updateFields = {};

            if (Description !== undefined) {
                updateFields["planDescription.$.Description"] = Description;
            }
            if (date !== undefined && parsedMoment.isValid()) {
                updateFields["planDescription.$.date"] = dateData;
            }
            if (fromLatitude !== undefined) {
                updateFields["planDescription.$.location.from.latitude"] = fromLatitude;
            }
            if (fromLongitude !== undefined) {
                updateFields["planDescription.$.location.from.longitude"] = fromLongitude;
            }
            if (toLatitude !== undefined) {
                updateFields["planDescription.$.location.to.latitude"] = toLatitude;
            }
            if (toLongitude !== undefined) {
                updateFields["planDescription.$.location.to.longitude"] = toLongitude;
            }

            if (Object.keys(updateFields).length === 0) {
                return res.status(400).json({
                    status: false,
                    message: "No fields provided for update"
                });
            }

            const updatedSchedule = await schedules.findOneAndUpdate(
                {
                    _id: scheduleId,
                    "planDescription._id": descriptionId
                },
                {
                    $set: updateFields
                },
                { new: true }
            );


            if (!updatedSchedule) {
                return res.status(404).json({
                    status: false,
                    message: "Description not found or update failed."
                });
            }

            return res.status(200).json({
                status: true,
                message: 'Schedule description updated successfully.',
                data: updatedSchedule
            });

        } catch (error) {
            console.error('Error editing schedule description:', error);
            return res.status(500).json({
                status: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    };

    static async deleteSchedule(req, res) {
        try {
            const { scheduleId } = req.params;

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
                return res.status(400).json({
                    status: false,
                    message: "Invalid schedule ID"
                });
            }

            // Fetch the schedule
            const schedule = await schedules.findById(scheduleId);

            if (!schedule || schedule.isDeleted) {
                return res.status(404).json({
                    status: false,
                    message: "Schedule not found"
                });
            }

            // Authorization: Only the creator can delete
            if (schedule.createdBy.toString() !== req.user.id) {
                return res.status(403).json({
                    status: false,
                    message: "You are not authorized to delete this schedule"
                });
            }

            // Perform soft delete
            schedule.isDeleted = true;
            await schedule.save();

            return res.status(200).json({
                status: true,
                message: "Schedule deleted successfully"
            });

        } catch (error) {
            console.error("Error deleting schedule:", error);
            return res.status(500).json({
                status: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    };

    static async deleteScheduleDescription(req, res) {
        try {
            const { scheduleId, descriptionId } = req.params;

            // Fetch the schedule and check if it exists and is not deleted
            const fetchSchedule = await schedules.findOne({ _id: scheduleId });

            if (!fetchSchedule || fetchSchedule.isDeleted) {
                return res.status(404).json({
                    status: false,
                    message: 'Schedule not found or has been deleted.'
                });
            }

            // Ensure user is authorized to delete
            if (fetchSchedule.createdBy.toString() !== req.user.id) {
                return res.status(403).json({
                    status: false,
                    message: 'You are not authorized to modify this schedule.'
                });
            }

            // Check if the description exists
            const descriptionExists = fetchSchedule.planDescription.some(
                (desc) => desc._id.toString() === descriptionId
            );

            if (!descriptionExists) {
                return res.status(404).json({
                    status: false,
                    message: 'Description not found in the schedule.'
                });
            }

            // Pull (remove) the specific description by ID
            await schedules.updateOne(
                { _id: scheduleId },
                {
                    $pull: {
                        planDescription: { _id: descriptionId }
                    }
                }
            );

            return res.status(200).json({
                status: true,
                message: 'Description deleted successfully.'
            });

        } catch (error) {
            console.error('Error deleting schedule description:', error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
                error: error.message
            });
        }
    };

};


module.exports = ScheduleController;

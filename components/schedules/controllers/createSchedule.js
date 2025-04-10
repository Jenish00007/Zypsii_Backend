const { schedules } = require('../../../models');
const upload = require('../../../middleware/multerUpload');
const { uploadCloudInAry } = require('../../../helpers/');

const createSchedule = async (req, res) => {
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

module.exports = createSchedule;

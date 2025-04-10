const mongoose = require("mongoose");

const tutorialVideoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
    url: { type: String, required: true }
}, { timestamps: true });

const TutorialVideos = mongoose.model("TutorialVideos", tutorialVideoSchema);

// Insert hardcoded data if not already present
const insertDefaultTutorialVideos = async () => {
    try {
        const existingVideos = await TutorialVideos.countDocuments();
        if (existingVideos === 0) {
            await TutorialVideos.insertMany([
                {
                    title: 'Exploring Ooty',
                    thumbnail: 'https://example.com/ooty-thumbnail1.jpg',
                    url: 'https://www.youtube.com/watch?v=abcdef123456',
                },
                {
                    title: 'Best Places in Ooty',
                    thumbnail: 'https://example.com/ooty-thumbnail2.jpg',
                    url: 'https://www.youtube.com/watch?v=ghijkl789012',
                },
                {
                    title: 'Ooty Travel Guide',
                    thumbnail: 'https://example.com/ooty-thumbnail3.jpg',
                    url: 'https://www.youtube.com/watch?v=mnopqr345678',
                }
            ]);
            console.log("Default tutorial videos inserted.");
        }
    } catch (error) {
        console.error("Error inserting tutorial videos:", error);
    }
};
mongoose.connection.once("open", insertDefaultTutorialVideos);

module.exports = TutorialVideos;

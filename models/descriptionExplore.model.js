const mongoose = require("mongoose");

const descriptionexploreSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true }
}, { timestamps: true });

const Descriptionexplore = mongoose.model("Descriptionexplore", descriptionexploreSchema);

// Insert hardcoded data if not already present
const insertDefaultDescriptionexplore = async () => {
    try {
        const existingexplore = await Descriptionexplore.countDocuments();
        if (existingexplore === 0) {
            await Descriptionexplore.insertMany([
                {
                    id: 1,
                    name: 'Main Attractions',
                    description: 'Abith Ooty offers several must-visit attractions including the beautiful Botanical Gardens, Ooty Lake where you can enjoy boating, and the historic Nilgiri Mountain Railway.'
                  },
                  {
                    id: 2,
                    name: 'Squares',
                    description: 'Explore Ooty\'s charming town squares, where you can experience local culture, shop for souvenirs, and enjoy street food among colonial architecture.'
                  },
                  {
                    id: 3,
                    name: 'Museums',
                    description: 'Visit the Tea Museum to learn about Ooty\'s famous tea production, or explore the Tribal Research Centre Museum to understand the local indigenous cultures.'
                  },
                  {
                    id: 4,
                    name: 'Churches',
                    description: 'St. Stephen\'s Church and St. Thomas Church are beautiful examples of colonial architecture with stained glass windows and peaceful surroundings.'
                  },
                  {
                    id: 5,
                    name: 'Hidden Spots',
                    description: 'Discover off-the-beaten-path locations like Avalanche Lake, hidden tea estates, and lesser-known viewpoints that offer spectacular panoramic views without the crowds.'
                  }
            ]);
            console.log("Default Descrition explor inserted.");
        }
    } catch (error) {
        console.error("Error inserting Descrition explor:", error);
    }
};
mongoose.connection.once("open", insertDefaultDescriptionexplore);

module.exports = Descriptionexplore;

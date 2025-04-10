const bcrypt = require("bcrypt");

const generateUserName = (name) => {
    if (!name || typeof name !== "string") return null; // Validate input

    // Convert to lowercase and remove spaces
    let formattedName = name.trim().toLowerCase().replace(/\s+/g, "");

    // Capitalize the first letter
    formattedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);

    // Generate a unique 3-digit number (100-999)
    const randomNumber = Math.floor(100 + Math.random() * 900);

    // Final username with fixed "ZY" prefix
    return `${formattedName}_ZY_${randomNumber}`;
};


const hashPassword = async (password) => {
    const saltRounds = 10; // Recommended value
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

module.exports = { generateUserName, hashPassword };
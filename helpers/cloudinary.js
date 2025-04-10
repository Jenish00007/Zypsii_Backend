const cloudinary = require('cloudinary');
const cloud = cloudinary.v2;

cloud.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const uploadCloudInAry = async (files) => {
    try {
        
        if (!files || files.length === 0) {
            throw new Error("No files provided for upload");
        }

        const uploadOptions = {
            resource_type: 'auto',
            folder: process.env.CLOUD_FOLDER_NAME,
            overwrite: true,
            timeout: 60000,
        };

        const uploadedFiles = await Promise.all(
            files.map(file =>
                new Promise((resolve, reject) => {
                    const uploadStream = cloud.uploader.upload_stream(uploadOptions, (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.secure_url);
                        }
                    });
                    uploadStream.end(file.buffer); // Upload from buffer
                })
            )
        );

        return uploadedFiles; // Return array of URLs
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};

module.exports = { uploadCloudInAry };

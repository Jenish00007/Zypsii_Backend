const { uploadCloudInAry } = require('../../../helpers/cloudinary');
const { validateMulterMediaFile } = require('../../../helpers/');
const {  SUPPORTED_IMAGE_FORMATS, SUPPORTED_VIDEO_FORMATS } = require('../../../utils/constants');

class MediaUpload {
    static upload = async (req, res) => {
        try {
            const files = req.files;
            const { mediaType } = req.query
            let message;
            const validatedFiles = await Promise.all(
                files.map(async (file) => {

                    //validate the files 
                    await validateMulterMediaFile(file); // throws error if invalid
                    let uploadPath; // add the path of were the file need to upload.

                    if (SUPPORTED_IMAGE_FORMATS.includes(file?.mimetype) && mediaType == 'post') {
                        uploadPath = `${process.env.CLOUD_FOLDER_NAME}/posts/images`
                        message = 'Post image uploaded successfully';
                    } else if (SUPPORTED_VIDEO_FORMATS.includes(file?.mimetype) && mediaType == 'post') {
                        uploadPath = `${process.env.CLOUD_FOLDER_NAME}/posts/videos`
                        message = 'Post video uploaded successfully';
                    };

                    return [{
                        ...file,
                        uploadPath
                    }];
                })
            );

            //upload the file to Cloudinary  uploadCloudInAry(validatedFiles, validatedFiles.uploadPath),
            const getUploadUrls = await Promise.all(
                validatedFiles.map(async (file) => {
                    const getUploadUrls = await uploadCloudInAry(file, file[0].uploadPath)
                    return getUploadUrls;
                })
            );

            return res.status(200).json({
                status: true,
                message: message,
                urls: getUploadUrls.flat()
            });
            
        } catch (error) {
            console.log('Error in the MediaUpload class upload :', error);
            return res.status(500).json({
                status: false,
                message: error.message
            });
        }
    };
};

module.exports = MediaUpload;
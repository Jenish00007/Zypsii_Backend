const { users } = require('../../../models');
const sendEmail = require('../../../helpers/email');
const { getUserDetails } = require('../../../helpers/');
const { hashPassword } = require('../../users/helpers/userAuth')
const ejs = require('ejs');
const path = require('path');

class PasswordController {
    static async getOTP(req, res) {
        try {
            const { email } = req.params;

            // Find the user by email
            const user = await users.findOne({ email, isDeleted: false });

            if (!user) {
                return res.status(404).json({
                    status: false,
                    message: "User not found",
                });
            }

            // Generate a 4-digit OTP (between 1000 and 9999)
            const otp = Math.floor(1000 + Math.random() * 9000);

            // Update user's otp field
            user.otp = {
                value: otp.toString(),   // store as string
                createdAt: new Date(),   // refresh createdAt
            };
            user.verifyOtp = false; // reset verification flag

            const updatedUser = await users.findOneAndUpdate(
                { email },
                {
                    $set: {
                        otp: {
                            value: otp.toString(),
                            createdAt: new Date()
                        },
                        verifyOtp: false
                    }
                },
                { new: true }
            );

            if (!updatedUser) {
                return res.status(400).json({
                    status: false,
                    message: "OTP is not updated in DB",
                })
            };

            const emailTemplate = await ejs.renderFile(
                path.join(__dirname, '../../../views/otp-forgot-password.ejs'),
                {
                    otp: otp
                }
            );

            // Send the email with the rendered template
            await sendEmail(
                email,
                'OTP for reset password.',
                emailTemplate
            );
            // TODO: Send OTP to user's email or mobile (for now, just returning it)
            return res.status(200).json({
                status: true,
                message: "OTP sent successfully",
                otp: otp, // for testing - in production don't send OTP in response
            });

        } catch (error) {
            console.error('Error in sending OTP:', error);
            return res.status(500).json({
                status: false,
                message: "Internal Server Error"
            });
        }
    }


    static async resetPassword(req, res) {
        const { password, otp, email } = req.body;

        const user = await getUserDetails({ email: email });

        if (!user) {
            return res.status(400).json({
                status: false,
                message: 'user not found'
            });
        };

        // Calculate time difference
        const now = Date.now();
        const otpCreatedAt = new Date(user?.verifyOtp?.createdAt).getTime();
        const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
        const isOtpExpired = (now - otpCreatedAt) >= tenMinutes;

        // Check if OTP is wrong OR expired
        if (user?.otp?.value !== otp || isOtpExpired) {
            return res.status(400).json({
                status: false,
                message: 'Invalid OTP'
            });
        };

        const encryptedPassword = await hashPassword(password);

        const updatePassword = await users.findOneAndUpdate({ email: email, verifyOtp: false },
            {
                password: encryptedPassword,
                verifyOtp: true
            });

        if (!updatePassword) {
            return res.status(400).json({
                status: false,
                message: 'Password update unsuccessful',
                data: updatePassword
            })
        };

        return res.status(200).json({
            status: true,
            message: 'Password updated successfully',
            data: updatePassword
        });
    };
}

module.exports = PasswordController;



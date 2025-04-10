const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { users } = require('../../../models');
const sendEmail = require('../../../helpers/email');
const ejs = require('ejs');
const path = require('path');

class PasswordController {
    async forgetPassword(req, res) {
        const { email } = req.body;
        try {
            const user = await users.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

            // Render the email template using EJS
            const emailTemplate = await ejs.renderFile(
                path.join(__dirname, '../../../views/reset-password-email.ejs'),
                {
                    name: user.name,
                    resetLink: resetLink
                }
            );

            // Send the email with the rendered template
            await sendEmail(
                email,
                'Reset Password Request',
                emailTemplate
            );

            return res.status(200).json({ message: 'Reset password email sent' });
            
        } catch (error) {
            console.error('Error in forgetPassword:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async resetPassword(req, res) {
        const { token, newPassword } = req.body;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await users.findById(decoded.userId);
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();
            return res.status(200).json({ message: 'Password reset successfully' });
        } catch (error) {
            console.error('Error in resetPassword:', error);
            return res.status(500).json({ message: 'Invalid or expired token' });
        }
    }
}

module.exports = new PasswordController();



const nodemailer = require("nodemailer");

// Email transporter setup (using Gmail SMTP)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "jenujenu8@gmail.com",  // Replace with your email
        pass: "jvhg slmx wynv pxat",  // Use an app password for security
    },
});

// Function to send an email
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: "jenujenu8@gmail.com",
            to,
            subject,
            html, // Changed from text to html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Re-throw the error to handle it in the controller
    }
};

module.exports = sendEmail;

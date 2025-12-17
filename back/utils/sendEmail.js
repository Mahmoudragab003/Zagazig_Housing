const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail', // e.g., 'gmail'
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    // Define email options
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Zagazig Housing'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html // Optional HTML content
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

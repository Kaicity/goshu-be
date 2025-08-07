const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.USERNAME_EMAIL,
    pass: process.env.PASSWORD,
  },
});

const handleSendEmailService = async (val) => {
  try {
    await transporter.sendMail(val);
    return 'SUCCESS';
  } catch (error) {
    return error;
  }
};

module.exports = handleSendEmailService;

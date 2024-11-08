
const nodemailer = require("nodemailer");
const config = require("../config/config");
const dotenv = require("dotenv");
dotenv.config({ path: './.env' });

let transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

/** Send mail */
const sendMail = async (to, data, subject) => {
  try {
    return transport.sendMail({
      from: config.email.from,
      to,
      subject,
      html: data,
      // text:`http://localhost:8000/api/auth/change-password?token=${token} `
    });
  } catch (error) {
    return false;
  }
};

module.exports = {
  sendMail,
};

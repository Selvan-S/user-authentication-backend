const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.nodemailer_user,
    pass: process.env.nodemailer_pass,
  },
});

function sendMail(toEmail, subject, content) {
  // console.log("Email");
  const mailOptions = {
    from: "itscody666@gmail.com",
    to: toEmail,
    subject: subject,
    html: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("error occurred"+ error);
    } else {
      console.log("Email sent: "+ info.response);
    }
  });
}

module.exports = { sendMail };

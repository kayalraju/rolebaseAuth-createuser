// 3rd-party module
const nodeMailer = require("nodemailer");

//  Set up email transport
const transport = (senderEmail, password) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com", // fallback if environment variable is not set,
    port: process.env.EMAIL_PORT || 587, // default to standard SMTP port
    secure: false,
    requireTLS: true,
    auth: {
      user: senderEmail,
      pass: password,
    },
  });
  return transporter;
};

// Send verification email
const sendVerificationEmail = async (req, res, transporter, mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    // console.log(`Email sent: ${info.messageId}`);

    // Return if succesfully main is send
    return { status: true, messageId: info.messageId };
  } catch (error) {
    // console.error("Error sending email:", error.message);

    return {
      status: false,
      message: error.message,
    };
  }
};

// // Send notification email
// const notificationEmail = async (req, res, transporter, mailOptions) => {
//   try {
//     const info = await transporter.sendMail(mailOptions);
//     // console.log(`Email sent: ${info.messageId}`);

//     // Return if succesfully main is send
//     return { status: true, messageId: info.messageId };
//   } catch (error) {
//     // console.error("Error sending email:", error.message);

//     return {
//       status: false,
//       message: error.message,
//     };
//   }
// };

module.exports = {
  transport,
  sendVerificationEmail,
};

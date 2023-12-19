const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const tokenForVerify = (user) => {
  return jwt.sign(
    {
      name: user.name,
      email: user.email,
      password: user.password,
    },
    process.env.JWT_SECRET_FOR_EMAIL_VERIFICATION,
    { expiresIn: "15m" }
  );
};

const sendEmail = async (mailOptions, res, message) => {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    service: process.env.SERVICE, //comment this line if you use custom server/domain
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.APP_PASS,
    },
  });

  try {
    await transporter.sendMail(mailOptions);
    res.send({
      message: message,
    });
  } catch (err) {
    res.status(403).send({
      message: `Error happen when sending email ${err.message}`,
    });
  }
};

const signInToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      image: user.image,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2d",
    }
  );
};

module.exports = {
  tokenForVerify,
  sendEmail,
  signInToken,
};

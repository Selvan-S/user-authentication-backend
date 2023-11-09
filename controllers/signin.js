const User = require("../models/User");
const { sendMail } = require("./SendMail");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
let jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const verifyUser = require("../models/verifyUser");
dotenv.config();
async function InsertVerifyUser(name, email, password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const token = generateToken(email);
    const newUser = new verifyUser({
      name: name,
      email: email,
      password: hashedPassword,
      token: token,
    });

    const activationLink = `https://auth-be-1s6h.onrender.com/signin/${token}`;
    const content = `<h4> Hi, there </h4>
      <h5>Welcome to the app</h5>
      <p>Thank you for Signing up. Click on the below link to activate</p>
      <a href=${activationLink}>Click Here</a>
      <p>Regards</p>
      <p>Team</p>`;
    // console.log(newUser);
    await newUser.save();
    sendMail(email, "VerifyUser", content);
  } catch (e) {
    console.log("controller signin error: " + e);
  }
}

function generateToken(email) {
  const token = jwt.sign(email, process.env.signup_Secret_Token);
  return token;
}

async function InsertSignUpUser(token) {
  try {
    const userVerify = await verifyUser.findOne({ token: token });
    if (userVerify) {
      const newUser = new User({
        name: userVerify.name,
        email: userVerify.email,
        password: userVerify.password,
        forgetPassword: {},
      });
      await newUser.save();
      await userVerify.deleteOne({ token: token });
      const content = `<h4> Resgisteration successful</h4>
      <h5>Welcome to the app</h5>
      <p>You are successfully registered</p>
      <p>Regards</p>
      <p>Team</p>`;
      sendMail(newUser.email, "Registeration successful", content);
      return `<h4> Hi, there </h4>
      <p>You are successfully registered</p>
      <p>Regards</p>
      <p>Team</p>`;
    }
    return `<h4> Resgisteration failed</h4>
      <p>Link expired...</p>
      <p>Regards</p>
      <p>Team</p>`;
  } catch (error) {
    console.log("Error in insert signup user: " + error);
    return `
      <html>
        <body>
          <h4> Resgisteration failed</h4>
          <p>Unexpected error happened</p>
          <p>Regards</p>
          <p>Team</p>
        </body>
      </html>`;
  }
}

module.exports = { InsertVerifyUser, InsertSignUpUser };

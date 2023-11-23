const User = require("../models/User");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
const client = require("../redis");

dotenv.config();

async function checkUser(email) {
  try {
    const user = await User.findOne({ email: email });
    // console.log("Now Trying to print user outside " + user);
    if (user) {
      return true;
    }
    return false;
  } catch (e) {
    return "Server Busy";
  }
}

async function AuthenticateUser(email, password) {
  try {
    const userCheck = await User.findOne({ email: email });
    // console.log("userCheck " + userCheck);
    const validPassword = await bcrypt.compare(password, userCheck.password);
    // console.log("Valid password " + validPassword);
    if (validPassword) {
      const token = jwt.sign({ email }, process.env.login_secret_token);
      const response = {
        id: userCheck._id,
        name: userCheck.name,
        email: userCheck.email,
        token: token,
        status: true,
      };
      await client.set(`key-${email}`, JSON.stringify(response));
      await User.findOneAndUpdate(
        { email: userCheck.email },
        { $set: { token: token } },
        { new: true }
      );
      return response;
    }
    return "Invalid User Name or Password";
  } catch (error) {
    console.log(error);
    return "Server Busy";
  }
}

async function AuthorizeUser(token) {
  try {
    const decodedToken = jwt.verify(token, process.env.login_secret_token);
    if (decodedToken) {
      const email = decodedToken.email;
      const auth = await client.get(`key-${email}`);
      if (auth) {
        const data = await User.findOne({ email: email });
        // console.log("auth using mongodb: ", data);
        return data;
      } else {
        const data = JSON.parse(auth);
        // console.log("auth using redis: ", data);
        return data;
      }
    }
    return false;
  } catch (error) {
    console.log("AuthenticateUser Error" + error);
  }
}

module.exports = { checkUser, AuthenticateUser, AuthorizeUser };

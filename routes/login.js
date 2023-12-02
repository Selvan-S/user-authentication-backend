const express = require("express");
const { AuthenticateUser } = require("../controllers/login");
const client = require("../redis");
const e = require("express");
const router = express.Router();

client
  .connect()
  .then(() => {
    console.log("connected to redis");
  })
  .catch((e) => {
    console.log(e);
  });

router.post("/", async (req, res) => {
  try {
    const { email, password } = await req.body;
    let loginCredentials = await AuthenticateUser(email, password);
    if (loginCredentials === "Invalid User Name or Password") {
      res.status(200).send("Invalid User Name or Password");
    } else if (loginCredentials === "Server Busy") {
      res.status(200).send("Server Busy");
    } else {
      res.status(200).json({ token: loginCredentials.token });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Busy");
  }
});

module.exports = router;

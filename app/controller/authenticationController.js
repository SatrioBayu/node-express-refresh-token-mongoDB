const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const handleRegister = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(403).send({
        message: "Please provide username and password",
      });

    const user = await User.findOne({ username }).exec();
    if (user) {
      return res.status(400).send({
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();
    res.status(201).send({
      message: "User created successfully",
      user: savedUser,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

const handleWhoAmI = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).exec();
    res.status(200).send({
      user,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
};

module.exports = {
  handleRegister,
  handleWhoAmI,
};

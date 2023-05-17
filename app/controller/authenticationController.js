const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const handleRegister = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send({
        errors: [
          {
            code: "E-001",
            message: "Please provide a username and password",
          },
        ],
      });
    }
    const userExist = await User.findOne({ username }).exec();
    if (userExist) {
      return res.status(409).send({
        errors: [
          {
            code: "E-002",
            message: "Username already exists",
          },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(200).send({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).send({
      errors: [
        {
          code: "E-003",
          message: "Something went wrong",
        },
      ],
    });
  }
};

module.exports = { handleRegister };

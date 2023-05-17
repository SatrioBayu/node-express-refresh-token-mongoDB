const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
    res.status(500).send({
      errors: [
        {
          code: "E-003",
          message: "Something went wrong",
        },
      ],
    });
  }
};

const handleLogin = async (req, res) => {
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
    const user = await User.findOne({ username }).exec();
    if (!user) {
      return res.status(401).send({
        errors: [
          {
            code: "E-004",
            message: "Invalid username or password",
          },
        ],
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({
        errors: [
          {
            code: "E-004",
            message: "Invalid username or password",
          },
        ],
      });
    }
    const refreshTokenCookie = req.cookies.refreshToken;
    if (refreshTokenCookie)
      return res.status(403).send({
        errors: [
          {
            code: "E-005",
            message: "You are already logged in",
          },
        ],
      });

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET_KEY);

    // PROD
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   maxAge: 1000 * 60 * 60 * 24 * 7,
    // });

    // DEV
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60,
    });

    res.status(200).send({
      accessToken,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      errors: [
        {
          code: "E-003",
          message: "Something went wrong",
        },
      ],
    });
  }
};

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: "30m" });
};

module.exports = { handleRegister, handleLogin };

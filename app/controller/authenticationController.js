const { User, BlacklistToken } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AuthErr, InternErr } = require("../errors");
require("dotenv").config();

const handleAuth = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth)
      return res.status(401).send({
        errors: [
          {
            code: "E-008",
            message: "No token provided",
          },
        ],
      });
    const token = auth.split(" ")[1];

    const blackListToken = await BlacklistToken.findOne({ token });
    if (blackListToken)
      return res.status(403).send({
        errors: [
          {
            code: "E-009",
            message: "Token blacklisted",
          },
        ],
      });

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
      const user = await User.findById(decoded.id);
      if (!user)
        return res.status(403).send({
          errors: [
            {
              code: "E-011",
              message: expect.any(String),
            },
          ],
        });
      req.user = user;
    } catch (error) {
      return res.status(403).send({
        errors: [
          {
            code: "E-010",
            message: expect.any(String),
          },
        ],
      });
    }
    next();
  } catch (error) {
    res.status(500).send(InternErr.internalError(error.message));
  }
};

const handleRegister = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userExist = await User.findOne({ username }, null, { collation: { locale: "en", strength: 2 } });
    if (userExist) {
      return res.status(409).send(AuthErr.usernameAlreadyExist());
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
    res.status(500).send(InternErr.internalError(error.message));
  }
};

const handleLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }, null, { collation: { locale: "en", strength: 2 } }).exec();
    if (!user) {
      return res.status(401).send(AuthErr.invalidUsernameOrPassword());
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send(AuthErr.invalidUsernameOrPassword());
    }
    const refreshTokenCookie = req.cookies.refreshToken;
    if (refreshTokenCookie) return res.status(403).send(AuthErr.alreadyLogin());

    const accessToken = generateAccessToken(user);
    // const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET_KEY);

    // PROD
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   maxAge: 1000 * 60 * 60 * 24 * 7,
    // });

    // DEV
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   maxAge: 1000 * 60,
    // });

    res.status(200).send({
      accessToken,
    });
  } catch (error) {
    res.status(500).send(InternErr.internalError(error.message));
  }
};

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: "30m" });
};

module.exports = { handleRegister, handleLogin, handleAuth };

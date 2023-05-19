const { User } = require("../models");
const { AuthErr, InternErr } = require("../errors");

const handleUpdateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(403).send({
        errors: [
          {
            code: "E-012",
            message: "User from this token not found",
          },
        ],
      });
    }
    if (user.username.toLowerCase() === username.toLowerCase()) {
      return res.status(200).send({
        message: "No operation was performed since the new username is the same as the old username",
      });
    }

    const existingUser = await User.findOne({
      username: { $eq: username },
      _id: { $ne: req.user.id },
    }).collation({ locale: "en", strength: 2, caseLevel: false });
    if (existingUser)
      return res.status(409).send({
        errors: [
          {
            code: "E-014",
            message: "Username already in use",
          },
        ],
      });

    user.username = username;
    await user.save();
    res.status(200).send({
      message: "Username updated successfully",
    });
  } catch (error) {
    res.status(500).send(InternErr.internalError(error.message));
  }
};

module.exports = {
  handleUpdateUsername,
};

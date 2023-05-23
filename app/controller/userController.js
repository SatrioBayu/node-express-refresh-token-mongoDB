const { User } = require("../models");
const { AuthErr, InternErr } = require("../errors");
const bcrypt = require("bcryptjs");
const imageKit = require("../middleware/imagekit");

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

const handleUpdatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
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
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(409).send({
        errors: [
          {
            code: "E-013",
            message: "Old password is incorrect",
          },
        ],
      });
    }
    // if (oldPassword === newPassword) {
    //   return res.status(409).send({
    //     errors: [
    //       {
    //         code: "E-016",
    //         message: "New password can't be same with old password",
    //       },
    //     ],
    //   });
    // }
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = newHashedPassword;
    await user.save();
    res.status(200).send({
      message: "Password successfully updated",
    });
  } catch (error) {
    res.status(500).send(InternErr.internalError(error.message));
  }
};

const handleUpdateImage = async (req, res) => {
  try {
    const { id } = req.user;
    if (!req.file)
      return res.status(400).send({
        errors: [
          {
            code: "E-015",
            message: "No image uploaded",
          },
        ],
      });

    if (!req.file.mimetype.startsWith("image/"))
      return res.status(400).send({
        errors: [
          {
            code: "E-016",
            message: "Invalid image type",
          },
        ],
      });

    const user = await User.findById(id);
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

    if (user.photo_profile && user.photo_public_id) {
      await imageKit.deleteFile(user.photo_public_id);
    }

    const result = await uploadImageToImageKit(req.file);
    user.photo_profile = result.url;
    user.photo_public_id = result.fileId;
    await user.save();
    res.status(200).send({
      message: "Image successfully updated",
    });
  } catch (error) {
    res.status(500).send(InternErr.internalError(error.message));
  }
};

const uploadImageToImageKit = async (file) => {
  try {
    const result = await imageKit.upload({ file: file.buffer, fileName: file.originalname });
    return result;
  } catch (error) {
    throw {
      code: "E-022",
      message: error.message,
    };
  }
};

module.exports = {
  handleUpdateUsername,
  handleUpdatePassword,
  handleUpdateImage,
};

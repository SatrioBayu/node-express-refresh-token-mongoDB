const { body } = require("express-validator");

const usernameValidator = body("username").notEmpty().withMessage({
  code: "E-001",
  message: "Please provide a username",
});

const passwordValidator = (fieldName) => {
  return body(fieldName).custom((value) => {
    if (!value) {
      throw {
        code: "E-001",
        message: "Please provide a password",
      };
    }
    if (value.length < 6) {
      throw {
        code: "E-006",
        message: "Password must be at least 6 characters long",
      };
    }
    if (!/[a-zA-Z]/.test(value)) {
      throw {
        code: "E-007",
        message: "Password must contain at least 1 letter",
      };
    }
    if (!/\d/.test(value)) {
      throw {
        code: "E-008",
        message: "Password must contain at least 1 digit",
      };
    }
    if (!/[A-Z]/.test(value)) {
      throw {
        code: "E-009",
        message: "Password must contain at least 1 uppercase letter",
      };
    }
    if (!/[\W_]/.test(value)) {
      throw {
        code: "E-010",
        message: "Password must contain at least 1 special character",
      };
    }
    return true;
  });
};

module.exports = {
  authValidate: [usernameValidator, passwordValidator("password")],
  loginValidate: [
    usernameValidator,
    body("password").notEmpty().withMessage({
      code: "E-001",
      message: "Please provide a password",
    }),
  ],
};

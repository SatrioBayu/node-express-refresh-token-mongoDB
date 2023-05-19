const { body } = require("express-validator");
const { AuthErr } = require("../errors");

const usernameValidator = body("username").notEmpty().withMessage(AuthErr.usernameEmpty().errors[0]);
// const usernameValidator = body("username").notEmpty().withMessage({
//   code: "E-001",
//   message: "Please provide a username",
// });

const passwordValidator = (fieldName) => {
  return body(fieldName).custom((value) => {
    if (!value) {
      throw AuthErr.passwordEmpty().errors[0];
      // throw {
      //   code: "E-001",
      //   message: "Please provide a password",
      // };
    }
    if (value.length < 8) {
      throw AuthErr.passwordValidation("Password must be at least 8 characters long").errors[0];
      // throw {
      //   code: "E-006",
      //   message: "Password must be at least 8 characters long",
      // };
    }
    if (!/[a-zA-Z]/.test(value)) {
      throw AuthErr.passwordValidation("Password must contain at least 1 letter").errors[0];
      // throw {
      //   code: "E-007",
      //   message: "Password must contain at least 1 letter",
      // };
    }
    if (!/\d/.test(value)) {
      throw AuthErr.passwordValidation("Password must contain at least 1 digit").errors[0];
      // throw {
      //   code: "E-008",
      //   message: "Password must contain at least 1 digit",
      // };
    }
    if (!/[A-Z]/.test(value)) {
      throw AuthErr.passwordValidation("Password must contain at least 1 uppercase letter").errors[0];
      // throw {
      //   code: "E-009",
      //   message: "Password must contain at least 1 uppercase letter",
      // };
    }
    if (!/[\W_]/.test(value)) {
      throw AuthErr.passwordValidation("Password must contain at least 1 special character").errors[0];
      // throw {
      //   code: "E-010",
      //   message: "Password must contain at least 1 special character",
      // };
    }
    return true;
  });
};

module.exports = {
  authValidate: [usernameValidator, passwordValidator("password")],
  loginValidate: [usernameValidator, body("password").notEmpty().withMessage(AuthErr.passwordEmpty().errors[0])],
  updateUsernameValidate: [usernameValidator],
  logoutValidate: [
    usernameValidator,
    body("token").notEmpty().withMessage({
      code: "E-016",
      message: "Token not provided",
    }),
  ],
};

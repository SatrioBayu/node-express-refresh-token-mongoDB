const usernameEmpty = () => {
  return {
    errors: [
      {
        code: "E-001",
        message: "Username is required",
      },
    ],
  };
};

const passwordEmpty = () => {
  return {
    errors: [
      {
        code: "E-002",
        message: "Password is required",
      },
    ],
  };
};

const passwordValidation = (message) => {
  return {
    errors: [
      {
        code: "E-003",
        message,
      },
    ],
  };
};

const usernameAlreadyExist = () => {
  return {
    errors: [
      {
        code: "E-004",
        message: "Username already exist",
      },
    ],
  };
};

const invalidUsernameOrPassword = () => {
  return {
    errors: [
      {
        code: "E-005",
        message: "Invalid username or password",
      },
    ],
  };
};

const alreadyLogin = () => {
  return {
    errors: [
      {
        code: "E-006",
        message: "Already login",
      },
    ],
  };
};

module.exports = {
  usernameEmpty,
  passwordEmpty,
  passwordValidation,
  usernameAlreadyExist,
  invalidUsernameOrPassword,
  alreadyLogin,
};

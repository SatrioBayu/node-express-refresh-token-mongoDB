const internalError = (message) => {
  return {
    errors: [
      {
        code: "E-007",
        message,
      },
    ],
  };
};

module.exports = {
  internalError,
};

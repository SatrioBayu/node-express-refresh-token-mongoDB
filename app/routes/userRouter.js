const express = require("express");
const router = express.Router();
const { authenticationController } = require("../controller");
const bodyValidation = require("../validation/bodyValidation");
const validationResult = require("../validation/validationResult");

router.get("/", (req, res) => {
  res.send({
    message: "Router user",
  });
});

router.post("/register", bodyValidation.authValidate, validationResult.validate, authenticationController.handleRegister);
router.post("/login", bodyValidation.loginValidate, validationResult.validate, authenticationController.handleLogin);

module.exports = router;

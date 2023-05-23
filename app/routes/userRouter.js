const express = require("express");
const router = express.Router();
const { authenticationController, userController } = require("../controller");
const bodyValidation = require("../validation/bodyValidation");
const validationResult = require("../validation/validationResult");
const uploadOnMemory = require("../middleware/multer");

router.get("/", (req, res) => {
  res.send({
    message: "Router user",
  });
});

router.post("/register", bodyValidation.authValidate, validationResult.validate, authenticationController.handleRegister);
router.post("/login", bodyValidation.loginValidate, validationResult.validate, authenticationController.handleLogin);
router.patch("/", authenticationController.handleAuth, bodyValidation.updateUsernameValidate, validationResult.validate, userController.handleUpdateUsername);
router.post("/logout", bodyValidation.logoutValidate, validationResult.validate, authenticationController.handleLogout);
router.patch("/updateImage", authenticationController.handleAuth, uploadOnMemory.single("photo"), userController.handleUpdateImage);
router.post("/refresh", authenticationController.refreshToken);

module.exports = router;

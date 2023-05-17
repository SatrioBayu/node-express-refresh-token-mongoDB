const express = require("express");
const router = express.Router();
const { authenticationController } = require("../controller");

router.get("/", (req, res) => {
  res.send({
    message: "Router user",
  });
});

router.post("/register", authenticationController.handleRegister);
router.get("/:id", authenticationController.handleWhoAmI);

module.exports = router;

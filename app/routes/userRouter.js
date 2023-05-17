const express = require("express");
const router = express.Router();
const { authenticationController } = require("../controller");

router.get("/", (req, res) => {
  res.send({
    message: "Router user",
  });
});

module.exports = router;

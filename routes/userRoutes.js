const express = require("express");
const router = express.Router();

const {
  verifyEmailAddress,
  registerUser,
} = require("../controller/userController");
const { emailVerificationLimit } = require("../config/others");

//Email Verification
router.post("/verify-email", emailVerificationLimit, verifyEmailAddress);

// User Registration
router.post("/register/:token", registerUser);

module.exports = router;

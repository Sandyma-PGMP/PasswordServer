const express = require("express");
const { forgotPassword, resetPassword,signup,login } = require("../Controllers/auth.controller");
const router = express.Router();


router.post("/sign-up", signup);
router.post("/sign-in", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;

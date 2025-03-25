const express = require("express");
const { forgotPassword, resetPassword,createUser,loginUser } = require("../Controllers/auth.controller");
const router = express.Router();


router.post("/create-user", createUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;

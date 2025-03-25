const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../Models/users.model");

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("Login request received:", email); // Debugging Log

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password does not match");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Login successful, token generated");

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err); // Print the real error
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    to: user.email,
    from: process.env.EMAIL,
    subject: "Password Reset",
    html: `<p>Click <a href="https://passwordappy.netlify.app/reset-password/${token}">here</a> to reset your password</p>`
  });
  res.json({ message: "Password reset link sent to email" });
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: "Password updated successfully" });
};
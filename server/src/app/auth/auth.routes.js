const express = require("express");
const router = express.Router();
const authService = require("./auth.service");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Call the auth service to login and get token and user data
    const { token, user } = await authService.login(username, password);
    res.json({ message: "Login successful", token, user }); // Send token along with user data
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Register the user using the auth service
    await authService.register(username, email, password);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Example of a protected route using the JWT token
router.get("/protected", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from the Authorization header
  if (!token) {
    return res.status(401).json({ error: "Token is required" });
  }

  try {
    // Verify the token using the auth service
    const decoded = await authService.verifyToken(token);
    res.json({ message: "Protected route accessed", decoded });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

module.exports = router;

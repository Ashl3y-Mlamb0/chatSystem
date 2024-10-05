const jwt = require("jsonwebtoken");
const authService = require("../app/auth/auth.service"); // Assuming you have a service for JWT verification
const User = require("../models/User");

module.exports = async function (socket, next) {
  try {
    const token = socket.handshake.auth.token; // Get token from the handshake

    if (!token) {
      const err = new Error("Authentication error");
      err.data = { content: "Please send a valid token" };
      return next(err);
    }

    // Verify JWT token using the authService
    const decoded = await authService.verifyToken(token); // Assuming verifyToken is an async method that verifies the token
    const userId = decoded.userId; // Extract userId from the token

    // Fetch the user from the database, excluding password, groups, and timestamps
    const user = await User.findById(userId)
      .select("username email avatar roles") // Adjust the fields based on your model
      .lean(); // Return a plain JavaScript object

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // Attach the user info to the socket object for later use
    socket.user = user;

    // Proceed with the connection
    next();
  } catch (err) {
    console.error("Socket authentication error:", err);
    return next(new Error("Authentication error: Invalid or expired token"));
  }
};

const jwt = require("jsonwebtoken");

module.exports = function (socket, next) {
  const token = socket.handshake.auth.token; // Get token from the handshake

  if (!token) {
    const err = new Error("Authentication error");
    err.data = { content: "Please send a valid token" };
    return next(err);
  }

  // Verify JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication error"));
    }

    // Store user data in socket object for later use
    socket.user = decoded;
    next(); // Proceed with the connection
  });
};

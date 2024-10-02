const authService = require("../app/auth/auth.service");

const authMiddleware = {
  // Middleware to verify JWT token
  verifyToken: async (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res
          .status(401)
          .json({ error: "Authorization header is missing" });
      }

      // Extract token from header
      const token = authHeader.split(" ")[1]; // Expected format: Bearer <token>
      if (!token) {
        return res.status(401).json({ error: "Token is missing" });
      }

      // Verify the token using the auth service
      const decoded = await authService.verifyToken(token);

      // Attach user info to request object (e.g., userId, roles)
      req.user = decoded;

      // Proceed to the next middleware or route handler
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  },

  // Middleware to enforce role-based authorization
  requireRole: (role) => {
    return (req, res, next) => {
      // Check if the user has been authenticated and has the required role
      if (!req.user || !req.user.roles || !req.user.roles.includes(role)) {
        return res
          .status(403)
          .json({ error: "Forbidden: insufficient permissions" });
      }
      next(); // User has the required role, proceed to the next middleware/route
    };
  },
};

module.exports = authMiddleware;

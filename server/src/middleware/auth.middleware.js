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

  // Middleware to enforce role-based authorization, with Super Admin bypass
  requireRole: (role) => {
    return (req, res, next) => {
      // Allow Super Admin to bypass any role check
      if (req.user && req.user.roles.includes("superAdmin")) {
        return next(); // Super Admins can access anything
      }

      // Otherwise, check if the user has the required role
      if (!req.user || !req.user.roles || !req.user.roles.includes(role)) {
        return res
          .status(403)
          .json({ error: "Forbidden: insufficient permissions" });
      }

      next(); // User has the required role, proceed to the next middleware/route
    };
  },

  // Middleware to check if the Group Admin is managing a group they are an admin for
  isGroupAdminForGroup: async (req, res, next) => {
    const { groupId } = req.params;
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      // Allow Super Admins to bypass this check
      if (req.user && req.user.roles.includes("superAdmin")) {
        return next(); // Super Admins can manage any group
      }

      // Check if the user is listed as an admin in the group
      if (group.admins.includes(req.user._id)) {
        return next(); // User is an admin of this group, proceed
      }

      return res.status(403).json({
        error: "Forbidden: You can only manage groups you are an admin of.",
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Middleware to check if the Group Admin is managing a channel in their own group
  isGroupAdminForChannel: async (req, res, next) => {
    const { channelId } = req.params; // Extract channel ID from the request

    try {
      const channel = await Channel.findById(channelId).populate("group");
      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }

      const group = channel.group;

      // Allow Super Admins to bypass this check
      if (req.user && req.user.roles.includes("superAdmin")) {
        return next(); // Super Admins can manage any channel
      }

      // Check if the user is listed as an admin in the group associated with the channel
      if (group && group.admins.includes(req.user._id)) {
        return next(); // User is an admin of the group that owns this channel
      }

      return res.status(403).json({
        error:
          "Forbidden: You can only manage channels in groups you are an admin of.",
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};

module.exports = authMiddleware;

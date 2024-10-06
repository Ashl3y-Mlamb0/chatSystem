const express = require("express");
const router = express.Router();
const groupsService = require("./groups.service");
const authMiddleware = require("../../middleware/auth.middleware");

// GET /api/groups - Get all groups (Accessible by all authenticated users)
router.get(
  "/",
  authMiddleware.verifyToken, // Ensure the user is authenticated
  async (req, res) => {
    try {
      // Use the groupsService to get all groups
      const groups = await groupsService.getAllGroups();

      if (!groups || groups.length === 0) {
        return res.status(404).json({ message: "No groups found" });
      }

      res.json(groups); // Return the list of all groups
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/groups/accessible - Get groups accessible by the current user
router.get(
  "/accessible",
  authMiddleware.verifyToken, // Ensure the user is authenticated
  async (req, res) => {
    try {
      const userId = req.user._id; // Get the user ID from the token
      const isSuperAdmin = req.user.role === "superAdmin"; // Check if user is a super admin

      // Use the groupsService to get the accessible groups
      const groups = await groupsService.getAccessibleGroups(
        userId,
        isSuperAdmin
      );

      if (!groups || groups.length === 0) {
        return res.status(404).json({ message: "No accessible groups found" });
      }

      res.json(groups); // Return the accessible groups
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/groups - Create a new group (Only Group Admins and Super Admins)
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.requireRole("groupAdmin"), // Only Group Admins and Super Admins
  async (req, res) => {
    const { name, description } = req.body;

    try {
      const group = await groupsService.createGroup(
        name,
        description,
        req.user._id
      ); // req.user._id is the creator
      res.status(201).json({ message: "Group created successfully", group });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/groups/:groupId - Get a group by ID (Accessible by all authenticated users)
router.get(
  "/:groupId",
  authMiddleware.verifyToken, // Any authenticated user can view group details
  async (req, res) => {
    const { groupId } = req.params;

    try {
      const group = await groupsService.getGroupById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json(group);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/groups/:groupId - Update a group (Only Group Admins for their groups or Super Admins)
router.put(
  "/:groupId",
  authMiddleware.verifyToken,
  authMiddleware.requireRole("groupAdmin"), // Only Group Admins and Super Admins
  authMiddleware.isGroupAdminForGroup, // Check if user is an admin of this group
  async (req, res) => {
    const { groupId } = req.params;
    const { name, description, joinRequestsAction } = req.body;

    try {
      const updatedGroup = await groupsService.updateGroup(
        groupId,
        name,
        description,
        joinRequestsAction
      );
      if (!updatedGroup) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json({ message: "Group updated successfully", updatedGroup });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE /api/groups/:groupId - Delete a group (Only Super Admins or Group Admins for their groups)
router.delete(
  "/:groupId",
  authMiddleware.verifyToken,
  authMiddleware.requireRole("groupAdmin"), // Only Group Admins and Super Admins
  authMiddleware.isGroupAdminForGroup, // Check if user is an admin of this group
  async (req, res) => {
    const { groupId } = req.params;

    try {
      const deletedGroup = await groupsService.deleteGroup(groupId);
      if (!deletedGroup) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json({ message: "Group deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// POST /api/groups/:groupId/join - Request to join a group
router.post(
  "/:groupId/join",
  authMiddleware.verifyToken, // Ensure the user is authenticated
  async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;

    try {
      // Call the service to handle the join request
      const group = await groupsService.requestToJoinGroup(groupId, userId);

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      res.json({ message: "Join request sent successfully", group });
    } catch (err) {
      // Check if it's a known error (user already requested or is a member)
      if (
        err.message === "Already a member" ||
        err.message === "Request already sent"
      ) {
        return res.status(400).json({ message: err.message });
      }

      // Handle other unexpected errors
      res
        .status(500)
        .json({ error: "An error occurred while sending the join request" });
    }
  }
);

module.exports = router;

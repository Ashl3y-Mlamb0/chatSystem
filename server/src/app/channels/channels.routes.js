const express = require("express");
const router = express.Router();
const channelsService = require("./channels.service");
const authMiddleware = require("../../middleware/auth.middleware");

// POST /api/channels - Create a new channel (Only Group Admins of the specific group or Super Admins)
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.requireRole("groupAdmin"), // Require Group Admin role
  authMiddleware.isGroupAdminForGroup, // Ensure the user is an admin for the specified group
  async (req, res) => {
    const { name, groupId } = req.body;

    try {
      const channel = await channelsService.createChannel(name, groupId);
      res
        .status(201)
        .json({ message: "Channel created successfully", channel });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/channels/:channelId - Get channel by ID (Accessible by all authenticated users)
router.get(
  "/:channelId",
  authMiddleware.verifyToken, // Any authenticated user can view channels
  async (req, res) => {
    const { channelId } = req.params;

    try {
      const channel = await channelsService.getChannelById(channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json(channel);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/channels/group/:groupId - Get all channels for a specific group (Accessible by all authenticated users)
router.get(
  "/group/:groupId",
  authMiddleware.verifyToken, // Any authenticated user can view group channels
  async (req, res) => {
    const { groupId } = req.params;

    try {
      const channels = await channelsService.getChannelsByGroup(groupId);
      res.json(channels);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/channels/:channelId - Update a channel (Only Group Admins of the group that owns the channel or Super Admins)
router.put(
  "/:channelId",
  authMiddleware.verifyToken,
  authMiddleware.requireRole("groupAdmin"), // Require Group Admin role
  authMiddleware.isGroupAdminForChannel, // Ensure the user is an admin for the group that owns the channel
  async (req, res) => {
    const { channelId } = req.params;
    const { name } = req.body;

    try {
      const updatedChannel = await channelsService.updateChannel(
        channelId,
        name
      );
      if (!updatedChannel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json({ message: "Channel updated successfully", updatedChannel });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE /api/channels/:channelId - Delete a channel (Only Super Admins or Group Admins of the group that owns the channel)
router.delete(
  "/:channelId",
  authMiddleware.verifyToken,
  authMiddleware.requireRole("groupAdmin"), // Require Group Admin role
  authMiddleware.isGroupAdminForChannel, // Ensure the user is an admin for the group that owns the channel
  async (req, res) => {
    const { channelId } = req.params;

    try {
      const deletedChannel = await channelsService.deleteChannel(channelId);
      if (!deletedChannel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json({ message: "Channel deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;

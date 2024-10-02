const express = require("express");
const router = express.Router();
const messagesService = require("./messages.service");
const authMiddleware = require("../../middleware/auth.middleware");

// POST /api/messages - Send a new message (All authenticated users)
router.post(
  "/",
  authMiddleware.verifyToken, // Ensure the user is authenticated
  async (req, res) => {
    const { content, channelId, imageUrl } = req.body;

    try {
      const message = await messagesService.createMessage(
        content,
        req.user._id,
        channelId,
        imageUrl
      );
      res.status(201).json({ message: "Message sent successfully", message });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/messages/:channelId - Get all messages for a specific channel (All authenticated users)
router.get(
  "/:channelId",
  authMiddleware.verifyToken, // Ensure the user is authenticated
  async (req, res) => {
    const { channelId } = req.params;

    try {
      const messages = await messagesService.getMessagesByChannel(channelId);
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE /api/messages/:messageId - Delete a message (Only Super Admins or Group Admins of the channel's group)
router.delete(
  "/:messageId",
  authMiddleware.verifyToken,
  authMiddleware.requireRole("groupAdmin"), // Only Group Admins and Super Admins
  authMiddleware.isGroupAdminForChannel, // Check if the user is a group admin for the channel's group
  async (req, res) => {
    const { messageId } = req.params;

    try {
      const deletedMessage = await messagesService.deleteMessage(messageId);
      if (!deletedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;

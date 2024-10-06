const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const messagesService = require("./messages.service");
const authMiddleware = require("../../middleware/auth.middleware");

// Configure multer for image storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set the destination directory for uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Create a unique file name
  },
});

const upload = multer({ storage: storage });

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

// POST /api/messages/upload - Upload an image (All authenticated users)
router.post(
  "/upload",
  authMiddleware.verifyToken, // Ensure the user is authenticated
  upload.single("image"), // Handle single image upload
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // File path for the uploaded image
    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({ message: "Image uploaded successfully", imageUrl });
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

// PUT /api/messages/:messageId - Update a message (Only authenticated users)
router.put(
  "/:messageId",
  authMiddleware.verifyToken, // Ensure the user is authenticated
  authMiddleware.requireRole("groupAdmin"), // Only Group Admins and Super Admins
  authMiddleware.isGroupAdminForMessage, // Check if the user is a group admin for the channel's group
  async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;

    try {
      const updatedMessage = await messagesService.updateMessage(
        messageId,
        content
      );
      res.json({ message: "Message updated successfully", updatedMessage });
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
  authMiddleware.isGroupAdminForMessage, // Check if the user is a group admin for the channel's group
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

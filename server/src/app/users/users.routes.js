const express = require("express");
const router = express.Router();
const usersService = require("./users.service");
const authMiddleware = require("../../middleware/auth.middleware");
const multer = require("multer");
const path = require("path"); // Ensure path is imported

// Configure multer for profile image uploads with a file size limit
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../../uploads")); // Correct path for saving uploaded files
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}${ext}`); // Use user ID as the filename
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
});

// GET /api/users/me - Get logged-in user's profile (Authenticated users only)
router.get(
  "/me",
  authMiddleware.verifyToken, // Ensure the user is authenticated
  async (req, res) => {
    try {
      const user = await usersService.getUserById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/users/me - Update logged-in user's profile (Authenticated users only)
router.put(
  "/me",
  authMiddleware.verifyToken, // Ensure the user is authenticated
  async (req, res) => {
    const { username, email } = req.body;

    try {
      const updatedUser = await usersService.updateUserProfile(req.user._id, {
        username,
        email,
      });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "Profile updated successfully", updatedUser });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/users/me/avatar - Update logged-in user's profile picture (Authenticated users only)
router.put(
  "/me/avatar",
  authMiddleware.verifyToken, // Ensure the user is authenticated
  upload.single("avatar"), // Handle profile picture upload
  async (req, res) => {
    try {
      // Log the uploaded file info
      console.log(req.file); // Check if the file is being uploaded properly

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Save the avatar path
      const avatarPath = `/uploads/${req.file.filename}`;
      const updatedUser = await usersService.updateUserAvatar(
        req.user._id,
        avatarPath
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "Profile picture updated successfully",
        updatedUser,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/users/:userId - Get user by ID (Only Super Admins)
router.get(
  "/:userId",
  authMiddleware.verifyToken,
  authMiddleware.requireRole("superAdmin"), // Only Super Admins can view any user's profile
  async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await usersService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/users - Get all users (Only Super Admins)
router.get(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.requireRole("superAdmin"), // Only Super Admins can list all users
  async (req, res) => {
    try {
      const users = await usersService.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;

const User = require("../../models/User");

const usersService = {
  // Get user by ID
  getUserById: async (userId) => {
    const user = await User.findById(userId).select("-password"); // Exclude password from result
    return user;
  },

  // Get all users (for Super Admins)
  getAllUsers: async () => {
    return await User.find().select("-password"); // Exclude passwords from the user list
  },

  // Update user profile (username, email)
  updateUserProfile: async (userId, updates) => {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    user.username = updates.username || user.username;
    user.email = updates.email || user.email;

    await user.save();
    return user;
  },

  // Update user avatar
  updateUserAvatar: async (userId, avatarPath) => {
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    user.avatar = avatarPath;
    await user.save();
    return user;
  },
};

module.exports = usersService;

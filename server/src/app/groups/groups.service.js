const Group = require("../../models/Group");

const groupsService = {
  // Create a new group and set the creator as admin
  createGroup: async (name, description, creatorId) => {
    const group = new Group({
      name,
      description,
      admins: [creatorId], // Add the creator to the admins array
    });
    await group.save();
    return group;
  },

  // Get group by ID
  getGroupById: async (groupId) => {
    return await Group.findById(groupId).populate("admins", "username"); // Populate admin details
  },

  // Get all groups
  getAllGroups: async () => {
    return await Group.find().populate("admins", "username"); // Populate admin details
  },

  // Get groups accessible by the current user
  getAccessibleGroups: async (userId, isSuperAdmin) => {
    // If the user is a super admin, return all groups
    if (isSuperAdmin) {
      return await Group.find().populate("admins", "username");
    }

    // Otherwise, return groups where the user is an admin or a member
    return await Group.find({
      $or: [{ admins: userId }, { members: userId }],
    }).populate("admins", "username");
  },

  // Update group information (name, description)
  updateGroup: async (groupId, name, description) => {
    const group = await Group.findById(groupId);
    if (!group) {
      return null;
    }
    group.name = name;
    group.description = description;
    await group.save();
    return group;
  },

  // Delete a group by ID
  deleteGroup: async (groupId) => {
    const group = await Group.findByIdAndDelete(groupId);
    return group;
  },
};

module.exports = groupsService;

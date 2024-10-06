const Group = require("../../models/Group");
const User = require("../../models/User"); // Import the User model

const groupsService = {
  // Create a new group and set the creator as admin
  createGroup: async (name, description, creatorId) => {
    // Create a new group
    const group = new Group({
      name,
      description,
      admins: [creatorId], // Add the creator to the admins array
    });

    // Save the new group
    await group.save();

    // Add the newly created group to the creator's `groups` array
    await User.findByIdAndUpdate(creatorId, {
      $addToSet: { groups: group._id }, // Use $addToSet to prevent duplicates
    });

    return group;
  },

  // Get group by ID
  getGroupById: async (groupId) => {
    return await Group.findById(groupId).populate("admins", "username"); // Populate admin details
  },

  // Get all groups
  getAllGroups: async () => {
    return await Group.find()
      .populate("admins", "username") // Populate admin details
      .populate({
        path: "joinRequests", // Specify the path to joinRequests
        select: "username", // Populate only the username field
      });
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
    })
      .populate("admins", "username")
      .populate({
        path: "joinRequests", // Specify the path to joinRequests
        select: "username", // Populate only the username field
      });
  },

  // Update group information (name, description, joinRequests)
  updateGroup: async (groupId, name, description, joinRequestsAction) => {
    const group = await Group.findById(groupId);
    if (!group) {
      return null;
    }

    // Update the name and description if provided
    if (name !== group.name) group.name = name;
    if (description !== group.description) group.description = description;

    // Handle joinRequests actions (approve or reject a user)
    if (joinRequestsAction) {
      const { action, userId } = joinRequestsAction;

      // Find the user being approved/rejected
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (action === "approve") {
        // If approved, remove the user from joinRequests and add them to group members
        group.joinRequests = group.joinRequests.filter(
          (id) => id.toString() !== userId.toString()
        );

        // Check if user is already a member
        if (!group.members.includes(userId)) {
          group.members.push(userId); // Add user to group members
        }

        // Update the user's groups array to include the group
        if (!user.groups.includes(groupId)) {
          user.groups.push(groupId); // Add group to user's groups array
          await user.save(); // Save the updated user
        }
      } else if (action === "reject") {
        // If rejected, simply remove the user from joinRequests
        group.joinRequests = group.joinRequests.filter(
          (id) => id.toString() !== userId.toString()
        );
      }
    }

    // Save the updated group
    await group.save();
    return group;
  },

  // Delete a group by ID
  deleteGroup: async (groupId) => {
    const group = await Group.findByIdAndDelete(groupId);
    return group;
  },

  // Request to join a group
  requestToJoinGroup: async (groupId, userId) => {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    // Check if the user is already a member
    if (group.members.includes(userId)) {
      throw new Error("Already a member");
    }

    // Check if the user has already requested to join
    if (group.joinRequests.includes(userId)) {
      throw new Error("Request already sent");
    }

    // Add the user to the joinRequests array
    group.joinRequests.push(userId);
    await group.save();

    return group;
  },
};

module.exports = groupsService;

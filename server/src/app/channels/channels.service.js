const Channel = require("../../models/Channel");
const Group = require("../../models/Group");

const channelsService = {
  // Create a new channel and link it to the group
  createChannel: async (name, groupId) => {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    const channel = new Channel({ name, group: groupId });
    await channel.save();

    group.channels.push(channel._id);
    await group.save();

    return channel;
  },

  // Get a channel by its ID
  getChannelById: async (channelId) => {
    const channel = await Channel.findById(channelId);
    return channel;
  },

  // Get all channels for a specific group
  getChannelsByGroup: async (groupId) => {
    const group = await Group.findById(groupId).populate("channels");
    if (!group) {
      throw new Error("Group not found");
    }
    return group.channels;
  },

  // Update a channel's information
  updateChannel: async (channelId, name) => {
    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    channel.name = name;
    await channel.save();
    return channel;
  },

  // Delete a channel
  deleteChannel: async (channelId) => {
    const channel = await Channel.findByIdAndDelete(channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    return channel;
  },
};

module.exports = channelsService;

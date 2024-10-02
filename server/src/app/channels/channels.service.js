const fs = require("fs");
const path = require("path");

const groupsFilePath = path.join(__dirname, "../data/groups.json");

const channelService = {
  createChannel: (groupId, name) => {
    // const groups = readFromFile(groupsFilePath);
    const group = groups.find((g) => g.id === groupId);

    if (!group) {
      throw new Error("Group not found");
    }

    const newChannel = {
      id: group.channels.length + 1,
      name,
    };

    group.channels.push(newChannel);
    // writeToFile(groupsFilePath, groups);
  },

  deleteChannelById: (channelId) => {
    // const groups = readFromFile(groupsFilePath);

    for (const group of groups) {
      group.channels = group.channels.filter((c) => c.id !== channelId);
    }

    // writeToFile(groupsFilePath, groups);
  },
};

module.exports = channelService;

const fs = require("fs");
const path = require("path");

const groupsFilePath = path.join(__dirname, "../data/groups.json");

const groupService = {
  createGroup: (name, adminId) => {
    // const groups = readFromFile(groupsFilePath);

    const newGroup = {
      id: groups.length + 1,
      name,
      admins: [adminId],
      channels: [],
    };

    groups.push(newGroup);
    // writeToFile(groupsFilePath, groups);
  },

  getAllGroups: () => {
    // return readFromFile(groupsFilePath);
  },

  deleteGroupById: (groupId) => {
    // let groups = readFromFile(groupsFilePath);
    groups = groups.filter((g) => g.id !== groupId);
    // writeToFile(groupsFilePath, groups);
  },
};

module.exports = groupService;

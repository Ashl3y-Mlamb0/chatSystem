const fs = require("fs");
const path = require("path");

const usersFilePath = path.join(__dirname, "../../../data/users.json");

const authService = {
  login: (username, password) => {
    // const users = readFromFile(usersFilePath);
    const user = users.find((u) => u.username === username);

    if (!user || user.password !== password) {
      throw new Error("Invalid username or password");
    }

    return user;
  },

  register: (username, email, password) => {
    // const users = readFromFile(usersFilePath);

    if (users.some((u) => u.username === username || u.email === email)) {
      throw new Error("Username or email already exists");
    }

    const newUser = {
      id: users.length + 1,
      username,
      email,
      password,
      roles: ["user"],
      groups: [],
    };

    users.push(newUser);
    // writeToFile(usersFilePath, users);
  },
};

module.exports = authService;

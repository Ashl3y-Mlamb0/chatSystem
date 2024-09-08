// server/middleware/auth.middleware.js

const { readFromFile } = require('../utils/data');
const path = require('path');

const usersFilePath = path.join(__dirname, '../../data/users.json');

const authenticate = (req, res, next) => {
    const { username, password } = req.headers; // Assuming you're sending credentials in headers for now

    if (!username || !password) {
        return res.status(401).json({ error: 'Unauthorized - Missing credentials' });
    }

    const users = readFromFile(usersFilePath);
    const user = users.find(u => u.username === username);

    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Unauthorized - Invalid credentials' });
    }

    // Attach the authenticated user object to the request for further use in route handlers
    req.user = user;
    next();
};

module.exports = authenticate;
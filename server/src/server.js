const express = require('express');
const http = require('http');
const cors = require('cors');

const authRoutes = require('./app/auth/auth.routes');
const userRoutes = require('./app/users/users.routes');
const groupRoutes = require('./app/groups/groups.routes');
const channelRoutes = require('./app/channels/channels.routes');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Use the imported route handlers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/channels', channelRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
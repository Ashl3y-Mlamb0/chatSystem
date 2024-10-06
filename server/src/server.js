require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const authRoutes = require("./app/auth/auth.routes");
const userRoutes = require("./app/users/users.routes");
const groupRoutes = require("./app/groups/groups.routes");
const channelRoutes = require("./app/channels/channels.routes");
const messageRoutes = require("./app/messages/messages.routes");

const socketAuthMiddleware = require("./middleware/socketAuth.middleware");
const socketEvents = require("./socketEvents");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// MongoDB connection with Mongoose
const mongoURI =
  process.env.MONGO_URI || "mongodb://localhost:27017/chat_system";
mongoose
  .connect(mongoURI, {})
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Use the imported route handlers
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);

// Serve the uploads folder to make avatars accessible
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Socket.IO authentication middleware
io.use(socketAuthMiddleware); // Apply the auth middleware to every socket connection

// Handle socket events
io.on("connection", (socket) => {
  socketEvents(io, socket); // Import the socket events
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

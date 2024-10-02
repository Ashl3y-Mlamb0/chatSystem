// src/socketEvents.js
const Channel = require("./models/Channel");
const Message = require("./models/Message");
const User = require("./models/User");

module.exports = function (io, socket) {
  console.log(`User connected: ${socket.id}`);

  // Join a channel/room
  socket.on("joinChannel", async (channelId) => {
    try {
      const channel = await Channel.findById(channelId).populate("group");
      if (!channel) {
        return socket.emit("error", { message: "Channel not found" });
      }

      // Fetch the user
      const user = await User.findById(socket.user._id);
      if (!user) {
        return socket.emit("error", { message: "User not found" });
      }

      // Check if the user is a super admin, or if they belong to the group
      const isSuperAdmin = user.roles.includes("superAdmin");
      const isGroupMember = user.groups.includes(channel.group._id);

      if (!isSuperAdmin && !isGroupMember) {
        return socket.emit("error", {
          message: "You are not a member of this group",
        });
      }

      // Allow the user to join the channel
      socket.join(channelId);
      console.log(`User ${socket.user.username} joined channel: ${channelId}`);
      io.to(channelId).emit("userJoined", `User joined channel ${channelId}`);

      // Fetch the previous messages for the channel (e.g., last 50 messages)
      const messages = await Message.find({ channel: channelId })
        .sort({ createdAt: -1 }) // Sort by createdAt, latest first
        .limit(50) // Limit to the last 50 messages
        .populate("sender", "username avatar"); // Include sender details (username, avatar)

      // Send the previous messages to the user who joined the channel
      socket.emit("previousMessages", messages);
    } catch (error) {
      socket.emit("error", { message: "Error joining channel" });
    }
  });

  // Leave a channel
  socket.on("leaveChannel", (channelId) => {
    socket.leave(channelId);
    console.log(`User left channel: ${channelId}`);
    io.to(channelId).emit("userLeft", `User left channel ${channelId}`);
  });

  // Send a message to the channel
  socket.on("sendMessage", async (message) => {
    const { channelId, content } = message;

    try {
      const channel = await Channel.findById(channelId).populate("group");
      if (!channel) {
        return socket.emit("error", { message: "Channel not found" });
      }

      // Fetch the user
      const user = await User.findById(socket.user._id);
      if (!user) {
        return socket.emit("error", { message: "User not found" });
      }

      // Check if the user is a super admin, or if they belong to the group
      const isSuperAdmin = user.roles.includes("superAdmin");
      const isGroupMember = user.groups.includes(channel.group._id);

      if (!isSuperAdmin && !isGroupMember) {
        return socket.emit("error", {
          message: "You are not a member of this group",
        });
      }

      // Save the new message in the database
      const newMessage = await Message.create({
        content,
        sender: user._id,
        channel: channelId,
      });

      // Broadcast the new message to the channel
      io.to(channelId).emit("receiveMessage", {
        content: newMessage.content,
        sender: { username: user.username, avatar: user.avatar },
      });
      console.log(`Message sent to channel ${channelId}: ${content}`);
    } catch (error) {
      socket.emit("error", { message: "Error sending message" });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
};

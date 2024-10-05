const Message = require("../../models/Message");
const Channel = require("../../models/Channel");

const messagesService = {
  // Create a new message
  createMessage: async (content, senderId, channelId, imageUrl) => {
    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }

    const message = new Message({
      sender: senderId,
      content,
      channel: channelId,
      imageUrl: imageUrl || null, // Optional image attachment
    });

    await message.save();
    return message;
  },

  // Update message by ID
  updateMessage: async (messageId, content) => {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { content },
      { new: true }
    ).populate("sender", "username avatar"); // Populate sender with username and avatar fields

    if (!updatedMessage) {
      throw new Error("Message not found");
    }

    return updatedMessage;
  },

  // Get all messages for a specific channel
  getMessagesByChannel: async (channelId) => {
    const messages = await Message.find({ channel: channelId })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 }); // Sort by creation date
    return messages;
  },

  // Delete a message by ID
  deleteMessage: async (messageId) => {
    const message = await Message.findByIdAndDelete(messageId);
    return message;
  },
};

module.exports = messagesService;

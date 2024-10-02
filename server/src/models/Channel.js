const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // Belongs to a specific group
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }], // Array of messages
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", channelSchema);

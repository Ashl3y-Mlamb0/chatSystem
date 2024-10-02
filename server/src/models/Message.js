const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String }, // Message content
    imageUrl: { type: String }, // Optional image attachment
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" }, // Reference to the channel
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);

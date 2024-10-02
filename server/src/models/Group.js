const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user references
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Channel" }], // Array of channels
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);

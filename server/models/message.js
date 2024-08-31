const mongoose = require("mongoose")
const Schema = mongoose.Schema

const messageSchema = new Schema({
  type: String,
  text: { type: String, default: "" },
  images: [{ type: mongoose.Types.ObjectId, ref: "Media" }],
  links: [{ type: mongoose.Types.ObjectId, ref: "Media" }],
  game: { type: mongoose.Types.ObjectId, ref: "Game" },
  action: { type: mongoose.Types.ObjectId, ref: "Action" },
  from: { type: mongoose.Types.ObjectId, ref: "User" },
  chat: { type: mongoose.Types.ObjectId, ref: "Chat", required: true },
  timestamp: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Message", messageSchema)

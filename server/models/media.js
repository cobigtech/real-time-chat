const mongoose = require("mongoose")
const Schema = mongoose.Schema

// can be either an image or a link

const mediaSchema = new Schema({
  type: { type: String, required: true },
  url: { type: String, required: true },
  from: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  chat: { type: mongoose.Types.ObjectId, ref: "Chat", required: true },
  timestamp: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Media", mediaSchema)

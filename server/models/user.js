const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  avatar: { type: String, default: "" },
  bio: { type: String, default: "" },
  provider: { type: String },
  googleId: { type: String },
  githubId: { type: String },
  isOnline: { type: Boolean, required: true, default: false },
})

module.exports = mongoose.model("User", userSchema)

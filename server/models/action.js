const mongoose = require("mongoose")
const Schema = mongoose.Schema

const actionSchema = new Schema({
  type: { type: String, required: true },
  agent: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  subjects: { type: [{ type: mongoose.Types.ObjectId, ref: "User" }], length: { min: 1 } },
  value: { type: String },
})

module.exports = mongoose.model("Action", actionSchema)

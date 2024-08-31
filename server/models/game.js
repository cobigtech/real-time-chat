const mongoose = require("mongoose")
const Schema = mongoose.Schema

const winningPatterns = [
  "111000000",
  "000111000",
  "000000111",
  "100100100",
  "010010010",
  "001001001",
  "100010001",
  "001010100",
]

const gameSchema = new Schema({
  board: { type: Array, default: new Array(9).fill(null), required: true },
  status: { type: String, default: "waiting", required: true },
  players: [{ type: mongoose.Types.ObjectId, ref: "User", required: true }],
  startTurn: { type: Number, default: 0, required: true },
  turn: { type: Number, default: 0, required: true },
  from: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  chat: { type: mongoose.Types.ObjectId, ref: "Chat", required: true },
  scores: { type: Schema.Types.Mixed, required: true },
})

gameSchema.methods.switchTurn = function () {
  this.turn = Number(!this.turn)
}

gameSchema.methods.incrementScores = function (field) {
  ++this.scores[field]
  this.markModified(`scores.${field}`)
}

gameSchema.methods.end = function () {
  this.board = new Array(9).fill(null)
  this.startTurn = Number(!this.startTurn)
  this.turn = this.startTurn
}

gameSchema.virtual("win").get(function () {
  let winningPlayerId = null
  let winningPattern = null

  this.players.every((player, playerIndex) => {
    winningPatterns.every((pattern) => {
      let win = true
      pattern
        .split("")
        .map((square) => Number(square))
        .forEach((square, id) => {
          if (square === 1 && this.board[id] !== playerIndex) {
            win = false
          }
        })
      if (win) {
        winningPlayerId = player._id.toString()
        winningPattern = pattern
        return false
      }
      return true
    })
    if (winningPlayerId) {
      return false
    }
    return true
  })

  if (winningPlayerId && winningPattern) {
    return { playerId: winningPlayerId, pattern: winningPattern }
  }
})

gameSchema.virtual("draw").get(function () {
  return this.board.every((square) => square !== null)
})

module.exports = mongoose.model("Game", gameSchema)

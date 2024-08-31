const User = require("./models/user")
const Chat = require("./models/chat")
const Game = require("./models/game")
const Message = require("./models/message")

exports.handleLogin = async function (userId) {
  const socket = this
  socket.join(userId)
  socket.userId = userId
  await User.findByIdAndUpdate(userId, { isOnline: true })
  const chats = await Chat.find({ members: userId })
  chats.forEach((chat) => {
    const chatId = chat._id.toString()
    socket.join(chatId)
    socket.to(chatId).emit("user-connection", userId)
  })
}

exports.handleStartTyping = async function (chatId) {
  const socket = this
  socket.to(chatId).emit("start-typing", { userId: socket.userId, chatId })
}

exports.handleStopTyping = async function (chatId) {
  const socket = this
  socket.to(chatId).emit("stop-typing", { userId: socket.userId, chatId })
}

exports.handleDisconnect = async function () {
  const socket = this
  await User.findByIdAndUpdate(socket.userId, { isOnline: false })
  const chats = await Chat.find({ members: socket.userId })
  chats.forEach((chat) => {
    const chatId = chat._id.toString()
    socket.leave(chatId)
    socket.to(chatId).emit("user-disconnection", socket.userId)
  })

  // delete and update games status when players go offline
  const waitingGames = await Game.find({ players: socket.userId, status: "waiting" }).populate({ path: "players" })
  const runningGames = await Game.find({ players: socket.userId, status: "running" }).populate({ path: "players" })
  const offlineWaitingGames = waitingGames.filter((game) => game.players.every((player) => player.isOnline === false))
  const offlineRunningGames = runningGames.filter((game) => game.players.every((player) => player.isOnline === false))
  const gamesToBeDeleted = [
    ...offlineWaitingGames,
    ...offlineRunningGames.filter((game) => Object.keys(game.scores).every((score) => game.scores[score] === 0)),
  ]
  await Game.deleteMany({ _id: { $in: gamesToBeDeleted.map((game) => game._id) } })
  await Message.deleteMany({ game: { $in: gamesToBeDeleted.map((game) => game._id) } })
  const gamesToBeUpdated = offlineRunningGames.filter(
    (game) => gamesToBeDeleted.map((deletedGame) => deletedGame._id).includes(game._id) === false
  )
  await Game.updateMany({ _id: { $in: gamesToBeUpdated.map((game) => game._id) } }, { status: "over" })
}

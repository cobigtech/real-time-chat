const Game = require("../models/game")
const Chat = require("../models/chat")
const asyncHandler = require("express-async-handler")

exports.createGame = asyncHandler(async (req, res, next) => {
  const { io } = req
  const { chatId, from } = req.body
  const chat = await Chat.findById(chatId)

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" })
  }
  if (chat.members.length > 2) {
    return res.status(400).json({ message: "Game cannot be created on group chats" })
  }

  const firstTurn = chat.members.findIndex((userId) => userId.toString() !== from)

  const game = new Game({
    chat: chatId,
    players: chat.members,
    from,
    startTurn: firstTurn,
    turn: firstTurn,
    scores: { ...chat.members.reduce((acc, curr) => ({ ...acc, [curr._id]: 0 }), {}), draws: 0 },
  })

  await game.save()
  await game.populate({ path: "players", select: "-password" })

  req.game = game._id.toString()

  next()
})

exports.startGame = asyncHandler(async (req, res) => {
  const { io } = req
  const { gameId } = req.params
  const game = await Game.findById(gameId)

  game.status = "running"

  await game.save()
  await game.populate({ path: "players", select: "-password" })

  io.to(game.chat.toString()).emit("game-update", game)
  res.json({ game })
})

exports.playGame = asyncHandler(async (req, res) => {
  const { io } = req
  const { gameId } = req.params
  const { index } = req.body
  const userId = req.user._id.toString()
  const game = await Game.findById(gameId).populate({ path: "players", select: "-password" })

  if (!game) {
    return res.status(404).json({ message: "Game not found" })
  }
  if (game.board[index] !== null) {
    return res.status(400).json({ message: "Square already taken" })
  }
  if (game.players[game.turn]._id.toString() !== userId) {
    return res.status(400).json({ message: "Not your turn yet" })
  }

  game.board[index] = game.turn

  if (game.win) {
    io.to(game.chat.toString()).emit("game-update", { ...game.toObject(), win: game.win })
    game.incrementScores(game.win.playerId)
    game.end()
    await game.save()
    setTimeout(async () => {
      io.to(game.chat.toString()).emit("game-update", game)
      res.json({ game })
    }, 2000)
  } else if (game.draw) {
    io.to(game.chat.toString()).emit("game-update", { ...game.toObject(), draw: true })
    setTimeout(async () => {
      game.incrementScores("draws")
      game.end()
      await game.save()
      io.to(game.chat.toString()).emit("game-update", game)
      res.json({ game })
    }, 2000)
  } else {
    game.switchTurn()
    await game.save()
    io.to(game.chat.toString()).emit("game-update", game)
    res.json({ game })
  }
})

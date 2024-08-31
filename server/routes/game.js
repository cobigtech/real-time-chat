const express = require("express")
const router = express.Router()
const gameController = require("../controllers/game")
const messageController = require("../controllers/message")
const userController = require("../controllers/user")

router.post("/", userController.checkUserAuth, gameController.createGame, messageController.createMessage)

router.post("/:gameId/start", userController.checkUserAuth, gameController.startGame)

router.post("/:gameId/play", userController.checkUserAuth, gameController.playGame)

module.exports = router

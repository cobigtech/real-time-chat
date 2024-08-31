const express = require("express")
const router = express.Router()
const messageController = require("../controllers/message")
const userController = require("../controllers/user")

router.post("/", userController.checkUserAuth, messageController.createMessage)

module.exports = router

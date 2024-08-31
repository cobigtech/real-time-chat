const messageService = require("../services/message")
const asyncHandler = require("express-async-handler")
const { multerUpload } = require("../storage")

const upload = multerUpload("media/images")

exports.createMessage = [
  upload.array("images", 10),
  asyncHandler(async (req, res) => {
    try {
      const message = await messageService.createMessage({
        chatId: req.body.chatId,
        authUserId: req.user._id,
        text: req.body.text,
        files: req.files,
        game: req.game,
        io: req.io,
      })

      res.json(message)
    } catch (err) {
      console.log(err)
      res.status(err.status || 500).json({ message: err.message })
    }
  }),
]

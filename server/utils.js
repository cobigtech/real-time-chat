const { validationResult } = require("express-validator")

exports.findSocket = function (io, userId) {
  return (Array.from(io.sockets.sockets).find((socket) => socket[1].userId === userId) || [])[1]
}

exports.handleFormValidation = function (req, res) {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    return res.status(400).json({ message: result.array()[0].msg })
  }
}

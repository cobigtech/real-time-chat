const multer = require("multer")

const types = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]

function storage(path) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
      cb(null, uniqueSuffix + "-" + file.originalname)
    },
  })
}

exports.multerUpload = function upload(path) {
  return multer({
    storage: storage(path),
    limits: { fileSize: 2500000 },
    fileFilter: (req, file, cb) => {
      if (!types.includes(file.mimetype)) {
        return cb(new Error("File type is not allowed"))
      }
      cb(null, true)
    },
  })
}

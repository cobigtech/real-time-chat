require("dotenv").config()
const express = require("express")
const app = express()
const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, { cors: { origin: process.env.CLIENT_BASE_URL } })
const mongoose = require("mongoose")
const cors = require("cors")
const passport = require("passport")
const compression = require("compression")
const helmet = require("helmet")
const RateLimit = require("express-rate-limit")

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(compression())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }))
const limiter = RateLimit({ windowMs: 1 * 60 * 1000, max: 300 })
app.use(limiter)
app.use(
  cors({
    origin: process.env.CLIENT_BASE_URL,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
    optionsSuccessStatus: 200,
  })
)
app.use(passport.initialize())
app.use((req, res, next) => {
  req.io = io
  next()
})

app.use("/media/avatars", express.static("media/avatars"))
app.use("/media/images", express.static("media/images"))
app.use("/media/groups", express.static("media/groups"))

// connect to db
const mongoDb = process.env.MONGODB_URL
const main = async () => mongoose.connect(mongoDb)
main()
  .then(() => console.log("db connected"))
  .catch((err) => console.log(err))

const handlers = require("./handlers")

io.on("connection", (socket) => {
  socket.on("login", handlers.handleLogin)
  socket.on("start-typing", handlers.handleStartTyping)
  socket.on("stop-typing", handlers.handleStopTyping)
  socket.on("disconnect", handlers.handleDisconnect)
})

const userRouter = require("./routes/user")
const messageRouter = require("./routes/message")
const chatRouter = require("./routes/chat")
const gameRouter = require("./routes/game")
app.use("/api/user", userRouter)
app.use("/api/message", messageRouter)
app.use("/api/chat", chatRouter)
app.use("/api/game", gameRouter)

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))

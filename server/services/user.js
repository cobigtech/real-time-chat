const User = require("../models/user")
const Chat = require("../models/chat")
const Message = require("../models/message")
const chatService = require("./chat")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const CustomError = require("../customError")
const messageService = require("./message")

exports.registerUser = async (name, email, password, io) => {
  const hashedPassword = bcrypt.hashSync(password, 12)
  const user = new User({ name, email, password: hashedPassword })
  await user.save()
  await exports.handleUserRegister(user._id.toString(), io)
}

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new CustomError("Invalid email or password", 400)
  }
  const passwordMatch = bcrypt.compareSync(password, user.password)
  if (!passwordMatch) {
    throw new CustomError("Invalid email or password", 400)
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
  return token
}

exports.updateUser = async (authUserId, userId, name, bio, file, prevAvatar) => {
  if (authUserId !== userId) {
    throw new CustomError("Action forbidden, you cannot update this user", 403)
  }
  const avatar = (file && file.path) || prevAvatar
  const updatedUser = await User.findByIdAndUpdate(userId, { name, bio, avatar }, { new: true }).select("-password")
  if (!updatedUser) {
    throw new CustomError("User not found", 404)
  }
  return updatedUser
}

exports.deleteUser = async (authUserId, userId) => {
  if (authUserId !== userId) {
    throw new CustomError("Action forbidden, you cannot delete this user", 403)
  }
  const deletedUser = await User.findByIdAndDelete(userId).select("-password")
  if (!deletedUser) {
    throw new CustomError("User not found", 404)
  }
  return deletedUser
}

exports.searchUser = async (term, authUserId) => {
  if (!term) {
    return []
  }
  const formattedTerm = term
    .toLowerCase()
    .split("")
    .map((char) => ("^!@#$%^&*()-_=+[\\]{};:'\",.<>?/\\|`~".includes(char) ? "\\" + char : char))
    .join("")
  const results = await User.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              { name: { $regex: "^" + formattedTerm, $options: "i" } },
              { email: { $regex: "^" + formattedTerm, $options: "i" } },
            ],
          },
          {
            // remove authUser from search results
            _id: { $ne: new mongoose.Types.ObjectId(authUserId) },
          },
        ],
      },
    },
    {
      $unset: "password",
    },
  ]).limit(5)
  return results
}

const addUserToGlobalChat = async (userId, io) => {
  const CREATOR_USER_ID = process.env.CREATOR_USER_ID

  if (!CREATOR_USER_ID) return null

  let globalChat = await Chat.findOne({ title: "Global chat", admin: CREATOR_USER_ID })
  if (!globalChat) {
    globalChat = await chatService.createGlobalChat(io)
  } else {
    chatService.addUserToChat(globalChat._id.toString(), userId)
  }

  await messageService.createActionMessage({ chatId: globalChat._id.toString(), type: "join", agentId: userId, io })

  return Promise.resolve()
}

const greetUser = async (userId, io) => {
  const user = await User.findById(userId)

  if (!user) {
    throw new CustomError("User not found", 404)
  }

  const text = `Hi ${user.name}! Thank's for trying out my app. You can check my other projects at https://github.com/nelrnd 😁✌️`

  setTimeout(async () => {
    const CREATOR_USER_ID = process.env.CREATOR_USER_ID

    if (CREATOR_USER_ID) {
      const members = [CREATOR_USER_ID, userId]

      let chat = await Chat.findOne({ members: { $all: members }, type: "private" })
      let greetMessage = chat && (await Message.findOne({ chat: chat._id, from: CREATOR_USER_ID, text: text }))

      if (!chat) {
        chat = await chatService.createChat({ members, authUserId: CREATOR_USER_ID, io })
      }

      if (!greetMessage) {
        greetMessage = await messageService.createMessage({
          chatId: chat._id.toString(),
          authUserId: CREATOR_USER_ID,
          text,
          files: [],
          io,
        })
      }
    }
  }, 4000)
}

exports.handleUserRegister = async (userId, io) => {
  await addUserToGlobalChat(userId, io)
  greetUser(userId, io)
}

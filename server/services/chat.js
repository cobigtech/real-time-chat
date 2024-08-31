const Chat = require("../models/chat")
const User = require("../models/user")
const Message = require("../models/message")
const Media = require("../models/media")
const messageService = require("./message")
const he = require("he")
const { findSocket } = require("../utils")
const CustomError = require("../customError")

exports.createChat = async ({ type, title, desc, members, admin, authUserId, io }) => {
  members = Array.from(new Set(members))

  if (members.length < 2) {
    throw new CustomError("Chat must contain at least 2 members", 400)
  }

  if (!members.includes(authUserId)) {
    throw new CustomError("Chat must contain auth user", 400)
  }

  const lastViewed = members.reduce((acc, curr) => ({ ...acc, [curr]: Date.now() }), {})

  type = type || (members.length === 2 ? "private" : "group")
  let chat = new Chat({ type, members, lastViewed, title, desc, admin })
  await chat.save()
  await chat.populate({ path: "members", select: "-password" })

  let firstMessage
  if (type === "group") {
    const actionMessage = await messageService.createActionMessage({
      chatId: chat._id.toString(),
      type: "create",
      agentId: authUserId,
      io,
    })
    firstMessage = actionMessage.message
  }
  const unreadCount = await chat.getUnreadCount(authUserId)

  chat = chat.toObject()
  chat.unreadCount = unreadCount
  chat.messages = firstMessage ? [firstMessage] : []
  chat.images = []
  chat.links = []
  chat.typingUsers = []

  emitNewChat(chat, authUserId, io)

  return chat
}

exports.createGlobalChat = async (io) => {
  const CREATOR_USER_ID = process.env.CREATOR_USER_ID

  if (!CREATOR_USER_ID) return null

  const users = await User.find({})
  const userIds = users.map((user) => user._id.toString())

  const globalChat = await exports.createChat({
    type: "group",
    members: userIds,
    title: "Global chat",
    desc: "Global chat of the app, have fun ;)",
    admin: CREATOR_USER_ID,
    authUserId: CREATOR_USER_ID,
    io,
  })

  await messageService.createMessage({
    chatId: globalChat._id.toString(),
    authUserId: CREATOR_USER_ID,
    text: "Welcome to the global chat!",
    files: [],
    io,
  })

  return globalChat
}

const emitNewChat = (chat, authUserId, io) => {
  chat.members.forEach((member) => {
    const userId = member._id.toString()
    const socket = findSocket(io, userId)
    if (socket) {
      socket.join(chat._id.toString())
      if (userId !== authUserId) {
        io.to(userId).emit("new-chat", chat)
      }
    }
  })
}

exports.updateChat = async (chatId, authUserId, title, desc, members, file, prevImage, io) => {
  let chat = await Chat.findById(chatId).populate({ path: "members", select: "-password" })
  if (!chat) {
    throw new CustomError("Chat not found", 404)
  }
  if (chat.admin.toString() !== authUserId) {
    throw new CustomError("Forbidden, cannot update chat", 403)
  }
  const image = (file && file.path) || prevImage

  await exports.createActionMessagesFromChatUpdate(chatId, authUserId, title, desc, image, members, io)

  if (members?.length) {
    const addedUsers = members.filter((user) => !chat.members.map((user) => user._id.toString()).includes(user._id))
    if (addedUsers?.length) {
      emitChatJoin(chatId, addedUsers, io)
    }

    const removedUsers = chat.members.filter((user) => !members.map((user) => user._id).includes(user._id.toString()))
    if (removedUsers?.length) {
      removedUsers.forEach((user) => {
        const userId = user._id.toString()
        io.to(userId).emit("chat-delete", chatId)
        const socket = findSocket(io, userId)
        if (socket) {
          socket.leave(chat._id.toString())
        }
      })
    }
  }

  chat = await Chat.findByIdAndUpdate(chatId, { title, desc, members, image }, { new: true })
    .select(`title desc image ${members ? "members" : ""}`)
    .populate({ path: "members", select: "-password" })

  emitUpdatedChat(chat, chatId, authUserId, io)
  return chat
}

exports.createActionMessagesFromChatUpdate = async (chatId, authUserId, title, desc, image, members, io) => {
  let chat = await Chat.findById(chatId).populate({ path: "members", select: "-password" })
  if (!chat) {
    throw new CustomError("Chat not found", 404)
  }
  if (chat.admin.toString() !== authUserId) {
    throw new CustomError("Forbidden, cannot update chat", 403)
  }

  if (title && title !== chat.title) {
    await messageService.createActionMessage({ chatId, type: "update-title", agentId: authUserId, value: title, io })
  }

  if (title === "" && chat.title) {
    await messageService.createActionMessage({ chatId, type: "remove-title", agentId: authUserId, io })
  }

  if (desc && desc !== chat.desc) {
    await messageService.createActionMessage({ chatId, type: "update-desc", agentId: authUserId, io })
  }

  if (desc === "" && chat.desc) {
    await messageService.createActionMessage({ chatId, type: "remove-desc", agentId: authUserId, io })
  }

  if (image && image !== chat.title) {
    await messageService.createActionMessage({ chatId, type: "update-image", agentId: authUserId, io })
  }

  if (image === "" && chat.image) {
    await messageService.createActionMessage({ chatId, type: "remove-image", agentId: authUserId, io })
  }

  if (members && members.length) {
    const addedUsers = members.filter((user) => !chat.members.map((user) => user._id.toString()).includes(user._id))
    const removedUsers = chat.members.filter((user) => !members.map((user) => user._id).includes(user._id.toString()))

    if (addedUsers.length) {
      await messageService.createActionMessage({
        chatId,
        type: "add",
        agentId: authUserId,
        subjectIds: addedUsers,
        io,
      })
    }

    if (removedUsers.length) {
      await messageService.createActionMessage({
        chatId,
        type: "remove",
        agentId: authUserId,
        subjectIds: removedUsers,
        io,
      })
    }
  }
}

const emitUpdatedChat = (updatedChat, chatId, authUserId, io) => {
  io.to(chatId).except(authUserId).emit("chat-update", chatId, updatedChat)
}

const emitChatJoin = async (chatId, newMembers, io) => {
  let [chat, messages, images, links] = await Promise.all([
    Chat.findById(chatId).populate({ path: "members", select: "-password" }),
    Message.find({ chat: chatId })
      .populate({ path: "images", populate: { path: "from", select: "-password" } })
      .populate({ path: "from", select: "-password" })
      .populate({
        path: "action",
        populate: [
          { path: "agent", select: "-password" },
          { path: "subjects", select: "-password" },
        ],
      })
      .populate({ path: "game", populate: { path: "players", select: "-password" } })
      .lean(),
    Media.find({ type: "image", chat: chatId }).populate({ path: "from", select: "-password" }).lean(),
    Media.find({ type: "link", chat: chatId }).populate({ path: "from", select: "-password" }).lean(),
  ])

  if (newMembers.length) {
    await Promise.all(
      newMembers.map(async (user) => {
        const userId = user._id.toString()
        const unreadCount = await chat.getUnreadCount(userId)
        const socket = findSocket(io, userId)
        if (socket) {
          socket.join(chatId)
          let formattedChat = JSON.parse(he.decode(JSON.stringify(chat)))
          formattedChat = {
            ...formattedChat,
            messages,
            images,
            links,
            typingUsers: [],
            unreadCount,
          }
          io.to(userId).emit("new-chat", formattedChat)
        }
      })
    )
  }
}

exports.getChatList = async (authUserId) => {
  let chats = await Chat.find({ members: authUserId }).populate({ path: "members", select: "-password" })

  const chatIds = chats.map((chat) => chat._id.toString())

  const [messages, images, links] = await Promise.all([
    Message.find({ chat: { $in: chatIds } })
      .populate({ path: "images", populate: { path: "from", select: "-password" } })
      .populate({ path: "from", select: "-password" })
      .populate({
        path: "action",
        populate: [
          { path: "agent", select: "-password" },
          { path: "subjects", select: "-password" },
        ],
      })
      .populate({ path: "game", populate: { path: "players", select: "-password" } })
      .lean(),
    Media.find({ type: "image", chat: { $in: chatIds } })
      .populate({ path: "from", select: "-password" })
      .lean(),
    Media.find({ type: "link", chat: { $in: chatIds } })
      .populate({ path: "from", select: "-password" })
      .lean(),
  ])

  const [messagesMap, imagesMap, linksMap] = [messages, images, links].map((type) =>
    type.reduce((map, item) => {
      map[item.chat.toString()] = map[item.chat.toString()] || []
      map[item.chat.toString()].push(item)
      return map
    }, {})
  )

  let unreadCounts = await Promise.all(
    chats.map(async (chat) => {
      const unreadCount = await chat.getUnreadCount(authUserId)
      return { id: chat._id, unreadCount }
    })
  )

  unreadCounts = unreadCounts.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.unreadCount }), {})

  chats = JSON.parse(he.decode(JSON.stringify(chats)))

  chats = chats.map((chat) => ({
    ...chat,
    messages: messagesMap[chat._id.toString()] || [],
    images: imagesMap[chat._id.toString()] || [],
    links: linksMap[chat._id.toString()] || [],
    typingUsers: [],
    unreadCount: unreadCounts[chat._id.toString()],
  }))

  return chats
}

exports.readChat = async (authUserId, chatId) => {
  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { $set: { [`lastViewed.${authUserId}`]: Date.now() } },
    { new: true }
  )
  if (!chat) {
    throw new CustomError("Chat not found", 404)
  }
  return chat
}

exports.addUserToChat = async (chatId, userId) => {
  const [chat, user] = await Promise.all([Chat.findById(chatId), User.findById(userId)])

  if (!chat) {
    throw new CustomError("Chat not found", 404)
  }
  if (!user) {
    throw new CustomError("User not found", 404)
  }
  if (chat.members.includes(user._id.toString())) {
    throw new CustomError("User is already a member of the chat", 400)
  }

  chat.members.push(user._id.toString())
  chat.lastViewed[user._id.toString()] = new Date(0)
  chat.markModified("members")
  chat.markModified("lastViewed")
  await chat.save()
  return chat
}

exports.deleteChat = async (chatId, authUserId, io) => {
  const chat = await Chat.findById(chatId)
  if (!chat) {
    throw new CustomError("Chat not found", 404)
  }
  if (chat.admin.toString() !== authUserId) {
    throw new CustomError("Cannot delete chat, permission denied", 403)
  }
  io.to(chatId).emit("chat-delete", chatId)
  const deletedChat = await Chat.findByIdAndDelete(chatId)
  return deletedChat
}

exports.removeUserFromChat = async (chatId, userId, authUserId, io) => {
  const [chat, user] = await Promise.all([
    Chat.findById(chatId).populate({ path: "members", select: "-password" }),
    User.findById(userId),
  ])

  if (!chat) {
    throw new CustomError("Chat not found", 404)
  }
  if (!user) {
    throw new CustomError("User not found", 404)
  }
  if (!chat.members.map((user) => user._id.toString()).includes(userId)) {
    throw new CustomError("User is not present in chat", 400)
  }
  if (userId !== authUserId && userId !== chat.admin.toString()) {
    throw new CustomError("Cannot remove user, permission denied", 403)
  }

  const index = chat.members.findIndex((member) => member._id.toString() === userId)
  chat.members.splice(index, 1)
  delete chat.lastViewed[userId]
  chat.markModified("members")
  chat.markModified("lastViewed")
  await chat.save()

  if (authUserId !== userId) {
    await messageService.createActionMessage({ chatId, type: "remove", agentId: authUserId, subjectIds: [userId], io })
  } else {
    await messageService.createActionMessage({ chatId, type: "leave", agentId: userId, io })
  }

  io.to(userId).emit("chat-delete", chatId)
  io.to(chatId).except(userId).emit("chat-update", chatId, { members: chat.members })

  return chat
}

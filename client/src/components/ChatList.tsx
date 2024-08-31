import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useChats } from "../providers/ChatProvider"
import Avatar, { GroupAvatar } from "./Avatar"
import { useAuth } from "@/providers/AuthProvider"
import { Chat } from "@/types"
import { BiImageAlt, BiJoystick } from "react-icons/bi"
import Loader from "./Loader"
import { getChatName, sortChats } from "@/utils"
import { formatIsTyping } from "@/utils"
import { getActionText } from "./Message"

export default function ChatList() {
  const { chatId } = useParams()
  const { chats, loading } = useChats()

  const filterChats = (chat: Chat) => chat.messages.length > 0 || chat._id === chatId

  const filteredAndSortedChats = chats.filter(filterChats).sort(sortChats)

  if (loading) return <Loader />

  return filteredAndSortedChats.length ? (
    <ul className="space-y-1">
      {filteredAndSortedChats.map((chat) => (
        <ChatTab key={chat._id} chat={chat} />
      ))}
    </ul>
  ) : (
    <p className="text-neutral-400 text-center">No chats for now</p>
  )
}

function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp).getTime() / 1000
  const now = new Date().getTime() / 1000

  if (now - date >= 31536000) {
    const diff = Math.floor(now / 31536000) - Math.floor(date / 31536000)
    return diff + "y"
  } else if (now - date >= 2678400) {
    const diff = Math.floor(now / 2678400) - Math.floor(date / 2678400)
    return diff + "mo"
  } else if (now - date >= 604800) {
    const diff = Math.floor(now / 604800) - Math.floor(date / 604800)
    return diff + "w"
  } else if (now - date >= 86400) {
    const diff = Math.floor(now / 86400) - Math.floor(date / 86400)
    return diff + "d"
  } else if (now - date >= 3600) {
    const diff = Math.floor(now / 3600) - Math.floor(date / 3600)
    return diff + "h"
  } else if (now - date >= 60) {
    const diff = Math.floor(now / 60) - Math.floor(date / 60)
    return diff + "m"
  } else {
    return "now"
  }
}

interface ChatTabProps {
  chat: Chat
}

function ChatTab({ chat }: ChatTabProps) {
  const { chatId } = useParams()
  const { authUser } = useAuth()
  const otherMembers = chat.members.filter((user) => user._id !== authUser?._id)
  const lastMessage = chat.messages[chat.messages.length - 1]
  const isTyping = chat.typingUsers.filter((userId) => userId !== authUser?._id)
  const [formattedRelativeTime, setFormattedRelativeTime] = useState("")

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    if (lastMessage) {
      setFormattedRelativeTime(formatRelativeTime(lastMessage.timestamp))
      interval = setInterval(() => {
        setFormattedRelativeTime(formatRelativeTime(lastMessage.timestamp))
      }, 60000)
    }

    return () => clearInterval(interval)
  }, [lastMessage])

  if (otherMembers.length === 0) {
    return null
  }

  return (
    <li>
      <Link to={`/chat/${chat._id}`} className="group">
        <div
          className={`p-3 flex gap-3 items-center rounded-lg border ${
            chatId === chat._id ? "border-neutral-800 bg-neutral-900" : "border-transparent"
          } hover:bg-neutral-900 transition-colors`}
        >
          <ChatAvatar chat={chat} />

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{chat.title || getChatName(otherMembers, chat.type)}</h3>
            <div className={`${chat.unreadCount ? "text-white font-medium" : "text-neutral-400"} `}>
              {isTyping.length ? (
                formatIsTyping(chat, isTyping, "short")
              ) : lastMessage ? (
                <div className="flex items-center gap-1">
                  {lastMessage.type === "game" && (
                    <>
                      <BiJoystick className="relative top-[2px]" />
                      <span className="italic">game</span>
                    </>
                  )}
                  {lastMessage.type === "normal" && (
                    <>
                      {chat.type === "group" && (
                        <span>{lastMessage.from._id === authUser?._id ? "You" : lastMessage.from.name}: </span>
                      )}
                      {lastMessage.images.length > 0 && <BiImageAlt />}
                      <div className="flex-1 min-w-0 truncate">
                        {lastMessage.images.length > 0 && !lastMessage.text && (
                          <span className="italic">{lastMessage.images.length > 1 ? "images" : "image"}</span>
                        )}
                        {lastMessage.text}
                      </div>
                    </>
                  )}
                  {lastMessage.type === "action" && (
                    <p className="flex-1 min-w-0 truncate">{getActionText(lastMessage.action)}</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {lastMessage && (
            <div className="space-y-1">
              <p className={`text-xs ${chat.unreadCount ? "text-white" : "text-neutral-400"}`}>
                {formattedRelativeTime}
              </p>
              <UnreadBadge count={chat.unreadCount} />
            </div>
          )}
        </div>
      </Link>
    </li>
  )
}

interface UnreadBadgeProps {
  count: number
}

function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count === 0) return null

  return (
    <div className="bg-indigo-600 text-white w-5 h-5 ml-auto rounded-full grid place-content-center">
      <span className="text-xs leading-none tracking-tighter">{count < 100 ? count : "99+"}</span>
    </div>
  )
}

interface ChatAvatarProps {
  chat: Chat
}

function ChatAvatar({ chat }: ChatAvatarProps) {
  const { authUser } = useAuth()
  const { chatId } = useParams()
  const selected = chatId === chat._id

  const otherMembers = chat.members.filter((user) => user._id !== authUser?._id)

  if (!otherMembers) return null

  return (
    <div className="relative">
      {chat.type === "private" ? (
        <Avatar src={otherMembers[0].avatar} />
      ) : (
        <GroupAvatar image={chat.image} members={otherMembers} />
      )}
      {chat.type === "private" && otherMembers[0].isOnline && <OnlineBadge selected={selected} />}
    </div>
  )
}

interface OnlineBadgeProps {
  selected: boolean
}

function OnlineBadge({ selected }: OnlineBadgeProps) {
  return (
    <div className="w-fit h-fit absolute right-0 bottom-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="8"
          cy="8"
          r="8"
          className={`fill-neutral-950 group-hover:fill-neutral-900 transition-all ${selected && "fill-neutral-900"}`}
        />
        <circle cx="8" cy="8" r="6" fill="#86EFAC" />
        <circle cx="8" cy="8" r="5" fill="#22C55E" />
      </svg>
    </div>
  )
}

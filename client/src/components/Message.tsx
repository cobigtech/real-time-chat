import moment from "moment"
import { Action, Media, Message as MessageType, User } from "../types"
import { useAuth } from "../providers/AuthProvider"
import Avatar from "./Avatar"
import { ImageWrapper } from "@/providers/ImageViewerProvider"
import Game from "./Game"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL

function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          href={part}
          key={index}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold hover:underline inline-block break-all"
        >
          <span>{part}</span>
        </a>
      )
    }
    return part
  })
}

interface MessageProps {
  message: MessageType
  chatType: "private" | "group"
  followed: boolean
}

export default function Message({ message, chatType, followed }: MessageProps) {
  const { authUser } = useAuth()
  const fromMe = message.from?._id === authUser?._id

  return (
    <li className={`w-full flex gap-3 items-end ${followed ? "mb-2" : "mb-4"}`}>
      {chatType === "group" && message.type === "normal" && !fromMe && (
        <div className="w-[2.625rem]">{!followed && <Avatar src={message.from.avatar} className="w-full" />}</div>
      )}
      {message.type === "action" && <ActionMessage message={message} />}
      {message.game && (
        <div className="w-full space-y-2 flex flex-col justify-end items-end">
          <Game game={message.game} />
          <MessageMeta message={message} chatType={chatType} fromMe={fromMe} />
        </div>
      )}
      {message.type === "normal" && (
        <div className={`max-w-[80%] space-y-2 ${fromMe && "ml-auto flex flex-col items-end"}`}>
          {message.images?.map((image) => (
            <MessageImage key={image._id} image={image} />
          ))}
          {message.text && <MessageContent text={message.text} fromMe={fromMe} />}
          {!followed && <MessageMeta message={message} chatType={chatType} fromMe={fromMe} />}
        </div>
      )}
    </li>
  )
}

function formatSubjects(subjects?: User[]) {
  if (!subjects || !subjects.length) return null
  if (subjects.length === 1) return subjects[0].name
  return subjects.reduce(
    (acc, curr, id, arr) => acc + (id === arr.length - 1 ? " and " : acc ? ", " : "") + curr.name,
    ""
  )
}

export function getActionText(action: Action) {
  switch (action.type) {
    case "create":
      return (action.agent?.name || "someone") + " created the chat"
    case "add":
      return (action.agent?.name || "someone") + " added " + formatSubjects(action.subjects)
    case "remove":
      return (action.agent?.name || "someone") + " removed " + formatSubjects(action.subjects)
    case "join":
      return (action.agent?.name || "someone") + " joined the chat"
    case "leave":
      return (action.agent?.name || "someone") + " left the chat"
    case "update-title":
      return (action.agent?.name || "someone") + " updated the chat title to " + '"' + action.value + '"'
    case "remove-title":
      return (action.agent?.name || "someone") + " removed chat title"
    case "update-desc":
      return (action.agent?.name || "someone") + " updated the chat description"
    case "remove-desc":
      return (action.agent?.name || "someone") + " removed the chat description"
    case "update-image":
      return (action.agent?.name || "someone") + " updated the chat image"
    case "remove-image":
      return (action.agent?.name || "someone") + " removed the chat image"
    default:
      return ""
  }
}

interface ActionMessageProps {
  message: MessageType
}

function ActionMessage({ message }: ActionMessageProps) {
  if (!message.action) return null

  return (
    <p className="w-full text-neutral-400 text-center text-sm">
      {getActionText(message.action)} - {moment(message.timestamp).format("LT")}
    </p>
  )
}

interface MessageContentProps {
  text: string
  fromMe: boolean
}

function MessageContent({ text, fromMe }: MessageContentProps) {
  return (
    <div
      className={`w-fit max-w-full px-4 py-3 rounded-md ${
        fromMe ? "bg-indigo-600 rounded-br-none" : "bg-neutral-800 rounded-bl-none"
      }`}
    >
      {linkify(text)}
    </div>
  )
}

interface MessageImageProps {
  image: Media
}

function MessageImage({ image }: MessageImageProps) {
  return (
    <ImageWrapper image={image}>
      <div className="h-[12rem] md:h-[16rem] w-auto max-w-full overflow-hidden rounded-2xl shadow-xl">
        <img src={SERVER_BASE_URL + "/" + image.url} alt="" className="block h-[12rem] md:h-[16rem] object-cover" />
      </div>
    </ImageWrapper>
  )
}

interface MessageMetaProps {
  message: MessageType
  chatType: "private" | "group"
  fromMe: boolean
}

function MessageMeta({ message, chatType, fromMe }: MessageMetaProps) {
  return (
    <div className={`w-fit text-xs text-neutral-400`}>
      {chatType === "group" && !fromMe && message.from.name + " • "} {moment(message.timestamp).format("LT")}
    </div>
  )
}

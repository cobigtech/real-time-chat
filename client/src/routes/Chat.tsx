import { useEffect, useLayoutEffect, useRef } from "react"
import { Link, useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import { useAuth } from "../providers/AuthProvider"
import IsTypingFeedback from "../components/IsTypingFeedback"
import MessageList from "../components/MessageList"
import { getChatName } from "../utils"
import ChatForm from "../components/ChatForm"
import Loader from "@/components/Loader"
import ChatInfo from "@/components/ChatInfo"
import { Chat as ChatType, Message } from "@/types"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Button } from "@/components/ui/button"
import { BiArrowBack } from "react-icons/bi"

export default function Chat() {
  const { chatId } = useParams()
  const { authUser } = useAuth()
  const { chat, loading, readMessages } = useChat(chatId)

  useEffect(() => {
    if (chat?.unreadCount) {
      readMessages(chat._id)
    }
  }, [chatId, chat, authUser, readMessages])

  if (loading) return <Loader />

  if (!chat) return <ChatNotFound />

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ChatHeader chat={chat} />
      <ChatMessages messages={chat.messages} chatType={chat.type} />
      <IsTypingFeedback />
      <ChatFooter />
    </div>
  )
}

interface ChatHeaderProps {
  chat: ChatType
}

export function splitText(text: string) {
  return text.split(" ").map((word, wordIndex) => (
    <span key={wordIndex} className="whitespace-nowrap">
      {word.split("").map((char, charIndex) => (
        <span key={charIndex} className="char inline-block">
          {char}
        </span>
      ))}
      {wordIndex < text.split(" ").length - 1 && <span className="whitespace-pre inline">&nbsp;</span>}
    </span>
  ))
}

function ChatHeader({ chat }: ChatHeaderProps) {
  const { authUser } = useAuth()
  const otherMembers = chat.members.filter((user) => user._id !== authUser?._id)

  const heading = useRef(null)

  useGSAP(
    () => {
      gsap.from(".char", { duration: 0.25, stagger: 0.05, ease: "power1.out", y: 10, opacity: 0, rotateY: 40 })
    },
    { scope: heading, dependencies: [chat._id], revertOnUpdate: true }
  )

  return (
    <header className="h-[6rem] p-3 md:p-6 flex justify-between items-center gap-4 border-b border-neutral-800">
      <Button variant="secondary" size="icon" className="md:hidden" asChild>
        <Link to="/chat">
          <BiArrowBack />
          <span className="sr-only">Go back to main page</span>
        </Link>
      </Button>
      <div className="flex-1">
        <h1
          ref={heading}
          className="scroll-m-20 text-2xl md:text-3xl font-semibold tracking-tight first:mt-0 leading-none whitespace-normal"
          style={{ wordBreak: "break-word" }}
        >
          {splitText(chat.title || getChatName(otherMembers, chat.type))}
        </h1>
        {otherMembers.length === 1 && otherMembers[0].isOnline && <p className="text-sm text-neutral-400">Online</p>}
      </div>
      <ChatInfo chat={chat} />
    </header>
  )
}

interface ChatMessages {
  messages: Message[]
  chatType: "private" | "group"
}

function ChatMessages({ messages, chatType }: ChatMessages) {
  const { chatId } = useParams()
  const elem = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    setTimeout(() => {
      if (elem.current) {
        elem.current.scrollTo(0, elem.current.scrollHeight)
      }
    }, 10)
  }, [chatId])

  return (
    <section className="px-3 md:px-6 pb-0 flex-1 overflow-y-auto" id="messages" ref={elem}>
      <MessageList messages={messages} chatType={chatType} />
    </section>
  )
}

function ChatFooter() {
  return (
    <footer className="p-3 md:p-6 md:pt-3">
      <ChatForm />
    </footer>
  )
}

function ChatNotFound() {
  return (
    <div className="absolute inset-0 grid place-content-center">
      <h2 className="text-4xl font-semibold text-neutral-200 tracking-tight">Chat not found</h2>
    </div>
  )
}

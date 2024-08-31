import { useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import { formatIsTyping } from "@/utils"

export default function IsTypingFeedback() {
  const { chatId } = useParams()
  const { chat } = useChat(chatId)

  if (chat?.typingUsers.length === 0) return null

  return (
    <div className="px-6">
      <p className="w-[40rem] m-auto">{formatIsTyping(chat, chat?.typingUsers || [])}</p>
    </div>
  )
}

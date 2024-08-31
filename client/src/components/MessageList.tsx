import moment from "moment"
import { Message as MessageType } from "../types"
import Message from "./Message"

function splitMessagesIntoDays(messages: MessageType[]): MessageType[][] {
  return messages.reduce((acc: MessageType[][], curr: MessageType, id: number, arr: MessageType[]) => {
    const prevDate = arr[id - 1] && new Date(arr[id - 1].timestamp).toLocaleDateString("sv")
    const currDate = new Date(curr.timestamp).toLocaleDateString("sv")
    if (prevDate !== currDate) {
      return [...acc, [curr]]
    } else {
      const newAcc: MessageType[][] = acc.length ? [...acc] : [[]]
      newAcc[newAcc.length - 1].push(curr)
      return newAcc
    }
  }, [])
}

function formatDay(timestamp: string): string {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toLocaleDateString("sv") === today.toLocaleDateString("sv")) {
    return "Today"
  } else if (date.toLocaleDateString("sv") === yesterday.toLocaleDateString("sv")) {
    return "Yesterday"
  } else if (date.getFullYear() === today.getFullYear()) {
    return moment(date).format("MMM D")
  } else {
    return moment(date).format("MMM D YY")
  }
}

function checkFollowed(currMessage: MessageType, nextMessage: MessageType | undefined): boolean {
  if (
    !nextMessage ||
    currMessage.type === "action" ||
    currMessage.from?._id !== nextMessage.from?._id ||
    Math.floor(new Date(currMessage.timestamp).getTime() / 1000 / 60) !==
      Math.floor(new Date(nextMessage.timestamp).getTime() / 1000 / 60)
  ) {
    return false
  }

  return true
}

interface MessageListProps {
  messages: MessageType[]
  chatType: "private" | "group"
}

export default function MessageList({ messages, chatType }: MessageListProps) {
  if (messages.length < 1) return null

  return (
    <ul className="max-w-[40rem] m-auto">
      {splitMessagesIntoDays(messages).map((day) => (
        <Day key={day[0].timestamp} messages={day} chatType={chatType} />
      ))}
    </ul>
  )
}

function Day({ messages, chatType }: MessageListProps) {
  return (
    <div className="pt-4">
      <h3 className="sticky top-4 text-sm px-3 py-1.5 w-fit m-auto bg-neutral-900 rounded-full border border-neutral-800 mb-4">
        {formatDay(messages[0].timestamp)}
      </h3>
      {messages.map((msg, id) => (
        <Message key={msg._id} message={msg} chatType={chatType} followed={checkFollowed(msg, messages[id + 1])} />
      ))}
    </div>
  )
}

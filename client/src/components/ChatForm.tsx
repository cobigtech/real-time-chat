import { useChat } from "../providers/ChatProvider"
import { useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { socket } from "../socket"
import { Button } from "./ui/button"
import { BiImageAlt, BiJoystick, BiLoaderAlt, BiSend, BiX } from "react-icons/bi"
import { useMediaQuery } from "react-responsive"

export default function ChatForm() {
  const { chatId } = useParams()
  const { chat, createMessage, createGame } = useChat(chatId)

  const [text, setText] = useState("")
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const empty = !text && images.length === 0
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isTyping, setIsTyping] = useState<boolean | null>(null)

  const isSmall = useMediaQuery({ query: "(max-width: 768px)" })

  const handleTyping = () => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
    setIsTyping(true)
    timeout.current = setTimeout(() => setIsTyping(false), 2000)
  }

  const removeImage = (image: File) => {
    setImages(Array.from(images).filter((img) => img !== image))
  }

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading || empty) return null
    setIsTyping(false)
    setLoading(true)
    const formData = new FormData()
    formData.append("text", text)
    formData.append("chatId", chatId || "")
    images.forEach((image) => formData.append("images", image))
    await createMessage(formData)
    reset()
    setLoading(false)
  }

  const handlePlay = () => {
    if (chatId) {
      createGame(chatId)
    }
  }

  const reset = () => {
    setText("")
    setImages([])
  }

  useEffect(() => {
    if (isTyping) {
      socket.emit("start-typing", chatId)
    } else if (isTyping === false) {
      socket.emit("stop-typing", chatId)
    }
  }, [chatId, isTyping])

  return (
    <div className="w-full max-w-[40rem] m-auto bg-neutral-900 rounded-2xl">
      {images.length > 0 && (
        <div className="p-1 flex gap-4 overflow-x-auto w-full">
          {images.map((images, id) => (
            <FormImagePreview key={id} image={images} onClick={removeImage} />
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="h-[5rem] p-3 md:p-4 flex items-center gap-4">
          <input
            id="images"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              setImages(Array.from(e.target.files))
              e.target.value = ""
              const messages = document.getElementById("messages")
              setTimeout(() => {
                messages?.scrollTo(0, messages.scrollHeight)
              }, 10)
            }}
          />

          <div className="flex items-center gap-1">
            {chat?.type === "private" && (
              <Button type="button" onClick={handlePlay} size="icon" variant="ghost" className="hover:bg-neutral-800">
                <BiJoystick className="text-lg" />
              </Button>
            )}
            <Button type="button" size="icon" variant="ghost" className="hover:bg-neutral-800" asChild>
              <label htmlFor="images" className="cursor-pointer">
                <BiImageAlt className="text-lg" />
              </label>
            </Button>
          </div>

          <input
            placeholder="Type something..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck="false"
            onKeyDown={handleTyping}
            className="h-[4rem] w-full flex-1 bg-transparent placeholder-neutral-300 focus:outline-none"
          />

          <Button size={isSmall ? "icon" : "default"} disabled={loading || empty}>
            {loading ? (
              <BiLoaderAlt className="text-2xl animate-spin" />
            ) : (
              <>
                <span className="sr-only md:not-sr-only inline">Send</span>
                <BiSend className="text-lg" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

interface FormImagePreviewProps {
  image: File
  onClick: (image: File) => void | void
}

function FormImagePreview({ image, onClick }: FormImagePreviewProps) {
  const src = URL.createObjectURL(image)

  return (
    <div className="overflow-hidden w-fit shrink-0 rounded-xl border border-neutral-800 relative">
      <Button
        onClick={() => onClick(image)}
        variant="secondary"
        size="icon"
        className="absolute top-1 right-1"
        aria-label="Remove image"
      >
        <BiX className="text-xl" />
      </Button>
      <img src={src} alt="" className="h-[8rem]" />
    </div>
  )
}

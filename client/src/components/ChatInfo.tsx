import { BiInfoCircle, BiLoaderAlt } from "react-icons/bi"
import { useAuth } from "../providers/AuthProvider"
import { Chat, Media } from "../types"
import { Button } from "./ui/button"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./ui/sheet"
import Avatar, { GroupAvatar } from "./Avatar"
import { getChatName } from "@/utils"
import { UserTab } from "./User"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { ImageWrapper } from "@/providers/ImageViewerProvider"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "react-responsive"
import ChatEditModal from "./ChatEditModal"
import ChatMembersManager from "./ChatMembersManager"
import axios from "axios"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL

interface ChatInfoProps {
  chat: Chat
}

export default function ChatInfo({ chat }: ChatInfoProps) {
  const { chatId } = useParams()
  const { authUser } = useAuth()
  const isSmall = useMediaQuery({ query: "(max-width: 768px)" })

  const [open, setOpen] = useState(false)
  const otherMembers = chat.members.filter((user) => user._id !== authUser?._id)
  const isAdmin = authUser?._id === chat.admin

  useEffect(() => {
    setOpen(false)
  }, [chatId])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size={isSmall ? "icon" : "default"}>
          <BiInfoCircle />
          <span className="sr-only md:not-sr-only">Info</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="border-l border-neutral-800 overflow-y-auto overflow-x-hidden pb-4 flex flex-col">
        <div className="flex-1">
          <header className="h-[6rem] p-6 flex justify-between items-center">
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              {chat.type === "private" ? "Chat info" : "Group info"}
            </h2>
            <SheetClose asChild>
              <Button variant="secondary">Close</Button>
            </SheetClose>
          </header>

          {chat.type === "private" ? (
            <section className="p-6 pt-3 text-center space-y-3">
              <Avatar src={otherMembers[0].avatar} className="w-[8rem] m-auto" />
              <div>
                <h3 className="font-semibold">{otherMembers[0].name}</h3>
                <p>{otherMembers[0].email}</p>
              </div>
              <p className="text-neutral-400">{otherMembers[0].bio}</p>
            </section>
          ) : (
            <section className="p-6 pt-3 text-center space-y-3">
              <GroupAvatar image={chat.image} members={otherMembers} className="w-[8rem] m-auto" />
              <h3 className="font-semibold">{chat.title || getChatName(otherMembers, "group")}</h3>
              {chat.desc && <p className="text-neutral-400">{chat.desc}</p>}
              {isAdmin && <ChatEditModal chat={chat} />}
            </section>
          )}

          {chat.type === "group" && <ChatMembersSection chat={chat} admin={chat.admin} />}
          <ChatImagesSection images={chat.images} />
          <ChatLinksSection links={chat.links} />
        </div>
        {chat.type === "group" && <ChatQuitSection chatId={chat._id} isAdmin={isAdmin} />}
      </SheetContent>
    </Sheet>
  )
}

interface ChatMembersSectionProps {
  chat: Chat
  admin?: string
}

function ChatMembersSection({ chat, admin }: ChatMembersSectionProps) {
  const { authUser } = useAuth()
  const otherMembers = chat.members.filter((user) => user._id !== authUser?._id)
  const isAdmin = authUser?._id === admin

  if (!authUser) return null

  return (
    <Dialog>
      <section className="p-6 space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Members ({chat.members.length})</h4>
          <DialogTrigger asChild>
            <Button variant="link" className="p-0 h-auto">
              view all
            </Button>
          </DialogTrigger>
        </div>
        <ul className="-mx-2 space-y-2">
          {[...otherMembers, authUser].slice(0, 3).map((user) => (
            <UserTab key={user._id} user={user} isAdmin={user._id === admin} />
          ))}
        </ul>
        {isAdmin && <ChatMembersManager chat={chat} />}
      </section>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>All members ({chat.members.length})</DialogTitle>
          <ul className="-mx-2 space-y-2 max-h-[32rem] overflow-y-auto">
            {[...otherMembers, authUser].map((user) => (
              <UserTab key={user._id} user={user} isAdmin={user._id === admin} />
            ))}
          </ul>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ChatImagesSectionProps {
  images: Media[]
}

function ChatImagesSection({ images }: ChatImagesSectionProps) {
  return (
    <Dialog>
      <section className="p-6 space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Shared images ({images.length})</h4>
          {images.length > 0 && (
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto">
                view all
              </Button>
            </DialogTrigger>
          )}
        </div>
        {images.length ? (
          <ul className="grid grid-cols-3 gap-2">
            {images.slice(0, 3).map((image, id) =>
              id === 2 && images.length > 3 ? (
                <DialogTrigger key={image._id} asChild>
                  <button className="relative">
                    <ImagePreview image={image} className="scale-125 blur-sm opacity-50" />
                    <div className="text-white text-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap select-none">
                      + {images.length - 3} more
                    </div>
                  </button>
                </DialogTrigger>
              ) : (
                <ImageWrapper key={image._id} image={image}>
                  <ImagePreview image={image} />
                </ImageWrapper>
              )
            )}
          </ul>
        ) : (
          <p className="text-neutral-400">No shared images for now</p>
        )}
      </section>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shared images ({images.length})</DialogTitle>
          <ul className="max-h-[32rem] overflow-y-auto grid grid-cols-3 gap-2">
            {images.map((image) => (
              <ImageWrapper key={image._id} image={image}>
                <ImagePreview image={image} />
              </ImageWrapper>
            ))}
          </ul>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ImagePreviewProps {
  image: Media
  className?: string
}

function ImagePreview({ image, className }: ImagePreviewProps) {
  return (
    <li className="aspect-square overflow-hidden rounded-xl border border-neutral-800">
      <img src={SERVER_BASE_URL + "/" + image.url} alt="" className={cn("w-full h-full object-cover", className)} />
    </li>
  )
}

interface ChatLinksSectionProps {
  links: Media[]
}

function ChatLinksSection({ links }: ChatLinksSectionProps) {
  return (
    <Dialog>
      <section className="p-6 space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Shared links ({links.length})</h4>
          {links.length > 0 && (
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto">
                view all
              </Button>
            </DialogTrigger>
          )}
        </div>
        {links.length ? (
          <ul className="space-y-2">
            {links.slice(0, 3).map((link) => (
              <LinkPreview key={link._id} url={link.url} short={true} />
            ))}
            {links.length > 3 && (
              <DialogTrigger asChild>
                <button className="block px-4 py-3 w-full font-semibold border border-neutral-800 rounded-lg hover:bg-neutral-900 transition-colors">
                  + {links.length - 3} more
                </button>
              </DialogTrigger>
            )}
          </ul>
        ) : (
          <p className="text-neutral-400">No shared links for now</p>
        )}
      </section>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shared links ({links.length})</DialogTitle>
          <ul className="max-h-[32rem] overflow-y-auto space-y-4">
            {links.map((link) => (
              <LinkPreview key={link._id} url={link.url} />
            ))}
          </ul>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface LinkPreviewProps {
  url: string
  short?: boolean
}

function LinkPreview({ url, short = false }: LinkPreviewProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-4 max-w-full font-semibold border border-neutral-800 rounded-lg hover:underline hover:bg-neutral-900 transition-colors ${
        short ? "truncate" : "break-all"
      }`}
    >
      {url}
    </a>
  )
}

interface ChatQuitSectionProps {
  chatId: string
  isAdmin: boolean
}

function ChatQuitSection({ chatId, isAdmin }: ChatQuitSectionProps) {
  return (
    <section className="p-6 space-y-2">
      {isAdmin ? <DeleteChat chatId={chatId} /> : <LeaveChat chatId={chatId} />}
    </section>
  )
}

interface DeleteChatProps {
  chatId: string
}

function DeleteChat({ chatId }: DeleteChatProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const deleteChat = () => {
    if (loading) return null
    setLoading(true)
    axios
      .delete(`/chat/${chatId}`)
      .then(() => {
        setOpen(false)
        setLoading(false)
        navigate("/chat")
      })
      .catch((err) => console.error(err))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          Delete chat
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete chat</DialogTitle>
          <DialogDescription>Do you really want to delete this chat? </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={deleteChat} disabled={loading}>
            {loading ? <BiLoaderAlt className="text-2xl animate-spin" /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface LeaveChatProps {
  chatId: string
}

function LeaveChat({ chatId }: LeaveChatProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { authUser } = useAuth()
  const navigate = useNavigate()

  const leaveChat = () => {
    if (!authUser || loading) return null
    setLoading(true)
    axios
      .delete(`/chat/${chatId}/members/${authUser._id}`)
      .then(() => {
        setOpen(false)
        setLoading(false)
        navigate("/chat")
      })
      .catch((err) => console.error(err))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          Leave chat
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave chat</DialogTitle>
          <DialogDescription>Do you really want to leave this chat? </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={leaveChat} disabled={loading}>
            {loading ? <BiLoaderAlt className="text-2xl animate-spin" /> : "Leave"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

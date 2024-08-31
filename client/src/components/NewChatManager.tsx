import { useEffect, useState } from "react"
import { useChats } from "../providers/ChatProvider"
import { useAuth } from "../providers/AuthProvider"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { BiLoaderAlt } from "react-icons/bi"
import { sortChats } from "@/utils"
import { useNavigate } from "react-router-dom"
import { UserManager } from "./User"
import { User } from "@/types"

export default function NewChatManager() {
  const { authUser } = useAuth()
  const { chats, findChat, createChat } = useChats()
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const usersFromOtherChats = chats
    .sort(sortChats)
    .filter((chat) => chat.messages.length > 0)
    .map((chat) => chat.members)
    .reduce((acc, curr) => [...acc, ...curr], [])
    .filter((user) => user._id !== authUser?._id)
    .filter((user, id, arr) => id === arr.findIndex((u) => u._id === user._id))

  const title = members.length < 2 ? "New chat" : "New group chat"

  const handleCreate = async () => {
    if (members.length < 1 || !authUser) return null
    setLoading(true)
    let chat
    if (members.length === 1) {
      // if private chat
      chat = findChat(members[0]._id)
    }
    if (!chat) {
      chat = await createChat([...members, authUser].map((user) => user._id))
    }
    setLoading(false)
    setOpen(false)
    navigate(`/chat/${chat?._id}`)
  }

  useEffect(() => {
    if (!open) {
      setMembers([])
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1">New</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <UserManager baseUsers={usersFromOtherChats} users={members} setUsers={setMembers} />

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>

          <Button onClick={handleCreate} disabled={loading || members.length < 1}>
            {loading ? <BiLoaderAlt className="text-2xl animate-spin" /> : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

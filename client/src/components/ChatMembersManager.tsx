import { Chat } from "@/types"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { BiLoaderAlt } from "react-icons/bi"
import { UserManager } from "./User"
import { useChat } from "@/providers/ChatProvider"
import axios from "axios"

interface ChatMembersManager {
  chat: Chat
}

export default function ChatMembersManager({ chat }: ChatMembersManager) {
  const { updateChat } = useChat()
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState(chat.members)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    if (members.length < 1) return null
    setLoading(true)
    const res = await axios.put(`/chat/${chat._id}`, { members })
    updateChat(chat._id, res.data)
    setLoading(false)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) {
      setMembers(chat.members)
    }
  }, [open, chat.members])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="w-full">
          Manage users
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage members</DialogTitle>
        </DialogHeader>

        <UserManager baseUsers={chat.members} users={members} setUsers={setMembers} />

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>

          <Button onClick={handleUpdate} disabled={loading || members.length < 1}>
            {loading ? <BiLoaderAlt className="text-2xl animate-spin" /> : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

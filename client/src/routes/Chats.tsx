import Loader from "@/components/Loader"
import { useChats } from "../providers/ChatProvider"

export default function Chats() {
  const { loading } = useChats()

  if (loading) return <Loader />

  return <div></div>
}

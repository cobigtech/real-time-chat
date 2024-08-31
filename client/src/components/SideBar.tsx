import { Link, useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import logo from "../assets/logo.svg"
import ChatList from "./ChatList"
import { useState } from "react"
import { UserSearchWithResults } from "./User"
import { BiCog } from "react-icons/bi"
import NewChatManager from "./NewChatManager"

export default function SideBar() {
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState("")

  const hidden = location.pathname !== "/chat"

  return (
    <nav
      className={`w-full ${
        hidden ? "hidden" : "flex"
      } md:flex md:w-[20rem] lg:w-[24rem] h-screen overflow-hidden border-r border-neutral-800 flex-col`}
    >
      <header className="h-[6rem] px-6 py-8 flex items-center">
        <Link to="/chat" className="inline-block w-fit p-2 -m-2">
          <img src={logo} alt="MiChat" />
        </Link>
      </header>

      <div className="flex-1 pt-[2px] relative overflow-y-auto z-10">
        <section className="px-6 pb-4">
          <UserSearchWithResults term={searchTerm} setTerm={setSearchTerm} />
        </section>

        {searchTerm === "" && (
          <section className="p-3">
            <ChatList />
          </section>
        )}
      </div>

      <footer className="p-6 flex gap-3">
        <Button variant="secondary" className="flex-1" asChild>
          <Link to="/settings">
            <BiCog className="text-lg" />
            Settings
          </Link>
        </Button>
        <NewChatManager />
      </footer>
    </nav>
  )
}

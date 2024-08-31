import { BiLoaderAlt, BiSearch, BiX } from "react-icons/bi"
import Avatar from "./Avatar"
import { Input } from "./ui/input"
import { useEffect, useState } from "react"
import axios from "axios"
import { User } from "@/types"
import { useAuth } from "@/providers/AuthProvider"
import { useNavigate } from "react-router-dom"
import { useChat } from "@/providers/ChatProvider"

interface UserSearchProps {
  term: string
  setTerm: React.Dispatch<React.SetStateAction<string>>
  setResults: React.Dispatch<React.SetStateAction<User[]>>
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export function UserSearch({ term, setTerm, setResults, setLoading }: UserSearchProps) {
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      const res = await axios.get(`/user/search?term=${term}`)
      setResults(res.data)
      setLoading(false)
    }
    fetchResults().catch((err) => console.error(err))
  }, [term, setResults, setLoading])

  return (
    <div className="relative">
      <BiSearch className="text-neutral-400 text-lg absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none" />
      <Input
        placeholder="Search users"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        spellCheck="false"
        className="pl-10"
      />
    </div>
  )
}

interface UserSearchWithResultsProps {
  term: string
  setTerm: React.Dispatch<React.SetStateAction<string>>
}

export function UserSearchWithResults({ term, setTerm }: UserSearchWithResultsProps) {
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  return (
    <div>
      <UserSearch term={term} setTerm={setTerm} setResults={setResults} setLoading={setLoading} />
      {term && (
        <div className="mt-4">
          {loading && results.length === 0 && (
            <p className="text-center text-neutral-400">
              <BiLoaderAlt className="text-2xl animate-spin m-auto" />
              <span className="sr-only">Loading</span>
            </p>
          )}
          {!loading && results.length === 0 && <p className="text-center text-neutral-400">No user found</p>}
          {results.length > 0 && (
            <ul className="-mx-2 space-y-2">
              {results.map((user) => (
                <li key={user._id}>
                  <UserTab user={user} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

interface UserManagerProps {
  baseUsers: User[]
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
}

export function UserManager({ baseUsers, users, setUsers }: UserManagerProps) {
  const { authUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  baseUsers = baseUsers.filter((user) => user._id !== authUser?._id)
  users = users.filter((user) => user._id !== authUser?._id)

  return (
    <div className="space-y-4">
      <UserSearch
        term={searchTerm}
        setTerm={setSearchTerm}
        setResults={setSearchResults}
        setLoading={setSearchLoading}
      />
      <ul className="flex gap-3 flex-wrap">
        {[
          ...baseUsers.filter((user) => users.map((u) => u._id).includes(user._id)),
          ...users.filter((user) => !baseUsers.map((u) => u._id).includes(user._id)),
        ].map((user) => (
          <li key={user._id}>
            <UserPin user={user} setUsers={setUsers} />
          </li>
        ))}
      </ul>
      <ul>
        {searchTerm ? (
          searchLoading ? (
            <p className="text-center text-neutral-400">
              <BiLoaderAlt className="text-2xl animate-spin m-auto" />
            </p>
          ) : searchResults.length ? (
            searchResults.map((user) => (
              <li key={user._id}>
                <UserCheckbox user={user} users={users} setUsers={setUsers} />
              </li>
            ))
          ) : (
            <p className="text-center text-neutral-400">No user found</p>
          )
        ) : (
          [...baseUsers, ...users.filter((user) => !baseUsers.map((user) => user._id).includes(user._id))].map(
            (user) => (
              <li key={user._id}>
                <UserCheckbox user={user} users={users} setUsers={setUsers} />
              </li>
            )
          )
        )}
      </ul>
    </div>
  )
}

interface UserTabProps {
  user: User
  isAdmin?: boolean
  onClick?: () => void
}

export function UserTab({ user, isAdmin, onClick }: UserTabProps) {
  const { authUser } = useAuth()
  const { findChat, createChat } = useChat()
  const navigate = useNavigate()
  const isAuthUser = user._id === authUser?._id
  const rightText = (isAdmin ? "admin" : "") + (isAdmin && isAuthUser ? " / " : "") + (isAuthUser ? "you" : "")

  const handleClick = async () => {
    if (isAuthUser || !authUser || !user) return null
    let chat = findChat(user._id)
    if (!chat) chat = await createChat([user._id, authUser._id])
    navigate(`/chat/${chat?._id}`)
    if (onClick) onClick()
  }

  return (
    <button
      onClick={handleClick}
      disabled={isAuthUser}
      className="w-full p-2 text-left rounded-lg hover:bg-neutral-900 disabled:hover:bg-transparent transition-colors flex items-center gap-3"
    >
      <Avatar src={user.avatar} className="w-[3rem] shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{user.name}</h3>
        <p className="text-neutral-400 text-sm truncate">{user.email}</p>
      </div>
      <p className="text-xs text-neutral-400">{rightText}</p>
    </button>
  )
}

interface UserPinProps {
  user: User
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
}

export function UserPin({ user, setUsers }: UserPinProps) {
  const userId = user._id

  const handleClick = () => {
    setUsers((users) => users.filter((user) => user._id !== userId))
  }

  return (
    <button
      onClick={handleClick}
      className="p-1 bg-neutral-900 hover:bg-neutral-900/70 text-sm rounded-full flex items-center gap-1.5 transition-colors"
    >
      <Avatar src={user.avatar} className="w-5" />
      <p className="leading-none">{user.name}</p>
      <BiX className="text-neutral-400" />
    </button>
  )
}

interface UserCheckboxProps {
  user: User
  users: User[]
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
}

export function UserCheckbox({ user, users, setUsers }: UserCheckboxProps) {
  const userId = user._id
  const [checked, setChecked] = useState(!!users.find((user) => user._id === userId))

  useEffect(() => {
    if (checked) {
      setUsers((users) => (users.find((user) => user._id === userId) ? users : [...users, user]))
    } else {
      setUsers((users) => users.filter((user) => user._id !== userId))
    }
  }, [checked, user, userId, setUsers])

  useEffect(() => {
    const inUsers = users.find((user) => user._id === userId)
    if (inUsers) {
      setChecked((check) => (check ? check : true))
    } else {
      setChecked((check) => (!check ? check : false))
    }
  }, [users, userId])

  return (
    <div>
      <input
        type="checkbox"
        id={user._id}
        name={user._id}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="hidden"
      />
      <label htmlFor={user._id}>
        <div className="w-full p-2 rounded-lg hover:bg-neutral-900 transition-colors text-left flex items-center gap-3 cursor-pointer">
          <Avatar src={user.avatar} className="w-[3rem]" />
          <div className="flex-1">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-neutral-400">{user.email}</p>
          </div>
          <CheckIcon checked={checked} />
        </div>
      </label>
    </div>
  )
}

interface CheckIconProps {
  checked: boolean
}

function CheckIcon({ checked }: CheckIconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {checked ? (
        <path
          d="M12 2C6.486 2 2 6.486 2 12C2 17.514 6.486 22 12 22C17.514 22 22 17.514 22 12C22 6.486 17.514 2 12 2ZM10.001 16.413L6.288 12.708L7.7 11.292L9.999 13.587L15.293 8.293L16.707 9.707L10.001 16.413Z"
          fill="white"
        />
      ) : (
        <path
          d="M12 2C6.486 2 2 6.486 2 12C2 17.514 6.486 22 12 22C17.514 22 22 17.514 22 12C22 6.486 17.514 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20Z"
          fill="#A3A3A3"
        />
      )}
    </svg>
  )
}

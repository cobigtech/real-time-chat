export type User = {
  _id: string
  name: string
  email: string
  bio?: string
  avatar?: string
  isOnline: boolean
}

export type Message = {
  _id: string
  type: "game" | "normal" | "action"
  text: string
  game?: Game
  images: Media[]
  links: Media[]
  from: User
  chat: string
  timestamp: string
  action?: Action
}

export type Media = {
  _id: string
  type: "image" | "link"
  url: string
  from: User
  chat: string
  timestamp: string
}

export type Chat = {
  _id: string
  type: "private" | "group"
  title?: string
  desc?: string
  image?: string
  members: User[]
  messages: Message[]
  images: Media[]
  links: Media[]
  typingUsers: string[]
  unreadCount: number
  admin?: string
}

export type Game = {
  _id: string
  status: "waiting" | "running" | "over"
  board: (number | null)[]
  players: User[]
  startTurn: number
  turn: number
  from: string
  chat: string
  scores: Record<string, number>
  message?: string
  win?: { playerId: string }
  draw?: boolean
}

export type Action = {
  _id: string
  type: string
  agent: User
  subjects?: User[]
  value?: string
}

import { io } from "socket.io-client"

const URL = import.meta.env.MODE === "production" ? import.meta.env.VITE_SERVER_BASE_URL : "http://localhost:3000"

export const socket = io(URL, { autoConnect: false })

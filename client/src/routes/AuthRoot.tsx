import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"
import { useEffect } from "react"
import { socket } from "../socket"
import SideBar from "../components/SideBar"
import Loader from "@/components/Loader"

export default function AuthRoot() {
  const { token, authUser } = useAuth()

  if (!token) {
    return <Navigate to="/login" />
  }

  if (!authUser) return <Loader />

  return (
    <SocketConnector>
      <div className="h-screen flex overflow-hidden">
        <SideBar />
        <div className="flex-1 relative w-full overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </SocketConnector>
  )
}

interface SocketConnectorProps {
  children: React.ReactNode
}

function SocketConnector({ children }: SocketConnectorProps) {
  useEffect(() => {
    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [])

  return children
}

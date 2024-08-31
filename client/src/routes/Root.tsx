import { Outlet, useSearchParams } from "react-router-dom"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import { useAuth } from "@/providers/AuthProvider"

export default function Root() {
  const { setToken } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const token = searchParams.get("token")

  if (token) {
    setToken(token)
    searchParams.delete("token")
    setSearchParams(searchParams)
  }
  return (
    <div className="h-screen flex flex-col">
      <NavBar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

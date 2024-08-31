import axios from "axios"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { User } from "../types"

type ContextContent = {
  token: string | null
  setToken: (newToken: string | null) => void
  authUser: User | null
  setAuthUser: (user: User) => void
}

const AuthContext = createContext<ContextContent>({
  token: null,
  setToken: () => {},
  authUser: null,
  setAuthUser: () => {},
})

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken_] = useState(localStorage.getItem("token"))
  const [authUser, setAuthUser_] = useState<User | null>(null)

  const setToken = (newToken: string | null) => {
    setToken_(newToken)
  }

  const setAuthUser = (user: User | null) => {
    setAuthUser_(user)
  }

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      localStorage.setItem("token", token)
      axios
        .get("/user/me")
        .then((res) => setAuthUser(res.data))
        .catch((error) => {
          if (error.response.status === 401) {
            setToken(null)
          }
        })
    } else {
      delete axios.defaults.headers.common["Authorization"]
      localStorage.removeItem("token")
      setAuthUser(null)
    }
  }, [token])

  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      authUser,
      setAuthUser,
    }),
    [token, authUser]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

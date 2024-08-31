import { RouterProvider, createBrowserRouter } from "react-router-dom"
import Home from "./routes/Home"
import Login from "./routes/Login"
import Register from "./routes/Register"
import Chats from "./routes/Chats"
import Profile from "./routes/Profile"
import AuthProvider from "./providers/AuthProvider"
import AuthRoot from "./routes/AuthRoot"
import Root from "./routes/Root"
import ChatProvider from "./providers/ChatProvider"
import Chat from "./routes/Chat"
import Settings from "./routes/Settings"
import About from "./routes/About"
import { Toaster } from "./components/ui/toaster"
import ImageViewerProvider from "./providers/ImageViewerProvider"

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/about",
        element: <About />,
      },
    ],
  },
  {
    element: <AuthRoot />,
    children: [
      {
        path: "/chat",
        element: <Chats />,
      },
      {
        path: "/chat/:chatId",
        element: <Chat />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <ImageViewerProvider>
          <RouterProvider router={router} />
        </ImageViewerProvider>
        <Toaster />
      </ChatProvider>
    </AuthProvider>
  )
}

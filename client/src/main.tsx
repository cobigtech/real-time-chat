import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import axios from "axios"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

axios.defaults.withCredentials = true
axios.defaults.baseURL = import.meta.env.VITE_SERVER_BASE_URL + "/api"
gsap.registerPlugin(ScrollTrigger)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

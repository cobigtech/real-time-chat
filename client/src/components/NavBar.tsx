import { Link } from "react-router-dom"
import logo from "../assets/logo.svg"

export default function NavBar() {
  return (
    <nav>
      <div className="max-w-[56rem] h-[6rem] m-auto px-3 flex justify-between items-center border-b border-neutral-800">
        <Link to="/" className="p-2 -ml-2">
          <img src={logo} alt="MiChat" />
        </Link>
        <ul className="flex gap-3 md:gap-6">
          <li>
            <Link to="/about" className="font-medium text-neutral-400 hover:text-white transition-colors p-2">
              About
            </Link>
          </li>
          <li>
            <Link to="/login" className="font-medium text-neutral-400 hover:text-white transition-colors p-2">
              Open
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

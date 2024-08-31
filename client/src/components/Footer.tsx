import logo from "../assets/logo.svg"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer>
      <div className="max-w-[56rem] h-[10rem] m-auto px-3 flex justify-between items-center border-t border-neutral-800">
        <div>
          <img src={logo} alt="" />
          <p className="text-neutral-400 mt-2">© {year} MiChat, Inc.</p>
        </div>

        <p className="text-neutral-400">
          Created by{" "}
          <a
            href="https://github.com/nelrnd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-medium hover:underline"
          >
            Nel
          </a>
        </p>
      </div>
    </footer>
  )
}

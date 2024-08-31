import { BiLoaderAlt } from "react-icons/bi"

export default function Loader() {
  return (
    <div className="absolute inset-0 grid place-content-center">
      <BiLoaderAlt className="text-4xl animate-spin" />
    </div>
  )
}

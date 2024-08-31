import Avatar from "@/components/Avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog"
import { Media } from "@/types"
import moment from "moment"
import { createContext, useContext, useEffect, useState } from "react"
import { BiX } from "react-icons/bi"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL

type ContextContent = {
  setImage: (image: Media) => void
}

const ImageViewerContext = createContext<ContextContent>({
  setImage: () => {},
})

interface ImageViewerProvider {
  children: React.ReactNode
}

export default function ImageViewerProvider({ children }: ImageViewerProvider) {
  const [open, setOpen] = useState(false)
  const [image, setImage_] = useState<Media | null>(null)

  useEffect(() => {
    if (image) {
      setOpen(true)
    }
  }, [image])

  useEffect(() => {
    if (!open) {
      setImage(null)
    }
  }, [open])

  const setImage = (image: Media | null) => {
    setImage_(image)
  }

  const contextValue = { setImage }

  return (
    <ImageViewerContext.Provider value={contextValue}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-full min-h-full p-0 rounded-none flex flex-col gap-0">
          <header className="p-6 flex justify-between">
            <div className="flex gap-3 items-center">
              <Avatar src={image?.from.avatar} className="w-[2.625rem]" />
              <div>
                <p className="font-semibold">By {image?.from.name}</p>
                <p className="text-sm text-neutral-400">
                  {moment(image?.timestamp).format("l")}, {moment(image?.timestamp).format("LT")}
                </p>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="secondary" size="icon" aria-label="Close">
                <BiX />
              </Button>
            </DialogClose>
          </header>
          <main className="p-12 pt-0 flex-1 relative">
            <img
              src={SERVER_BASE_URL + "/" + image?.url}
              alt=""
              className="block absolute w-[95%] h-[95%] left-1/2 top-0 -translate-x-1/2 inset-0 aspect-square object-contain"
            />
          </main>
        </DialogContent>
      </Dialog>
      {children}
    </ImageViewerContext.Provider>
  )
}

export function useImageViewer() {
  return useContext(ImageViewerContext)
}

interface ImageWrapperProps {
  image: Media
  children: React.ReactNode
}

export function ImageWrapper({ image, children }: ImageWrapperProps) {
  const { setImage } = useImageViewer()

  return (
    <button onClick={() => setImage(image)} className="hover:opacity-90 transition-opacity">
      {children}
    </button>
  )
}

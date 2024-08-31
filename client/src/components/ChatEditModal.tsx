import { Chat } from "@/types"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button, buttonVariants } from "./ui/button"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { BiCamera, BiImageAlt, BiLoaderAlt, BiX } from "react-icons/bi"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "./ui/use-toast"
import { useChats } from "@/providers/ChatProvider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { GroupAvatar } from "./Avatar"
import { useMediaQuery } from "react-responsive"

interface ChatEditModalProps {
  chat: Chat
}

const formSchema = z.object({
  title: z.string().max(50, "Name cannot exceed 50 characters").optional(),
  desc: z.string().max(300, "Description cannot exceed 300 characters").optional(),
  image: z.instanceof(FileList).optional(),
})

export default function ChatEditModal({ chat }: ChatEditModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: chat.title || "",
      desc: chat.desc || "",
    },
  })

  const [open, setOpen] = useState(false)
  const isSmall = useMediaQuery({ query: "(max-width: 768px)" })

  const { updateChat } = useChats()

  const desc = form.watch("desc")
  const image = form.watch("image")
  const [previewImage, setPreviewImage] = useState(chat?.image)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (image && image.length) {
      setPreviewImage(URL.createObjectURL(image[0]))
    }
  }, [image])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true)
    const formData = new FormData()
    formData.append("title", data.title || "")
    formData.append("desc", data.desc || "")
    formData.append("image", (data.image && data.image[0]) || previewImage || "")
    await axios
      .put(`/chat/${chat._id}`, formData)
      .then((res) => {
        updateChat(chat._id, res.data)
        toast({ title: "Success", description: "Chat info was updated successfully!" })
        setOpen(false)
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong",
          description: "There was a probme updating chat info.",
        })
        if (err.response && err.response.data.message) {
          setError(err.response.data.message)
        } else {
          setError(err.message)
        }
      })
    setLoading(false)
  }

  const removeImage = () => {
    form.setValue("image", undefined)
    setPreviewImage("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="w-full">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Edit chat info</DialogTitle>
            </DialogHeader>

            <FormField
              control={form.control}
              name="image"
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <div className="w-fit m-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <div className="relative rounded-[15%] overflow-hidden">
                          <div className="absolute z-50 bg-black/30 hover:bg-black/50 w-full h-full grid place-content-center transition-colors">
                            <BiCamera className="text-3xl" />
                          </div>
                          <GroupAvatar image={previewImage} className="w-[8rem]" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side={isSmall ? "bottom" : "right"} className="bg-neutral-950">
                        <DropdownMenuItem className="cursor-pointer" asChild>
                          <FormLabel className={buttonVariants({ variant: "ghost", size: "sm" })}>
                            <BiImageAlt />
                            Upload image
                          </FormLabel>
                        </DropdownMenuItem>
                        {previewImage && (
                          <DropdownMenuItem className="cursor-pointer" asChild>
                            <Button onClick={removeImage} variant="ghost" size="sm" className="w-full">
                              <BiX />
                              Remove image
                            </Button>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <FormControl>
                    <Input
                      {...fieldProps}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      multiple
                      onChange={(e) => onChange(e.target.files)}
                      className="hidden"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chat title</FormLabel>
                  <FormControl>
                    <Input {...field} spellCheck="false" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} spellCheck="false" />
                  </FormControl>
                  <FormDescription className={`ml-auto w-fit ${desc && desc.length > 300 && "text-red-500"}`}>
                    {desc?.length || 0}/300 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="font-medium text-red-500">{error}</p>}

            <DialogFooter className="gap-3">
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>

              <Button type="submit" disabled={loading}>
                {loading ? <BiLoaderAlt className="text-xl animate-spin" /> : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

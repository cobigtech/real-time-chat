import axios from "axios"
import { useForm } from "react-hook-form"
import { useAuth } from "../providers/AuthProvider"
import { useEffect, useState } from "react"
import { Button, buttonVariants } from "../components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Avatar from "@/components/Avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BiArrowBack, BiCamera, BiImageAlt, BiLoaderAlt, BiX } from "react-icons/bi"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Link } from "react-router-dom"
import { useMediaQuery } from "react-responsive"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name cannot exceed 50 characters"),
  bio: z.string().max(300, "Bio cannot exceed 300 characters").optional(),
  avatar: z.instanceof(FileList).optional(),
})

export default function Settings() {
  const { authUser, setAuthUser, setToken } = useAuth()
  const { toast } = useToast()
  const isSmall = useMediaQuery({ query: "(max-width: 768px)" })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: authUser?.name || "",
      bio: authUser?.bio || "",
    },
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const bio = form.watch("bio")
  const avatar = form.watch("avatar")
  const [previewAvatar, setPreviewAvatar] = useState(authUser?.avatar)

  useEffect(() => {
    if (avatar && avatar.length) {
      setPreviewAvatar(URL.createObjectURL(avatar[0]))
    }
  }, [avatar])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true)
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("bio", data.bio || "")
    formData.append("avatar", (data.avatar && data.avatar[0]) || previewAvatar || "")
    await axios
      .put(`/user/${authUser?._id}`, formData)
      .then((res) => {
        setAuthUser(res.data)
        toast({ title: "Success", description: "User info updated successfully!" })
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong",
          description: "There was a problem updating user info.",
        })
        if (err.response && err.response.data.message) {
          setError(err.response.data.message)
        } else {
          setError(err.message)
        }
      })
    setLoading(false)
  }

  const removeAvatar = () => {
    form.setValue("avatar", undefined)
    setPreviewAvatar("")
  }

  const deleteAccount = () => {
    axios.delete(`/user/${authUser?._id}`).then(() => setToken(null))
  }

  const logout = () => {
    setToken(null)
  }

  return (
    <div className="pb-8">
      <header className="h-[6rem] p-3 md:p-6 flex items-center gap-4 border-b border-neutral-800">
        <Button variant="secondary" size="icon" className="md:hidden" asChild>
          <Link to="/chat">
            <BiArrowBack />
            <span className="sr-only">Go back to main page</span>
          </Link>
        </Button>
        <h1 className="scroll-m-20 text-2xl md:text-3xl font-semibold tracking-tight first:mt-0">Settings</h1>
      </header>

      <div className="max-w-[36rem] m-auto mt-8 p-3 pb-8 md:p-0 space-y-8">
        <section className="p-3 md:p-6 rounded-2xl border border-neutral-800">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="avatar"
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <div className="w-fit m-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <div className="relative rounded-full overflow-hidden">
                            <div className="absolute z-10 bg-black/30 hover:bg-black/50 w-full h-full grid place-content-center transition-colors">
                              <BiCamera className="text-3xl" />
                            </div>
                            <Avatar src={previewAvatar || ""} className="w-[8rem]" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side={isSmall ? "bottom" : "right"} className="bg-neutral-950">
                          <DropdownMenuItem className="cursor-pointer" asChild>
                            <FormLabel className={buttonVariants({ variant: "ghost", size: "sm" })}>
                              <BiImageAlt />
                              Upload image
                            </FormLabel>
                          </DropdownMenuItem>
                          {previewAvatar && (
                            <DropdownMenuItem className="cursor-pointer" asChild>
                              <Button
                                onClick={removeAvatar}
                                variant="ghost"
                                size="sm"
                                className="w-full cursor-pointer"
                              >
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input {...field} spellCheck="false" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (a few words about you)</FormLabel>
                    <FormControl>
                      <Textarea {...field} spellCheck="false" />
                    </FormControl>
                    <FormDescription className={`ml-auto w-fit ${bio && bio.length > 300 && "text-red-500"}`}>
                      {(bio && bio.length) || "0"}/300 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <p className="font-medium text-red-500">{error}</p>}

              <Button variant="secondary" disabled={loading || (bio && bio.length > 300)} className="block ml-auto">
                {loading ? <BiLoaderAlt className="text-2xl animate-spin" /> : "Save changes"}
              </Button>
            </form>
          </Form>
        </section>

        <div className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Delete account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete account</DialogTitle>
                <DialogDescription>
                  Do you really want to delete your account? This action cannot be undone. This will permanently delete
                  your account and your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={deleteAccount} variant="destructive">
                    Delete
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={logout} variant="secondary" className="w-full">
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

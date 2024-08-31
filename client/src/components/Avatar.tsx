import { cn } from "@/lib/utils"
import defaultAvatar from "../assets/default-avatar.svg"
import defaultImage from "../assets/default-image.jpg"
import { User } from "@/types"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL

interface AvatarProps {
  src?: string
  className?: string
}

function getCompleteUrl(url?: string) {
  if (!url) {
    return defaultAvatar
  } else if (url.includes("http://") || url.includes("https://")) {
    return url
  } else if (url.startsWith("/")) {
    return url
  } else {
    return SERVER_BASE_URL + "/" + url
  }
}

export default function Avatar({ src, className }: AvatarProps) {
  const url = getCompleteUrl(src)

  return (
    <div className={cn("w-[4rem] aspect-square rounded-full relative overflow-hidden", className)}>
      <img
        src={url}
        alt=""
        className="w-full h-full object-cover select-none crisp"
        style={{ imageRendering: "crisp-edges" }}
        referrerPolicy={
          src?.includes("http://") || src?.includes("https://") ? "no-referrer" : "strict-origin-when-cross-origin"
        }
      />
    </div>
  )
}

interface GroupAvatarProps {
  image?: string
  members?: User[]
  className?: string
}

export function GroupAvatar({ image, members, className }: GroupAvatarProps) {
  const avatars =
    members &&
    members
      .sort((a, b) => {
        const hasAvatarA = a.avatar ? 1 : 0
        const hasAvatarB = b.avatar ? 1 : 0
        return hasAvatarB - hasAvatarA
      })
      .slice(0, 4)
      .map((user) => user.avatar)

  if (!avatars || !avatars.length) return null

  return (
    <div className={cn("w-[4rem] aspect-square relative overflow-hidden", className)}>
      {image ? (
        <>
          <Avatar src={image} className="w-full rounded-[15%]" />
        </>
      ) : members ? (
        <>
          <Avatar src={avatars[0]} className="w-[56%]" />
          <div className="w-[56%] absolute bottom-0 right-0 rounded-full overflow-hidden">
            {avatars.length > 2 && (
              <div>
                <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="inset-0 absolute z-20">
                  <text
                    x="50%"
                    y="50%"
                    className="fill-white font-sans tracking-tighter"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    +{members.length - 2}
                  </text>
                </svg>
                <div className="absolute inset-0 bg-black/50 z-10"></div>
              </div>
            )}
            <Avatar src={avatars[1]} className="w-full" />
          </div>
        </>
      ) : (
        <Avatar src={defaultImage} className="w-full rounded-[15%]" />
      )}
    </div>
  )
}

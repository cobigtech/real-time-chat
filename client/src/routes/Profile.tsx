import { useAuth } from "../providers/AuthProvider"

export default function Profile() {
  const { authUser } = useAuth()

  return (
    <div>
      <h1>Profile</h1>
      <p>
        {authUser?.name} | {authUser?.email}
      </p>
      <p>{authUser?.bio}</p>
      <p>{authUser?.avatar}</p>
      <img src={import.meta.env.VITE_BASE_API + authUser?.avatar} alt="" />
    </div>
  )
}

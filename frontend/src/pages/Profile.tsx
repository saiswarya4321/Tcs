import Sidebar from '@/components/Sidebar'

import { useEffect, useState } from "react"
import { supabase } from "@/supabase-client"
import { Button } from '@/components/ui/button'
import UpdateProfileModal from '@/modals/UpadateProfileModal'
import profileImg from "../../public/profile.jpg"

export default function Profile() {
    const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    try {
     
      const { data: userData } = await supabase.auth.getUser()
      const currentUser = userData.user

      if (!currentUser) return

      setUser(currentUser)

      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single()

      if (error) throw error

      setProfile(data)

    } catch (err: any) {
      console.log(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className="text-center mt-10 text-gray-300">Loading...</p>
  }
  return (
    <div className=''>
        <Sidebar/>
      
      <div className="min-h-screen text-gray-300 flex items-center justify-center">

      <div className="bg-red-900 p-6 rounded-xl w-full max-w-[500px] shadow-lg">

        <h2 className="text-xl font-bold text-white mb-4 text-center">
          User Profile
        </h2>

       
        <div className="flex flex-row justify-center items-center gap-3 max-w-md">
          <div>
 <img
  src={
    profile?.avatars_url && profile.avatars_url !== ""
      ? profile.avatars_url
      : profileImg
  }
  onError={(e) => {
    (e.target as HTMLImageElement).src = profileImg
  }}
  alt="profile"  className="w-[300px] h-[250px] rounded-full border border-red-500"
/>
          </div>


          <div className='flex flex-col  p-2 ml-2'>
  <p><b>Name:</b> {profile?.name || "N/A"}</p>
          <p><b>Email:</b> {user?.email}</p>
          <p><b>Phone:</b> {profile?.phone_number || "N/A"}</p>
          <p><b>Location:</b> {profile?.location || "Trivandrum"}</p>

          <p>
            <b>Created At:</b>{" "}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleString()
              : "N/A"}
          </p>
          <Button
  onClick={() => setOpen(true)}
  className="mt-4 bg-white text-red-900 w-full"
>
  Edit Profile
</Button>
          </div>


     
               

        

        </div>

      </div>
    </div>
    <UpdateProfileModal
  open={open}
  setOpen={setOpen}
  profile={profile}
  refresh={getProfile}
/>
    </div>
  )
}

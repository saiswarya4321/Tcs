import { useEffect, useState } from "react"
import { supabase } from "@/supabase-client"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
    profile: any
    refresh: () => void
}

export default function UpdateProfileModal({
    open,
    setOpen,
    profile,
    refresh,
}: Props) {
    const [formData, setFormData] = useState({
        name: "",
        phone_number: "",
        location:"",
        avatars_url:"",
    })

    const [avatar, setAvatar] = useState<File | null>(null)
    const [loading,setLoading]=useState(false)

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                phone_number: profile.phone_number || "",
                   location: profile.location || "",
                   avatars_url:profile.avatars_url || ""
            })
        }
    }, [profile])

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleUpdate = async () => {
        try {
            let avatar_url = profile.avatars_url


            if (avatar) {
                const filePath = `avatars/${profile.id}/${avatar.name}`

                const { error: uploadError } = await supabase.storage
                    .from("avatars")
                    .upload(filePath, avatar, { upsert: true })

                if (uploadError) throw uploadError

                const { data } = supabase.storage
                    .from("avatars")
                    .getPublicUrl(filePath)

                avatar_url = data.publicUrl
            }


            const { error } = await supabase
                .from("profiles")
                .update({
                    name: formData.name,
                    phone_number: formData.phone_number,
                    location:formData.location,
                    avatars_url:avatar_url,
                })
                .eq("id", profile.id)

            if (error) throw error

            toast.success("Profile updated ")
            setOpen(false)
            refresh()

        } catch (err: any) {
            toast.error(err.message)
        }
        finally{
            setLoading(false)
        }
    }

    if (!open) return null
    if (loading) {
    return <p className="text-center mt-10 text-gray-300">Loading...</p>
  }


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

            <div className="bg-red-900 text-gray-300 w-full max-w-md rounded-xl p-6 overflow-y-auto max-h-[90vh]">

                <h2 className="text-white text-lg font-bold mb-4">
                    Update Profile
                </h2>

                <div className="flex flex-col gap-4">
                    
         <div className='p-6'><img
                    src={formData?.avatars_url}
                    alt="profile"
                    className="w-[300px] h-[300px] rounded-full"
                /></div>
               


                    <Label>Name</Label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="p-2 rounded border text-gray-300"
                    />

                    <Label>Phone</Label>
                    <input
                        name="phone"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="p-2 rounded border text-gray-300"
                    />
                    <Label>Location</Label>
                    <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="p-2 rounded border text-gray-300"
                    />

                    <Label>Profile Image</Label>
                    <input
                        type="file"
                        onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                        className="p-2"
                    />

                    <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">

                        <Button
                            onClick={handleUpdate}
                            className="bg-white text-red-900 "
                        >
                            Update
                        </Button>

                        <Button
                            onClick={() => setOpen(false)}
                            className="bg-white text-red-900 "
                        >
                            Cancel
                        </Button>

                    </div>
                </div>
            </div>
        </div>
    )
}
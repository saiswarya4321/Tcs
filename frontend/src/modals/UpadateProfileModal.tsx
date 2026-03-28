import { useEffect, useState } from "react"
import { supabase } from "@/supabase-client"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import profileImg from "../../public/profile.jpg"


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
        location: "",
        avatars_url: "",
    })
const [errors, setErrors] = useState<any>({})
    const [avatar, setAvatar] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                phone_number: profile.phone_number || "",
                location: profile.location || "",
                avatars_url: profile.avatars_url || ""
            })
        }
    }, [profile])

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
const validate = () => {
  let newErrors: any = {}

  if (!formData.name || formData.name.trim() === "") {
    newErrors.name = "Name is required"
  }
if (!formData.phone_number || formData.phone_number.trim() === "") {
    newErrors.phone_number = "Phone number is required"
  }
  else{
    if(formData.phone_number && !/^[0-9]{10}$/.test(formData.phone_number)) {
    newErrors.phone_number = "Phone must be 10 digits"
  }
  } 
  if (!formData.location || formData.location.trim() === "") {
    newErrors.location = "Location is required"
  }


  if (formData.avatars_url && !/^https?:\/\/.+/.test(formData.avatars_url)) {
    newErrors.avatars_url = "Invalid URL"
  }

  setErrors(newErrors)

  return Object.keys(newErrors).length === 0
}
    const handleUpdate = async () => {
        try {
            if (!validate()) return
            let avatar_url = profile.avatars_url


            if (avatar) {
                const allowedTypes = ["image/png", "image/jpeg"]

                if (!allowedTypes.includes(avatar.type)) {
                    toast.error("Only PNG and JPEG images are allowed")
                    return
                }
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
                    location: formData.location,
                    avatars_url: avatar_url,
                })
                .eq("id", profile.id)

            if (error) throw error

            toast.success("Profile updated ")
            setOpen(false)
            refresh()

        } catch (err: any) {
            toast.error(err.message)
        }
        finally {
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
                {loading && <p className="text-center m-4 text-gray-300">Loading...</p>}
                <div className="flex flex-col gap-4">

                    <div className='p-6'><img
                        src={
                            profile?.avatars_url && profile.avatars_url !== ""
                                ? profile.avatars_url
                                : profileImg
                        }
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = profileImg
                        }}
                        alt="profile" className="w-[300px] h-[300px] rounded-full"
                    /></div>



                    <Label>Name</Label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="p-2 rounded border text-gray-300"
                    />
{errors.name && <p className="text-red-500">{errors.name}</p>}
                    <Label>Phone</Label>
                    <input
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="p-2 rounded border text-gray-300" type="tel"
                    />
                    {errors.phone_number && <p className="text-red-500">{errors.phone_number}</p>}
                    <Label>Location</Label>
                    <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="p-2 rounded border text-gray-300"
                    />
{errors.location && <p className="text-red-500">{errors.location}</p>}
                    <Label>Profile Image</Label>
                    <input
                        type="file"
                        onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                        className="p-2" accept="image/png, image/jpeg"
                    />
{errors.avatars_url && <p className="text-red-500">{errors.avatars_url}</p>}
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
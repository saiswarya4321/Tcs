import { useState } from "react"

import { Button } from "@/components/ui/button"
import { supabase } from "@/supabase-client"
import toast from "react-hot-toast"
import { Label } from "@/components/ui/label"

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
    refresh: () => void
}

export default function AddProjectModal({ open, setOpen, refresh }: Props) {
    const [formData, setFormData] = useState({
        project_code: "",
        name: "",
        description: "",
        start_date: "",
        end_date: "",
    })

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleAddProject = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user
            if (formData.end_date < formData.start_date) {
                toast.error("End date cannot be before start date")
                return
            }
            const { error } = await supabase.from("projects").insert([
                {
                    project_code: formData.project_code,
                    name: formData.name,
                    description: formData.description,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    created_by: user?.id,
                },
            ])

            if (error) throw error

            toast.success("Project added ✅")

            setOpen(false)
            refresh()

            // reset form
            setFormData({
                project_code: "",
                name: "",
                description: "",
                start_date: "",
                end_date: "",
            })

        } catch (err: any) {
            toast.error(err.message)
        }
    }

    return (
        <>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">


                    <div className="bg-red-900 text-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6">

                        <h2 className="text-xl font-bold mb-4">Add Project</h2>

                        <div className="flex flex-col gap-4">
                            <Label className="text-sm">Project Code *</Label>
                            <input name="project_code" placeholder="Project Code Eg. PRO100" className="p-2 rounded border border-gray-400 focus:outline-none text-gray-300 " onChange={handleChange} />
                            <Label className="text-sm">Project Name *</Label>
                            <input name="name" placeholder="Project Name" className="p-2 rounded border border-gray-400 focus:outline-none text-gray-300" onChange={handleChange} />
                            <Label className="text-sm">Description *</Label>
                            <input name="description" placeholder="Description" className="p-2 rounded border border-gray-400 focus:outline-none text-gray-300" onChange={handleChange} />
                            <Label className="text-sm">Start Date *</Label>
                            <input name="start_date" type="date" className="p-2 rounded border border-gray-400 focus:outline-none text-gray-300" onChange={handleChange} />
                            <Label className="text-sm">End Date *</Label>
                            <input name="end_date" type="date" className="p-2 rounded border border-gray-400 focus:outline-none text-gray-300" onChange={handleChange} />

                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleAddProject} className="bg-white text-red-900">
                                    Save
                                </Button>

                                <Button
                                    onClick={() => setOpen(false)}

                                    className="text-red-900 border-white bg-white"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    )
}
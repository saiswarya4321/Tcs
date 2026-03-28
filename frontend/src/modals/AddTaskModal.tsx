import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { supabase } from "@/supabase-client"
import toast from "react-hot-toast"
import { Label } from "@/components/ui/label"

type Props = {
    open: boolean
    setOpen: (open: boolean) => void
    refresh: () => void
}

export default function AddTaskModal({ open, setOpen, refresh }: Props) {
    const [formData, setFormData] = useState({
        task_code: "",
        title: "",
        description: "",
        status: "to_do",
        priority: "",
        project_id: "",
        assigned_to: "",
        due_date: ""
    })
    const [profiles, setProfiles] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [file, setFile] = useState<File | null>(null)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})



    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const validate = () => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.task_code.trim()) newErrors.task_code = "Task code is required"
        if (!formData.title.trim()) newErrors.title = "Title is required"
        if (!formData.description.trim()) newErrors.description = "Description is required"
        if (!formData.priority) newErrors.priority = "Priority is required"
           if (!formData.assigned_to) newErrors.assigned_to = "Assigned user is required"
              if (!formData.project_id) newErrors.project_id = "Project is required"
              if (!formData.due_date) newErrors.due_date = "Due date is required"


        if (!file) {
            newErrors.file = "Please select a file"
        } else {
            const maxSize = 2 * 1024 * 1024
            const allowedTypes = [
                "image/png",
                "image/jpeg",
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ]
            if (file.size > maxSize) newErrors.file = "File must be less than 2MB"
            else if (!allowedTypes.includes(file.type)) newErrors.file = "Invalid file type"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }


    const handleAddTask = async () => {
        try {
            if (!validate()) return
            const { data: userData } = await supabase.auth.getUser()
            const user = userData.user

            if (!user) {
                toast.error("User not found")
                return
            }



            const { data, error } = await supabase
                .from("tasks")
                .insert([
                    {
                        task_code: formData.task_code,
                        title: formData.title,
                        description: formData.description,
                        status: "to_do",
                        priority: formData.priority,
                        project_id: formData.project_id,
                        user_id: user?.id,
                        assigned_to: formData.assigned_to,
                        due_date: formData.due_date,
                    },
                ])
                .select()
                .single()

            if (error) throw error


            //upload
            // check file
            if (!file) {
                toast.error("Please select a file")
                return
            }

            const maxSize = 2 * 1024 * 1024

            if (file.size > maxSize) {
                alert("File size should be less than 2MB")
                return
            }


            const allowedTypes = [
                "image/png",
                "image/jpeg",
                "application/pdf",
                "application/msword", // .doc
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
            ]

            if (!allowedTypes.includes(file.type)) {
                alert("Only PNG, JPG, PDF, Word files are allowed")
                return
            }


            console.log("Valid file:", file)


            const filePath = `tasks/${data.id}/${Date.now()}-${file.name}`


            const { error: uploadError } = await supabase.storage
                .from("task_files")
                .upload(filePath, file)

            if (uploadError) throw uploadError


            const { data: publicUrlData } = supabase.storage
                .from("task_files")
                .getPublicUrl(filePath)

            const fileUrl = publicUrlData.publicUrl


            const { error: fileInsertError } = await supabase
                .from("task_files")
                .insert({
                    task_id: data.id,
                    file_url: fileUrl,
                    file_name: file.name,
                })

            if (fileInsertError) throw fileInsertError

            toast.success("Task added ")

            setOpen(false)
            refresh()


            setFormData({
                task_code: "",
                title: "",
                description: "",
                status: "to_do",
                priority: "",
                project_id: "",
                assigned_to: "",
                due_date: ""
            })

        } catch (err: any) {
            toast.error(err.message)
            console.log(err.message)
        }
    }
    useEffect(() => {
        fetchProfiles()
        fetchProjects()
        getUser()
    }, [])

    const getUser = async () => {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
    }

    const fetchProfiles = async () => {
        try {
            const { data, error } = await supabase.from("profiles").select("*")

            if (error) throw error

            setProfiles(data)
        } catch (err: any) {
            console.log(err.message)
        }
    }
    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from("projects")
                .select("id, name, project_code")

            if (error) throw error

            setProjects(data)
            console.log("Fetched Projects:", data)
        } catch (err: any) {
            console.log(err.message)
        }
    }


    return (
        <>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">


                    <div className="bg-red-900 text-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6">

                        <h2 className="text-xl font-bold mb-4">Add Task</h2>

                        <div className="flex flex-col gap-4">
                            <Label className="text-sm">Task Code *</Label>
                            <input name="task_code" placeholder="Task Code Eg. TASK100" className="p-2 rounded border border-gray-400 focus:outline-none text-gray-300 " onChange={handleChange} />
                            {errors.task_code && <p className="text-red-400 text-sm">{errors.task_code}</p>}
                            <Label className="text-sm">Title *</Label>
                            <input name="title" placeholder="title" className="p-2 rounded border border-gray-400 focus:outline-none text-gray-300" onChange={handleChange} />
                            {errors.title && <p className="text-red-400 text-sm">{errors.title}</p>}
                            <Label className="text-sm">Description *</Label>
                            <input name="description" placeholder="Description" className="p-2 rounded border border-gray-400 focus:outline-none text-gray-300" onChange={handleChange} />
                            {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
                            <Label className="text-sm">Status *</Label>
                            <input
                                type="text"
                                value="To Do"
                                disabled
                                className="p-2 rounded border border-gray-400 text-gray-300 bg-red-900"
                            />
                            {/* {errors.status && <p className="text-red-400 text-sm">{errors.status}</p>} */}
                            <Label className="text-sm">Priority *</Label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="p-2 rounded border border-gray-400 focus:outline-none text-gray-300 bg-red-900"
                            >
                                <option value="">Select Priority</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>

                            </select>
                            {errors.priority && <p className="text-red-400 text-sm">{errors.priority}</p>}
                            <Label className="text-sm">Assigned To</Label>
                            <select
                                name="assigned_to"
                                value={formData.assigned_to}
                                onChange={handleChange}
                                className="p-2 rounded border border-gray-400 focus:outline-none text-gray-300 bg-red-900"
                            >
                                <option value="">Select User</option>

                                {profiles
                                    .filter((profile) => profile.id !== user?.id)
                                    .map((profile) => (
                                        <option key={profile.id} value={profile.id}>
                                            {profile.name}
                                        </option>
                                    ))}
                            </select>
                            {errors.assigned_to && <p className="text-red-400 text-sm">{errors.assigned_to}</p>}
                            <Label className="text-sm">Project Id</Label>
                            <select
                                name="project_id"
                                value={formData.project_id}
                                onChange={handleChange}
                                className="p-2 rounded border border-gray-400 focus:outline-none text-gray-300 bg-red-900"
                            >
                                <option value="">Select Project</option>

                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.project_code} - {project.name}
                                    </option>
                                ))}
                            </select>
                            {errors.project_id && <p className="text-red-400 text-sm">{errors.project_id}</p>}
                            <Label className="text-sm">Due Date</Label>
                            <input name="due_date" type="date" placeholder="Project Name" className="p-2 rounded border border-gray-400 focus:outline-none text-gray-300" onChange={handleChange} />
                            {errors.due_date && <p className="text-red-400 text-sm">{errors.due_date}</p>}

                            <Label className="text-sm">Upload File</Label>
                            <input
                                type="file"
                                className=' p-3 rounded text-white shadow-xl hover:bg-red-200 m-2'
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleAddTask} className="bg-white text-red-900">
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
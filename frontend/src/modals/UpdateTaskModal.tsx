import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/supabase-client"
import toast from "react-hot-toast"
import { Label } from "@/components/ui/label"

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  refresh: () => void
  task: any   // 👈 selected task
}

export default function UpdateTaskModal({ open, setOpen, refresh, task }: Props) {
  const [formData, setFormData] = useState({
    task_code: "",
    title: "",
    description: "",
    status: "",
    priority: "",
    project_id: "",
    assigned_to: "",
    due_date: ""
  })

  const [profiles, setProfiles] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([]) // existing files
  const [newFile, setNewFile] = useState<File | null>(null) // new file
  const [loading, setLoading] = useState(false)
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




    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }



  useEffect(() => {
    if (task) {
      setFormData({
        task_code: task.task_code || "",
        title: task.title || "",
        description: task.description || "",
        status: task.status || "",
        priority: task.priority || "",
        project_id: task.project_id || "",
        assigned_to: task.assigned_to || "",
        due_date: task.due_date ? task.due_date.split("T")[0] : ""
      })
    }
  }, [task])

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
    const { data } = await supabase.from("profiles").select("*")
    setProfiles(data || [])
  }

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("id, name, project_code")
    setProjects(data || [])
  }
  useEffect(() => {
    if (task?.id) {
      fetchFiles()
    }
  }, [task])

  const fetchFiles = async () => {
    const { data, error } = await supabase
      .from("task_files")
      .select("*")
      .eq("task_id", task.id)

    if (!error) setFiles(data || [])
  }

  const handleUpdateTask = async () => {
    if (!validate()) return
    try {
      setLoading(true)


      const { error } = await supabase
        .from("tasks")
        .update({
          task_code: formData.task_code,
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          project_id: formData.project_id,
          assigned_to: formData.assigned_to,
          due_date: formData.due_date
        })
        .eq("id", task.id)

      if (error) throw error


      if (newFile) {

        // 1. delete old DB records
        await supabase
          .from("task_files")
          .delete()
          .eq("task_id", task.id)

        // 2. upload new file
        const filePath = `tasks/${task.id}/${newFile.name}`

        const { error: uploadError } = await supabase.storage
          .from("task_files")
          .upload(filePath, newFile, { upsert: true })

        if (uploadError) throw uploadError

        // 3. get url
        const { data: publicUrlData } = supabase.storage
          .from("task_files")
          .getPublicUrl(filePath)

        // 4. insert new record
        await supabase.from("task_files").insert({
          task_id: task.id,
          file_url: publicUrlData.publicUrl,
          file_name: newFile.name,
        })
      }

      toast.success("Task updated with file ✅")
      setOpen(false)
      refresh()

    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="bg-red-900 text-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-6">

            <h2 className="text-xl font-bold mb-4">Update Task</h2>

            <div className="flex flex-col gap-4">

              <Label>Task Code *</Label>
              <input name="task_code" value={formData.task_code} onChange={handleChange} className="p-2 rounded border text-gray-300" />
              {errors.task_code && <p className="text-red-400 text-sm">{errors.task_code}</p>}

              <Label>Title *</Label>
              <input name="title" value={formData.title} onChange={handleChange} className="p-2 rounded border text-gray-300" />
              {errors.title && <p className="text-red-400 text-sm">{errors.title}</p>}

              <Label>Description *</Label>
              <input name="description" value={formData.description} onChange={handleChange} className="p-2 rounded border text-gray-300" />
              {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}

              <Label>Status *</Label>
              <select name="status" value={formData.status} onChange={handleChange} className="p-2 rounded bg-red-900 border">
                <option value="to_do">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              {errors.status && <p className="text-red-400 text-sm">{errors.status}</p>}

              <Label>Priority *</Label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="p-2 rounded bg-red-900 border">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              {errors.priority && <p className="text-red-400 text-sm">{errors.priority}</p>}

              <Label>Assigned To</Label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="p-2 rounded bg-red-900 border"
              >
                <option value="">Select User</option>
                {profiles
                  .filter((p) => p.id !== user?.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
              {errors.assigned_to && <p className="text-red-400 text-sm">{errors.assigned_to}</p>}

              <Label>Project</Label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                className="p-2 rounded bg-red-900 border"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_code} - {p.name}
                  </option>
                ))}
              </select>
              {errors.project_id && <p className="text-red-400 text-sm">{errors.project_id}</p>}
              <Label>Due Date</Label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="p-2 rounded border text-gray-300"
              />
              {errors.due_date && <p className="text-red-400 text-sm">{errors.due_date}</p>}
              <Label>Attachments</Label>


              {files.length > 0 && (
                <div className="bg-red-800 p-2 rounded">
                  <a
                    href={files[0].file_url}
                    target="_blank"
                    className="text-blue-300 underline"
                  >
                    {files[0].file_name}
                  </a>
                </div>
              )}


              <input
                type="file"
                className="p-2 mt-2 text-gray-300"
                onChange={(e) => setNewFile(e.target.files?.[0] || null)}
              />


              {newFile && (
                <p className="text-green-300 mt-1">
                  New File: {newFile.name}
                </p>
              )}


              <div className="flex gap-2 mt-4">
                <Button onClick={handleUpdateTask} className="bg-white text-red-900" disabled={loading}>
                  {loading ? "Updating..." : "Update"}
                </Button>

                <Button onClick={() => setOpen(false)} className="bg-white text-red-900">
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
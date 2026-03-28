import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/supabase-client"
import toast from "react-hot-toast"
import { Label } from "@/components/ui/label"

export default function UpdateProjectModal({
  open,
  setOpen,
  refresh,
  project,
}: any) {
  const [formData, setFormData] = useState({
    project_code: "",
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  })
const [errors, setErrors] = useState<{ [key: string]: string }>({})
  useEffect(() => {
    if (project) {
      setFormData({
        project_code: project.project_code || "",
        name: project.name || "",
        description: project.description || "",
        start_date: project.start_date?.split("T")[0] || "",
        end_date: project.end_date?.split("T")[0] || "",
      })
    }
  }, [project])

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validate = () => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.project_code.trim()) {
            newErrors.project_code = "Project code is required"
        }

        if (!formData.name.trim()) {
            newErrors.name = "Project name is required"
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required"
        }

        if (!formData.start_date) {
            newErrors.start_date = "Start date is required"
        }

        if (!formData.end_date) {
            newErrors.end_date = "End date is required"
        }

        // Date validation
        if (formData.start_date && formData.end_date) {
            if (formData.end_date < formData.start_date) {
                newErrors.end_date = "End date cannot be before start date"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }



  const handleUpdateProject = async () => {
    try {
       if (!validate()) return
      if (!project) return

      if (formData.end_date < formData.start_date) {
        toast.error("End date cannot be before start date")
        return
      }

      const { error } = await supabase
        .from("projects")
        .update(formData)
        .eq("id", project.id)

      if (error) throw error

      toast.success("Updated successfully")
      setOpen(false)
      refresh()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-red-900 text-white p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        <h2 className="text-xl font-bold mb-4">Update Project</h2>

        <div className="flex flex-col gap-4 bg-red-900">
          <Label>Project Code</Label>
          <input name="project_code" value={formData.project_code} onChange={handleChange} className="p-2 rounded text-gray-300 border border-red-300 focus:outline-none" />
           {errors.project_code && <p className="text-red-400 text-sm">{errors.project_code}</p>}

          <Label>Name</Label>
          <input name="name" value={formData.name} onChange={handleChange} className="p-2 rounded text-gray-300 border border-red-300 focus:outline-none" />
           {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}

          <Label>Description</Label>
          <input name="description" value={formData.description} onChange={handleChange} className="p-2 rounded text-gray-300 border border-red-300 focus:outline-none" />
           {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}

          <Label>Start Date</Label>
          <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="p-2 rounded text-gray-300 border border-red-300 focus:outline-none" />
           {errors.start_date && <p className="text-red-400 text-sm">{errors.start_date}</p>}

          <Label>End Date</Label>
          <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="p-2 rounded text-gray-300 border border-red-300 focus:outline-none" />
           {errors.end_date && <p className="text-red-400 text-sm">{errors.end_date}</p>}

          <div className="flex gap-2 mt-4">
            <Button onClick={handleUpdateProject} className="bg-white text-red-900">
              Update
            </Button>

            <Button onClick={() => setOpen(false)} className="bg-white text-red-900">
              Cancel
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
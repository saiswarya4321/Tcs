import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/supabase-client"

type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  task: any
}

export default function ViewTaskModal({ open, setOpen, task }: Props) {
  const [files, setFiles] = useState<any[]>([])

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

    if (error) {
      console.log(error.message)
    } else {
      setFiles(data)
    }
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-red-900 text-gray-300 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Task Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">

          <p><b>Task Code:</b> {task.task_code}</p>
          <p><b>Title:</b> {task.title}</p>
          <p><b>Description:</b> {task.description}</p>
          <p><b>Status:</b> {task.status}</p>
          <p><b>Priority:</b> {task.priority}</p>
          <p><b>Project:</b> {task.project_id}</p>
          <p><b>Created By:</b> {task.user_id}</p>
          <p><b>Assigned To:</b> {task.assigned_to}</p>
          <p><b>Due Date:</b> {task.due_date}</p>

          {/* 🔥 FILE SECTION */}
          <div className="mt-4">
            <p className="font-bold text-white mb-2">Attachments:</p>

            {files.length === 0 ? (
              <p>No files uploaded</p>
            ) : (
              files.map((file) => (
                <div key={file.id} className="mb-2">
                  <a
                    href={file.file_url}
                    target="_blank"
                    className="text-blue-300 underline"
                  >
                    {file.file_name}
                  </a>
                </div>
              ))
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
import Sidebar from '@/components/Sidebar'
import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { supabase } from '@/supabase-client'
import toast from 'react-hot-toast'

type Tasks = {
  id: string
  task_code: string
  title: string
  description: string
  status: string
  priority: string
  project_id: string
   project_name: string
  user_id: string
  assigned_to: string
  assigned_name: string
  due_date: string
  created_at: string

}
type TaskType = {
  project_id: string
  project_name: string
  // other fields if needed
}
import UpdateTaskModal from '@/modals/UpdateTaskModal'
import AddTaskModal from '@/modals/AddTaskModal'
import ViewTaskModal from '@/modals/ViewTaskModal'

export default function Task() {
  const [tasks, setTasks] = useState<Tasks[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Tasks | null>(null)
  const [search, setSearch] = useState("")

  const [filterType, setFilterType] = useState("all")
  const [statusFilter, setStatusFilter] = useState("")
  const [projectFilter, setProjectFilter] = useState("")
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [viewOpen, setViewOpen] = useState(false)


 useEffect(() => {
  fetchTasks()
}, [search, filterType, statusFilter, projectFilter])

const fetchTasks = async () => {
  try {
    setLoading(true);

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    const user = userData.user
    if (!user?.id) return
    setUser(user)

    const { data: tasksData, error } = await supabase.rpc("get_user_tasks", {
      uid: user.id,
      search: search || null,
      filter_type: filterType === "all" ? null : filterType,
      status_filter: statusFilter || null,
      project_filter: projectFilter || null
    })
    if (error) throw error

    setTasks(tasksData || [])

    // Fill dropdown based on table tasks
  const projectsDropdown = Array.from(
  new Map(
    (tasksData as TaskType[] || []).map(t => [t.project_id, { id: t.project_id, name: t.project_name }])
  ).values()
)



setProjects(projectsDropdown)

  } catch (err: any) {
    console.log("Error fetching tasks:", err.message)
    toast.error("Failed to fetch tasks")
  } finally {
    setLoading(false)
  }
}

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", id)

      if (error) throw error

      toast.success("Status updated")


      setTasks(prev =>
        prev.map(t => t.id === id ? { ...t, status } : t)
      )

    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id: string) => {
    try {

      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast.success("Task deleted")
      setTasks((prev) => prev.filter((t) => t.id !== id))

    } catch (err: any) {
      toast.error(err.message)
    }
  }
{loading && <p className='text-gray-300 md:ml-74'>Loading....</p>}
  return (
    <div className='min-h-screen'>
      <Sidebar />
      <div className='md:ml-74 flex flex-col  md:mt-10 mr-10'>

        <div className='flex w-full justify-between p-2'>
          <input
            type="text"
            placeholder="Search by name or code..."
            className="p-3  border  w-full max-w-sm  bg-red-900 text-gray-300 rounded-xl shadow-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className='bg-red-900 p-2 rounded-xl shadow-xl flex justify-between w-full'>

            <select onChange={(e) => setFilterType(e.target.value)} className='text-red-900 bg-gray-300 mr-1 rounded-xl shadow-xl p-1 w-full'>
              <option value="all">All</option>
              <option value="assigned">Assigned to Me</option>
              <option value="created">Created by Me</option>
            </select>


            <select onChange={(e) => setStatusFilter(e.target.value)} className='text-red-900 bg-gray-300 mr-1 rounded-xl shadow-xl p-1 w-full'>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>


            <select
  onChange={(e) => setProjectFilter(e.target.value)}
  className="text-red-900 bg-gray-300 rounded-xl p-2 w-full"
>
  <option value="">All Projects</option>
  {projects.map((proj) => (
    <option key={proj.id} value={proj.id}>
      {proj.name}
    </option>
  ))}
</select>
          </div>

        </div>
        <Table className='bg-red-900 text-gray-100 rounded-xl'>
          <TableCaption>A list of your tasks.</TableCaption>

          

          <TableHeader className=' text-gray-50'>
            <TableRow>
              
              <TableHead className=' text-gray-50'>Task Code</TableHead>
              <TableHead className=' text-gray-50'>Title</TableHead>
              <TableHead className=' text-gray-50'>Assigned To</TableHead>
              <TableHead className=' text-gray-50'>Status</TableHead>
              <TableHead className=' text-gray-50'>Priority</TableHead>
              <TableHead className=' text-gray-50'>Due Date</TableHead>


              <TableHead className="text-right">
                {user && (
                  <Button
                    className='text-red-900 bg-gray-200 font-bold shadow-xl'
                    onClick={() => setOpen(true)}
                  >
                    ADD
                  </Button>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-white py-4">
                  No Tasks found
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => {

                const isCreator = task.user_id === user?.id
                const isAssigned = task.assigned_to === user?.id

                return (
                  <TableRow key={task.id}>
                    
                    <TableCell>{task.task_code}</TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.assigned_name}</TableCell>
                    
                    
                    <TableCell>
                      {isAssigned ? (

                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="text-red-900 bg-gray-300 p-1 rounded"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (

                        <span className="capitalize">{task.status}</span>
                      )}
                    </TableCell>
<TableCell>{task.priority}</TableCell>
                    <TableCell>{task.due_date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">

                        {isCreator && (
                          <>
                          <Button className='text-red-900 bg-gray-200 font-bold shadow-xl text-xs'
  onClick={() => {
    setSelectedProject(task)
    setViewOpen(true)
  }}
>
  VIEW
</Button>
                            <Button
                              className='text-red-900 bg-gray-200 font-bold shadow-xl text-xs'
                              onClick={() => {
                                setSelectedProject(task)
                                setUpdateOpen(true)
                              }}
                            >
                              UPDATE
                            </Button>

                            <Button
                              className='text-red-900 bg-gray-200 font-bold shadow-xl text-xs'
                              onClick={() => handleDelete(task.id)}
                            >
                              DELETE
                            </Button>
                          </>
                        )}

                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

      </div>

      <AddTaskModal
        open={open}
        setOpen={setOpen}
        refresh={fetchTasks}
      />
      <UpdateTaskModal
        open={updateOpen}
        setOpen={setUpdateOpen}
        refresh={fetchTasks}
        task={selectedProject}
      />
      <ViewTaskModal
  open={viewOpen}
  setOpen={setViewOpen}
  task={selectedProject}
/>
    </div>
  )
}

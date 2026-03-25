import Sidebar from '@/components/Sidebar'
import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
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
      user_id: string
       assigned_to: string
  due_date: string
  created_at: string
}

import AddProjectModal from "../../src/modals/AddProjectModal"
import UpdateProjectModal from '@/modals/UpdateProjectModal'
import AddTaskModal from '@/modals/AddTaskModal'

export default function Task() {
    const [tasks, setTasks] = useState<Tasks[]>([])
    const[loading,setLoading]=useState(false)
    const [open, setOpen] = useState(false)
    const [updateOpen, setUpdateOpen] = useState(false)
const [selectedProject, setSelectedProject] = useState<Project | null>(null)
const [search, setSearch] = useState("")



    useEffect(() => {
    fetchProjects()
  }, [])

const fetchProjects = async () => {
    try {
      setLoading(true)

      const { error: userError, data: userData } = await supabase.auth.getUser()
      if (userError) throw userError
      console.log("userData", userData)
      const user = userData.user
      // const { data, error } = await supabase
      //   .from('tasks')
      //   .select('*')
      // // .eq("user_id",userData.user.id)

      const { error, data } = await supabase.rpc("get_user_tasks", { uid: user.id })


      if (error) {
        throw error
      }

      setTasks(data)
      console.log("Data:", data)

    } catch (err: any) {
      console.log("Error on fetching tasks:", err.message)
      if (err.message.includes("permission")) {
        toast.error("Not allowed (RLS policy)")
      } else {
        toast.error("Error on Listing")
      }
    }
    finally {
      setLoading(false)
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
  const filteredTasks = tasks.filter((task) =>
  (task.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
  (task.task_code?.toLowerCase() || "").includes(search.toLowerCase())
)


  return (
    <div className='min-h-screen'>
        <Sidebar/>
        <div className='md:ml-74 flex flex-col  md:mt-10 mr-10'>
            <input
  type="text"
  placeholder="Search by name or code..."
  className="p-2 rounded border  w-full max-w-sm mb-4 bg-red-900 text-gray-300 rounded-xl shadow-xl"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
             <Table className='bg-red-900 text-gray-100 rounded-xl'>
      <TableCaption>A list of your tasks.</TableCaption>
       {loading && <p className='text-gray-300 md:ml-74'>Loading....</p>}
      <TableHeader className=' text-gray-50'>
        <TableRow >
          <TableHead className="w-[100px] text-gray-50">Task Id</TableHead>
          <TableHead className=' text-gray-50'>Task Code</TableHead>
          <TableHead className=' text-gray-50'>Title</TableHead>
           {/* <TableHead className=' text-gray-50'>Description</TableHead>
            <TableHead className=' text-gray-50'>Start_Date</TableHead>
             <TableHead className=' text-gray-50'>End_Date</TableHead> */}
             <TableHead className=' text-gray-50'>Assigned To</TableHead>
              <TableHead className=' text-gray-50'>Due Date</TableHead>
          
          <TableHead className="text-right "><Button className='text-red-900 bg-gray-200 font-bold shadow-xl' onClick={() => setOpen(true)}>ADD</Button></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
      {filteredTasks.length === 0 ? (
  <TableRow>
    <TableCell colSpan={5} className="text-center text-white py-4">
      No Tasks found 
    </TableCell>
  </TableRow>
) : (
  filteredTasks.map((task) => (
    <TableRow key={task.id}>
      <TableCell className="font-medium">{task.id}</TableCell>
      <TableCell>{task.task_code}</TableCell>
      <TableCell>{task.title}</TableCell>
      <TableCell>{task.assigned_to}</TableCell>
      <TableCell>{task.due_date}</TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          <Button className='text-red-900 bg-gray-200 font-bold shadow-xl text-xs'
            onClick={() => {
              setSelectedProject(task)
              setUpdateOpen(true)
            }}
          >
            UPDATE
          </Button>

          <Button className='text-red-900 bg-gray-200 font-bold shadow-xl text-xs' onClick={() => handleDelete(task.id)}>
            DELETE
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ))
)}
      </TableBody>
     
    </Table>
   
        </div>
        
      <AddTaskModal
  open={open}
  setOpen={setOpen}
  refresh={fetchProjects}
/>
<UpdateProjectModal
  open={updateOpen}
  setOpen={setUpdateOpen}
  refresh={fetchProjects}
  project={selectedProject}
/>
    </div>
  )
}

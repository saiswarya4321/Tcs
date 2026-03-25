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

type Project = {
  id: string
  project_code: string
  name: string
  description: string
  start_date: string
  end_date:string
  created_by: string
  created_at: string
}

import AddProjectModal from "../../src/modals/AddProjectModal"
import UpdateProjectModal from '@/modals/UpdateProjectModal'

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([])
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

      const { error, data } = await supabase.rpc("get_user_projects", { uid: user.id })


      if (error) {
        throw error
      }

      setProjects(data)
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
      .from("projects")
      .delete()
      .eq("id", id)

    if (error) throw error

    toast.success("Project deleted")
   setProjects((prev) => prev.filter((p) => p.id !== id))

  } catch (err: any) {
    toast.error(err.message)
  }
}
  const filteredProjects = projects.filter((project) =>
  (project.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
  (project.project_code?.toLowerCase() || "").includes(search.toLowerCase())
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
      <TableCaption>A list of your projects.</TableCaption>
       {loading && <p className='text-gray-300 md:ml-74'>Loading....</p>}
      <TableHeader className=' text-gray-50'>
        <TableRow >
          <TableHead className="w-[100px] text-gray-50">Project Id</TableHead>
          <TableHead className=' text-gray-50'>Project Code</TableHead>
          <TableHead className=' text-gray-50'>Name</TableHead>
           {/* <TableHead className=' text-gray-50'>Description</TableHead>
            <TableHead className=' text-gray-50'>Start_Date</TableHead>
             <TableHead className=' text-gray-50'>End_Date</TableHead> */}
             <TableHead className=' text-gray-50'>Created_By</TableHead>
              {/* <TableHead className=' text-gray-50'>Created_At</TableHead> */}
          
          <TableHead className="text-right"><Button className='text-red-900 bg-gray-200 font-bold shadow-xl' onClick={() => setOpen(true)}>ADD</Button></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
      {filteredProjects.length === 0 ? (
  <TableRow>
    <TableCell colSpan={5} className="text-center text-white py-4">
      No projects found 
    </TableCell>
  </TableRow>
) : (
  filteredProjects.map((project) => (
    <TableRow key={project.id}>
      <TableCell className="font-medium">{project.id}</TableCell>
      <TableCell>{project.project_code}</TableCell>
      <TableCell>{project.name}</TableCell>
      <TableCell>{project.created_by}</TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          <Button className='text-red-900 bg-gray-200 font-bold shadow-xl'
            onClick={() => {
              setSelectedProject(project)
              setUpdateOpen(true)
            }}
          >
           UPDATE
          </Button>

          <Button className='text-red-900 bg-gray-200 font-bold shadow-xl' onClick={() => handleDelete(project.id)}>
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
        
      <AddProjectModal
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

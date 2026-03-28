import { Home, User,  LogOut, Menu, Tags,MessageCircle,FileAxis3D} from "lucide-react"
import { useEffect, useState } from "react"

import { useNavigate } from "react-router-dom"
import { supabase } from "@/supabase-client"
import toast from "react-hot-toast"
import { useLocation } from "react-router-dom"



export default function Sidebar() {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const [profile,setProfile]=useState<any>("")
    const [loading,setLoading]=useState(false)
     const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    console.log("Logged out")
    toast.success("Logout successfully")
    navigate("/")

  } catch (err: any) {
    console.error("Logout error:", err.message)
  }
}
useEffect(()=>{
getUser()
},[])

const getUser=async()=>{
    try {
      setLoading(true)
      const{error,data}=await supabase.auth.getUser()
      if(error) throw error
      const userData=data.user
      //setUser(userData)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", userData.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)
    } catch (error:any) {
      console.log(error.message)
    }
    finally{
      setLoading(false)
    }
  }

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden flex items-center justify-between p-4 bg-red-900 text-white">
                <h1 className="text-lg font-semibold">Team Collaboration System</h1>
                <Menu onClick={() => setOpen(!open)} className="cursor-pointer" />
            </div>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-red-900 text-white transform ${open ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 transition-transform duration-300 z-50`}
            >
               <div className="m-2 p-2 bg-red-950 rounded-xl shadow-xl text-center">Team Collaboration System</div>
               {loading && <p >Loading......</p>}
              <p className="text-sm text-gray-300 md:ml-4 p-2"><span className="text-gray-400 mr-1">Logged In</span> {profile?.name}</p>
                <nav className="flex flex-col gap-2 p-4 md:gap-4">
                     
                    <SidebarItem icon={<Home size={18} />} label="Home" onClick={() => navigate("/dashboard")} active={location.pathname === "/dashboard"} />
                    <SidebarItem icon={<User size={18} />} label="Profile" onClick={() =>navigate("/profile")} active={location.pathname === "/profile"}/>
                    <SidebarItem icon={<Tags size={18} />} label="Tasks" onClick={() =>navigate("/task")} active={location.pathname === "/task"}/>
                      <SidebarItem icon={<FileAxis3D size={18} />} label="Projects" onClick={() =>navigate("/projects")} active={location.pathname === "/projects"}/>
                      <SidebarItem icon={<MessageCircle size={18} />} label="Chats" onClick={() =>navigate("/messages")} active={location.pathname === "/messages"}/>
                           
                    <SidebarItem icon={<LogOut size={18} />} label="Logout" onClick={handleLogout}/>
                    
                </nav>
            </div>

            {/* Overlay (mobile) */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}
        </>
    )
}

function SidebarItem({ icon, label,onClick ,active}: any) {
    return (
      <div
      onClick={onClick}
     className={`flex items-center gap-2 p-2 md:p-4 rounded-full cursor-pointer  bg-red-800
        ${active ? "bg-red-950 text-white rounded-xl shadow-xl" : "hover:bg-red-950 rounded-xl shadow-xl"}`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    )
}
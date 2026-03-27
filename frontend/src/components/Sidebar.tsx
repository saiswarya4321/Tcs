import { Home, User, Settings, LogOut, Menu, Tags, File,MessageCircle} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/supabase-client"
import toast from "react-hot-toast"

export default function Sidebar() {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
     const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    console.log("Logged out")
    toast.success("Logout successfully")
    navigate("/login")

  } catch (err: any) {
    console.error("Logout error:", err.message)
  }
}

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="md:hidden flex items-center justify-between p-4 bg-red-900 text-white">
                <h1 className="text-lg font-semibold">My App</h1>
                <Menu onClick={() => setOpen(!open)} className="cursor-pointer" />
            </div>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-red-900 text-white transform ${open ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 transition-transform duration-300 z-50`}
            >
               Team Collaboration System
                <nav className="flex flex-col gap-2 p-4">
                    <SidebarItem icon={<Home size={18} />} label="Home" onClick={() => navigate("/dashboard")} />
                    <SidebarItem icon={<User size={18} />} label="Profile" onClick={() =>navigate("/profile")} />
                    <SidebarItem icon={<Tags size={18} />} label="Tasks" onClick={() =>navigate("/task")} />
                      <SidebarItem icon={<File size={18} />} label="Projects" onClick={() =>navigate("/projects")} />
                      <SidebarItem icon={<MessageCircle size={18} />} label="Chats" onClick={() =>navigate("/messages")} />
                           
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

function SidebarItem({ icon, label,onClick }: any) {
    return (
      <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-800 cursor-pointer transition"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    )
}
import  { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/supabase-client'


function Dashboard() {

  const[user,setUser]=useState<any>("")
  const[loading,setLoading]=useState(false)
  const [profile, setProfile] = useState<{ name: string } | null>(null)
  useEffect(()=>{
getUser()
  },[])

  const getUser=async()=>{
    try {
      setLoading(true)
      const{error,data}=await supabase.auth.getUser()
      if(error) throw error
      const userData=data.user
      setUser(userData)
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
    <div >
        <Sidebar/>
      <div className='ml-64 min-h-screen flex flex-col justify-center items-center bg-red-950'>
        <div className='bg-red-900 p-10 text-white font-bold  max-w-md rounded shadow'>
          <p>
            Welcome {profile?.name || user?.email || "User"}
          </p>

        </div>
        {loading && <p className='text-gray-300'>Loading....</p>}
        
        
      </div>
    </div>
  )
}

export default Dashboard

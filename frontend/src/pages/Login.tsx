

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import toast from 'react-hot-toast'
import { supabase } from '@/supabase-client'

function Login() {
  const navigate=useNavigate()
        const [email,setEmail]=useState('')
        const [password,setPassword]=useState('')
        const [loading, setLoading] = useState(false)
        const [showPassword, setShowPassword] = useState(false)
        const handleLogin= async()=>{
            try {
                setLoading(true)
                let {data,error}=await supabase.auth.signInWithPassword({
                    email:email,
                    password:password
                })
                if(error) throw error
                 console.log("Logged in:", data)

    toast.success("Login successful")
    navigate("/dashboard")

            } catch (err:any) {
                console.log("Error in Login",err.message)
                toast.error("Error in Login",err.message)
                navigate("/")
            }
           finally{
            setLoading(false)
           }
        }
    

  return (
    <>
     <div className=' min-h-screen flex flex-col items-center justify-center text-blue-600'> 
     
      <Card className="w-full max-w-sm bg-red-900 ">
      <CardHeader>
        <CardTitle className='text-white'>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link" className='text-white' onClick={()=>navigate("/signup")}>Sign Up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className='text-white'>Email</Label>
              <Input
                id="email"
                type="email" className='text-white '
                placeholder="m@example.com"
                required onChange={(e)=>setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className='text-white'>Password</Label>
                
              </div>
              <Input id="password" type="password" required className='text-white' onChange={(e)=>setPassword(e.target.value)} />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full bg-red-900" onClick={handleLogin}>
          Login
        </Button>
       
      </CardFooter>
    </Card>
     </div>
    </>
  )
}

export default Login

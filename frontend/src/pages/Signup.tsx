import React, { useState } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'
import { supabase } from '@/supabase-client'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
    const navigate=useNavigate()
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [loading, setLoading] = useState(false)
     const [showPassword, setShowPassword] = useState(false)
     const [name,setName]=useState('')
     const[userId,setuserId]=useState('')
     const[phone_number,setPhone_Number]=useState('')
     const[location,setLocation]=useState('')
     
    
    const handleSignup = async () => {
  try {
    if (loading) return; 
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    })

    if (error) throw error

    console.log("User created:", data)
const user = data?.user

if (!user) {
  toast.error("User not created properly")
  return
}
    console.log("User ID:", user?.id)
    console.log("Signup clicked")


    const { error: insertError } = await supabase.from("profiles").insert([{
        employee_id:userId,
  name:name,
  email,
  id: user.id,
  phone_number:phone_number,
  location:location
  
}])

if (insertError) throw insertError

    toast.success("Signup successful")
    navigate("/dashboard")

  } catch (err: any) {
    toast.error(err.message)
    navigate("/signup")
  }
  finally{
    setLoading(false)
  }
}

  return (
     <div className=' min-h-screen flex flex-col items-center justify-center text-blue-600'> 
     
      <Card className="w-full max-w-sm bg-red-900 shadow-xl">
      <CardHeader>
        <CardTitle className='text-white'>Signup to your account</CardTitle>
        <CardDescription>
          Enter your email below to signup to your account
        </CardDescription>
        <CardAction>
          <Button variant="link" className='text-white'>Login</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form
  onSubmit={(e) => {
    e.preventDefault()
    handleSignup()
  }}
>
          <div className="flex flex-col gap-6">
             <div className="grid gap-2">
              <Label htmlFor="employee_id" className='text-white'>Employee Id</Label>
              <Input
                id="employee_id"
                type="text" className='text-white '
                placeholder="EMP100"
                required onChange={(e)=>setuserId(e.target.value)}
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="name" className='text-white'>Name</Label>
              <Input
                id="name"
                type="text" className='text-white '
                placeholder="examplename"
                required onChange={(e)=>setName(e.target.value)}
              />
            </div>
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
            <div className="grid gap-2">
              <Label htmlFor="employee_id" className='text-white'>Phone Number</Label>
              <Input
                id="phone_number"
                type="tel" className='text-white '
                placeholder="98999999999"
                required onChange={(e)=>setPhone_Number(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location" className='text-white'>Location</Label>
              <Input
                id="location"
                type="text" className='text-white '
                placeholder="e.g. Trivandrum"
                required onChange={(e)=>setLocation(e.target.value)}
              />
            </div>
          
             
            
          </div>
          <CardFooter className="flex-col gap-2 mt-4 mb-2">
       <Button
  type="submit"
  className="w-full bg-red-900"
  disabled={loading}
>
  {loading ? "Signing up..." : "Signup"}
</Button>
      </CardFooter>
           
       
        </form>
      </CardContent>
      
    </Card>
     </div>
  )
}

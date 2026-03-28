import { useState } from 'react'
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
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; userId?: string }>({})

  const [userId, setuserId] = useState('')

  const validate = () => {
    const newErrors: { email?: string; password?: string; userId?: string } = {}


    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else {

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        newErrors.email = "Invalid email format"
      }
    }


    if (!password) {
      newErrors.password = "Password is required"
    } else {

      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
      if (!passwordRegex.test(password)) {
        newErrors.password = "Password must be at least 6 characters and include letters and numbers"
      }
    }
    if (!userId) {
      newErrors.userId = "Employee Id is required"
    }

    setErrors(newErrors)


    return Object.keys(newErrors).length === 0
  }


  const handleSignup = async () => {
    if (!validate()) return
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
        employee_id: userId,

        email,
        id: user.id,


      }])

      if (insertError) throw insertError

      toast.success("Signup successful")
      navigate("/dashboard")

    } catch (err: any) {
      toast.error(err.message)
      navigate("/signup")
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className=' min-h-screen flex flex-col items-center justify-center text-blue-600 bg-red-950'>

      <Card className="w-full max-w-sm bg-red-900 shadow-xl">
        <CardHeader>
          <CardTitle className='text-white'>Signup to your account</CardTitle>
          <CardDescription>
            Enter your email below to signup to your account
          </CardDescription>
          <CardAction>
            <Button variant="link" className='text-white' onClick={() => navigate("/")}>Login</Button>
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
                  onChange={(e) => setuserId(e.target.value)}
                />
                {errors.userId && <p className="text-gray-400 text-sm">{errors.userId}</p>}
              </div>
              {/* <div className="grid gap-2">
              <Label htmlFor="name" className='text-white'>Name</Label>
              <Input
                id="name"
                type="text" className='text-white '
                placeholder="examplename"
                required onChange={(e)=>setName(e.target.value)}
              />
            </div> */}
              <div className="grid gap-2">
                <Label htmlFor="email" className='text-white'>Email</Label>
                <Input
                  id="email"
                  type="email" className='text-white '
                  placeholder="m@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-gray-400 text-sm">{errors.email}</p>}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className='text-white'>Password</Label>

                </div>
                <Input id="password" type="password" className='text-white' onChange={(e) => setPassword(e.target.value)} placeholder='user1234' />
                {errors.password && <p className="text-gray-400 text-sm">{errors.password}</p>}
              </div>
              {/* <div className="grid gap-2">
              <Label htmlFor="employee_id" className='text-white'>Phone Number</Label>
              <Input
                id="phone_number"
                type="tel" className='text-white '
                placeholder="98999999999"
                required onChange={(e)=>setPhone_Number(e.target.value)}
              />
            </div> */}
              {/* <div className="grid gap-2">
              <Label htmlFor="location" className='text-white'>Location</Label>
              <Input
                id="location"
                type="text" className='text-white '
                placeholder="e.g. Trivandrum"
                required onChange={(e)=>setLocation(e.target.value)}
              />
            </div>
           */}


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

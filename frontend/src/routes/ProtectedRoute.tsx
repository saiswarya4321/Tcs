import { Navigate } from "react-router-dom"
import { useEffect, useState} from "react"
import { supabase } from "../supabase-client"
import type { ReactNode } from "react"

type Props = {
  children: ReactNode
}

const ProtectedRoute = ({ children }: Props) => {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }

    getUser()
  }, [])

  if (loading) return <p>Loading...</p>

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
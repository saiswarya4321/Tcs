import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import ProtectedRoute from './routes/ProtectedRoute.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Signup from './pages/Signup.tsx'
import { Toaster } from "react-hot-toast"
import Task from './pages/Task.tsx'
import Projects from './pages/Projects.tsx'
import Profile from './pages/Profile.tsx'
import Messages from './pages/Messages.tsx'
import Login from './pages/Login.tsx'

createRoot(document.getElementById('root')!).render(
   <StrictMode>
     <Toaster position="top-center" />
    
    
    <BrowserRouter>
    <Routes>
      <Route path='/dashboard' element={<ProtectedRoute><Dashboard/></ProtectedRoute>}></Route>
      <Route path='/signup' element={<Signup/>}></Route>
      <Route path='/app' element={<App/>}></Route>
        <Route path='/task' element={<Task/>}></Route>
        <Route path='/projects' element={<ProtectedRoute><Projects/></ProtectedRoute>}></Route>
        <Route path='/profile' element={<ProtectedRoute><Profile/></ProtectedRoute>}></Route>
        <Route path='/messages' element={<ProtectedRoute><Messages/></ProtectedRoute>}></Route>
        <Route path='/' element={<Login/>}></Route>
     
    </Routes>
    </BrowserRouter>
    
  </StrictMode>
)

import Sidebar from "@/components/Sidebar"
import { supabase } from "@/supabase-client"
import { useEffect, useState } from "react"
import NewChatModal from "@/modals/NewChatModal"

type User = {
  id: string
  name: string
}

type Message = {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  created_at: string
}

export default function Messages() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [openModal, setOpenModal] = useState(false)
  

  
  useEffect(() => {
    getUser()
    fetchUsers()
  }, [])

  const getUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*")
    setUsers(data || [])
  }
const filteredUsers = users.filter((u) => u.id !== user?.id)
  
  useEffect(() => {
    if (selectedUser && user) {
      fetchMessages()
    }
  }, [selectedUser, user])

  const fetchMessages = async () => {
    if (!selectedUser || !user) return

    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true })

    setMessages(data || [])
  }

  
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: any) => {
          const msg: Message = payload.new

          if (
            selectedUser &&
            ((msg.sender_id === user.id &&
              msg.receiver_id === selectedUser.id) ||
              (msg.sender_id === selectedUser.id &&
                msg.receiver_id === user.id))
          ) {
            setMessages((prev) => [...prev, msg])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedUser, user])
 const anon_key=import.meta.env.VITE_SUPABASE_ANON_KEY
  
  const sendMessage = async () => {
    if (!message.trim() || !selectedUser || !user) return

   await fetch(
  "https://wtqtigbbtbfhohcqrels.supabase.co/functions/v1/hyper-task",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anon_key}`, 

    },
    body: JSON.stringify({
      sender_id: user.id,
      receiver_id: selectedUser.id,
      message: message,
    }),
  }
)

    setMessage("")
    fetchMessages()
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="h-screen flex bg-[#0b141a] text-white w-full md:ml-74">

        {/* LEFT PANEL */}
        <div className="w-1/3 border-r border-gray-700 bg-[#111b21] overflow-y-auto">
          
          <div className="p-4 font-bold text-lg border-b border-gray-700 flex justify-between items-center">
  Chats

  <button
    onClick={() => setOpenModal(true)}
    className="bg-[#00a884] w-8 h-8 rounded-full flex items-center justify-center text-white text-lg"
  >
    +
  </button>
</div>

          {filteredUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`p-3 cursor-pointer hover:bg-[#2a3942] ${
                selectedUser?.id === u.id ? "bg-[#2a3942]" : ""
              }`}
            >
              <p className="font-semibold">{u.name}</p>
              <p className="text-sm text-gray-400">Tap to chat</p>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col">

  {/* ❌ no user selected */}
  {!selectedUser && (
    <div className="flex-1 flex items-center justify-center text-gray-400">
      Select a user to view conversation
    </div>
  )}
  

  {/* ✅ user selected */}
  {selectedUser && (
    <>
      {/* HEADER */}
      <div className="p-4 border-b border-gray-700 bg-[#202c33]">
        <p className="font-semibold">{selectedUser.name}</p>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white text-black">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === user?.id
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div className="bg-gray-200 px-3 py-2 rounded">
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-3 bg-[#202c33] flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-2 rounded"
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </>
  )}

</div>
      </div>
      <NewChatModal
  open={openModal}
  setOpen={setOpenModal}
  users={users}
  currentUserId={user?.id}
  onSelectUser={(u) => setSelectedUser(u)}
/>
    </div>
  )
}
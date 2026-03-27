import Sidebar from "@/components/Sidebar"
import { supabase } from "@/supabase-client"
import { useEffect, useState } from "react"
import NewChatModal from "@/modals/NewChatModal"

type User = { id: string; name: string }
type Message = {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  created_at: string
}

export default function Messages() {
  const [user, setUser] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [chatUsers, setChatUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [openModal, setOpenModal] = useState(false)

  const anon_key = import.meta.env.VITE_SUPABASE_ANON_KEY

  // Get logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setUser({ id: data.user.id, name: data.user.email || "User" })
    }
    fetchUser()
  }, [])

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("profiles").select("*")
      setAllUsers(data || [])
    }
    fetchUsers()
  }, [])

  // Fetch chat users via RPC
  useEffect(() => {
  if (!user) return

  const fetchChatUsers = async () => {
    const { data } = await supabase.rpc("get_chat_users", { uid: user.id })

    setChatUsers(
      (data || []).map((u: any) => ({
        id: u.id,
        name: u.name || u.email || "User", // fallback if name missing
      }))
    )
  }

  fetchChatUsers()
}, [user])

  // Fetch messages with selected user
  useEffect(() => {
    if (!user || !selectedUser) return
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true })
      setMessages(data || [])
    }
    fetchMessages()
  }, [user, selectedUser])

  // Realtime listener
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
            ((msg.sender_id === user.id && msg.receiver_id === selectedUser.id) ||
              (msg.sender_id === selectedUser.id && msg.receiver_id === user.id))
          ) {
            setMessages((prev) => [...prev, msg])
          }
          if (msg.sender_id === user.id || msg.receiver_id === user.id) {
            // Refresh chat users
            supabase.rpc("get_chat_users", { uid: user.id }).then(({ data }) => {
              setChatUsers(data || [])
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, selectedUser])

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
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="h-screen flex bg-red-900 text-white w-full md:ml-64">
        {/* LEFT PANEL */}
        <div className="w-1/3 border-r border-red-700 bg-red-950 overflow-y-auto">
          <div className="p-4 font-bold text-lg border-b border-gray-700 flex justify-between items-center">
            Chats
            <button
              onClick={() => user && setOpenModal(true)}
              className="bg-red-900 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg"
            >
              +
            </button>
          </div>

          {chatUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`p-3 cursor-pointer hover:bg-red-900 ${
                selectedUser?.id === u.id ? "bg-red-950" : ""
              }`}
            >
              <p className="font-semibold">{u.name}</p>
              <p className="text-sm text-gray-400">Tap to chat</p>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center bg-red-950 text-gray-400">
              Select a user to view conversation
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-red-700 bg-red-950">
                <p className="font-semibold">{selectedUser.name}</p>
              </div>

              {user && (
  <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-red-900 text-black">
    {messages.map((msg) => (
      <div
        key={msg.id}
        className={`flex ${
          msg.sender_id === user.id ? "justify-end" : "justify-start"
        }`}
      >
        <div className="bg-red-200 px-3 py-2 rounded">
          {msg.message}
          <p className="text-[10px] text-gray-600 text-right mt-1">
            {formatTime(msg.created_at)}
          </p>
        </div>
      </div>
    ))}
  </div>
)}

              <div className="p-3 bg-red-950 flex gap-2 text-gray-300 ">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 p-2 rounded border border-red-500 focus:outline-none"
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* NEW CHAT MODAL */}
      <NewChatModal
        open={openModal && !!user} // only open if user exists
        setOpen={setOpenModal}
        users={allUsers}
        currentUserId={user?.id || ""}
        onSelectUser={(u) => setSelectedUser(u)}
      />
    </div>
  )
}
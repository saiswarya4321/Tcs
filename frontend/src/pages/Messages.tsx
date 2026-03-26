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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [openModal, setOpenModal] = useState(false)

  const [allUsers, setAllUsers] = useState<any[]>([])
  const [chatUsers, setChatUsers] = useState<any[]>([])

  // get logged user + all users
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
    setAllUsers(data || [])
  }

  // fetch chat users (history only)
  const fetchChatUsers = async () => {
    if (!user) return

    const { data, error } = await supabase.rpc("get_chat_users", {
      uid: user.id,
    })

    if (error) {
      console.log(error.message)
    } else {
      setChatUsers(data || []) //  safe
    }
  }

  useEffect(() => {
    if (user) fetchChatUsers()
  }, [user])

  // fetch messages
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
    if (selectedUser && user) {
      fetchMessages()
    }
  }, [selectedUser, user])

  // realtime
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload: any) => {
          const msg: Message = payload.new

          // update chat window
          if (
            selectedUser &&
            ((msg.sender_id === user.id &&
              msg.receiver_id === selectedUser.id) ||
              (msg.sender_id === selectedUser.id &&
                msg.receiver_id === user.id))
          ) {
            setMessages((prev) => [...prev, msg])
          }

          // update sidebar users
          if (
            msg.sender_id === user.id ||
            msg.receiver_id === user.id
          ) {
            fetchChatUsers()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedUser, user])

  const anon_key = import.meta.env.VITE_SUPABASE_ANON_KEY

  // ✅ send message
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
    fetchChatUsers() // ✅ update sidebar
  }

  const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
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
              onClick={() => setOpenModal(true)}
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

          {!selectedUser && (
            <div className="flex-1 flex items-center justify-center bg-red-950 text-gray-400">
              Select a user to view conversation
            </div>
          )}

          {selectedUser && (
            <>
              <div className="p-4 border-b border-red-700 bg-red-950">
                <p className="font-semibold">{selectedUser.name}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-red-900 text-black">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender_id === user?.id
                        ? "justify-end"
                        : "justify-start"
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

      <NewChatModal
        open={openModal}
        setOpen={setOpenModal}
        users={allUsers}
        currentUserId={user?.id}
        onSelectUser={(u) => setSelectedUser(u)}
      />
    </div>
  )
}
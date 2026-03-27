import { useState } from "react"

type User = {
  id: string
  name: string
}

type Props = {
  open: boolean
  setOpen: (val: boolean) => void
  users: User[]
  currentUserId: string
  onSelectUser: (user: User) => void
}

export default function NewChatModal({
  open,
  setOpen,
  users,
  currentUserId,
  onSelectUser,
}: Props) {
  const [search, setSearch] = useState("")

  if (!open || !currentUserId) return null // Safety: modal won't render until user is ready

  const filteredUsers = users.filter(
  (u) => u?.id !== currentUserId && u?.name?.toLowerCase().includes(search.toLowerCase())
)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#111b21] w-full max-w-md rounded-xl shadow-xl flex flex-col max-h-[85vh] text-white">
        {/* HEADER */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Start New Chat</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* SEARCH */}
        <div className="p-3 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 rounded bg-[#2a3942] outline-none"
          />
        </div>

        {/* USER LIST */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredUsers.length === 0 && (
            <p className="text-gray-400 text-center mt-4">No users found</p>
          )}

          {filteredUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => {
                onSelectUser(u)
                setOpen(false)
              }}
              className="flex items-center gap-3 p-3 rounded cursor-pointer hover:bg-[#2a3942]"
            >
              <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-gray-400">Start chat</p>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={() => setOpen(false)}
            className="w-full bg-red-500 hover:bg-red-600 p-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
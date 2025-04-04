"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { useParams } from "next/navigation"
import { useState } from "react"

export function MessagePanel() {
  const params = useParams()
  const contactId = params?.pubkey as string
  const [message, setMessage] = useState("")

  // In a real app, you would fetch actual messages
  // For this demo, we'll use dummy data
  const messages = contactId
    ? [
        { id: 1, content: "Hey there!", sender: "them", time: "10:30 AM" },
        { id: 2, content: "Hi! How are you?", sender: "me", time: "10:31 AM" },
        {
          id: 3,
          content: "I'm good, thanks! Just checking out this new Nostr client.",
          sender: "them",
          time: "10:32 AM",
        },
        { id: 4, content: "It looks pretty cool!", sender: "me", time: "10:33 AM" },
      ]
    : []

  const handleSend = () => {
    if (!message.trim()) return
    // In a real app, you would send the message to the Nostr network
    console.log("Sending message:", message)
    setMessage("")
  }

  if (!contactId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Select a conversation to start messaging
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{contactId.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-bold">{contactId}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.sender === "me"
                  ? "bg-purple-500 text-white rounded-br-none"
                  : "bg-gray-200 dark:bg-gray-800 rounded-bl-none"
              }`}
            >
              <div>{msg.content}</div>
              <div
                className={`text-xs mt-1 ${
                  msg.sender === "me" ? "text-purple-100" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button size="icon" onClick={handleSend} disabled={!message.trim()}>
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}


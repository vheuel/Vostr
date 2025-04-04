import { Sidebar } from "@/components/sidebar"
import { MessageList } from "@/components/message-list"
import { MessagePanel } from "@/components/message-panel"
import { cookies } from "next/headers"
import { LoginPrompt } from "@/components/login-prompt"

export default function MessagesPage() {
  const cookieStore = cookies()
  const hasPublicKey = cookieStore.has("nostr-public-key")

  return (
    <main className="flex min-h-screen bg-white dark:bg-black">
      <Sidebar />
      {hasPublicKey ? (
        <div className="flex flex-1">
          <MessageList />
          <MessagePanel />
        </div>
      ) : (
        <div className="flex-1 border-x border-gray-200 dark:border-gray-800 max-w-2xl">
          <h1 className="text-xl font-bold p-4 border-b border-gray-200 dark:border-gray-800">Messages</h1>
          <LoginPrompt />
        </div>
      )}
    </main>
  )
}


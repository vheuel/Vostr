import { Sidebar } from "@/components/sidebar"
import { TrendingPanel } from "@/components/trending-panel"
import { NotificationList } from "@/components/notification-list"
import { cookies } from "next/headers"
import { LoginPrompt } from "@/components/login-prompt"

export default function NotificationsPage() {
  const cookieStore = cookies()
  const hasPublicKey = cookieStore.has("nostr-public-key")

  return (
    <main className="flex min-h-screen bg-white dark:bg-black">
      <Sidebar />
      <div className="flex-1 border-x border-gray-200 dark:border-gray-800 max-w-2xl">
        <h1 className="text-xl font-bold p-4 border-b border-gray-200 dark:border-gray-800">Notifications</h1>
        {hasPublicKey ? <NotificationList /> : <LoginPrompt />}
      </div>
      <TrendingPanel />
    </main>
  )
}


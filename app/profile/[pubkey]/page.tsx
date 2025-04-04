import { Sidebar } from "@/components/sidebar"
import { TrendingPanel } from "@/components/trending-panel"
import { ProfileHeader } from "@/components/profile-header"
import { ProfileTabs } from "@/components/profile-tabs"
import { ProfileNotes } from "@/components/profile-notes"

export default function ProfilePage({ params }: { params: { pubkey: string } }) {
  return (
    <main className="flex min-h-screen bg-white dark:bg-black">
      <Sidebar />
      <div className="flex-1 border-x border-gray-200 dark:border-gray-800 max-w-2xl">
        <ProfileHeader pubkey={params.pubkey} />
        <ProfileTabs pubkey={params.pubkey} />
        <ProfileNotes pubkey={params.pubkey} />
      </div>
      <TrendingPanel />
    </main>
  )
}


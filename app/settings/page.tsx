import { Sidebar } from "@/components/sidebar"
import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <main className="flex min-h-screen bg-white dark:bg-black">
      <Sidebar />
      <div className="flex-1 border-x border-gray-200 dark:border-gray-800 max-w-2xl">
        <h1 className="text-xl font-bold p-4 border-b border-gray-200 dark:border-gray-800">Settings</h1>
        <SettingsForm />
      </div>
    </main>
  )
}


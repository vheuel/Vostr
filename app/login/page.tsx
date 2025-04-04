"use client"

import { Sidebar } from "@/components/sidebar"
import { LoginPrompt } from "@/components/login-prompt"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const handleLoginSuccess = () => {
    router.push("/")
  }

  return (
    <main className="flex min-h-screen bg-white dark:bg-black">
      <Sidebar />
      <div className="flex-1 border-x border-gray-200 dark:border-gray-800 max-w-2xl">
        <h1 className="text-xl font-bold p-4 border-b border-gray-200 dark:border-gray-800">Login</h1>
        <LoginPrompt onLoginSuccess={handleLoginSuccess} />
      </div>
    </main>
  )
}


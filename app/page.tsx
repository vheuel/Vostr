"use client"

import { Sidebar } from "@/components/sidebar"
import { Timeline } from "@/components/timeline"
import { TrendingPanel } from "@/components/trending-panel"
import { LoginPrompt } from "@/components/login-prompt"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useNostr } from "@/components/nostr-provider"

export default function Home() {
  const [hasPublicKey, setHasPublicKey] = useState<boolean | null>(null)
  const router = useRouter()
  const { publicKey } = useNostr()

  useEffect(() => {
    // Check if user is logged in
    const checkLoginStatus = () => {
      const isLoggedIn = document.cookie.split("; ").some((row) => row.startsWith("nostr-public-key="))

      setHasPublicKey(isLoggedIn)
    }

    checkLoginStatus()

    // Listen for login success event
    const handleLoginSuccess = () => {
      setHasPublicKey(true)
      router.push("/")
    }

    window.addEventListener("nostr:login-success", handleLoginSuccess)

    return () => {
      window.removeEventListener("nostr:login-success", handleLoginSuccess)
    }
  }, [router, publicKey])

  // Show loading state while checking login status
  if (hasPublicKey === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <main className="flex min-h-screen bg-white dark:bg-black">
      <Sidebar />
      <div className="flex-1 border-x border-gray-200 dark:border-gray-800 max-w-2xl">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center px-4 py-3">
            <h1 className="text-xl font-bold">Home</h1>
          </div>
        </div>
        {hasPublicKey ? <Timeline /> : <LoginPrompt onLoginSuccess={() => setHasPublicKey(true)} />}
      </div>
      <TrendingPanel />
    </main>
  )
}


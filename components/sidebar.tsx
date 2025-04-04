"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, MessageSquare, Bell, LogIn, Settings, Search, PenSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNostr } from "./nostr-provider"
import { ComposeNoteDialog } from "./compose-note-dialog"
import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const { publicKey, logout } = useNostr()
  const [composeOpen, setComposeOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Explore", icon: Search },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: publicKey ? `/profile/${publicKey}` : "/login", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="w-16 md:w-64 flex flex-col h-screen sticky top-0 z-20">
      <div className="p-2 md:p-4 flex flex-col h-full">
        {/* X Logo */}
        <div className="flex justify-center md:justify-start mb-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
            <span className="text-2xl font-bold">𝕏</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 mb-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${
                pathname === item.href ? "font-bold" : ""
              }`}
            >
              <div className="flex items-center justify-center">
                <item.icon size={24} />
              </div>
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Post Button */}
        <Button
          className="rounded-full py-6 mb-4 bg-blue-500 hover:bg-blue-600 hidden md:flex"
          onClick={() => setComposeOpen(true)}
        >
          <span>Post</span>
        </Button>

        {/* Mobile Post Button */}
        <Button
          className="rounded-full p-3 aspect-square md:hidden bg-blue-500 hover:bg-blue-600"
          onClick={() => setComposeOpen(true)}
        >
          <PenSquare size={24} />
        </Button>

        {/* User Profile / Login */}
        <div className="mt-auto">
          {publicKey ? (
            <Button variant="ghost" className="w-full rounded-full justify-start p-3" onClick={logout}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  {publicKey.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <div className="font-bold">Profile</div>
                  <div className="text-sm text-gray-500">Logout</div>
                </div>
              </div>
            </Button>
          ) : (
            <Link href="/login" className="w-full">
              <Button className="w-full rounded-full bg-blue-500 hover:bg-blue-600">
                <LogIn className="mr-2 md:mr-2" size={18} />
                <span className="hidden md:inline">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      <ComposeNoteDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </div>
  )
}


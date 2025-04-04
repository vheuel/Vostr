"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Repeat, User } from "lucide-react"
import { useNostr } from "./nostr-provider"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

type Notification = {
  id: string
  type: "like" | "repost" | "mention" | "follow"
  pubkey: string
  content?: string
  eventId?: string
  time: string
}

export function NotificationList() {
  const { pool, relays, publicKey } = useNostr()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pool || !publicKey) return

    setLoading(true)

    // In a real app, you would fetch actual notifications
    // For this demo, we'll use dummy data
    setTimeout(() => {
      setNotifications([
        {
          id: "1",
          type: "like",
          pubkey: "npub1abc123def456",
          eventId: "note1xyz",
          time: "10 minutes ago",
        },
        {
          id: "2",
          type: "repost",
          pubkey: "npub2xyz789uvw012",
          eventId: "note1abc",
          time: "2 hours ago",
        },
        {
          id: "3",
          type: "mention",
          pubkey: "npub3ghi456jkl789",
          content: "Hey @you, check this out!",
          eventId: "note1def",
          time: "Yesterday",
        },
        {
          id: "4",
          type: "follow",
          pubkey: "npub4mno789pqr012",
          time: "2 days ago",
        },
      ])
      setLoading(false)
    }, 1000)
  }, [pool, publicKey])

  // Get initials from pubkey
  const getInitials = (pubkey: string) => {
    return pubkey.substring(0, 2).toUpperCase()
  }

  // Truncate public key for display
  const truncatePubkey = (pubkey: string) => {
    return `${pubkey.substring(0, 8)}...${pubkey.substring(pubkey.length - 4)}`
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={16} className="text-red-500" />
      case "repost":
        return <Repeat size={16} className="text-green-500" />
      case "mention":
        return <MessageCircle size={16} className="text-blue-500" />
      case "follow":
        return <User size={16} className="text-purple-500" />
      default:
        return null
    }
  }

  // Get notification text based on type
  const getNotificationText = (notification: Notification) => {
    const username = truncatePubkey(notification.pubkey)

    switch (notification.type) {
      case "like":
        return (
          <>
            <span className="font-bold">{username}</span> liked your note
          </>
        )
      case "repost":
        return (
          <>
            <span className="font-bold">{username}</span> reposted your note
          </>
        )
      case "mention":
        return (
          <>
            <span className="font-bold">{username}</span> mentioned you
          </>
        )
      case "follow":
        return (
          <>
            <span className="font-bold">{username}</span> followed you
          </>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">No notifications yet</div>
  }

  return (
    <div>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">{getNotificationIcon(notification.type)}</div>
            <Link href={`/profile/${notification.pubkey}`}>
              <Avatar>
                <AvatarFallback>{getInitials(notification.pubkey)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div>{getNotificationText(notification)}</div>
              {notification.content && (
                <div className="mt-2 p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                  {notification.content}
                </div>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{notification.time}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


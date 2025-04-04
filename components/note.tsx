"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Repeat, Share } from 'lucide-react'
import { useState } from "react"
import { useNostr } from "./nostr-provider"
import Link from "next/link"

type NostrEvent = {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
}

interface NoteProps {
  event: NostrEvent
  onReaction?: () => void
}

export function Note({ event, onReaction }: NoteProps) {
  const { publishReaction, publishRepost } = useNostr()
  const [liked, setLiked] = useState(false)
  const [reposted, setReposted] = useState(false)

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) {
      return diffDays === 1 ? "Yesterday" : `${diffDays}d ago`
    } else if (diffHours > 0) {
      return `${diffHours}h ago`
    } else if (diffMins > 0) {
      return `${diffMins}m ago`
    } else {
      return "Just now"
    }
  }

  // Get initials from public key
  const getInitials = (pubkey: string) => {
    return pubkey.substring(0, 2).toUpperCase()
  }

  // Truncate public key for display
  const truncatePubkey = (pubkey: string) => {
    return `${pubkey.substring(0, 8)}...${pubkey.substring(pubkey.length - 4)}`
  }

  const handleLike = async () => {
    try {
      await publishReaction(event.id, "+")
      setLiked(true)
      if (onReaction) onReaction()
    } catch (error) {
      console.error("Failed to like note:", error)
    }
  }

  const handleRepost = async () => {
    try {
      await publishRepost(event.id)
      setReposted(true)
      if (onReaction) onReaction()
    } catch (error) {
      console.error("Failed to repost note:", error)
    }
  }

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <div className="flex gap-4">
        <Link href={`/profile/${event.pubkey}`}>
          <Avatar>
            <AvatarFallback>{getInitials(event.pubkey)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${event.pubkey}`} className="font-bold hover:underline">
              {truncatePubkey(event.pubkey)}
            </Link>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              • {formatDate(event.created_at)}
            </span>
          </div>
          <div className="mt-2 whitespace-pre-wrap">{event.content}</div>
          <div className="flex justify-between mt-4 max-w-md">
            <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
              <MessageCircle size={18} className="mr-1" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={reposted ? "text-green-500" : "text-gray-500 dark:text-gray-400"}
              onClick={handleRepost}
              disabled={reposted}
            >
              <Repeat size={18} className="mr-1" />
              {reposted && <span>1</span>}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={liked ? "text-red-500" : "text-gray-500 dark:text-gray-400"}
              onClick={handleLike}
              disabled={liked}
            >
              <Heart size={18} className="mr-1" />
              {liked && <span>1</span>}
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400">
              <Share size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


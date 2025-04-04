"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useNostr } from "./nostr-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ComposeNoteProps {
  onNotePublished?: () => void
}

export function ComposeNote({ onNotePublished }: ComposeNoteProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { publishNote, publicKey } = useNostr()

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await publishNote(content)
      setContent("")

      // Call the callback if provided
      if (onNotePublished) {
        onNotePublished()
      }
    } catch (error) {
      console.error("Failed to publish note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get initials from public key
  const getInitials = () => {
    if (!publicKey) return "??"
    return publicKey.substring(0, 2).toUpperCase()
  }

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex gap-4">
        <Avatar>
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="What's happening?"
            className="min-h-[80px] resize-none border-none focus-visible:ring-0 p-0"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handleSubmit} disabled={!content.trim() || isSubmitting} className="rounded-full">
              {isSubmitting ? "Publishing..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


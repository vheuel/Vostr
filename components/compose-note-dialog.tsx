"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useNostr } from "./nostr-provider"

interface ComposeNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ComposeNoteDialog({ open, onOpenChange }: ComposeNoteDialogProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { publishNote } = useNostr()

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await publishNote(content)
      setContent("")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to publish note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Compose Note</DialogTitle>
          <DialogDescription>Share your thoughts with the Nostr network</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="What's happening?"
            className="min-h-[120px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={!content.trim() || isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


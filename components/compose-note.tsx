"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useNostr } from "@/components/nostr-provider" // path diperbaiki

export default function ComposeNote() {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const { publishNote, publicKey } = useNostr()

  const handleSubmit = async () => {
    if (!content.trim()) return

    setLoading(true)
    try {
      await publishNote(content)
      setContent("")
    } catch (error) {
      console.error("Failed to publish note:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!publicKey) {
    return (
      <div className="border rounded-xl p-4 text-sm text-muted-foreground">
        Login untuk mengirim catatan.
      </div>
    )
  }

  return (
    <div className="border rounded-xl p-4 mb-4">
      <Textarea
        placeholder="Apa yang sedang kamu pikirkan?"
        className="mb-2"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      />
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Mengirim..." : "Kirim"}
        </Button>
      </div>
    </div>
  )
}
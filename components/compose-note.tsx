"use client"

import { useState } from "react"
import { useNostr } from "./nostr-provider"
import { Button } from "@/components/ui/button"

export function ComposeNote() {
  const { publishNote } = useNostr()
  const [content, setContent] = useState("")

  const handleSubmit = async () => {
    if (content.trim()) {
      await publishNote(content)
      setContent("")
    }
  }

  return (
    <div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Tulis catatan..." />
      <Button onClick={handleSubmit}>Kirim</Button>
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { useNostr } from "./nostr-provider"
import { Note } from "./note"
import { ComposeNote } from "./compose-note"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type NostrEvent = {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
}

export function Timeline() {
  const { pool, relays, publicKey } = useNostr()
  const [notes, setNotes] = useState<NostrEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("for-you")

  useEffect(() => {
    if (!pool) return

    setLoading(true)
    setNotes([])

    const filter = { kinds: [1], limit: 20 }
    if (activeTab === "following" && publicKey) filter.authors = [publicKey]

    pool.get(relays, filter).then((events) => {
      if (events) setNotes(events.sort((a, b) => b.created_at - a.created_at))
      setLoading(false)
    })
  }, [pool, relays, activeTab, publicKey])

  return (
    <div>
      {publicKey && <ComposeNote />}
      <Tabs defaultValue="for-you" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="for-you">For You</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
      </Tabs>
      {loading ? <p>Loading...</p> : notes.length === 0 ? <p>No posts available</p> : notes.map((note) => <Note key={note.id} event={note} />)}
    </div>
  )
}
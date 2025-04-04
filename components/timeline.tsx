"use client"

import { useEffect, useState } from "react"
import { useNostr } from "../context/NostrProvider"
import Note from "./Note"

type NostrEvent = {
  id: string
  pubkey: string
  created_at: number
  content: string
}

export function Timeline() {
  const { pool, relays } = useNostr()
  const [notes, setNotes] = useState<NostrEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pool) return

    setLoading(true)
    const filter = { kinds: [1], limit: 20 }
    
    pool.get(relays, filter).then((events) => {
      setNotes(events ? events.sort((a, b) => b.created_at - a.created_at) : [])
      setLoading(false)
    })
  }, [pool, relays])

  return (
    <div>
      <h2 className="text-xl font-bold">Latest Notes</h2>
      {loading ? <p>Loading...</p> : notes.map((note) => <Note key={note.id} event={note} />)}
    </div>
  )
}
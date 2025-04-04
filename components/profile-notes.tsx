"use client"

import { useEffect, useState } from "react"
import { useNostr } from "./nostr-provider"
import { Note } from "./note"
import { Skeleton } from "@/components/ui/skeleton"

type NostrEvent = {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
}

interface ProfileNotesProps {
  pubkey: string
}

export function ProfileNotes({ pubkey }: ProfileNotesProps) {
  const { pool, relays } = useNostr()
  const [notes, setNotes] = useState<NostrEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pool) return

    setLoading(true)

    // Use a simpler approach with fewer relays
    const singleRelay = relays[0] || "wss://relay.damus.io"

    // Create a safety timeout
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
      }
    }, 10000)

    // Create a simple filter
    const filter = {
      kinds: [1],
      authors: [pubkey],
      limit: 20,
    }

    // Use a simple array to collect events
    const events: NostrEvent[] = []

    try {
      // Try to use the most basic subscription method
      const sub = pool.subscribeMany([singleRelay], [filter], {
        onEvent: (event: NostrEvent) => {
          events.push(event)
        },
        onEose: () => {
          // Sort by created_at (newest first)
          const sortedEvents = [...events].sort((a, b) => b.created_at - a.created_at)
          setNotes(sortedEvents)
          setLoading(false)
          clearTimeout(safetyTimeout)

          // Try to close the subscription if possible
          try {
            if (sub && typeof sub.close === "function") {
              sub.close()
            } else if (sub && typeof sub.unsub === "function") {
              sub.unsub()
            }
          } catch (closeError) {
            console.error("Error closing subscription:", closeError)
          }
        },
      })

      // Fallback in case onEose doesn't fire
      setTimeout(() => {
        if (loading) {
          const sortedEvents = [...events].sort((a, b) => b.created_at - a.created_at)
          setNotes(sortedEvents)
          setLoading(false)
          clearTimeout(safetyTimeout)

          // Try to close the subscription if possible
          try {
            if (sub && typeof sub.close === "function") {
              sub.close()
            } else if (sub && typeof sub.unsub === "function") {
              sub.unsub()
            }
          } catch (closeError) {
            console.error("Error closing subscription:", closeError)
          }
        }
      }, 5000)
    } catch (e) {
      console.error("Error fetching profile notes:", e)
      setLoading(false)
      clearTimeout(safetyTimeout)
    }

    return () => {
      clearTimeout(safetyTimeout)
    }
  }, [pool, relays, pubkey])

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
      </div>
    )
  }

  if (notes.length === 0) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">No notes found</div>
  }

  return (
    <div>
      {notes.map((note) => (
        <Note key={note.id} event={note} />
      ))}
    </div>
  )
}


"use client"

import { useEffect, useState } from "react"
import { useNostr } from "./nostr-provider"
import { Note } from "./note"
import { Skeleton } from "@/components/ui/skeleton"
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pool) return

    setLoading(true)
    setError(null)
    setNotes([])

    // Safety timeout untuk memastikan UI merespon jika koneksi terlalu lama
    const safetyTimeout = setTimeout(() => {
      setLoading(false)
      setError("Connection timed out. Please try again later.")
    }, 15000)

    const singleRelay = relays[0] || "wss://relay.damus.io"
    const filter: any = {
      kinds: [1],
      limit: 20,
    }

    // Filter khusus untuk tab "following"
    if (activeTab === "following" && publicKey) {
      filter.authors = [publicKey]
    }

    const events: NostrEvent[] = []

    // Gunakan metode pool.get jika tersedia
    if (typeof pool.get === "function") {
      pool
        .get(relays, filter)
        .then((receivedEvents: NostrEvent[]) => {
          if (receivedEvents && Array.isArray(receivedEvents)) {
            setNotes(receivedEvents.sort((a, b) => b.created_at - a.created_at))
          } else {
            console.log("Received null or invalid events from pool.get")
            setNotes([])
          }
          setLoading(false)
          clearTimeout(safetyTimeout)
        })
        .catch((e: any) => {
          console.error("Error fetching events with pool.get:", e)
          setLoading(false)
          setError("Failed to load notes. Please try again.")
          clearTimeout(safetyTimeout)
        })
    }
    // Jika pool.get tidak tersedia, gunakan subscribeMany dengan objek konfigurasi
    else if (typeof pool.subscribeMany === "function") {
      const sub = pool.subscribeMany(
        [singleRelay],
        [filter],
        {
          onEvent: (event: NostrEvent) => {
            events.push(event)
          },
          onEose: () => {
            setNotes(events.sort((a, b) => b.created_at - a.created_at))
            setLoading(false)
            clearTimeout(safetyTimeout)
            // Coba tutup langganan jika memungkinkan
            if (sub && typeof sub.close === "function") {
              sub.close()
            } else if (sub && typeof sub.unsub === "function") {
              sub.unsub()
            }
          },
        }
      )

      // Fallback jika onEose tidak terpanggil
      setTimeout(() => {
        if (loading) {
          setNotes(events.sort((a, b) => b.created_at - a.created_at))
          setLoading(false)
          clearTimeout(safetyTimeout)
          if (sub && typeof sub.close === "function") {
            sub.close()
          } else if (sub && typeof sub.unsub === "function") {
            sub.unsub()
          }
        }
      }, 5000)
    } else {
      console.error("No supported subscription method found on pool")
      setError("Subscription method not supported.")
      setLoading(false)
      clearTimeout(safetyTimeout)
    }

    return () => {
      clearTimeout(safetyTimeout)
    }
  }, [pool, relays, activeTab, publicKey])

  // Fungsi untuk me-refresh timeline
  const handleRefresh = () => {
    setLoading(true)
  }

  return (
    <div>
      {publicKey && <ComposeNote onNotePublished={handleRefresh} />}

      <Tabs
        defaultValue="for-you"
        onValueChange={(value) => {
          setActiveTab(value)
          setLoading(true)
        }}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="for-you">For You</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="p-4 text-center text-red-500">
          <p>{error}</p>
          <Button onClick={handleRefresh} variant="outline" className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 p-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-3 border-b border-gray-200 dark:border-gray-800 pb-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          {activeTab === "following"
            ? "No posts from people you follow yet. Follow some users to see their posts here."
            : "No posts available. There may be an issue connecting to the Nostr network. Please try again later."}
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {notes.map((note) => (
            <Note key={note.id} event={note} onReaction={handleRefresh} />
          ))}
        </div>
      )}
    </div>
  )
}
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

  // Use a more compatible approach that should work with any version of nostr-tools
  useEffect(() => {
    if (!pool) return

    setLoading(true)
    setError(null)
    setNotes([])

    // Create a safety timeout to ensure we always show something
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
        setError("Connection timed out. Please try again later.")
      }
    }, 15000)

    try {
      // Use a simpler approach with fewer relays
      const singleRelay = relays[0] || "wss://relay.damus.io"

      // Create a simple filter
      const filter = {
        kinds: [1],
        limit: 20,
      }

      // Add author filter for "following" tab
      if (activeTab === "following" && publicKey) {
        filter.authors = [publicKey]
      }

      // Use a simple array to collect events
      const events: NostrEvent[] = []

      // Try to use the most basic subscription method that should be available in all versions
      try {
        // Check what methods are available on the pool
        if (typeof pool.get === "function") {
          // Use pool.get if available
          pool
            .get(relays, filter)
            .then((receivedEvents) => {
              // Add null check before sorting
              if (receivedEvents && Array.isArray(receivedEvents)) {
                setNotes(receivedEvents.sort((a, b) => b.created_at - a.created_at))
              } else {
                // Handle case where receivedEvents is null or not an array
                console.log("Received null or invalid events from pool.get")
                setNotes([])
              }
              setLoading(false)
              clearTimeout(safetyTimeout)
            })
            .catch((e) => {
              console.error("Error fetching events with pool.get:", e)
              setLoading(false)
              setError("Failed to load notes. Please try again.")
              clearTimeout(safetyTimeout)
            })
        } else {
          // Fall back to subscribeMany which should be available in most versions
          // Use a more compatible approach for callbacks
          const sub = pool.subscribeMany(
            [singleRelay],
            [filter],
            // First argument is the event handler
            (event: NostrEvent) => {
              events.push(event)
            },
            // Second argument is the EOSE (End of Stored Events) handler
            () => {
              setNotes(events.sort((a, b) => b.created_at - a.created_at))
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
          )

          // Fallback in case onEose doesn't fire
          setTimeout(() => {
            if (loading) {
              setNotes(events.sort((a, b) => b.created_at - a.created_at))
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
        }
      } catch (fetchError) {
        console.error("Error in fetch operation:", fetchError)

        // Last resort: use mock data
        setNotes([
          {
            id: "mock1",
            pubkey: "mock_pubkey_1",
            created_at: Math.floor(Date.now() / 1000) - 300,
            kind: 1,
            tags: [],
            content: "This is a fallback note because we couldn't connect to Nostr. Please try again later.",
            sig: "mock_sig",
          },
        ])
        setLoading(false)
        setError("Failed to connect to Nostr network. Showing fallback content.")
        clearTimeout(safetyTimeout)
      }
    } catch (e) {
      console.error("Error in timeline:", e)
      setLoading(false)
      setError("Failed to load notes. Please try again.")
      clearTimeout(safetyTimeout)
    }

    return () => {
      clearTimeout(safetyTimeout)
    }
  }, [pool, relays, activeTab, publicKey, loading])

  // Function to refresh the timeline
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


"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Note } from "./note"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { useNostr } from "./nostr-provider"
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

type Profile = {
  pubkey: string
  name?: string
  about?: string
}

export function SearchResults() {
  const { pool, relays } = useNostr()
  const [notes, setNotes] = useState<NostrEvent[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
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
    }, 15000)

    // Create a simple filter for notes
    const noteFilter = {
      kinds: [1],
      limit: 10,
    }

    // Use a simple array to collect events
    const noteEvents: NostrEvent[] = []

    try {
      // Try to use the most basic subscription method for notes
      const noteSub = pool.subscribeMany([singleRelay], [noteFilter], {
        onEvent: (event: NostrEvent) => {
          noteEvents.push(event)
        },
        onEose: () => {
          // Process notes
          setNotes(noteEvents.filter((e) => e.kind === 1))

          // Extract unique pubkeys from notes
          const pubkeys = [...new Set(noteEvents.map((e) => e.pubkey))].slice(0, 5)

          // Create a simple filter for profiles
          const profileFilter = {
            kinds: [0],
            authors: pubkeys,
          }

          // Use a simple array to collect profile events
          const profileEvents: NostrEvent[] = []

          // Try to fetch profiles
          try {
            const profileSub = pool.subscribeMany([singleRelay], [profileFilter], {
              onEvent: (event: NostrEvent) => {
                profileEvents.push(event)
              },
              onEose: () => {
                // Process profile metadata
                const profileData = profileEvents.reduce((acc: Profile[], event) => {
                  if (event.kind === 0) {
                    try {
                      const metadata = JSON.parse(event.content)
                      acc.push({
                        pubkey: event.pubkey,
                        name: metadata.name,
                        about: metadata.about,
                      })
                    } catch (e) {
                      console.error("Failed to parse profile metadata:", e)
                    }
                  }
                  return acc
                }, [])

                setProfiles(profileData)
                setLoading(false)
                clearTimeout(safetyTimeout)

                // Try to close the subscription if possible
                try {
                  if (profileSub && typeof profileSub.close === "function") {
                    profileSub.close()
                  } else if (profileSub && typeof profileSub.unsub === "function") {
                    profileSub.unsub()
                  }
                } catch (closeError) {
                  console.error("Error closing profile subscription:", closeError)
                }
              },
            })

            // Fallback in case onEose doesn't fire for profiles
            setTimeout(() => {
              if (loading) {
                // Process profile metadata
                const profileData = profileEvents.reduce((acc: Profile[], event) => {
                  if (event.kind === 0) {
                    try {
                      const metadata = JSON.parse(event.content)
                      acc.push({
                        pubkey: event.pubkey,
                        name: metadata.name,
                        about: metadata.about,
                      })
                    } catch (e) {
                      console.error("Failed to parse profile metadata:", e)
                    }
                  }
                  return acc
                }, [])

                setProfiles(profileData)
                setLoading(false)
                clearTimeout(safetyTimeout)

                // Try to close the subscription if possible
                try {
                  if (profileSub && typeof profileSub.close === "function") {
                    profileSub.close()
                  } else if (profileSub && typeof profileSub.unsub === "function") {
                    profileSub.unsub()
                  }
                } catch (closeError) {
                  console.error("Error closing profile subscription:", closeError)
                }
              }
            }, 5000)
          } catch (profileError) {
            console.error("Error fetching profiles:", profileError)
            setLoading(false)
            clearTimeout(safetyTimeout)
          }

          // Try to close the note subscription if possible
          try {
            if (noteSub && typeof noteSub.close === "function") {
              noteSub.close()
            } else if (noteSub && typeof noteSub.unsub === "function") {
              noteSub.unsub()
            }
          } catch (closeError) {
            console.error("Error closing note subscription:", closeError)
          }
        },
      })

      // Fallback in case onEose doesn't fire for notes
      setTimeout(() => {
        if (loading) {
          // Process notes
          setNotes(noteEvents.filter((e) => e.kind === 1))
          setLoading(false)
          clearTimeout(safetyTimeout)

          // Try to close the subscription if possible
          try {
            if (noteSub && typeof noteSub.close === "function") {
              noteSub.close()
            } else if (noteSub && typeof noteSub.unsub === "function") {
              noteSub.unsub()
            }
          } catch (closeError) {
            console.error("Error closing note subscription:", closeError)
          }
        }
      }, 5000)
    } catch (e) {
      console.error("Error in search results:", e)
      setLoading(false)
      clearTimeout(safetyTimeout)
    }

    return () => {
      clearTimeout(safetyTimeout)
    }
  }, [pool, relays, loading])

  // Get initials from name or pubkey
  const getInitials = (profile: Profile) => {
    if (profile.name) {
      return profile.name.substring(0, 2).toUpperCase()
    }
    return profile.pubkey.substring(0, 2).toUpperCase()
  }

  // Truncate public key for display
  const truncatePubkey = (pubkey: string) => {
    return `${pubkey.substring(0, 8)}...${pubkey.substring(pubkey.length - 4)}`
  }

  if (loading) {
    return (
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
        </TabsList>
        <TabsContent value="notes" className="space-y-4 p-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-3">
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
        </TabsContent>
        <TabsContent value="profiles" className="space-y-4 p-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
              </div>
            ))}
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="profiles">Profiles</TabsTrigger>
      </TabsList>
      <TabsContent value="notes">
        {notes.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No notes found</div>
        ) : (
          notes.map((note) => <Note key={note.id} event={note} />)
        )}
      </TabsContent>
      <TabsContent value="profiles">
        {profiles.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No profiles found</div>
        ) : (
          profiles.map((profile) => (
            <Link
              key={profile.pubkey}
              href={`/profile/${profile.pubkey}`}
              className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <Avatar>
                <AvatarFallback>{getInitials(profile)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold">{profile.name || truncatePubkey(profile.pubkey)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{truncatePubkey(profile.pubkey)}</div>
                {profile.about && <div className="mt-1">{profile.about}</div>}
              </div>
            </Link>
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}


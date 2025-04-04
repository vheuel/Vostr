"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useNostr } from "./nostr-provider"
import { Skeleton } from "@/components/ui/skeleton"

interface ProfileHeaderProps {
  pubkey: string
}

type ProfileMetadata = {
  name?: string
  about?: string
  picture?: string
  banner?: string
  nip05?: string
  lud16?: string
}

export function ProfileHeader({ pubkey }: ProfileHeaderProps) {
  const { pool, relays, publicKey } = useNostr()
  const [profile, setProfile] = useState<ProfileMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)

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
      kinds: [0],
      authors: [pubkey],
    }

    try {
      // Try to use the most basic subscription method
      const sub = pool.subscribeMany([singleRelay], [filter], {
        onEvent: (event: any) => {
          try {
            const metadata = JSON.parse(event.content)
            setProfile(metadata)
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
          } catch (e) {
            console.error("Failed to parse profile metadata:", e)
          }
        },
        onEose: () => {
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
      console.error("Error fetching profile:", e)
      setLoading(false)
      clearTimeout(safetyTimeout)
    }

    return () => {
      clearTimeout(safetyTimeout)
    }
  }, [pool, relays, pubkey, loading])

  // Get initials from public key
  const getInitials = () => {
    if (profile?.name) {
      return profile.name.substring(0, 2).toUpperCase()
    }
    return pubkey.substring(0, 2).toUpperCase()
  }

  // Truncate public key for display
  const truncatePubkey = (key: string) => {
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
  }

  const handleFollow = () => {
    setFollowing(!following)
    // In a real app, you would publish a kind 3 event here
  }

  if (loading) {
    return (
      <div>
        <Skeleton className="w-full h-32" />
        <div className="px-4 pb-4 relative">
          <div className="absolute -top-12 left-4 border-4 border-white dark:border-black rounded-full overflow-hidden">
            <Skeleton className="w-24 h-24 rounded-full" />
          </div>
          <div className="pt-16 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        className="w-full h-32 bg-gray-200 dark:bg-gray-800 bg-cover bg-center"
        style={profile?.banner ? { backgroundImage: `url(${profile.banner})` } : {}}
      />
      <div className="px-4 pb-4 relative">
        <div className="absolute -top-12 left-4 border-4 border-white dark:border-black rounded-full overflow-hidden">
          {profile?.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.picture || "/placeholder.svg"}
              alt={profile.name || "Profile"}
              className="w-24 h-24 object-cover"
            />
          ) : (
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className="flex justify-end pt-2">
          {publicKey === pubkey ? (
            <Button variant="outline" className="rounded-full">
              Edit profile
            </Button>
          ) : (
            <Button variant={following ? "outline" : "default"} className="rounded-full" onClick={handleFollow}>
              {following ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        <div className="pt-12">
          <h2 className="text-xl font-bold">{profile?.name || truncatePubkey(pubkey)}</h2>
          {profile?.nip05 && <p className="text-gray-500 dark:text-gray-400">{profile.nip05}</p>}
          {profile?.about && <p className="mt-2">{profile.about}</p>}
        </div>
      </div>
    </div>
  )
}


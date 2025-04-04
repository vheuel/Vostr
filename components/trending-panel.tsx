"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useNostr } from "./nostr-provider"
import { Skeleton } from "@/components/ui/skeleton"

type Trend = {
  tag: string
  category: string
  count: number
}

type SuggestedUser = {
  pubkey: string
  name?: string
  about?: string
}

export function TrendingPanel() {
  const { pool, relays } = useNostr()
  const [trends, setTrends] = useState<Trend[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pool) return

    setLoading(true)

    // Analyze recent notes to find trending hashtags
    const fetchTrends = async () => {
      try {
        // Get recent notes
        const events = await fetchEvents(pool, relays, [{ kinds: [1], limit: 100 }])

        // Extract hashtags from content
        const tagCounts = new Map<string, number>()

        events.forEach((event) => {
          if (event.kind !== 1 || !event.content) return

          // Extract hashtags from content
          const hashtags = event.content.match(/#[\w]+/g) || []

          // Count occurrences
          hashtags.forEach((tag) => {
            const cleanTag = tag.substring(1) // Remove # prefix
            const count = tagCounts.get(cleanTag) || 0
            tagCounts.set(cleanTag, count + 1)
          })
        })

        // Convert to array and sort by count
        const trendingTags = Array.from(tagCounts.entries())
          .map(([tag, count]) => ({
            tag,
            category: getCategoryForTag(tag),
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3) // Top 3 trends

        setTrends(trendingTags)

        // Get some active users for "Who to follow"
        const activeUsers = events
          .map((e) => e.pubkey)
          .filter((v, i, a) => a.indexOf(v) === i) // Unique pubkeys
          .slice(0, 5) // Top 5 users

        // Fetch profiles for these users
        const profileEvents = await fetchEvents(pool, relays, [{ kinds: [0], authors: activeUsers }])

        // Process profile metadata
        const profileData = profileEvents.reduce((acc: SuggestedUser[], event) => {
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

        setSuggestedUsers(profileData.slice(0, 2)) // Show top 2 users
        setLoading(false)
      } catch (e) {
        console.error("Error fetching trends:", e)
        setLoading(false)
      }
    }

    fetchTrends()
  }, [pool, relays])

  // Helper function to fetch events using available methods
  const fetchEvents = async (pool: any, relays: string[], filters: any[]) => {
    return new Promise((resolve) => {
      const events: any[] = []

      try {
        const sub = pool.subscribeMany(relays, filters, {
          onEvent: (event: any) => {
            events.push(event)
          },
          onEose: () => {
            resolve(events)
            if (sub && typeof sub.close === "function") {
              sub.close()
            }
          },
        })

        // Timeout fallback
        setTimeout(() => {
          resolve(events)
          if (sub && typeof sub.close === "function") {
            sub.close()
          }
        }, 5000)
      } catch (e) {
        console.error("Error in subscription:", e)
        resolve([])
      }
    })
  }

  // Helper to categorize tags
  const getCategoryForTag = (tag: string) => {
    const techTags = ["nostr", "bitcoin", "web", "dev", "programming", "tech", "code"]
    const cryptoTags = ["bitcoin", "btc", "lightning", "crypto", "nft", "defi"]

    tag = tag.toLowerCase()

    if (techTags.some((t) => tag.includes(t))) return "Technology"
    if (cryptoTags.some((t) => tag.includes(t))) return "Cryptocurrency"

    return "Trending"
  }

  // Truncate public key for display
  const truncatePubkey = (pubkey: string) => {
    return `${pubkey.substring(0, 8)}...`
  }

  return (
    <div className="w-80 p-4 hidden lg:block space-y-4 sticky top-0 h-screen overflow-y-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
        <Input placeholder="Search Nostr" className="pl-10 rounded-full" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trending</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))
          ) : trends.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">No trending topics found</div>
          ) : (
            trends.map((trend) => (
              <div key={trend.tag}>
                <div className="text-sm text-gray-500 dark:text-gray-400">{trend.category}</div>
                <div className="font-bold">#{trend.tag}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{trend.count} notes</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            Array(2)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))
          ) : suggestedUsers.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">No suggestions available</div>
          ) : (
            suggestedUsers.map((user) => (
              <div key={user.pubkey} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {user.name ? user.name.substring(0, 2).toUpperCase() : user.pubkey.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold">{user.name || truncatePubkey(user.pubkey)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.about ? user.about.substring(0, 30) + (user.about.length > 30 ? "..." : "") : "Nostr User"}
                    </div>
                  </div>
                </div>
                <button className="text-sm font-bold text-blue-500 hover:text-blue-600">Follow</button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}


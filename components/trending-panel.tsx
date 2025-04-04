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

type NostrEvent = {
  kind: number
  content: string
  pubkey: string
}

export function TrendingPanel() {
  const { pool, relays } = useNostr()
  const [trends, setTrends] = useState<Trend[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pool || !relays?.length) return

    setLoading(true)

    const fetchTrends = async () => {
      try {
        const events: NostrEvent[] = await fetchEvents(pool, relays, [{ kinds: [1], limit: 100 }])

        const tagCounts = new Map<string, number>()

        events.forEach((event) => {
          const hashtags = event.content?.match(/#[\w]+/g) || []
          hashtags.forEach((tag) => {
            const cleanTag = tag.substring(1)
            tagCounts.set(cleanTag, (tagCounts.get(cleanTag) || 0) + 1)
          })
        })

        const trendingTags = Array.from(tagCounts.entries())
          .map(([tag, count]) => ({ tag, category: getCategoryForTag(tag), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)

        setTrends(trendingTags)

        const activeUsers = Array.from(new Set(events.map((e) => e.pubkey))).slice(0, 5)
        const profileEvents: NostrEvent[] = await fetchEvents(pool, relays, [{ kinds: [0], authors: activeUsers }])

        const profileData = profileEvents.reduce((acc: SuggestedUser[], event) => {
          try {
            const metadata = JSON.parse(event.content)
            acc.push({ pubkey: event.pubkey, name: metadata.name, about: metadata.about })
          } catch (e) {
            console.error("Invalid metadata JSON", e)
          }
          return acc
        }, [])

        setSuggestedUsers(profileData.slice(0, 2))
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch trends:", err)
        setLoading(false)
      }
    }

    fetchTrends()
  }, [pool, relays])

  const fetchEvents = async (pool: any, relays: string[], filters: any[]) => {
    return new Promise<NostrEvent[]>((resolve) => {
      const events: NostrEvent[] = []
      const sub = pool.subscribeMany(relays, filters, {
        onEvent: (event: NostrEvent) => events.push(event),
        onEose: () => {
          resolve(events)
          sub?.close?.()
        },
      })

      setTimeout(() => {
        resolve(events)
        sub?.close?.()
      }, 5000)
    })
  }

  const getCategoryForTag = (tag: string): string => {
    const tech = ["nostr", "bitcoin", "web", "dev", "programming", "tech", "code"]
    const crypto = ["bitcoin", "btc", "lightning", "crypto", "nft", "defi"]
    const lower = tag.toLowerCase()

    if (tech.some((t) => lower.includes(t))) return "Technology"
    if (crypto.some((t) => lower.includes(t))) return "Cryptocurrency"
    return "Trending"
  }

  const truncatePubkey = (pubkey: string): string => `${pubkey.slice(0, 8)}...`

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
            Array.from({ length: 3 }).map((_, i) => (
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
            Array.from({ length: 2 }).map((_, i) => (
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
                    {(user.name || user.pubkey).substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold">{user.name || truncatePubkey(user.pubkey)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.about?.length ? `${user.about.slice(0, 30)}${user.about.length > 30 ? "..." : ""}` : "Nostr User"}
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
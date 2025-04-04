"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useNostr } from "./nostr-provider"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { nip04 } from "nostr-tools"
import { Skeleton } from "@/components/ui/skeleton"

type Contact = {
  pubkey: string
  lastMessage?: string
  time?: string
}

type NostrEvent = {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
}

export function MessageList() {
  const { pool, relays, publicKey } = useNostr()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!pool || !publicKey) return

    setLoading(true)

    // Get private key from localStorage for decryption
    const privateKey = localStorage.getItem("nostr-private-key")
    if (!privateKey) return

    // Subscribe to DM events (kind 4)
    const events: NostrEvent[] = []

    const sub = pool.subscribeMany(
      relays,
      [
        {
          kinds: [4], // DM events
          "#p": [publicKey], // Messages where we are tagged
        },
      ],
      {
        onEvent: (event: NostrEvent) => {
          events.push(event)
        },
        onEose: async () => {
          try {
            // Process events to extract contacts
            const contactsMap = new Map<string, { event: NostrEvent; decrypted?: string }>()

            // Group by contact and keep only the most recent message
            for (const event of events) {
              // Find the pubkey of the other party
              const otherPubkey =
                event.pubkey === publicKey ? event.tags.find((tag) => tag[0] === "p")?.[1] || "" : event.pubkey

              if (!otherPubkey) continue

              // If we already have a more recent message from this contact, skip
              if (contactsMap.has(otherPubkey) && contactsMap.get(otherPubkey)!.event.created_at > event.created_at) {
                continue
              }

              // Try to decrypt the message
              let decrypted = undefined
              try {
                // Determine which key to use for decryption
                const decryptionPubkey =
                  event.pubkey === publicKey ? event.tags.find((tag) => tag[0] === "p")?.[1] || "" : event.pubkey

                if (decryptionPubkey) {
                  decrypted = await nip04.decrypt(privateKey, decryptionPubkey, event.content)
                }
              } catch (error) {
                console.error("Failed to decrypt message:", error)
              }

              contactsMap.set(otherPubkey, { event, decrypted })
            }

            // Convert to array and sort by timestamp (newest first)
            const contactsList = Array.from(contactsMap.entries()).map(([pubkey, { event, decrypted }]) => {
              return {
                pubkey,
                lastMessage: decrypted || "[Encrypted message]",
                time: formatTimestamp(event.created_at),
              }
            })

            contactsList.sort((a, b) => {
              const eventA = events.find(
                (e) => e.pubkey === a.pubkey || e.tags.some((t) => t[0] === "p" && t[1] === a.pubkey),
              )
              const eventB = events.find(
                (e) => e.pubkey === b.pubkey || e.tags.some((t) => t[0] === "p" && t[1] === b.pubkey),
              )

              if (!eventA || !eventB) return 0
              return eventB.created_at - eventA.created_at
            })

            setContacts(contactsList)
            setLoading(false)
          } catch (error) {
            console.error("Error processing messages:", error)
            setLoading(false)
          }
        },
      },
    )

    return () => {
      sub.close()
    }
  }, [pool, relays, publicKey])

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return diffDays === 1 ? "Yesterday" : `${diffDays}d ago`
    } else if (diffHours > 0) {
      return `${diffHours}h ago`
    } else if (diffMins > 0) {
      return `${diffMins}m ago`
    } else {
      return "Just now"
    }
  }

  // Get initials from pubkey
  const getInitials = (pubkey: string) => {
    return pubkey.substring(0, 2).toUpperCase()
  }

  // Filter contacts based on search query
  const filteredContacts = searchQuery
    ? contacts.filter(
        (contact) =>
          contact.pubkey.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : contacts

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-800 h-screen">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <Input
            placeholder="Search messages"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-97px)]">
        {loading ? (
          <div className="space-y-4 p-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-3 w-10" />
                </div>
              ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? "No matching messages" : "No messages yet"}
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <Link
              key={contact.pubkey}
              href={`/messages/${contact.pubkey}`}
              className={`flex items-center gap-3 p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                pathname === `/messages/${contact.pubkey}` ? "bg-gray-100 dark:bg-gray-800" : ""
              }`}
            >
              <Avatar>
                <AvatarFallback>{getInitials(contact.pubkey)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <div className="font-bold truncate">{contact.pubkey.substring(0, 8)}...</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{contact.time}</div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{contact.lastMessage}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}


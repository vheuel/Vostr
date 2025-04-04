"use client"

type NostrEvent = {
  id: string
  pubkey: string
  created_at: number
  content: string
}

export default function Note({ event }: { event: NostrEvent }) {
  return (
    <div className="p-4 border-b">
      <p className="text-gray-600">@{event.pubkey.slice(0, 10)}... </p>
      <p className="mt-2">{event.content}</p>
      <span className="text-xs text-gray-400">{new Date(event.created_at * 1000).toLocaleString()}</span>
    </div>
  )
}
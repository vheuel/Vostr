"use client"

type NoteProps = { event: { pubkey: string; content: string; created_at: number } }

export function Note({ event }: NoteProps) {
  return (
    <div className="border p-4 my-2">
      <p><strong>{event.pubkey}</strong> <small>{new Date(event.created_at * 1000).toLocaleString()}</small></p>
      <p>{event.content}</p>
    </div>
  )
}
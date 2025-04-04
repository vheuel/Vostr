import React from "react"

type NoteProps = {
  id: string
  pubkey: string
  content: string
  created_at: number
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

const Note: React.FC<NoteProps> = ({ id, pubkey, content, created_at }) => {
  if (!content) {
    return <p className="text-gray-500">Catatan tidak tersedia</p>
  }

  return (
    <div className="border p-4 rounded-lg shadow-md bg-white my-2">
      <p className="text-sm text-gray-600">{pubkey.substring(0, 10)}...</p>
      <p className="text-lg font-semibold">{content}</p>
      <p className="text-xs text-gray-500">{formatDate(created_at)}</p>
    </div>
  )
}

export default Note
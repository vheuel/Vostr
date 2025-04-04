import React from "react";
import { type Event as NostrEvent } from "nostr-tools";

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

type NoteProps = {
  note: NostrEvent;
};

const Note: React.FC<NoteProps> = ({ note }) => {
  if (!note?.id || !note?.pubkey || !note?.created_at) {
    console.error("Note is invalid:", note);
    return <div className="text-red-500">Invalid note data</div>;
  }

  return (
    <div className="border p-4 rounded-lg shadow-md bg-white my-2">
      <p className="text-sm text-gray-600">{note.pubkey?.substring(0, 10)}...</p>
      <p className="text-lg font-semibold">{note.content}</p>
      <p className="text-xs text-gray-500">{formatDate(note.created_at)}</p>
    </div>
  );
};

export default Note;
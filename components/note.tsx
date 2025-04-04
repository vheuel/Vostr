"use client";

import React from "react";

type NoteProps = {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};

const Note: React.FC<{ note: NoteProps }> = ({ note }) => {
  if (!note) {
    console.error("Note undefined");
    return <div>Error: note kosong</div>;
  }

  return (
    <div className="border p-4 rounded-lg shadow-md bg-white dark:bg-gray-900 my-2">
      <p className="text-sm text-gray-600 dark:text-gray-400">{note.pubkey.substring(0, 10)}...</p>
      <p className="text-lg font-semibold text-gray-900 dark:text-white">{note.content}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(note.created_at)}</p>
    </div>
  );
};

export default Note;
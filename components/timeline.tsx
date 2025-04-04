"use client";

import { useEffect } from "react";
import { useNostr } from "@/context/NostrContext";
import { type Event as NostrEvent } from "nostr-tools";
import Note from "./Note";

export default function Timeline() {
  const { pool, relays, addNote, notes } = useNostr();

  useEffect(() => {
    if (!pool) return;

    const sub = pool.sub(relays, [
      {
        kinds: [1],
        limit: 100,
      },
    ]);

    sub.on("event", (event: NostrEvent) => {
      if (
        event.id &&
        event.pubkey &&
        typeof event.content === "string" &&
        typeof event.created_at === "number"
      ) {
        addNote(event);
      } else {
        console.warn("Ignored invalid note:", event);
      }
    });

    return () => {
      sub.unsub();
    };
  }, [pool]);

  return (
    <div>
      {notes.map((note) => (
        <Note key={note.id} note={note} />
      ))}
    </div>
  );
}
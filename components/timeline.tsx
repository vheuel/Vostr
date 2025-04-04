"use client";

import { useEffect, useState } from "react";
import { useNostr } from "./nostr-provider";
import { Note } from "./note";
import { Skeleton } from "@/components/ui/skeleton";
import { ComposeNote } from "./compose-note";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type NostrEvent = {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
};

export function Timeline() {
  const { pool, relays, publicKey } = useNostr();
  const [notes, setNotes] = useState<NostrEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("for-you");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pool) return;

    setLoading(true);
    setError(null);
    setNotes([]);

    const fetchNotes = async () => {
      try {
        const events = await pool.get(relays, {
          kinds: [1], // Kind 1 = Notes
          limit: 50,
        });

        if (events.length === 0) {
          setError("No notes found");
        }

        setNotes(events);
      } catch (err) {
        console.error("Error fetching notes:", err);
        setError("Failed to fetch notes");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [pool, relays]);

  return (
    <div>
      <ComposeNote />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="for-you">For You</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
      </Tabs>
      {loading ? <Skeleton /> : notes.map((note) => <Note key={note.id} {...note} />)}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
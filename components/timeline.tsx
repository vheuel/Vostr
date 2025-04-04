"use client";

import { useEffect, useState } from "react";
import { useNostr } from "./nostr-provider";
import Note from "./note";
import { Skeleton } from "@/components/ui/skeleton";
import { ComposeNote } from "./compose-note";
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
    if (!pool || !relays?.length) return;

    setLoading(true);
    setError(null);
    setNotes([]);

    const fetchNotes = async () => {
      try {
        const filters: any = {
          kinds: [1],
          limit: 50,
        };

        if (activeTab === "following" && publicKey) {
          // Ambil event follow (contacts) sebagai referensi untuk siapa yang diikuti
          const followEvents = await pool.list(relays, {
            kinds: [3],
            authors: [publicKey],
            limit: 1,
          });
          const latestFollowEvent = followEvents?.[0];
          const followed = latestFollowEvent?.tags
            ?.filter((tag) => tag[0] === "p")
            ?.map((tag) => tag[1]);

          if (followed?.length) {
            filters.authors = followed;
          } else {
            setNotes([]);
            setError("You are not following anyone yet");
            setLoading(false);
            return;
          }
        }

        // Gunakan pool.list untuk mendapatkan array events
        const events = await pool.list(relays, filters);

        if (!Array.isArray(events) || events.length === 0) {
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
  }, [pool, relays, activeTab, publicKey]);

  return (
    <div className="space-y-4">
      <ComposeNote />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="for-you">For You</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        notes.map((note) => <Note key={note.id} note={note} />)
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react"; import { useNostrPool } from "../nostr/useNostrPool";

const Timeline = ({ activeTab, publicKey }) => { const { pool, relays } = useNostrPool(); const [notes, setNotes] = useState([]); const [loading, setLoading] = useState(false); const [error, setError] = useState(null);

useEffect(() => { if (!pool || !relays || relays.length === 0) { console.log("Pool atau relays tidak tersedia"); return; }

setLoading(true);
setError(null);
setNotes([]);

console.log("Starting Timeline effect dengan:");
console.log("Menggunakan relay:", relays);

const filter = {
  kinds: [1],
  limit: 20,
};

if (activeTab === "following" && publicKey) {
  filter.authors = [publicKey];
}

console.log("Menggunakan filter:", filter);

pool
  .get(relays, filter)
  .then((receivedEvents) => {
    console.log("Events diterima dari pool.get:", receivedEvents);
    if (receivedEvents && Array.isArray(receivedEvents)) {
      setNotes(receivedEvents.sort((a, b) => b.created_at - a.created_at));
    } else {
      console.log("Tidak ada event yang diterima atau format salah.");
      setNotes([]);
    }
    setLoading(false);
  })
  .catch((e) => {
    console.error("Error fetching events:", e);
    setLoading(false);
    setError("Failed to load notes. Please try again.");
  });

}, [pool, relays, activeTab, publicKey]);

return ( <div> {loading && <p>Loading...</p>} {error && <p style={{ color: "red" }}>{error}</p>} {notes.length === 0 && !loading && <p>No posts available.</p>} <ul> {notes.map((note) => ( <li key={note.id}>{note.content}</li> ))} </ul> </div> ); };

export default Timeline;


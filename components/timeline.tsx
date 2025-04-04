import { relayInit, getPublicKey } from 'nostr-tools';

const relays = [ "wss://relay.damus.io", "wss://nostr-pub.wellorder.net", "wss://relay.snort.social" ];

const filter = { kinds: [1], // Kind 1 adalah postingan biasa limit: 50,  // Ambil maksimal 50 event terbaru };

async function fetchEvents() { console.log("Starting Timeline effect dengan:"); console.log("Menggunakan relay:", relays); console.log("Menggunakan filter:", filter);

let events = [];
try {
    for (const relayURL of relays) {
        const relay = relayInit(relayURL);
        await relay.connect();
        console.log(`Terhubung ke relay: ${relayURL}`);
        
        const relayEvents = await relay.list([filter]);
        console.log(`Events diterima dari ${relayURL}:`, relayEvents.length);
        events.push(...relayEvents);
        
        await relay.close();
    }
} catch (error) {
    console.error("Error mengambil event:", error);
}

return events;

}

async function updateTimeline() { const events = await fetchEvents(); if (events.length === 0) { console.log("Tidak ada postingan yang tersedia."); document.getElementById("timeline").innerHTML = "No posts available."; return; }

const sortedEvents = events.sort((a, b) => b.created_at - a.created_at);
const timeline = document.getElementById("timeline");
timeline.innerHTML = sortedEvents.map(event => `<p>${event.content}</p>`).join("\n");

}

updateTimeline();


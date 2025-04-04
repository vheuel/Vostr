const relays = [ "wss://relay.damus.io", "wss://nostr-pub.wellorder.net", "wss://relay.snort.social" ];

const pool = new SimplePool(); const filters = [{ kinds: [1], limit: 50 }];

async function fetchEvents() { console.log("Menghubungkan ke relay dan mengambil events...");

try {
    const events = await pool.get(relays, filters);
    if (!events || events.length === 0) {
        console.warn("Tidak ada event yang diterima.");
    } else {
        console.log("Event diterima:", events);
        displayEvents(events);
    }
} catch (error) {
    console.error("Error mengambil event:", error);
}

}

function displayEvents(events) { const timeline = document.getElementById("timeline"); if (!timeline) { console.error("Element #timeline tidak ditemukan di HTML."); return; }

timeline.innerHTML = "";
events.sort((a, b) => b.created_at - a.created_at); // Urutkan berdasarkan waktu

events.forEach(event => {
    const post = document.createElement("div");
    post.classList.add("post");
    post.innerHTML = `
        <div class="post-content">
            <p><strong>${event.pubkey}</strong>: ${event.content}</p>
            <small>${new Date(event.created_at * 1000).toLocaleString()}</small>
        </div>
    `;
    timeline.appendChild(post);
});

}

document.addEventListener("DOMContentLoaded", fetchEvents);


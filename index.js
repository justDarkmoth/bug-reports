const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const fetchWithRetry = async (url, maxRetries = 3, delayMs = 1000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                const data = await res.json();
                const errMsg = data?.errors?.[0]?.message || res.statusText;

                // If we got rate-limited, back off and retry
                if (errMsg.includes("Too many requests") || res.status === 429) {
                    console.warn(`Rate limited: ${url} — retrying in ${delayMs}ms 😵`);
                    await delay(delayMs);
                    continue;
                }

                // NotFound is fine, just log it once
                if (errMsg === "NotFound") {
                    console.warn(`Not found: ${url} 😬`);
                    return null;
                }

                // Other errors
                throw new Error(errMsg);
            }

            return await res.json();

        } catch (err) {
            if (attempt < maxRetries - 1) {
                console.warn(`Fetch failed (${attempt + 1}/${maxRetries}) for ${url}: ${err.message} 😤 Retrying...`);
                await delay(delayMs);
            } else {
                console.error(`Failed to fetch ${url} after ${maxRetries} attempts: ${err.message} 💀`);
                return null;
            }
        }
    }
};

// Wrap your main logic with some spacing between fetches
const fetchUserData = async (userId) => {
    const base = `https://friends.roblox.com/v1/users/${userId}`;
    const userUrl = `https://users.roblox.com/v1/users/${userId}`;
    const gameUrl = `https://games.roblox.com/v1/users/${userId}/games`;

    console.log(`Fetching info for user: ${userId}`);

    const userInfo = await fetchWithRetry(userUrl);
    const friends = await fetchWithRetry(`${base}/friends/count`);
    const followers = await fetchWithRetry(`${base}/followers/count`);
    const following = await fetchWithRetry(`${base}/followings/count`);
    const games = await fetchWithRetry(gameUrl);

    console.log({
        userId,
        userInfo,
        friends,
        followers,
        following,
        games,
    });

    // small delay between users to avoid triggering the 429 gods
    await delay(500);
};

// Example usage
const userIds = ["6221016804", "4875864764"]; // Add more as needed
(async () => {
    for (const userId of userIds) {
        await fetchUserData(userId);
    }
})();

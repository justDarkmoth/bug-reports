const express = require("express");
const axios = require("axios");
const app = express();
const port = 10000;

async function safeGet(url) {
  try {
    console.log(`Fetching from: ${url}`);
    return await axios.get(url);
  } catch (err) {
    console.warn(`Failed to fetch ${url}:`, err.response?.data || err.message);
    return { data: {} }; // fallback value
  }
}

app.get("/userinfo/:username", async (req, res) => {
  try {
    const username = req.params.username;

    const userInfoRes = await axios.post(
      `https://users.roblox.com/v1/usernames/users`,
      {
        usernames: [username],
        excludeBannedUsers: false
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const user = userInfoRes.data.data[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const userId = user.id;

    const profileURL = `https://users.roblox.com/v1/users/${userId}`;
    const followersURL = `https://friends.roblox.com/v1/users/${userId}/followers/count`;
    const followingURL = `https://friends.roblox.com/v1/users/${userId}/followings/count`;
    const friendsURL = `https://friends.roblox.com/v1/users/${userId}/friends/count`;
    const gamesURL = `https://games.roblox.com/v1/users/${userId}/games`;

    const [profileRes, followersRes, followingRes, friendsRes, gamesRes] = await Promise.all([
      safeGet(profileURL),
      safeGet(followersURL),
      safeGet(followingURL),
      safeGet(friendsURL),
      safeGet(gamesURL)
    ]);

    const profile = profileRes.data || {};
    const followers = followersRes.data?.count ?? 0;
    const following = followingRes.data?.count ?? 0;
    const friends = friendsRes.data?.count ?? 0;
    const games = gamesRes.data?.data ?? [];

    let totalVisits = 0;
    for (let game of games) {
      totalVisits += game.visits || 0;
    }

    res.json({
      id: userId,
      name: profile.name || user.name,
      displayName: profile.displayName || user.displayName,
      description: profile.description || "",
      created: profile.created || "",
      isBanned: profile.isBanned ?? false,
      hasVerifiedBadge: profile.hasVerifiedBadge ?? false,
      followers,
      following,
      friends,
      totalPlaceVisits: totalVisits
    });
  } catch (err) {
    console.error("💥 Top-level error:", err.message);
    res.status(500).json({
      error: "Internal server error",
      details: err.response?.data?.errors || err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});

const express = require("express");
const axios = require("axios");
const app = express();
const port = 10000;

app.get("/userinfo/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const userInfoRes = await axios.get(`https://users.roblox.com/v1/usernames/users`, {
      headers: { "Content-Type": "application/json" },
      data: { usernames: [username], excludeBannedUsers: false },
      method: "POST"
    });

    const user = userInfoRes.data.data[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const userId = user.id;

    // Get basic profile info
    const [profileRes, followersRes, followingRes, friendsRes, gamesRes] = await Promise.all([
      axios.get(`https://users.roblox.com/v1/users/${userId}`),
      axios.get(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
      axios.get(`https://friends.roblox.com/v1/users/${userId}/followings/count`),
      axios.get(`https://friends.roblox.com/v1/users/${userId}/friends/count`),
      axios.get(`https://games.roblox.com/v1/users/${userId}/games`)
    ]);

    const profile = profileRes.data;
    const followers = followersRes.data.count;
    const following = followingRes.data.count;
    const friends = friendsRes.data.count;
    const games = gamesRes.data.data;

    let totalVisits = 0;
    for (let game of games) {
      totalVisits += game.visits || 0;
    }

    res.json({
      id: userId,
      name: profile.name,
      displayName: profile.displayName,
      description: profile.description,
      created: profile.created,
      isBanned: profile.isBanned,
      hasVerifiedBadge: profile.hasVerifiedBadge,
      followers,
      following,
      friends,
      totalPlaceVisits: totalVisits
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});

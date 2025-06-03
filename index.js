const express = require("express");
const axios = require("axios");
const app = express();
const port = 10000;

app.get("/userinfo/:username", async (req, res) => {
  try {
    const username = req.params.username;
    console.log(`Fetching from: ${url}`);
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

    // Get basic profile info
    const [profileRes, followersRes, followingRes, friendsRes, gamesRes] = await Promise.all([
      console.log(`Fetching from: ${url}`);
      axios.get(`https://users.roblox.com/v1/users/${userId}`),
      console.log(`Fetching from: ${url}`);
      axios.get(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
      console.log(`Fetching from: ${url}`);
      axios.get(`https://friends.roblox.com/v1/users/${userId}/followings/count`),
      console.log(`Fetching from: ${url}`);
      axios.get(`https://friends.roblox.com/v1/users/${userId}/friends/count`),
      console.log(`Fetching from: ${url}`);
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

const express = require("express");
const axios = require("axios");
const app = express();
const port = 10000;

app.get("/userinfo/:username", async (req, res) => {
  try {
    const username = req.params.username;

    // Get the userId first
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

    // Prepare all the URLs
    const profileURL = `https://users.roblox.com/v1/users/${userId}`;
    const followersURL = `https://friends.roblox.com/v1/users/${userId}/followers/count`;
    const followingURL = `https://friends.roblox.com/v1/users/${userId}/followings/count`;
    const friendsURL = `https://friends.roblox.com/v1/users/${userId}/friends/count`;
    const gamesURL = `https://games.roblox.com/v1/users/${userId}/games`;

    console.log(`Fetching from: ${profileURL}`);
    console.log(`Fetching from: ${followersURL}`);
    console.log(`Fetching from: ${followingURL}`);
    console.log(`Fetching from: ${friendsURL}`);
    console.log(`Fetching from: ${gamesURL}`);

    // Fetch everything in parallel
    const [profileRes, followersRes, followingRes, friendsRes, gamesRes] = await Promise.all([
      axios.get(profileURL),
      axios.get(followersURL),
      axios.get(followingURL),
      axios.get(friendsURL),
      axios.get(gamesURL)
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
    console.error(err.response?.data || err.message || err);
    res.status(500).json({
      error: "Internal server error",
      details: err.response?.data?.errors || err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});

const express = require("express");
const app = express();
const port = 10000;

app.get("/userinfo/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const lookup = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username] })
    }).then(r => r.json());

    const user = lookup.data?.[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const [profile, followers, following, friends, games] = await Promise.all([
      fetch(`https://users.roblox.com/v1/users/${user.id}`).then(r => r.json()),
      fetch(`https://friends.roblox.com/v1/users/${user.id}/followers/count`).then(r => r.json()),
      fetch(`https://friends.roblox.com/v1/users/${user.id}/followings/count`).then(r => r.json()),
      fetch(`https://friends.roblox.com/v1/users/${user.id}/friends/count`).then(r => r.json()),
      fetch(`https://games.roblox.com/v1/users/${user.id}/games`).then(r => r.json())
    ]);

    const visits = games.data?.reduce((t, g) => t + (g.visits || 0), 0) || 0;

    res.json({
      id: user.id,
      name: profile.name,
      displayName: profile.displayName,
      description: profile.description,
      created: profile.created,
      isBanned: profile.isBanned,
      hasVerifiedBadge: profile.hasVerifiedBadge,
      followers: followers.count,
      following: following.count,
      friends: friends.count,
      totalPlaceVisits: visits
    });
  } catch (err) {
    res.status(500).json({ error: "Internal error", msg: err.message });
  }
});

app.listen(port, () => console.log(`👻 http://localhost:${port}`));

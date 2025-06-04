app.get("/userinfo/:username", async (req, res) => {
  try {
    const username = req.params.username;

    // Step 1: Get User Info
    const userRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
    });
    const user = (await userRes.json()).data[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    // Step 2: Get Friends Count
    const friendsRes = await fetch(`https://friends.roblox.com/v1/users/${user.id}/friends/count`);
    const friends = (await friendsRes.json()).count;

    // Step 3: Get Followers & Following
    const followers = await fetch(`https://friends.roblox.com/v1/users/${user.id}/followers/count`).then(r => r.json()).then(d => d.count);
    const following = await fetch(`https://friends.roblox.com/v1/users/${user.id}/followings/count`).then(r => r.json()).then(d => d.count);

    // Step 4: Get User Places to find universeIds
    const placesRes = await fetch(`https://develop.roblox.com/v1/users/${user.id}/places`);
    const places = (await placesRes.json()).data;
    const universeIds = [...new Set(places.map(place => place.universeId))].filter(Boolean);

    // Step 5: Get Visit Counts per universe
    let totalPlaceVisits = 0;
    if (universeIds.length > 0) {
      const universeRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeIds.join(",")}`);
      const universeData = (await universeRes.json()).data;
      totalPlaceVisits = universeData.reduce((sum, game) => sum + (game.visits || 0), 0);
    }

    // Final Response
    res.json({
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      description: user.description,
      created: user.created,
      isBanned: user.isBanned,
      hasVerifiedBadge: user.hasVerifiedBadge,
      followers,
      following,
      friends,
      totalPlaceVisits
    });
  } catch (err) {
    console.error("Error fetching user info:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

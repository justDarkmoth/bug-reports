import express from "express";
import fetch from "node-fetch";
const app = express();

const port = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("🔥 Roblox Profile Proxy is working");
});

app.get("/profile/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const userInfoRes = await fetch(`https://users.roblox.com/v1/users/${id}`);
    const userInfo = await userInfoRes.json();

    res.json({
      userId: id,
      userInfo,
    });
  } catch (err) {
    res.status(500).json({ error: "😭 Couldn't fetch profile." });
  }
});

app.get("/followers/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const followersRes = await fetch(`https://friends.roblox.com/v1/users/${id}/followers?limit=100`);
    const followers = await followersRes.json();

    res.json({
      userId: id,
      followers,
    });
  } catch (err) {
    res.status(500).json({ error: "😭 Couldn't fetch followers." });
  }
});

app.get("/following/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const followingRes = await fetch(`https://friends.roblox.com/v1/users/${id}/followings?limit=100`);
    const following = await followingRes.json();

    res.json({
      userId: id,
      following,
    });
  } catch (err) {
    res.status(500).json({ error: "😭 Couldn't fetch following." });
  }
});

app.listen(port, () => {
  console.log(`🔥 Roblox proxy running on http://localhost:${port}`);
});

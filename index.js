import express from 'express';
import fetch from 'node-fetch'; // or global fetch if you're on newer Node

const app = express();
const port = process.env.PORT || 10000;

// CORS middleware so your frontend doesn’t scream
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// 💀 THE BAREBONES ENDPOINT
app.get('/roblox/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // GET BASIC USER INFO
    const userInfoRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    if (!userInfoRes.ok) {
      return res.status(userInfoRes.status).json({ error: 'User not found' });
    }

    const userInfo = await userInfoRes.json();

    // 🧼 BASIC CLEAN DATA
    const cleanUserData = {
      userId: userId,
      userInfo: {
        name: userInfo.name,
        displayName: userInfo.displayName,
        description: userInfo.description,
        created: userInfo.created,
        isBanned: userInfo.isBanned
      }
    };

    res.json(cleanUserData);

  } catch (err) {
    console.error('😭 Proxy failed:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the damn thing
app.listen(port, () => {
  console.log(`🔥 Roblox proxy running on http://localhost:${port}`);
});

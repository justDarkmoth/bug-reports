const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/userinfo/:username", async (req, res) => {
	try {
		const username = req.params.username;
		if (!username) return res.status(400).json({ error: "Bruh. Username is missing." });

		const userRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ usernames: [username] }),
		});

		if (!userRes.ok) throw new Error("Roblox API died while fetching user ID");

		const userData = await userRes.json();
		if (!userData.data || userData.data.length === 0)
			return res.status(404).json({ error: "That username doesn’t exist, chief." });

		const userId = userData.data[0].id;

		const profileRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
		if (!profileRes.ok) throw new Error("Roblox API fumbled getting the profile");

		const profileData = await profileRes.json();
		res.json(profileData);
	} catch (err) {
		console.error("😭 Error:", err.message);
		res.status(500).json({ error: "Proxy server had a stroke tryna get that data." });
	}
});

app.listen(PORT, () => {
	console.log(`✅ Server running on port ${PORT}`);
});

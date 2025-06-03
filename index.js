const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 10000;

app.get("/userinfo/:username", async (req, res) => {
	const username = req.params.username;
	try {
		const response = await axios.get(`https://users.roblox.com/v1/usernames/users`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			data: {
				usernames: [username],
				excludeBannedUsers: true
			}
		});

		const userData = response.data.data[0];
		if (!userData) {
			return res.status(404).json({ error: "User not found" });
		}

		// Fetch full user info using their ID
		const profileRes = await axios.get(`https://users.roblox.com/v1/users/${userData.id}`);
		res.json(profileRes.data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Something went wrong 😭" });
	}
});

app.listen(PORT, () => {
	console.log(`Proxy server running on port ${PORT}`);
});

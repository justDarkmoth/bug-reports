import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

app.post("/report", async (req, res) => {
  const { message } = req.body;

  if (!message || message.length > 1024) {
    return res.status(400).json({ error: "Invalid message." });
  }

  try {
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
      embeds: [
        {
          title: "🐛 Bug Report from Roblox",
          description: message,
          color: 0xff0000,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.status(500).json({ error: "Failed to send report." });
  }
});

app.get("/", (req, res) => {
  res.send("👋 Proxy server is alive.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

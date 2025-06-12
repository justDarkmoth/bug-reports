const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.post("/report", (req, res) => {
  const message = req.body.message;
  console.log("Received bug report:", message);

  // Here you’d send to Discord webhook etc
  res.send("Bug report received, thanks bro 🐛💖");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

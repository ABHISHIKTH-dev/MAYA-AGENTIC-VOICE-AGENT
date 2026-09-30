require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "https://abhishikth-dev.github.io"
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("Maya backend is online.");
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please send a message."
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        error: "Backend API key is not configured."
      });
    }

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are Maya, a warm, sweet, highly efficient
executive assistant and voice companion.

Speak naturally, clearly, and conversationally.
Keep spoken answers concise unless the user asks for detail.
Help with research, planning, writing, and organization.
Ask a brief clarifying question when needed.
Never claim to send emails, access accounts, or complete
external actions unless an actual connected tool confirms it.
You are an AI assistant, not a human.`
            },
            {
              role: "user",
              content: message.trim()
            }
          ],
          temperature: 0.7,
          max_tokens: 600
        })
      }
    );

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Groq error:", data);
      return res.status(groqResponse.status).json({
        error: data.error?.message || "Groq request failed."
      });
    }

    res.json({
      reply: data.choices?.[0]?.message?.content ||
        "Sorry, I couldn't create a reply."
    });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Maya had a server problem. Please try again."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Maya backend running on port ${PORT}`);
});

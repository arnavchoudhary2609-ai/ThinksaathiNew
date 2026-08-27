const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
const { message, history = [] } = req.body;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
You are ThinkSaathi, an empathetic AI companion for teenagers (13-19).
Be warm, supportive and conversational.
Do not sound robotic.
Keep responses under 120 words unless the user asks for more.

Previous conversation:
${history
  .map(item => `${item.role === "user" ? "User" : "ThinkSaathi"}: ${item.content}`)
  .join("\n")}
User: ${message}
`,
    });

    res.json({
      reply: response.text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      reply: "Sorry, something went wrong.",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`ThinkSaathi backend running on port ${PORT}`);
});
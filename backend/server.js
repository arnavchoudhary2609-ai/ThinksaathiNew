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
app.get("/", (req, res) => {
  res.send("ThinkSaathi backend is running!");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const contents = `
You are ThinkSaathi, an empathetic AI companion for teenagers (13-19).
Be warm, supportive and conversational.
Do not sound robotic.
Keep responses under 120 words unless the user asks for more.

Previous conversation:
${history
  .map(item => `${item.role === "user" ? "User" : "ThinkSaathi"}: ${item.content}`)
  .join("\n")}

User: ${message}
`;

    let response;

    try {
      response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
      });
    } catch (error) {
      console.error("Gemini first attempt failed:", error);

      if (error.status === 503) {
        console.log("Gemini temporarily unavailable. Retrying in 2 seconds...");

        await new Promise(resolve => setTimeout(resolve, 2000));

        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents,
        });
      } else {
        throw error;
      }
    }

    res.json({
      reply: response.text,
    });

  } catch (error) {
    console.error("ThinkSaathi /chat error:", error);

    res.status(error.status || 500).json({
      reply: "Saathi is having a little trouble right now. Please try again in a moment."
    });
  }
});
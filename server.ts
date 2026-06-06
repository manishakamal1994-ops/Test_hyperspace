import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required for AI actions");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// API Route for Gemini assistance
app.post("/api/help", async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getAI();
    const systemInstruction = 
      "You are N2S Deep Architect, a specialized AI developer assistant. " +
      "The user is building a web application using the N2S (Node to Serverless) framework, " +
      "developing it inside GitHub Codespaces, and deploying it on Vercel from their GitHub repository 'Test_hyperspace'.\n\n" +
      "Provide extremely precise, concise, and helpful advice. " +
      "If the user asks for code, write clean, production-ready serverless functions or configurations " +
      "following standard N2S/Vercel guidelines. Keep all answers professional, objective, and action-oriented.";

    const contents = `User question: ${prompt}\n\nContext of their current selection: ${JSON.stringify(context || {})}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({ text: response.text });
  } catch (err: any) {
    console.error("Gemini API error:", err);
    return res.status(500).json({ error: err.message || "An unexpected error occurred with the AI assistant." });
  }
});

// Serve frontend with Vite in development, static build in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

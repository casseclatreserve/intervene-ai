import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route: Gemini Intervene Coach
  app.post("/api/intervene", async (req, res) => {
    try {
      const { tasks, habits, currentFeeling, situation } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are the core consciousness of "Intervene AI" — a cinematic, goth-dark productivity operating system. Your purpose is to deliver a highly customized, raw, urgent, poetic, and dark intervention for a user who is procrastinating, spiraling, or losing track of time.
      
      User's Current Feeling/Vibe: "${currentFeeling || 'Overwhelmed and hesitant'}"
      User's Immediate Situation: "${situation || 'Staring at a blank screen, avoiding action'}"
      
      User's Active Tasks:
      ${JSON.stringify(tasks || [])}
      
      User's Monthly Kaizen Habits:
      ${JSON.stringify(habits || [])}
      
      Guidelines for your response:
      1. Tone: Deep, atmospheric, goth-luxe, cinematic, intellectual, and urgent. Speak with quiet intensity and commanding precision.
      2. Keep it concise yet deeply impactful (under 250 words). Use dark, poetic metaphors of time, the abyss, starlight, and inevitability.
      3. Do NOT use standard cheerful, preppy "you can do it!" language. Instead, speak about reclaiming agency, intervening before the timeline decays, and the beautiful friction of action.
      4. Call out 1 or 2 specific tasks or habits from their list to make the intervention feel personal and hyper-intelligent.
      5. End with a single, absolute, un-negotiable directive: "5. 4. 3. 2. 1. Intervene."
      6. Provide output in clean HTML formatting (like paragraphs <p>, strong words <strong>, maybe blockquote) suitable for rendering directly in a beautiful dark container. Do not output markdown codeblocks. Just raw HTML text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // API Route: Gemini Coach Chat
  app.post("/api/coach", async (req, res) => {
    try {
      const { messages, tasks, habits, matrixTasks } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Format conversation history for model
      const formattedHistory = (messages || []).map((m: any) => `${m.sender === 'user' ? 'User' : 'Intervene AI'}: ${m.text}`).join('\n');

      const prompt = `You are the core consciousness of "Intervene AI" — a cinematic, goth-dark productivity operating system. Your purpose is to act as a supportive, commanding, and poetic productivity coach.
      
      User's Current Active Tasks:
      ${JSON.stringify(tasks || [])}
      
      User's Kaizen Habits:
      ${JSON.stringify(habits || [])}
      
      User's Eisenhower Matrix:
      ${JSON.stringify(matrixTasks || [])}
      
      Conversation History:
      ${formattedHistory}
      
      Guidelines for your response:
      1. Tone: Deep, atmospheric, goth-luxe, cinematic, intellectual, and supportive but urgent. Speak with quiet intensity.
      2. Keep it relatively concise (under 180 words). Use gorgeous metaphors of time, focus, compound progress, and prefrontal discipline.
      3. Strictly avoid standard preppy cheerfulness or casual banter.
      4. DO NOT use italic text under any circumstances outside scientific binaural terms. Keep all regular words plain.
      5. Reference their real tasks or habits if relevant to the conversation.
      6. Provide output in clean HTML paragraphs (e.g. <p>, <strong>), suitable for rendering directly. No markdown blockquotes, lists, or backticks.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Coach API Error:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // Vite Integration
  if (!isProd) {
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
    console.log(`[Intervene AI Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

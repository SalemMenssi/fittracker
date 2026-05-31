const { generateAIContent } = require("../utils/aiHelper");

const SYSTEM_PERSONA =
  'You are "The System" in a gamified self-improvement RPG app. Reply in 2-4 short sentences. Be motivating, practical, and gamified (quests, EXP, rank). Do not use markdown headers.';

const askSystem = async (req, res) => {
  try {
    if (typeof fetch !== "function") {
      return res.status(500).json({ message: "Server fetch API unavailable. Use Node 18+." });
    }

    const prompt = (req.body?.prompt || "").trim();
    const raw = !!req.body?.raw;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(503).json({ message: "GEMINI_API_KEY is not configured on the server." });
    }

    const userPrompt = raw
      ? `Return ONLY valid JSON with no markdown and no extra text. User request: ${prompt}`
      : prompt;

    const { text, modelUsed, apiVersion } = await generateAIContent(userPrompt, {
      raw,
      allowFallback: false,
      systemInstruction: raw ? undefined : SYSTEM_PERSONA,
    });

    return res.json({
      text: text || "System response unavailable.",
      modelUsed,
      apiVersion,
    });
  } catch (error) {
    const message = error.message || "Gemini request failed";
    const lower = message.toLowerCase();
    const status =
      lower.includes("not configured") || lower.includes("unavailable")
        ? 503
        : 502;
    return res.status(status).json({ message });
  }
};

module.exports = { askSystem };

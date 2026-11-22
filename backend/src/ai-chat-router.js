import { Router } from "express";

const router = Router();

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export function createAiChatRouter({ authenticate } = {}) {
  const aiRouter = Router();

  // Require login for chatbot requests.
  if (authenticate) {
    aiRouter.use(authenticate);
  }

  aiRouter.post("/chat", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(503).json({
          error: "Gemini API key is not configured.",
        });
      }

      const { message, messages } = req.body || {};

      // Support both a single message and chat history.
      const input = Array.isArray(messages)
        ? messages
        : [{ role: "user", content: message }];

      if (!input.length || input.length > 20) {
        return res.status(400).json({
          error: "Please provide 1 to 20 messages.",
        });
      }

      const contents = input.map((item) => {
        const content = item?.content ?? item?.text;
        const role = item?.role === "assistant" ? "model" : "user";

        if (
          typeof content !== "string" ||
          !content.trim() ||
          content.length > 4000 ||
          !["user", "assistant"].includes(item?.role)
        ) {
          throw new Error("Invalid chat message.");
        }

        return {
          role,
          parts: [{ text: content }],
        };
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      let response;

      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [
                  {
                    text:
                      "You are ProjectHealth AI Assistant. " +
                      "Help students with project management, " +
                      "programming, technology, and general questions. " +
                      "Be helpful, accurate, and clear. " +
                      "Do not claim to have accessed Asana or project " +
                      "data unless it was actually provided.",
                  },
                ],
              },
              generationConfig: {
                maxOutputTokens: 700,
                temperature: 0.7,
              },
            }),
          },
        );
      } finally {
        clearTimeout(timeout);
      }

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Gemini API error:",
          response.status,
          data?.error?.message || "Unknown error",
        );

        return res.status(response.status === 429 ? 429 : 502).json({
          error:
            response.status === 429
              ? "Gemini free-tier limit reached. Please try again later."
              : "Gemini could not process your request.",
        });
      }

      const reply = (data.candidates?.[0]?.content?.parts || [])
        .map((part) => part.text || "")
        .join("")
        .trim();

      if (!reply) {
        return res.status(502).json({
          error: "Gemini returned no text response.",
        });
      }

      return res.json({
        reply,
        answer: reply,
        model: GEMINI_MODEL,
      });
    } catch (error) {
      if (error.message === "Invalid chat message.") {
        return res.status(400).json({ error: error.message });
      }

      console.error("AI chatbot error:", error.message);

      return res.status(500).json({
        error: "AI chatbot request failed.",
      });
    }
  });

  return aiRouter;
}

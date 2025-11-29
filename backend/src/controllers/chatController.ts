import { Request, Response } from "express";
import { Car, type ICar } from "../models/Car";
import { runFreeAI } from "../utils/aiEngine";

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const lower = message.toLowerCase();

    // --------------------------
    // 1️⃣ Recommendation intent
    // --------------------------
    const isRecommendation =
      lower.includes("recommend") ||
      lower.includes("best car") ||
      lower.includes("good car") ||
      lower.includes("budget") ||
      lower.includes("student");

    let carDataText = "";

    if (isRecommendation) {
      const cars: ICar[] = await Car.find().limit(10);

      carDataText = cars
        .map(
          (c: ICar) =>
            `- ${c.brand} ${c.model} (${c.year}) • $${c.price} • ${c.mileage}km • Condition: ${c.condition}`
        )
        .join("\n");
    }

    // --------------------------
    // 2️⃣ Evaluation intent
    // --------------------------
    const isEvaluation =
      lower.includes("good deal") ||
      lower.includes("evaluate") ||
      lower.includes("worth it") ||
      lower.includes("is this good");

    // --------------------------
    // Build AI Prompt
    // --------------------------
    const prompt = `
You are an AI assistant specialized in cars.
Always answer clearly and accurately.

Conversation so far:
${(history || [])
  .map(
    (m: { role: string; content: string }) =>
      `${m.role.toUpperCase()}: ${m.content}`
  )
  .join("\n")}

USER MESSAGE: ${message}

${isRecommendation ? `Real cars from database:\n${carDataText}` : ""}
${isEvaluation ? "Evaluate the car description realistically." : ""}

AI RESPONSE:
`.trim();

    // --------------------------
    // GET AI RESPONSE
    // --------------------------
    const ai = await fetch(
      "https://api-inference.huggingface.co/models/google/gemma-2-2b-it",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await ai.json();
    console.log("HF response:", data);

    // --------------------------
    // HANDLE FAILED RESPONSES
    // --------------------------
    if (data.error || data.estimated_time) {
      return res.json({
        reply:
          "The model is loading... but generally, popular choices include Toyota Corolla, Honda Civic, and Hyundai Elantra for budget or student drivers.",
      });
    }

    // --------------------------
    // EXTRACT GENERATED TEXT SAFELY
    // --------------------------
    const raw =
      data?.[0]?.generated_text ||
      data?.generated_text ||
      "";

    const aiReply = raw.replace(prompt, "").trim();

    if (!aiReply || aiReply.length < 3) {
      return res.json({
        reply:
          "If you're looking for a good, reliable, and affordable option, consider a Toyota Corolla, Honda Civic, Hyundai Elantra, or Kia Rio.",
      });
    }

    return res.json({ reply: aiReply });
  } catch (err) {
    console.error("AI Chat Error:", err);
    return res.status(500).json({ error: "AI service failed" });
  }
};

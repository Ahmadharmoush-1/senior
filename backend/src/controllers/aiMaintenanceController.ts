// src/controllers/aiMaintenanceController.ts
import axios from "axios";
import { Request, Response } from "express";

export const estimateMaintenance = async (req: Request, res: Response) => {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const MODEL = process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct";

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ message: "Missing OPENROUTER_API_KEY" });
    }

    const car = req.body;

    // -----------------------------
    // 🔥 AI Prompt
    // -----------------------------
    const prompt = `
You are an expert certified automotive mechanic AI.
Estimate the yearly maintenance cost for the following car:

Brand: ${car.brand}
Model: ${car.model}
Year: ${car.year}
Mileage: ${car.mileage}
Condition: ${car.condition}
Fuel Type: ${car.fuelType}
Transmission: ${car.transmission}

Return ONLY valid JSON in this exact format:

{
  "yearlyLow": number,
  "yearlyHigh": number,
  "recommendedYearlyBudget": number,
  "riskLevel": "low" | "medium" | "high",
  "commonRepairs": string[],
  "summary": string,
  "tips": string
}
    `;

    // -----------------------------
    // 🔥 OpenRouter Request
    // -----------------------------
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({
        message: "AI returned empty response",
        raw: response.data
      });
    }

    // -----------------------------
    // 🔥 Extract clean JSON from messy AI output
    // -----------------------------
    const cleaned = content.trim();

    // Extract the first {...} block
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(500).json({
        message: "AI returned invalid JSON format",
        raw: cleaned,
      });
    }

    // Parse the extracted JSON
    let jsonData;
    try {
      jsonData = JSON.parse(jsonMatch[0]);
    } catch (err) {
      return res.status(500).json({
        message: "AI JSON parse error",
        raw: cleaned,
      });
    }

    // -----------------------------
    // 🔥 Final Response
    // -----------------------------
    return res.json(jsonData);

  } catch (error) {
    console.error("AI Maintenance Error:", error);
    return res.status(500).json({
      message: "Maintenance AI failed",
      error: (error as Error).message,
    });
  }
};

import { Request, Response } from "express";
import { openrouter } from "../services/openrouterService";

export const predictPrice = async (req: Request, res: Response) => {
  try {
    const { brand, model, year, mileage, condition } = req.body;

    const prompt = `
You are a car market pricing expert.

Given the following car details:
Brand: ${brand}
Model: ${model}
Year: ${year}
Mileage: ${mileage}
Condition: ${condition}

Provide JSON ONLY in this format:

{
  "minPrice": number,
  "maxPrice": number,
  "recommendedPrice": number,
  "marketSummary": "string"
}
`;

    const response = await openrouter.post("/chat/completions", {
      model: process.env.OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.data.choices[0].message.content ?? "{}";
    const priceData = JSON.parse(content);

    return res.json(priceData);

  } catch (error) {
    console.error("AI Price Prediction Error:", error);
    res.status(500).json({ message: "AI price prediction failed." });
  }
};

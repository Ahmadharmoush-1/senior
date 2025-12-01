import { Request, Response } from "express";
import { openrouter } from "../services/openrouterService";

export const compareCars = async (req: Request, res: Response) => {
  try {
    const { carA, carB } = req.body;

    const prompt = `
You are a professional car analyst. Compare the following two cars
and provide an objective comparison.

Car A:
Brand: ${carA.brand}
Model: ${carA.model}
Year: ${carA.year}
Mileage: ${carA.mileage}
Price: ${carA.price}
Condition: ${carA.condition}

Car B:
Brand: ${carB.brand}
Model: ${carB.model}
Year: ${carB.year}
Mileage: ${carB.mileage}
Price: ${carB.price}
Condition: ${carB.condition}

Respond ONLY in JSON format like this:

{
  "betterCar": "A or B",
  "reason": "string",
  "detailedComparison": {
    "performance": "string",
    "reliability": "string",
    "fuelEconomy": "string",
    "comfort": "string",
    "valueForMoney": "string"
  }
}
`;

    const response = await openrouter.post("/chat/completions", {
      model: process.env.OPENROUTER_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.data.choices?.[0]?.message?.content ?? "{}";
    const result = JSON.parse(content);

    return res.json(result);

  } catch (error) {
    console.error("AI Compare Error:", error);
    res.status(500).json({ message: "AI comparison failed." });
  }
};

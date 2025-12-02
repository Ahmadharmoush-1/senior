// src/services/aiCompareService.ts
import axios from "../lib/axios";

export interface CarCompareInput {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  condition: string;
}

export interface CarCompareResult {
  betterCar: "A" | "B";
  reason: string;
  detailedComparison: {
    performance: string;
    reliability: string;
    fuelEconomy: string;
    comfort: string;
    valueForMoney: string;
  };
}

export const compareCarsAI = async (
  carA: CarCompareInput,
  carB: CarCompareInput
): Promise<CarCompareResult> => {
  const res = await axios.post("/ai/compare", { carA, carB });
  return res.data;
};

import axios from "../lib/axios";

// ---------- Types ----------
export type AiPriceInput = {
  brand: string;
  model: string;
  year: number | string;
  mileage: number | string;
  condition: string;
};

export type AiPriceResult = {
  minPrice: number;
  maxPrice: number;
  recommendedPrice: number;
  marketSummary: string;
};

// ---------- Service ----------
export const predictCarPrice = async (
  carData: AiPriceInput
): Promise<AiPriceResult> => {
  try {
    const res = await axios.post<AiPriceResult>("/ai/price", carData);
    return res.data;
  } catch (err) {
    console.error("AI Price Prediction Error:", err);
    throw err;
  }
};

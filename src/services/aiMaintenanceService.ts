// src/services/aiMaintenanceService.ts
import axios from "../lib/axios";

export interface MaintenanceInput {
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  condition: string;
  fuelType?: string;
  transmission?: string;
}

export interface MaintenanceEstimate {
  yearlyLow: number;
  yearlyHigh: number;
  recommendedYearlyBudget: number;
  riskLevel: "low" | "medium" | "high";
  summary: string;
  commonRepairs: string[];
  tips: string;
}

export const estimateMaintenanceCost = async (
  car: MaintenanceInput
): Promise<MaintenanceEstimate> => {
  const res = await axios.post<MaintenanceEstimate>("/ai/maintenance", car);
  return res.data;
};

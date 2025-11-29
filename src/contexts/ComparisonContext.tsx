// src/contexts/ComparisonContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { Car } from "@/types/car";
import { useAuthStore } from "@/stores/authStore";
import { saveComparison } from "@/services/carService";

// Helper: validate MongoDB ObjectId
const isValidObjectId = (id: string) => /^[a-fA-F0-9]{24}$/.test(id);

interface ComparisonContextType {
  comparisonList: Car[];
  addToComparison: (car: Car) => boolean;
  removeFromComparison: (carId: string) => void;
  clearComparison: () => void;
  isInComparison: (carId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(
  undefined
);

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
};

const MAX_COMPARISON = 3;

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [comparisonList, setComparisonList] = useState<Car[]>([]);
  const token = useAuthStore((state) => state.token);
  const [hasSaved, setHasSaved] = useState(false); // avoid double saving

  // -------------------------------------
  // ADD CAR TO COMPARISON (with validation)
  // -------------------------------------
 const addToComparison = (car: Car): boolean => {
  const mongoId = car.id ?? car.id; // use _id if available

  if (!isValidObjectId(mongoId)) {
    console.warn("Skipping compare: Invalid ID", mongoId);
    return false;
  }

  // Normalize object — backend expects _id
  car.id = mongoId;

  if (comparisonList.length >= MAX_COMPARISON) return false;
  if (comparisonList.some((c) => c.id === mongoId)) return false;

  setComparisonList((prev) => [...prev, car]);
  return true;
};



  // Remove by ID
  const removeFromComparison = (carId: string) => {
    setComparisonList((prev) => prev.filter((car) => car.id !== carId));
  };

  // Clear all
  const clearComparison = () => {
    setComparisonList([]);
    setHasSaved(false);
  };

  // Check if car in comparison
  const isInComparison = (carId: string) => {
    return comparisonList.some((car) => car.id === carId);
  };

  // ------------------------------------------------------
  // AUTO-SAVE the first TWO REAL cars to DB (only once)
  // ------------------------------------------------------
  useEffect(() => {
    const doSave = async () => {
      if (!token) return;
      if (comparisonList.length < 2) return;
      if (hasSaved) return;

      const [carA, carB] = comparisonList;

      if (!isValidObjectId(carA.id) || !isValidObjectId(carB.id)) {
        console.warn("Not saving comparison: invalid IDs", carA.id, carB.id);
        return;
      }

      try {
        await saveComparison(carA.id, carB.id, token);
        console.log("Comparison saved to database!");
        setHasSaved(true);
      } catch (err) {
        console.error("Error saving comparison:", err);
      }
    };

    doSave();
  }, [comparisonList, token, hasSaved]);

  return (
    <ComparisonContext.Provider
      value={{
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

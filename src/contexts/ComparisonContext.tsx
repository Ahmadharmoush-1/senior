import React, { createContext, useContext, useState } from "react";
import { Car } from "@/types/car";

interface ComparisonContextType {
  comparisonList: Car[];
  addToComparison: (car: Car) => boolean;
  removeFromComparison: (carId: string) => void;
  clearComparison: () => void;
  isInComparison: (carId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
};

const MAX_COMPARISON = 3;

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparisonList, setComparisonList] = useState<Car[]>([]);

  const addToComparison = (car: Car): boolean => {
    if (comparisonList.length >= MAX_COMPARISON) {
      return false;
    }
    if (comparisonList.find((c) => c.id === car.id)) {
      return false;
    }
    setComparisonList((prev) => [...prev, car]);
    return true;
  };

  const removeFromComparison = (carId: string) => {
    setComparisonList((prev) => prev.filter((car) => car.id !== carId));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const isInComparison = (carId: string) => {
    return comparisonList.some((car) => car.id === carId);
  };

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

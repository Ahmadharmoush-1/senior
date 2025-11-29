// src/models/Comparison.ts
import mongoose, { Schema, model, Document } from "mongoose";

export interface IComparison extends Document {
  user: mongoose.Types.ObjectId;
  carA: mongoose.Types.ObjectId;
  carB: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const comparisonSchema = new Schema<IComparison>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    carA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    carB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
  },
  { timestamps: true }
);

export const Comparison = model<IComparison>("Comparison", comparisonSchema);

import mongoose, { Schema, model } from "mongoose";

export interface ICar {
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  platforms: string[];
  description: string;
  condition: "new" | "used" | "certified";
  images: string[];
  seller: mongoose.Types.ObjectId;
  facebookUrl?: string;
}

const carSchema = new Schema<ICar>(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    mileage: { type: Number, required: true },

    // ❌ FIXED: remove required
    platforms: [{ type: String }],

    description: { type: String, required: true },

    condition: {
      type: String,
      enum: ["new", "used", "certified"],
      required: true,
    },

    // ❌ FIXED: remove required
    images: [{ type: String }],

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    facebookUrl: { type: String },
  },
  { timestamps: true }
);

export const Car = model<ICar>("Car", carSchema);

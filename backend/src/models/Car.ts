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

  // optional specs
  fuelType?: string;
  transmission?: string;
  color?: string;
  engineSize?: number;
  doors?: number;
  cylinder?: number;
  drivetrain?: string;
  bodyType?: string;

  // NEW FIELD
  phone?: string;

  // SOLD FEATURE
  sold?: boolean;
  soldAt?: Date | null;
}

const carSchema = new Schema<ICar>(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    mileage: { type: Number, required: true },

    platforms: [{ type: String }],
    description: { type: String, required: true },

    condition: {
      type: String,
      enum: ["new", "used", "certified"],
      required: true,
    },

    images: [{ type: String }],

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    facebookUrl: { type: String },
    phone: { type: String },

    // OPTIONAL SPECS
    fuelType: { type: String },
    transmission: { type: String },
    color: { type: String },
    engineSize: { type: Number },
    doors: { type: Number },
    cylinder: { type: Number },
    drivetrain: { type: String },
    bodyType: { type: String },

    // SOLD FIELDS
    sold: { type: Boolean, default: false },
    soldAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Car = model<ICar>("Car", carSchema);

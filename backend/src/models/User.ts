// src/models/User.ts
import mongoose, { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  otpHash: string | null;
  otpExpiresAt: Date | null;
  favorites: mongoose.Types.ObjectId[]; // ⭐ NEW
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // OTP fields (nullable)
    otpHash: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },

    // ⭐ FAVORITE CARS (by Car ObjectId)
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);

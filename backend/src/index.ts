// src/index.ts
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import carRoutes from "./routes/carRoutes";
import scrapeRoutes from "./routes/scrapeRoutes";
import facebookRoutes from "./routes/facebookRoutes";
import chatRoutes from "./routes/chatRoutes"; // still here, OK
import userRoutes from "./routes/userRoutes"; // ⭐ NEW
import comparisonRoutes from "./routes/comparisonRoutes"; // ⭐ NEW

const app = express();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8081",
      "http://127.0.0.1:8081",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

// JSON
app.use(express.json());

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/scrape", scrapeRoutes);
app.use("/api/facebook", facebookRoutes);
app.use("/api", chatRoutes); // AI route (you can remove later if not used)

// ⭐ NEW:
app.use("/api/user", userRoutes);
app.use("/api/comparisons", comparisonRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
});

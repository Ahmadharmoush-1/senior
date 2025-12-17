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
import userRoutes from "./routes/userRoutes";
import comparisonRoutes from "./routes/comparisonRoutes";
import aiRoutes from "./routes/aiRoutes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8081",
];


if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.options("*", cors());

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "API is running" });
});
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/scrape", scrapeRoutes);
app.use("/api/facebook", facebookRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/user", userRoutes);
app.use("/api/comparisons", comparisonRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

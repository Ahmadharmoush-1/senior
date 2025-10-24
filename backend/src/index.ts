// src/index.ts (or src/server.ts)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" , credentials: true }));
app.use(express.json());

// health route - add this
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "API is running", version: "1.0.0" });
});

// your API routes
app.use("/api/auth", authRoutes);

// start server after DB connected
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});

// src/index.ts (or src/server.ts)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";

dotenv.config();
const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:8081"], // add your frontend URL(s)
  credentials: true
}));
app.use(express.json());

// health route - add this
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "API is running", version: "1.0.0" });
});

// your API routes
app.use("/api/auth", authRoutes);

// start server after DB connected
const PORT = process.env.PORT || 5001;
connectDB().then(() => {
 app.listen(5000, "0.0.0.0", () => console.log("Server running on port 5000"));
});

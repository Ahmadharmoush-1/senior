import axios from "axios";

export const openrouter = axios.create({
  baseURL: process.env.OPENROUTER_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
  },
});

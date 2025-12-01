import axios from "axios";

export const openrouter = axios.create({
  baseURL: process.env.OPENROUTER_BASE_URL,
  headers: {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json"
  }
});

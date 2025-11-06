import axios from "axios";

// src/api/auth.ts
const API_URL = "http://localhost:5000/api/auth"; // Must match your local backend port


export const register = async (name: string, email: string, password: string) => {
  const res = await axios.post(`${API_URL}/register`, { name, email, password });
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  return res.data;
};

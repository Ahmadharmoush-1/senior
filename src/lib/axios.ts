// src/lib/axios.ts
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api", // backend base URL
  withCredentials: false, // change to true if you use cookie auth
  timeout: 30_000,
});

// Optional: request interceptor to log or attach token if you prefer centralizing auth
// instance.interceptors.request.use(config => {
//   // e.g. const token = getTokenFromStore();
//   // if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
//   return config;
// });

export default instance;

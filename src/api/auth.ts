import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export interface AuthSuccessResponse {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  token: string;
}

export const register = async (name: string, email: string, password: string) => {
  const res = await axios.post<AuthSuccessResponse>(`${API_URL}/register`, {
    name,
    email,
    password,
  });
  return res.data;
};

// STEP 1: password login → backend sends otp
export const login = async (email: string, password: string) => {
  const res = await axios.post<{ message: string }>(`${API_URL}/login`, {
    email,
    password,
  });
  return res.data;
};

// STEP 2: verify otp → returns user+token
export const verifyOtp = async (email: string, otp: string) => {
  const res = await axios.post<AuthSuccessResponse>(`${API_URL}/verify-otp`, {
    email,
    otp,
  });
  return res.data;
};

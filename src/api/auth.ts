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
  try {
    const res = await axios.post<{ message: string }>(`${API_URL}/login`, {
      email,
      password,
    });
    return res.data;

  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg = err.response?.data?.message || "Something went wrong.";
      throw new Error(msg);
    }

    throw new Error("Unexpected error occurred.");
  }
};



// STEP 2: verify otp → returns user+token
export const verifyOtp = async (email: string, otp: string) => {
  try {
    const res = await axios.post<AuthSuccessResponse>(`${API_URL}/verify-otp`, {
      email,
      otp,
    });
    return res.data;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "OTP verify failed.");
    }
    throw new Error("Unexpected error");
  }
};
// SEND OTP for forgot password
export const forgotPassword = async (email: string) => {
  try {
    const res = await axios.post<{ message: string }>(
      `${API_URL}/forgot-password`,
      { email }
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to send OTP");
    }
    throw new Error("Unexpected error occurred.");
  }
};

// VERIFY OTP for forgot password
export const verifyForgotOtp = async (email: string, otp: string) => {
  try {
    const res = await axios.post<{ message: string }>(
      `${API_URL}/verify-forgot-otp`,
      { email, otp }
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Invalid OTP");
    }
    throw new Error("Unexpected error occurred.");
  }
};

// RESET PASSWORD
export const resetPassword = async (
  email: string,
  password: string
) => {
  try {
    const res = await axios.post<AuthSuccessResponse>(
      `${API_URL}/reset-password`,
      { email, password }
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Reset failed");
    }
    throw new Error("Unexpected error occurred.");
  }
};

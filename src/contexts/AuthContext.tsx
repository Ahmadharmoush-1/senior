import React, { createContext, useContext, useState } from "react";
import {
  register as apiRegister,
  login as apiLogin,
  verifyOtp as apiVerifyOtp,
  AuthSuccessResponse,
} from "../api/auth";

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

interface AuthContextType {
  user: User | null;

  // step 1
  requestOtpLogin: (email: string, password: string) => Promise<void>;

  // step 2
  verifyOtpLogin: (email: string, otp: string) => Promise<void>;

  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

function getErrorMessage(error: unknown, fallback = "An error occurred") {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "object" && error !== null) {
    const e = error as { response?: { data?: { message?: string } } };
    return e.response?.data?.message ?? fallback;
  }
  return fallback;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used within an AuthProvider");
  return c;
};

function getStoredUser(): User | null {
  try {
    const item = localStorage.getItem("carfinder_user");
    if (!item || item === "undefined") return null;
    return JSON.parse(item) as User;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  const saveUserSession = (data: AuthSuccessResponse) => {
    const fullUser: User = {
      _id: data.user._id,
      name: data.user.name,
      email: data.user.email,
      token: data.token,
    };
    setUser(fullUser);
    localStorage.setItem("carfinder_user", JSON.stringify(fullUser));
  };

  // STEP 1
  const requestOtpLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await apiLogin(email, password);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Login failed");
      alert(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2
  const verifyOtpLogin = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const data = await apiVerifyOtp(email, otp);
      saveUserSession(data);
      alert("Login successful!");
    } catch (error: unknown) {
      const message = getErrorMessage(error, "OTP verification failed");
      alert(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiRegister(name, email, password);
      saveUserSession(data);
      alert("Registration successful!");
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Registration failed");
      alert(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("carfinder_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, requestOtpLogin, verifyOtpLogin, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

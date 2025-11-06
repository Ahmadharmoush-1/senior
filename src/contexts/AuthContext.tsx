import React, { createContext, useContext, useState } from "react";
import { register as apiRegister, login as apiLogin } from "../api/auth"; // ✅ Import axios helpers

interface User {
  name: string;
  email: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

function getErrorMessage(error: unknown, fallback = "An error occurred") {
  if (error instanceof Error) {
    return error.message || fallback;
  }
  if (typeof error === "object" && error !== null) {
    const maybeAxiosError = error as { response?: { data?: { message?: string } } };
    return maybeAxiosError.response?.data?.message ?? fallback;
  }
  return fallback;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ✅ Safe parser for localStorage
function getStoredUser(): User | null {
  try {
    const item = localStorage.getItem("carfinder_user");
    if (!item || item === "undefined") return null;
    return JSON.parse(item);
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiLogin(email, password);
      setUser(data.user);
      localStorage.setItem("carfinder_user", JSON.stringify(data.user));
      alert("Login successful!");
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Login failed");
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiRegister(name, email, password);
      setUser(data.user);
      localStorage.setItem("carfinder_user", JSON.stringify(data.user));
      alert("Registration successful!");
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Registration failed");
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("carfinder_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// src/stores/authStore.ts
import { create } from "zustand";

export interface User {
  id: string;
  name: string;
  email: string;
  // Add more fields if your backend returns them
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,

  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),

  logout: () => set({ token: null, user: null }),
}));

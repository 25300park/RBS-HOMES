import { create } from "zustand";

interface AuthState {
  session: any;
  setSession: (session: any) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
}));

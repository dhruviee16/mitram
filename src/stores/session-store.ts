import { create } from "zustand";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
} | null;

type SessionState = {
  user: SessionUser;
  setSession: (user: SessionUser) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  setSession: (user) => set({ user }),
  clear: () => set({ user: null }),
}));

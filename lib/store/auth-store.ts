import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

type AuthState = {
  session: Session | null;
  user: User | null;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setUser: (user) => set({ user }),
}));

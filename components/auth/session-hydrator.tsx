"use client";

import { useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { useAuthStore } from "@/lib/store/auth-store";

type Props = {
  session: Session | null;
};

export function SessionHydrator({ session }: Props) {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    setSession(session);
  }, [session, setSession]);

  return null;
}

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SessionHydrator } from "@/components/auth/session-hydrator";
import { Sidebar } from "@/components/layout/sidebar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    {
      data: { session },
    },
  ] = await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()]);

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_20%_10%,#D946EF15,transparent_30%),radial-gradient(circle_at_80%_0%,#22D3EE1a,transparent_20%),linear-gradient(160deg,#05060a,#050507)] text-white">
      <SessionHydrator session={session} />
      <Sidebar userEmail={user.email} />
      <main className="flex-1 px-8 py-10">
        <div className="mx-auto max-w-6xl space-y-8">{children}</div>
      </main>
    </div>
  );
}

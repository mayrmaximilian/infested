import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SessionHydrator } from "@/components/auth/session-hydrator";
import { Sidebar } from "@/components/layout/sidebar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [
    {
      data: { session },
    },
    { data: profile },
  ] = await Promise.all([
    supabase.auth.getSession(),
    supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).maybeSingle(),
  ]);


  const displayName =
    profile?.display_name ||
    (user.user_metadata as { name?: string })?.name ||
    user.email?.split("@")[0] ||
    "Player";
  const rawAvatar =
    profile?.avatar_url || (user.user_metadata as { avatarUrl?: string })?.avatarUrl || null;
  const avatarUrl =
    rawAvatar?.replace(/\/avatars\/(?:avatars\/)+/, "/avatars/") ?? rawAvatar ?? null;

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_20%_10%,#D946EF15,transparent_30%),radial-gradient(circle_at_80%_0%,#22D3EE1a,transparent_20%),linear-gradient(160deg,#05060a,#050507)] text-white">
      <SessionHydrator session={session} />
      <Sidebar
        userEmail={user.email}
        displayName={displayName}
        avatarUrl={avatarUrl}
      />
      <main className="flex-1 px-8 py-10">
        <div className="mx-auto max-w-6xl space-y-8">{children}</div>
      </main>
    </div>
  );
}

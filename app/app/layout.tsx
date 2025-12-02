import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SessionHydrator } from "@/components/auth/session-hydrator";
import { Sidebar } from "@/components/layout/sidebar";
import { ResponsiveShell } from "@/components/layout/responsive-shell";

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
    <ResponsiveShell
      sidebar={
        <Sidebar userEmail={user.email} displayName={displayName} avatarUrl={avatarUrl} />
      }
    >
      <SessionHydrator session={session} />
      {children}
    </ResponsiveShell>
  );
}

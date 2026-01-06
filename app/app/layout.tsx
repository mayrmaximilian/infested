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
    { data: profileData },
  ] = await Promise.all([
    supabase.auth.getSession(),
    supabase
      .from("profiles")
      .select("display_name, avatar_url, role")
      .eq("id", user.id)
      .maybeSingle(),
  ]);
  let profile = profileData;

  if (!profile) {
    const fallbackName =
      (user.user_metadata as { name?: string })?.name ||
      user.email?.split("@")[0] ||
      "Player";
    const fallbackRole =
      (user.user_metadata as { role?: string })?.role || "gamer";
    const fallbackAvatar =
      (user.user_metadata as { avatarUrl?: string })?.avatarUrl ?? null;

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        display_name: fallbackName,
        role: fallbackRole,
        avatar_url: fallbackAvatar,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    const { data: refreshedProfile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, role")
      .eq("id", user.id)
      .maybeSingle();
    if (refreshedProfile) {
      profile = refreshedProfile;
    }
  }
  const displayName =
    profile?.display_name ||
    (user.user_metadata as { name?: string })?.name ||
    user.email?.split("@")[0] ||
    "Player";
  const role =
    profile?.role || (user.user_metadata as { role?: string })?.role || "gamer";
  const rawAvatar =
    profile?.avatar_url || (user.user_metadata as { avatarUrl?: string })?.avatarUrl || null;
  const avatarUrl =
    rawAvatar?.replace(/\/avatars\/(?:avatars\/)+/, "/avatars/") ?? rawAvatar ?? null;

  return (
    <ResponsiveShell
      sidebar={
        <Sidebar
          userEmail={user.email}
          displayName={displayName}
          avatarUrl={avatarUrl}
          role={role}
        />
      }
    >
      <SessionHydrator session={session} />
      {children}
    </ResponsiveShell>
  );
}

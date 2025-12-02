import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/settings/profile-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const metadata = user.user_metadata as {
    name?: string;
    role?: "gamer" | "developer";
    avatarUrl?: string;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-white/50">
          Settings
        </p>
        <h1 className="text-3xl font-semibold">Profile & identity</h1>
        <p className="text-white/60">
          Update your display name, profile picture, and whether you build or play.
        </p>
      </div>
      <ProfileForm
        userId={user.id}
        name={metadata.name ?? user.email?.split("@")[0]}
        role={metadata.role ?? "gamer"}
        avatarUrl={metadata.avatarUrl}
      />
    </div>
  );
}

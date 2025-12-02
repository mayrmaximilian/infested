import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GameCreateForm } from "@/components/games/game-create-form";

export default async function NewGamePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role =
    profile?.role || (user.user_metadata as { role?: string })?.role || "gamer";

  if (role !== "developer") {
    redirect("/app");
  }

  return (
    <div className="space-y-10">
      <div className="overflow-hidden rounded-3xl border border-[#24112d] bg-gradient-to-br from-[#1a0c24] via-[#0b0f1c] to-[#071019] p-8 shadow-[0_25px_80px_-60px_#000]">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
              <span className="h-2 w-2 rounded-full bg-[#D946EF]" />
              Build your drops
            </p>
            <h1 className="text-4xl font-semibold">Launch a stellar game landing</h1>
            <p className="max-w-2xl text-white/70">
              Craft a hero-first page players can follow. Multiple games per developer, each with its
              own landing, wishlist, and update hooks.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
              {["Public page", "Follow & wishlist-ready", "Feature-rich hero", "Indie-first vibes"].map(
                (chip) => (
                  <span key={chip} className="rounded-full bg-white/5 px-3 py-1">
                    {chip}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#D946EF]/30 via-[#22D3EE]/20 to-[#2DD4BF]/20 p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#D946EF33,transparent_40%),radial-gradient(circle_at_80%_20%,#22D3EE33,transparent_40%)]" />
            <div className="relative space-y-3 rounded-xl bg-black/40 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Preview slice</p>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-lg bg-white/10" />
                <div>
                  <p className="text-sm font-semibold text-white">Your hero art</p>
                  <p className="text-xs text-white/60">Show the cinematic moment players remember.</p>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                “Summarize in one hooky line. Give players a reason to follow.”
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-[#1f2128] bg-[#0b0d12]">
        <CardHeader className="space-y-1">
          <CardTitle>Landing page</CardTitle>
          <CardDescription>Hero-first layout with a hook, art, and call-to-actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <GameCreateForm />
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GameEditForm } from "@/components/games/game-edit-form";

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || id === "undefined") {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: game } = await supabase
    .from("games")
    .select("id, owner_id, title, summary, hero_url, genre")
    .eq("id", id)
    .maybeSingle();

  if (!game) {
    notFound();
  }

  if (game.owner_id !== user.id) {
    redirect("/app/games");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-white/50">Game pages</p>
        <h1 className="text-3xl font-semibold">Edit landing page</h1>
        <p className="text-white/60">Update your public landing page.</p>
      </div>
      <Card className="border-[#1f2128] bg-[#0b0d12]">
        <CardHeader className="space-y-1">
          <CardTitle>Edit page</CardTitle>
          <CardDescription>Adjust your hero, copy, and genre.</CardDescription>
        </CardHeader>
        <CardContent>
          <GameEditForm
            id={game.id}
            title={game.title}
            summary={game.summary ?? ""}
            heroUrl={game.hero_url ?? ""}
            genre={game.genre ?? "other"}
          />
        </CardContent>
      </Card>
    </div>
  );
}

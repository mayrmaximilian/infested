import { ArrowUpRight, Flame, Sparkles, Waves } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const featured = [
  {
    title: "Neon Warden",
    meta: "Rogue-lite • PC + SteamDeck",
    tag: "new build",
    accent: "from-[#D946EF] via-[#22D3EE] to-[#2DD4BF]",
  },
  {
    title: "Echoes of Glass",
    meta: "Adventure • Cloud saves",
    tag: "playtest",
    accent: "from-[#22D3EE] via-[#2DD4BF] to-[#D946EF]",
  },
];

const drops = [
  { name: "Synth Run", time: "Today, 6:00 PM UTC", signal: "Creator AMA" },
  { name: "Glitch Shore", time: "Tomorrow", signal: "New build" },
  { name: "Orbitbreaker", time: "Friday", signal: "Exclusive skin" },
];

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name ||
    (user.user_metadata as { name?: string })?.name ||
    user.email?.split("@")[0] ||
    "Pilot";

  return (
    <div className="space-y-10">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">
            cockpit
          </p>
          <h1 className="text-3xl font-semibold">Welcome back, {displayName}</h1>
          <p className="text-white/60">
            Track new drops, sync your indie collection, and stay ahead of the swarm.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Creator feed
          </Button>
          <Button className="gap-2">
            Launch game
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {featured.map((item) => (
          <Card
            key={item.title}
            className="relative overflow-hidden border-[#1f2128]/80 bg-[#0b0d12]"
          >
            <div
              className={`absolute inset-x-0 -top-20 h-40 bg-gradient-to-br ${item.accent} opacity-30 blur-3xl`}
            />
            <CardHeader className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
                <Flame className="h-3 w-3" />
                {item.tag}
              </div>
              <CardTitle className="text-2xl">{item.title}</CardTitle>
              <CardDescription className="text-white/60">
                {item.meta}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <div className="text-sm text-white/60">
                  Sync progress, cross-save, cloud builds.
                </div>
                <Button variant="secondary" className="gap-2">
                  Jump in
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card className="border-[#1f2128]/80 bg-[#0b0d12]">
          <CardHeader>
            <CardTitle>Signal watch</CardTitle>
            <CardDescription>Upcoming drops across your followed games.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {drops.map((drop) => (
              <div
                key={drop.name}
              className="rounded-lg border border-[#1f2128] bg-white/5 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{drop.name}</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-[#22D3EE]">
                    {drop.signal}
                  </span>
                </div>
                <p className="text-sm text-white/60">{drop.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#1f2128]/80 bg-[#0b0d12]">
          <CardHeader>
            <CardTitle>Community heat</CardTitle>
            <CardDescription>
              Quick stats from the infested network right now.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Players online", value: "18,402", icon: Waves },
              { label: "Active playtests", value: "23", icon: Sparkles },
              { label: "Creator posts", value: "117", icon: Flame },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-[#1f2128] bg-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-2 text-[#22D3EE]">
                  <item.icon className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                    {item.label}
                  </p>
                </div>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#1f2128]/80 bg-gradient-to-br from-[#0b0d12] via-[#0b0d12] to-[#11121a]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Patch feed</CardTitle>
              <CardDescription>Fresh notes from your installs.</CardDescription>
            </div>
            <Button variant="ghost" className="gap-2">
              View all
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {["Balance pass for Echoes", "New biome: Neon Warden", "Co-op matchmaking updates"].map(
              (item, idx) => (
                <div key={item} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">{item}</p>
                    <span className="text-xs text-white/50">
                      {idx === 0 ? "3m ago" : idx === 1 ? "1h ago" : "Today"}
                    </span>
                  </div>
                  {idx < 2 && <Separator />}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import NextImage from "next/image";
import { Flame, Sparkles, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const featureChips = [
  "PC + Deck ready",
  "Cloud saves",
  "Controller friendly",
  "Indie crafted",
];

export default async function AppGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || id === "undefined") {
    return (
      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0b0d12] p-6 text-white">
        <h1 className="text-2xl font-semibold">Missing game ID</h1>
        <p className="text-white/70">No game id was provided in the URL.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select(
      "id, title, summary, hero_url, genre, wishlist_count, followers_count, status"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0b0d12] p-6 text-white">
        <h1 className="text-2xl font-semibold">Couldn&apos;t load game page</h1>
        <p className="text-white/70">
          {error?.message || "No data was returned for this game ID."}
        </p>
        <p className="text-sm text-white/50">ID: {id}</p>
      </div>
    );
  }

  const hero = data.hero_url;
  const wishlist = data.wishlist_count ?? "—";
  const followers = data.followers_count ?? "—";
  const status = data.status ?? "Coming soon";
  const genre = data.genre ?? "Uncategorized";

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-[#2c1d35] bg-[#08080f] shadow-[0_30px_90px_-60px_#000]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,#D946EF26,transparent_35%),radial-gradient(circle_at_80%_10%,#22D3EE22,transparent_35%)]" />
        <div className="relative h-[280px] w-full overflow-hidden rounded-2xl border border-[#2c1d35]">
          {hero ? (
            <NextImage
              src={hero}
              alt={data.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#D946EF33,transparent_35%),radial-gradient(circle_at_80%_0%,#22D3EE33,transparent_35%),linear-gradient(135deg,#0a0a12,#05060a)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="absolute inset-x-6 bottom-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
                    <span className="h-2 w-2 rounded-full bg-[#D946EF]" />
                    Game landing
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#D946EF]/15 px-3 py-1 text-[11px] font-medium text-[#f5a6ff]">
                    <Sparkles className="h-3 w-3" />
                    {genre}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/80">
                    <Flame className="h-3 w-3 text-[#D946EF]" />
                    {status}
                  </span>
                </div>
                <h1 className="text-3xl font-semibold">{data.title}</h1>
                <p className="max-w-3xl text-white/70">{data.summary}</p>
                <div className="flex flex-wrap gap-2 text-xs text-white/70">
                  {featureChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full bg-white/10 px-3 py-1"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" className="gap-2">
                  <Users className="h-4 w-4" />
                  Follow
                </Button>
                <Button className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Wishlist
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#1a0f1c]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Leaderboard</CardTitle>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              Playtest tier
            </span>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/80">
            {[
              "GhostRunner — 12,440 pts",
              "LumenDev — 11,980 pts",
              "NeonFox — 10,210 pts",
            ].map((entry, idx) => (
              <div
                key={entry}
                className="flex items-center justify-between rounded-md border border-[#1f2128] bg-white/5 px-3 py-2"
              >
                <span className="text-xs text-white/50">#{idx + 1}</span>
                <p className="text-white/80">{entry}</p>
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#D946EF]">
                  live
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#111121]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Challenges</CardTitle>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              Weekly
            </span>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/80">
            {[
              "Weekly speedrun — Beat act 1 under 8 minutes.",
              "High score hunt — Hit 15k combo without resets.",
              "Community vote — Pick the next biome to polish.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-md border border-[#1f2128] bg-white/5 px-3 py-2"
              >
                <p className="text-white/80">{item}</p>
                <Button size="sm" variant="secondary">
                  Join
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#0e131f]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Socials & forum</CardTitle>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              Community
            </span>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/80">
            {[
              {
                title: "Dev log: Act 2 lighting pass",
                desc: "Join the thread →",
              },
              {
                title: "Discord",
                desc: "Drop feedback and join playtest voice.",
              },
              {
                title: "Twitter / Bluesky",
                desc: "Follow @infesteddev for daily clips.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-md border border-[#1f2128] bg-white/5 px-3 py-2"
              >
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-white/60">{item.desc}</p>
                </div>
                <Button size="sm" variant="ghost">
                  Open
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#0f1424]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Updates</CardTitle>
            <span className="rounded-full bg-[#D946EF]/10 px-3 py-1 text-xs text-[#D946EF]">
              Live
            </span>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/80">
            {[
              {
                title: "Patch 0.3.1",
                desc: "Balance tweaks, new relic pool, UI polish.",
              },
              { title: "Dev note", desc: "Next playtest window opens Friday." },
              {
                title: "Roadmap peek",
                desc: "Co-op lobby & new boss fight in progress.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-md border border-[#1f2128] bg-white/5 px-3 py-2"
              >
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-white/60">{item.desc}</p>
                </div>
                <Button size="sm" variant="secondary">
                  Read
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import NextImage from "next/image";
import { Flame, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChallengesManager } from "@/components/games/challenges-manager";
import { PitchIt } from "@/components/games/pitch-it";
import { FollowButton } from "@/components/games/follow-button";
import { GameUpdates } from "@/components/games/game-updates";
import { getGameUpdates } from "@/app/actions/updates";

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

  // Fetch game data
  const { data, error } = await supabase
    .from("games")
    .select(
      "id, title, summary, hero_url, cover_url, genre, wishlist_count, followers_count, status, owner_id"
    )
    .eq("id", id)
    .maybeSingle();

  // Fetch challenges for this game
  const { data: challenges } = await supabase
    .from("challenges")
    .select("*")
    .eq("game_id", id)
    .order("created_at", { ascending: false });

  // Fetch game updates
  const updates = await getGameUpdates(id);

  // Fetch pitches for this game (top voted)
  const { data: pitches } = await supabase
    .from("pitches")
    .select("*")
    .eq("game_id", id)
    .order("vote_count", { ascending: false });

  // Get current user to check ownership
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's votes for pitches
  let userVotes: string[] = [];
  let isFollowing = false;
  if (user) {
    const { data: votes } = await supabase
      .from("pitch_votes")
      .select("pitch_id")
      .eq("user_id", user.id);
    userVotes = votes?.map((v) => v.pitch_id) ?? [];

    // Check if user is following this game
    const { data: followData } = await supabase
      .from("game_follows")
      .select("id")
      .eq("user_id", user.id)
      .eq("game_id", id)
      .maybeSingle();
    isFollowing = !!followData;
  }

  if (error) {
    console.error("Game fetch error:", error);
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

  if (!data) {
    return (
      <div className="space-y-4 rounded-2xl border border-white/10 bg-[#0b0d12] p-6 text-white">
        <h1 className="text-2xl font-semibold">Game not found</h1>
        <p className="text-white/70">No game was found with this ID.</p>
        <p className="text-sm text-white/50">ID: {id}</p>
      </div>
    );
  }

  const isOwner = user?.id === data.owner_id;

  const hero = data.hero_url;
  const cover = data.cover_url;
  const wishlist = data.wishlist_count ?? "—";
  const followers = data.followers_count ?? "—";
  const status = data.status ?? "Coming soon";
  const genre = data.genre ?? "Uncategorized";

  return (
    <div className="space-y-6">
      {/* Hero section with background image */}
      <div className="relative h-[320px] overflow-hidden rounded-2xl border border-[#2c1d35] bg-[#08080f] shadow-[0_30px_90px_-60px_#000]">
        {/* Background hero image - full bleed, constrained */}
        {hero && (
          <img
            src={hero}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        )}
        {!hero && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#D946EF33,transparent_35%),radial-gradient(circle_at_80%_0%,#22D3EE33,transparent_35%),linear-gradient(135deg,#0a0a12,#05060a)]" />
        )}
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />

        {/* Content on top of hero */}
        <div className="relative z-10 flex h-full flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
          {/* Cover image (4:5 aspect ratio, always cropped to fit) */}
          {cover && (
            <div
              style={{
                height: "200px",
                width: "160px",
                flexShrink: 0,
                overflow: "hidden",
                borderRadius: "8px",
                border: "2px solid rgba(255,255,255,0.2)",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                background: "rgba(0,0,0,0.5)",
              }}
            >
              <img
                src={cover}
                alt={`${data.title} cover`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
            </div>
          )}

          {/* Title and info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/50 px-4 py-1 text-xs uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#D946EF]" />
                Game landing
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#D946EF]/30 px-3 py-1 text-[11px] font-medium text-[#f5a6ff] backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                {genre}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                <Flame className="h-3 w-3 text-[#D946EF]" />
                {status}
              </span>
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                {data.title}
              </h1>
              <p className="mt-2 max-w-xl text-base leading-relaxed text-white/70">
                {data.summary}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {featureChips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur-sm"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <FollowButton
                gameId={data.id}
                isFollowing={isFollowing}
                followersCount={data.followers_count ?? 0}
              />
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                Buy Game
              </Button>
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
              Active
            </span>
          </CardHeader>
          <CardContent>
            <ChallengesManager
              gameId={id}
              challenges={challenges ?? []}
              isOwner={isOwner}
              showHeader={false}
            />
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
              {Array.isArray(updates) && updates.length > 0 ? "Live" : "None"}
            </span>
          </CardHeader>
          <CardContent>
            <GameUpdates
              updates={updates}
              isOwner={user?.id === data?.owner_id}
              gameId={id}
              showHeader={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Pitch It - Community Feature Voting */}
      <Card className="border-[#1f2128] bg-gradient-to-br from-[#0b0d12] via-[#0f0f18] to-[#1a1025]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">🎯 Pitch It</CardTitle>
          <span className="rounded-full bg-[#D946EF]/20 px-3 py-1 text-xs text-[#f5a6ff]">
            Top 3 Requests
          </span>
        </CardHeader>
        <CardContent>
          <PitchIt
            gameId={id}
            pitches={pitches ?? []}
            userVotes={userVotes}
            currentUserId={user?.id ?? null}
            isOwner={isOwner}
          />
        </CardContent>
      </Card>
    </div>
  );
}

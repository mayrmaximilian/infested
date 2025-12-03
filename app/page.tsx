import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Compass,
  Flame,
  Gamepad2,
  Radar,
  Sparkles,
  TerminalSquare,
  Trophy,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { FadeIn, HoverCard } from "@/components/marketing/motion";

const highlights = [
  { label: "Players leveling", value: "24k" },
  { label: "Indie drops tracked", value: "480" },
  { label: "Creator pings", value: "1.2k" },
];

const systemPillars = [
  {
    title: "Discovery Feed",
    description:
      "Trending launches, hidden gems, and community-picked highlights tuned to each player.",
    icon: Compass,
    items: [
      "New releases radar",
      "Hidden gem surfacing",
      "Community vote recommendations",
    ],
  },
  {
    title: "Communities",
    description:
      "Game-specific hubs that mix Discord vibes with Reddit-style threads and Steam-like profiles.",
    icon: Users,
    items: [
      "Threads & Q&A",
      "Fan art and screenshots",
      "Dev polls and AMA sessions",
    ],
  },
  {
    title: "Gamification",
    description:
      "XP, levels, badges, and lootbox-style cosmetics that reward discovery and contribution.",
    icon: Trophy,
    items: [
      "Daily & weekly quests",
      "Achievements for explorers and helpers",
      "Cosmetic-only drops",
    ],
  },
  {
    title: "Game Pages",
    description:
      "Cinematic pages with trailers, reviews, leaderboards, and live dev updates in one view.",
    icon: Sparkles,
    items: [
      "Overview, genre tags, and media",
      "Player ratings and reviews",
      "Leaderboards + rewards",
    ],
  },
];

const playerTrack = [
  {
    title: "Discover",
    copy: "Personalized feed that mixes trending indies, fresh releases, and algorithmic wildcards.",
  },
  {
    title: "Engage",
    copy: "Join mini-communities, follow devs, upvote guides, and drop fan art in-thread.",
  },
  {
    title: "Level Up",
    copy: "Earn XP for quests, comments, and trying new titles. Unlock badges, frames, and animated banners.",
  },
];

const developerTrack = [
  {
    title: "Showcase",
    copy: "Create rich game pages with teasers, screenshots, and a patch-notes cadence players can trust.",
  },
  {
    title: "Manage",
    copy: "Handle builds, leaderboards, and community moderation from a single dashboard.",
  },
  {
    title: "Grow",
    copy: "Track downloads, retention, sentiment, and wishlist adds - then react with polls or limited events.",
  },
];

const gamePageSections = [
  "Game overview with trailer, screenshots, and genre tags",
  "Player ratings & reviews with highlights for most helpful",
  "Community threads for Q&A, fan art, and strategy guides",
  "Game-specific leaderboards with speedrun and score categories",
  "Developer updates, patch notes, and devlogs pinned for visibility",
  "Rewards and time-limited challenges tied to each game",
];

const platformExtras = [
  {
    title: "Events & Tournaments",
    detail:
      "Weekly spotlights, monthly Indie Jams, and competitions that hand out exclusive badges.",
  },
  {
    title: "Follow System",
    detail:
      "Subscribe to developers, individual games, or trusted curators to get curated drops.",
  },
  {
    title: "Cosmetic Currency",
    detail:
      "Earn diamonds/coins to unlock profile themes, custom backgrounds, and animated nameplates - never pay-to-win.",
  },
];

const navigation = [
  {
    label: "Home / Discover",
    description: "Pulse of trending indies, hidden gems, and quests.",
  },
  {
    label: "Games",
    description:
      "Browse and filter the library across genres, tags, and status.",
  },
  {
    label: "Community",
    description: "Global lounge plus game-specific hubs with polls and guides.",
  },
  {
    label: "Profile",
    description: "XP, achievements, cosmetics, and follower graph.",
  },
  {
    label: "Developer",
    description:
      "Analytics, build uploads, leaderboards, and moderation tools.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,#D946EF26,transparent_30%),radial-gradient(circle_at_80%_0%,#22D3EE1f,transparent_32%),radial-gradient(circle_at_60%_80%,#2DD4BF26,transparent_32%)]" />
      <div className="absolute inset-x-8 top-10 -z-10 h-72 rounded-full bg-[#D946EF]/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-4 text-sm text-white/70">
            <Link href="/auth/login" className="hover:text-white">
              Log in
            </Link>
            <Button
              asChild
              size="sm"
              className="bg-[#D946EF] text-white hover:bg-[#f160ff]"
            >
              <Link href="/auth/signup">Sign up</Link>
            </Button>
          </nav>
        </header>

        <main className="mt-16 space-y-16 lg:space-y-24">
          <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-8">
              <FadeIn delay={0.05}>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
                  <Radar className="h-4 w-4 text-[#22D3EE]" />
                  Indie Gaming Hub - next-gen discover, support, and engage
                </p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="space-y-4">
                  <h1 className="text-5xl font-semibold leading-tight sm:text-6xl">
                    A neon command deck for the indie universe.
                  </h1>
                  <p className="max-w-3xl text-lg text-white/70">
                    Discover new gems, rally inside game-specific communities,
                    and collect cosmetic rewards while devs ship updates, manage
                    leaderboards, and grow loyal squads. Built like a futuristic
                    HUD with cyberpunk glow and retro-arcade edge.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.15}>
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="gap-2 bg-[#D946EF] text-white hover:bg-[#f160ff]"
                  >
                    <Link href="/auth/signup">
                      Start free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg" className="gap-2">
                    <Link href="/auth/login">
                      Already on board
                      <Gamepad2 className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </FadeIn>

              <div className="grid gap-4 sm:grid-cols-3">
                {highlights.map((item, index) => (
                  <FadeIn key={item.label} delay={0.18 + index * 0.05}>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                        {item.label}
                      </p>
                      <p className="text-3xl font-semibold">{item.value}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>

              <FadeIn delay={0.26}>
                <div className="flex flex-wrap gap-3 text-sm text-white/60">
                  <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    Futuristic HUD UI
                  </span>
                  <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    Neon cyan / magenta highlights
                  </span>
                  <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    Pixel + sci-fi type pairing
                  </span>
                </div>
              </FadeIn>
            </div>

            <HoverCard delay={0.12}>
              <Card className="relative overflow-hidden border-[#1f2128] bg-[#080a0f]/70">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#D946EF1f,transparent_35%),radial-gradient(circle_at_80%_0%,#22D3EE1f,transparent_35%)]" />
                <CardHeader className="relative">
                  <CardTitle>Infested OS</CardTitle>
                  <CardDescription className="text-white/60">
                    The operating system for indie players and developers to
                    meet, co-build, and keep momentum.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="rounded-lg border border-[#1f2128] bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Flame className="h-5 w-5 text-[#f160ff]" />
                      <h3 className="font-semibold">Players</h3>
                    </div>
                    <p className="mt-1 text-sm text-white/60">
                      Discover, collect, and flex XP with quests, badges, and
                      lootbox-style cosmetics.
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#1f2128] bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <TerminalSquare className="h-5 w-5 text-[#22D3EE]" />
                      <h3 className="font-semibold">Developers</h3>
                    </div>
                    <p className="mt-1 text-sm text-white/60">
                      Showcase builds, post devlogs, manage leaderboards, and
                      read sentiment without leaving the cockpit.
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#1f2128] bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-[#2DD4BF]" />
                      <h3 className="font-semibold">Community-first</h3>
                    </div>
                    <p className="mt-1 text-sm text-white/60">
                      Forums, fan art, polls, and time-limited events that keep
                      each game feeling alive.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </HoverCard>
          </section>

          <section className="space-y-6">
            <FadeIn>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/50">
                    Systems online
                  </p>
                  <h2 className="text-3xl font-semibold">
                    Core features for the hub
                  </h2>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/10 bg-white/5 text-white hover:border-[#D946EF] hover:bg-[#0b0d12]"
                >
                  <Link href="/auth/signup">Activate account</Link>
                </Button>
              </div>
            </FadeIn>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {systemPillars.map((pillar, index) => (
                <HoverCard
                  key={pillar.title}
                  delay={0.05 * index}
                  className="h-full"
                >
                  <Card className="h-full border-[#1f2128] bg-gradient-to-br from-[#0b0d12] to-[#05060a]">
                    <CardHeader className="space-y-2">
                      <div className="flex items-center gap-3 text-sm text-white/60">
                        <pillar.icon className="h-5 w-5 text-[#22D3EE]" />
                        <span>{pillar.title}</span>
                      </div>
                      <CardTitle className="text-lg">{pillar.title}</CardTitle>
                      <CardDescription className="text-white/60">
                        {pillar.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-white/70">
                      {pillar.items.map((item) => (
                        <div
                          key={item}
                          className="rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                        >
                          {item}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </HoverCard>
              ))}
            </div>
          </section>
        </main>

        <footer className="mt-20 border-t border-white/5 pt-10 pb-6 text-sm text-white/70">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Logo className="h-10" />
              <p className="text-white/60">
                A cyberpunk, community-driven deck for indie gamers and
                creators.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-white/70">
              <Link href="/auth/login" className="hover:text-white">
                Log in
              </Link>
              <Link href="/auth/signup" className="hover:text-white">
                Sign up
              </Link>
              <Link href="/app" className="hover:text-white">
                Enter app
              </Link>
              <a
                href="mailto:hello@infested.gg"
                className="hover:text-white"
                rel="noreferrer"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="mt-4 text-xs text-white/50">
            Copyright {new Date().getFullYear()} infested. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}

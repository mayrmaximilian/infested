import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Flame,
  Gamepad2,
  Gift,
  Radar,
  Sparkles,
  TerminalSquare,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { FadeIn, HoverCard } from "@/components/marketing/motion";
import { GameSlider } from "@/components/games/game-slider";

type GamePreview = {
  id: string;
  title: string;
  cover_url: string | null;
  genre: string | null;
};

const highlightStats = [
  { label: "Weekly challenges", value: "12 live" },
  { label: "XP gained", value: "96k this month" },
  { label: "Followers gained", value: "+38% avg" },
];

const arcadeSignals = [
  {
    title: "Trending",
    subtitle: "Wishlist spikes",
    icon: Flame,
    accent: "from-[#D946EF]/40 to-[#D946EF]/10",
  },
  {
    title: "Challenges",
    subtitle: "Weekly tournaments",
    icon: Gift,
    accent: "from-amber-500/40 to-amber-500/10",
  },
  {
    title: "Leaderboard",
    subtitle: "Top players",
    icon: Trophy,
    accent: "from-[#22D3EE]/40 to-[#22D3EE]/10",
  },
  {
    title: "Library",
    subtitle: "Followed games",
    icon: Sparkles,
    accent: "from-emerald-500/40 to-emerald-500/10",
  },
];

const playerOps = [
  "Track drops, patches, and follow alerts",
  "Level up with XP, streaks, and challenges",
  "Share pitches, reactions, and fan art",
];

const developerOps = [
  "Publish cinematic game pages fast",
  "Host challenges and reward your crowd",
  "Monitor follows, wishlists, and hype",
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  const { data: hottestGames } = await supabase
    .from("games")
    .select("id, title, cover_url, genre, wishlist_count")
    .order("wishlist_count", { ascending: false })
    .limit(10);

  const { data: newestGames } = await supabase
    .from("games")
    .select("id, title, cover_url, genre, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const hotGames = (hottestGames ?? []) as GamePreview[];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,#D946EF30,transparent_35%),radial-gradient(circle_at_85%_0%,#22D3EE24,transparent_35%),radial-gradient(circle_at_50%_80%,#2DD4BF22,transparent_35%)]" />
      <div className="absolute inset-x-6 top-12 -z-10 h-80 rounded-full bg-[#D946EF]/10 blur-[140px]" />

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
          <section className="space-y-12">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                <FadeIn delay={0.05}>
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
                    <Radar className="h-4 w-4 text-[#22D3EE]" />
                    Indie cockpit - discover, follow, compete
                  </p>
                </FadeIn>

                <FadeIn delay={0.1}>
                  <div className="space-y-4">
                    <h1 className="text-5xl font-semibold leading-tight sm:text-6xl">
                      Your indie cockpit awaits.
                    </h1>
                    <p className="max-w-2xl text-lg text-white/70">
                      Track drops, sync your indie library, compete in
                      challenges, earn XP, and keep pulse on the creators you
                      love.
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

                <div className="grid gap-3 sm:grid-cols-3">
                  {highlightStats.map((item, index) => (
                    <FadeIn key={item.label} delay={0.18 + index * 0.05}>
                      <div className="rounded-2xl border border-white/10 bg-linear-to-br from-white/5 to-white/0 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                          {item.value}
                        </p>
                      </div>
                    </FadeIn>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-white/50">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Trending radar
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    XP + challenges
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    Community pages
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {arcadeSignals.map((signal) => (
                  <div
                    key={signal.title}
                    className="group relative overflow-hidden rounded-2xl border border-[#1f2128] bg-[#0b0d12]/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-[#1f2128]/80 hover:bg-[#0f0f18]"
                  >
                    {/* Gradient background on hover */}
                    <div
                      className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-br ${signal.accent}`}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      <div
                        className={`mb-4 h-1.5 w-12 rounded-full bg-linear-to-r ${signal.accent}`}
                      />
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                          <signal.icon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-white">
                            {signal.title}
                          </p>
                          <p className="mt-1 text-sm text-white/60 group-hover:text-white/70 transition-colors">
                            {signal.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FadeIn>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-white/50">
                      Trending now
                    </p>
                    <h2 className="text-3xl font-semibold">
                      Covers in the radar
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
                <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-4">
                  <GameSlider
                    games={hotGames}
                    emptyMessage="No trending games yet."
                  />
                </div>
              </div>
            </FadeIn>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <HoverCard delay={0.05}>
              <div className="h-full rounded-2xl border border-[#1f2128] bg-[linear-gradient(135deg,#0b0d12,rgba(217,70,239,0.12))] p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#22D3EE]" />
                  <h3 className="text-xl font-semibold">Player mode</h3>
                </div>
                <div className="mt-4 space-y-3 text-sm text-white/70">
                  {playerOps.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#22D3EE]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
                  <Sparkles className="h-3 w-3" />
                  Live XP flow
                </div>
              </div>
            </HoverCard>

            <HoverCard delay={0.1}>
              <div className="h-full rounded-2xl border border-[#1f2128] bg-[linear-gradient(135deg,#0b0d12,rgba(34,211,238,0.12))] p-6">
                <div className="flex items-center gap-3">
                  <TerminalSquare className="h-5 w-5 text-[#D946EF]" />
                  <h3 className="text-xl font-semibold">Developer mode</h3>
                </div>
                <div className="mt-4 space-y-3 text-sm text-white/70">
                  {developerOps.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#D946EF]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
                  <Zap className="h-3 w-3" />
                  Momentum tools
                </div>
              </div>
            </HoverCard>
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

import Link from "next/link";
import {
  ArrowRight,
  Gamepad2,
  Lock,
  Radar,
  Sparkles,
  TerminalSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/logo";

const features = [
  {
    title: "Supabase-native auth",
    description:
      "Email + password with server actions, middleware, and protected layouts.",
    icon: Lock,
  },
  {
    title: "Shadcn + Tailwind 4",
    description:
      "Dark, techy UI kit tuned to infested’s brand colors and gradients.",
    icon: Sparkles,
  },
  {
    title: "Stateful cockpit",
    description:
      "Zustand store keeps session data hydrated across the internal app.",
    icon: TerminalSquare,
  },
];

const highlights = [
  { label: "Players on infested", value: "24k" },
  { label: "Indie drops tracked", value: "480" },
  { label: "Creator signals", value: "1.2k" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,#D946EF26,transparent_30%),radial-gradient(circle_at_80%_0%,#22D3EE1f,transparent_32%),radial-gradient(circle_at_60%_80%,#2DD4BF26,transparent_32%)]" />
      <div className="absolute inset-x-16 top-10 -z-10 h-64 rounded-full bg-[#D946EF]/10 blur-[80px]" />

      <div className="mx-auto max-w-6xl px-6 py-10">
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

        <main className="mt-16 space-y-16">
          <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-8">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
                <Radar className="h-4 w-4 text-[#22D3EE]" />
                indie gaming hub
              </p>
              <div className="space-y-4">
                <h1 className="text-5xl font-semibold leading-tight sm:text-6xl">
                  A command center for the{" "}
                  <span className="bg-gradient-to-r from-[#D946EF] via-[#22D3EE] to-[#2DD4BF] bg-clip-text text-transparent">
                    infected swarm
                  </span>
                  .
                </h1>
                <p className="max-w-2xl text-lg text-white/70">
                  infested is your backstage pass to indie games: verify builds,
                  sync libraries, and keep pace with drops before they hit the
                  mainstream.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="gap-2 bg-[#D946EF] text-white hover:bg-[#f160ff]"
                >
                  <Link href="/auth/signup">
                    Create free account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="gap-2">
                  <Link href="/auth/login">
                    Already infected
                    <Gamepad2 className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                      {item.label}
                    </p>
                    <p className="text-3xl font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="relative overflow-hidden border-[#1f2128] bg-[#080a0f]/70">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#D946EF1f,transparent_35%),radial-gradient(circle_at_80%_0%,#22D3EE1f,transparent_35%)]" />
              <CardHeader className="relative">
                <CardTitle>Built for dev velocity</CardTitle>
                <CardDescription className="text-white/60">
                  App Router, Supabase, Zod, Zustand, shadcn/ui, server actions,
                  and middleware out of the box.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-lg border border-[#1f2128] bg-white/5 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <feature.icon className="h-5 w-5 text-[#22D3EE]" />
                      <h3 className="font-semibold">{feature.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-white/60">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Supabase auth wired",
                copy: "Server + client clients, middleware protection, and session hydration.",
              },
              {
                title: "UI that glows",
                copy: "Dark gradient surfaces, neon edges, and ready-to-ship shadcn primitives.",
              },
              {
                title: "Future-proof layout",
                copy: "Sidebar shell ready for features: library, discover, creator feeds.",
              },
            ].map((item) => (
              <Card
                key={item.title}
                className="border-[#1f2128] bg-gradient-to-br from-[#0b0d12] to-[#05060a]"
              >
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="text-white/60">
                    {item.copy}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}

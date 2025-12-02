import { notFound } from "next/navigation";
import NextImage from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

const featureChips = ["PC + Deck ready", "Cloud saves", "Controller friendly", "Indie crafted"];

export default async function GameLandingPage({ params }: { params: { id: string } }) {
  if (!params.id || params.id === "undefined") {
    notFound();
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("id, title, summary, hero_url, genre, wishlist_count, followers_count, status")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-white/10 bg-[#0b0d12] p-6">
          <h1 className="text-2xl font-semibold">Couldn&apos;t load game page</h1>
          <p className="text-white/70">
            {error.message || "Something went wrong fetching this page."}
          </p>
          <p className="text-sm text-white/50">ID: {params.id}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const wishlist = data.wishlist_count ?? "—";
  const followers = data.followers_count ?? "—";
  const status = data.status ?? "Coming soon";
  const genre = data.genre ?? "Uncategorized";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative h-[380px] w-full overflow-hidden">
        {data.hero_url ? (
          <NextImage
            src={data.hero_url}
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
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
                <span className="h-2 w-2 rounded-full bg-[#D946EF]" />
                Game landing
              </p>
              <h1 className="text-4xl font-semibold">{data.title}</h1>
              <p className="max-w-3xl text-white/70">{data.summary}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-[#D946EF]">{genre}</p>
              <div className="flex flex-wrap gap-2 text-xs text-white/70">
                {featureChips.map((chip) => (
                  <span key={chip} className="rounded-full bg-white/10 px-3 py-1">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary">Wishlist</Button>
              <Button>Follow updates</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Wishlist", value: wishlist, color: "#D946EF" },
            { label: "Followers", value: followers, color: "#22D3EE" },
            { label: "Status", value: status, color: "#2DD4BF" },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-[#1f2128] bg-[#0b0d12] p-4 shadow-[0_20px_60px_-50px_#000]"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">{m.label}</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: m.color }}>
                {m.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6 shadow-[0_25px_80px_-60px_#000]">
          <h2 className="text-xl font-semibold">About the game</h2>
          <Separator className="my-4" />
          <p className="text-white/70 leading-relaxed">
            {data.summary || "The developer will add more details soon."}
          </p>
        </div>

        <div className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-6 shadow-[0_25px_80px_-60px_#000]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Stay in the loop</h3>
              <p className="text-sm text-white/60">
                Follow for playtest pings, dev logs, and drops.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary">Follow</Button>
              <Button>Wishlist</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

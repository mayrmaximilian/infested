"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";
import { useSocialTabs } from "@/components/social/social-tab-context";

type ActivityProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

type ActivityGame = {
  id: string;
  title: string;
  cover_url: string | null;
  genre: string | null;
};

export type ActivityEntry = {
  id: string;
  type: "follow" | "launch";
  created_at: string;
  user: ActivityProfile;
  game: ActivityGame;
};

type SocialActivityProps = {
  initialItems: ActivityEntry[];
};

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function getUtcParts(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
}

function formatActivityTimestamp(value: string) {
  const parts = getUtcParts(value);
  if (!parts) return "";
  return `${pad2(parts.day)}.${pad2(parts.month)}.${parts.year} at ${pad2(
    parts.hour
  )}:${pad2(parts.minute)}`;
}

export function SocialActivity({ initialItems }: SocialActivityProps) {
  const supabase = useMemo(() => createClient(), []);
  const session = useAuthStore((state) => state.session);
  const { notify, setBaseline } = useSocialTabs();
  const [items, setItems] = useState<ActivityEntry[]>(initialItems);
  const [authReady, setAuthReady] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);
  const initializedRef = useRef(false);
  const signatureRef = useRef("");

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    const signature = items.map((item) => item.id).join(",");

    if (!initializedRef.current) {
      initializedRef.current = true;
      signatureRef.current = signature;
      setBaseline("discover", Date.now());
      return;
    }

    if (signature && signature !== signatureRef.current) {
      signatureRef.current = signature;
      notify("discover", Date.now());
    }
  }, [items, notify, setBaseline]);

  useEffect(() => {
    const setSession = async () => {
      if (session?.access_token && session.refresh_token) {
        const { error: authError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
        setAuthReady(!authError);
        return;
      }

      const { data } = await supabase.auth.getSession();
      setAuthReady(Boolean(data.session));
    };

    void setSession();
  }, [session, supabase]);

  const refresh = async () => {
    const res = await fetch("/api/social/activity", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json().catch(() => ({}))) as {
      items?: ActivityEntry[];
    };
    setItems(data.items ?? []);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const scheduleRefresh = () => {
    if (refreshTimerRef.current) return;
    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null;
      void refresh();
    }, 250);
  };

  useEffect(() => {
    const intervalId = window.setInterval(refresh, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!authReady) return;

    const channel = supabase
      .channel("social-activity")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friendships" },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "game_follows" },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "games" },
        scheduleRefresh
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authReady, supabase]);

  return (
    <section className="rounded-2xl border border-[#1f2128] bg-[#0b0d12]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Activity
          </p>
          <h2 className="text-lg font-semibold">Friend pulse</h2>
        </div>
        <span className="text-xs text-white/40">{items.length} updates</span>
      </div>
      <div className="divide-y divide-white/10">
        {items.length === 0 ? (
          <div className="px-5 py-6">
            <p className="text-sm text-white/50">
              No recent activity yet. Add friends to see what they are
              following.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const name = item.user.display_name || "Player";
            const actionText =
              item.type === "follow"
                ? "started following"
                : "published a new game";
            const badgeLabel = item.type === "follow" ? "Following" : "New game";
            const badgeClass =
              item.type === "follow"
                ? "border-[#22D3EE]/40 text-[#22D3EE]"
                : "border-[#D946EF]/40 text-[#D946EF]";
            const timestamp = formatActivityTimestamp(item.created_at);

            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 overflow-hidden rounded-full border border-[#1f2128] bg-[#0a0b0f]">
                    {item.user.avatar_url ? (
                      <img
                        src={item.user.avatar_url}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/70">
                        {initialsFor(name)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-sm text-white/70">
                      {actionText}{" "}
                      <span className="font-semibold text-white">
                        {item.game.title}
                      </span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
                      {timestamp ? <span>{timestamp}</span> : null}
                      <span
                        className={`rounded-full border px-2 py-0.5 ${badgeClass}`}
                      >
                        {badgeLabel}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/app/games/${item.game.id}`}
                  className="group shrink-0 overflow-hidden rounded-xl border border-[#1f2128] bg-black/60"
                >
                  <div className="relative aspect-[4/5] w-[180px] max-h-[300px] sm:w-[200px] lg:w-[240px]">
                    {item.game.cover_url ? (
                      <img
                        src={item.game.cover_url}
                        alt={item.game.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-[#D946EF]/30 to-[#22D3EE]/20" />
                    )}
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

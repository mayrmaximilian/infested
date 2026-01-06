"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, UserMinus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { StartDirectChat } from "@/components/messages/start-direct-chat";
import { useSocialTabs } from "@/components/social/social-tab-context";
import {
  acceptFriendRequestAction,
  declineFriendRequestAction,
  removeFriendAction,
} from "@/app/actions/social";

type FriendProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
};

export type FriendEntry = {
  id: string;
  user_id: string;
  user: FriendProfile;
};

type SocialFriendsProps = {
  initialIncoming: FriendEntry[];
  initialAccepted: FriendEntry[];
};

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function renderProfile(profile: FriendProfile) {
  const name = profile.display_name || "Player";
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 overflow-hidden rounded-full border border-[#1f2128] bg-[#0a0b0f]">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/70">
            {initialsFor(name)}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{name}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          {profile.role ?? "gamer"}
        </p>
      </div>
    </div>
  );
}

export function SocialFriends({
  initialIncoming,
  initialAccepted,
}: SocialFriendsProps) {
  const supabase = useMemo(() => createClient(), []);
  const session = useAuthStore((state) => state.session);
  const { notify, setBaseline } = useSocialTabs();
  const [incoming, setIncoming] =
    useState<FriendEntry[]>(initialIncoming);
  const [accepted, setAccepted] =
    useState<FriendEntry[]>(initialAccepted);
  const [authReady, setAuthReady] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);
  const signatureRef = useRef<string>("");
  const initializedRef = useRef(false);

  useEffect(() => {
    setIncoming(initialIncoming);
  }, [initialIncoming]);

  useEffect(() => {
    setAccepted(initialAccepted);
  }, [initialAccepted]);

  useEffect(() => {
    const incomingIds = incoming.map((row) => row.id).sort().join(",");
    const acceptedIds = accepted.map((row) => row.id).sort().join(",");
    const signature = `${incomingIds}|${acceptedIds}`;

    if (!initializedRef.current) {
      initializedRef.current = true;
      signatureRef.current = signature;
      setBaseline("friends", Date.now());
      return;
    }

    if (signature !== signatureRef.current) {
      signatureRef.current = signature;
      notify("friends", Date.now());
    }
  }, [accepted, incoming, notify, setBaseline]);

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
    const res = await fetch("/api/social/friends", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json().catch(() => ({}))) as {
      incoming?: FriendEntry[];
      accepted?: FriendEntry[];
    };
    setIncoming(data.incoming ?? []);
    setAccepted(data.accepted ?? []);
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
      .channel("social-friends")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friendships" },
        scheduleRefresh
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authReady, supabase]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-[#1f2128] bg-[#0b0d12]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-semibold">Incoming requests</h2>
          <span className="text-xs text-white/40">{incoming.length}</span>
        </div>
        <div className="space-y-3 px-5 py-4">
          {incoming.length === 0 ? (
            <p className="text-sm text-white/50">No requests yet.</p>
          ) : (
            incoming.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                {renderProfile(row.user)}
                <div className="flex items-center gap-2">
                  <form action={acceptFriendRequestAction}>
                    <input type="hidden" name="targetId" value={row.user_id} />
                    <Button size="sm" className="gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Accept
                    </Button>
                  </form>
                  <form action={declineFriendRequestAction}>
                    <input type="hidden" name="targetId" value={row.user_id} />
                    <Button size="sm" variant="ghost" className="gap-2">
                      <X className="h-4 w-4" />
                      Decline
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[#1f2128] bg-[#0b0d12]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-sm font-semibold">Friends</h2>
          <span className="text-xs text-white/40">{accepted.length}</span>
        </div>
        <div className="space-y-3 px-5 py-4">
          {accepted.length === 0 ? (
            <p className="text-sm text-white/50">No friends yet.</p>
          ) : (
            accepted.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                {renderProfile(row.user)}
                <div className="flex items-center gap-2">
                  <StartDirectChat friendId={row.user_id} />
                  <form action={removeFriendAction}>
                    <input type="hidden" name="targetId" value={row.user_id} />
                    <Button size="sm" variant="ghost" className="gap-2">
                      <UserMinus className="h-4 w-4" />
                      Remove
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

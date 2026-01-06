"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ChatThread, ChatMessage } from "@/components/messages/chat-thread";
import { CreateGroupForm } from "@/components/messages/create-group-form";
import { useAuthStore } from "@/lib/store/auth-store";
import { useSocialTabs } from "@/components/social/social-tab-context";

type RoomSummary = {
  id: string;
  label: string;
  subtitle: string;
  is_group: boolean;
};

type Participant = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type FriendOption = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type ChatPanelProps = {
  rooms: RoomSummary[];
  currentUserId: string;
  initialRoomId?: string | null;
  initialRoomLabel: string;
  initialMessages: ChatMessage[];
  initialParticipants: Participant[];
  friends: FriendOption[];
};

type RoomDetailsResponse = {
  roomId: string;
  roomLabel: string;
  is_group: boolean;
  participants: Participant[];
  messages: ChatMessage[];
};

export function ChatPanel({
  rooms,
  currentUserId,
  initialRoomId,
  initialRoomLabel,
  initialMessages,
  initialParticipants,
  friends,
}: ChatPanelProps) {
  const supabase = useMemo(() => createClient(), []);
  const session = useAuthStore((state) => state.session);
  const { notify, setBaseline } = useSocialTabs();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    initialRoomId ?? null
  );
  const [activeRoomId, setActiveRoomId] = useState<string | null>(
    initialRoomId ?? null
  );
  const [roomLabel, setRoomLabel] = useState(initialRoomLabel);
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [loadingRoomId, setLoadingRoomId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const latestMessageIdRef = useRef<string | null>(null);
  const pollInitRef = useRef(false);

  useEffect(() => {
    const baseline = Date.now();
    setBaseline("chat", baseline);
  }, [setBaseline]);

  const summaryMap = useMemo(() => {
    const map = new Map<string, RoomSummary>();
    rooms.forEach((room) => map.set(room.id, room));
    return map;
  }, [rooms]);

  useEffect(() => {
    setSelectedRoomId(initialRoomId ?? null);
    setActiveRoomId(initialRoomId ?? null);
    setRoomLabel(initialRoomLabel);
    setParticipants(initialParticipants);
    setMessages(initialMessages);
  }, [initialRoomId, initialRoomLabel, initialMessages, initialParticipants]);

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

  useEffect(() => {
    if (!selectedRoomId) return;

    const summary = summaryMap.get(selectedRoomId);
    if (summary) {
      setRoomLabel(summary.label);
    }

    const url = new URL(window.location.href);
    url.searchParams.set("room", selectedRoomId);
    window.history.replaceState(null, "", url.toString());
  }, [selectedRoomId, summaryMap]);

  useEffect(() => {
    if (!selectedRoomId || selectedRoomId === activeRoomId) return;

    const controller = new AbortController();
    setLoadingRoomId(selectedRoomId);
    setError(null);

    const summary = summaryMap.get(selectedRoomId);
    if (summary) {
      setRoomLabel(summary.label);
    }
    setParticipants([]);
    setMessages([]);

    const loadRoom = async () => {
      const res = await fetch(
        `/api/messages/room/details?roomId=${selectedRoomId}`,
        { signal: controller.signal }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Failed to load room.");
      }
      const data = (await res.json()) as RoomDetailsResponse;
      return data;
    };

    loadRoom()
      .then((data) => {
        if (controller.signal.aborted) return;
        setActiveRoomId(data.roomId);
        setRoomLabel(data.roomLabel);
        setParticipants(data.participants ?? []);
        setMessages(data.messages ?? []);
      })
      .catch((fetchError) => {
        if (controller.signal.aborted) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load room."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingRoomId(null);
        }
      });

    return () => controller.abort();
  }, [activeRoomId, selectedRoomId, summaryMap]);

  useEffect(() => {
    if (!authReady) return;

    const channel = supabase
      .channel("chat-tab")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const next = payload.new as ChatMessage;
          if (next.sender_id === currentUserId) return;
          notify("chat", Date.now());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authReady, currentUserId, notify, supabase]);

  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;

    const checkLatest = async () => {
      const { data, error: fetchError } = await supabase
        .from("chat_messages")
        .select("id, sender_id, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      if (cancelled || fetchError || !data?.length) return;
      const latest = data[0] as ChatMessage;
      if (!latest) return;
      if (!pollInitRef.current) {
        pollInitRef.current = true;
        latestMessageIdRef.current = latest.id;
        return;
      }

      const hasSeen = latestMessageIdRef.current === latest.id;
      latestMessageIdRef.current = latest.id;
      if (hasSeen) return;
      if (latest.sender_id === currentUserId) return;
      notify("chat", Date.now());
    };

    const intervalId = window.setInterval(checkLatest, 15000);
    void checkLatest();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [authReady, currentUserId, notify, supabase]);

  const handleSelect = (roomId: string) => {
    if (roomId === selectedRoomId) return;
    setSelectedRoomId(roomId);
  };

  const isLoading =
    Boolean(loadingRoomId) && loadingRoomId === selectedRoomId;

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <section className="rounded-2xl border border-[#1f2128] bg-[#0b0d12]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                Messages
              </p>
              <h2 className="text-lg font-semibold">Chat & squads</h2>
            </div>
            <MessageCircle className="h-4 w-4 text-white/50" />
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Your rooms</h3>
              <span className="text-xs text-white/40">{rooms.length}</span>
            </div>
            <div className="mt-4 space-y-2">
              {rooms.length === 0 ? (
                <p className="text-sm text-white/50">No rooms yet.</p>
              ) : (
                rooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => handleSelect(room.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                      room.id === selectedRoomId
                        ? "border-[#22D3EE]/70 bg-[#22D3EE]/10"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-white">{room.label}</p>
                      <p className="text-xs text-white/50">{room.subtitle}</p>
                    </div>
                    <span className="text-xs text-white/40">
                      {room.id === selectedRoomId ? "Open" : "View"}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-5">
          <CreateGroupForm friends={friends} />
        </section>
      </aside>

      <section className="min-h-0 self-start">
        {!selectedRoomId ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-10 text-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/50">
                No room selected
              </p>
              <h2 className="mt-3 text-xl font-semibold">
                Pick a chat to start messaging.
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Open a room on the left or start a new chat with a friend.
              </p>
            </div>
          </div>
        ) : isLoading && activeRoomId !== selectedRoomId ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-[#1f2128] bg-[#0b0d12] p-10 text-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/50">
                Loading
              </p>
              <h2 className="mt-3 text-xl font-semibold">Opening chat…</h2>
              <p className="mt-2 text-sm text-white/60">
                Fetching messages and participants.
              </p>
            </div>
          </div>
        ) : (
          <ChatThread
            roomId={selectedRoomId}
            currentUserId={currentUserId}
            initialMessages={messages}
            participants={participants}
            roomLabel={roomLabel || "Chat"}
          />
        )}
      </section>
      {error ? (
        <p className="mt-3 text-xs text-red-300">{error}</p>
      ) : null}
    </div>
  );
}

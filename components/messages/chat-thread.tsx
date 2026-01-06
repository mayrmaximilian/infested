"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store/auth-store";

export type ChatMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type Participant = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type ChatThreadProps = {
  roomId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
  participants: Participant[];
  roomLabel: string;
};

function mergeMessages(
  current: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] {
  if (incoming.length === 0) return current;
  const merged = new Map<string, ChatMessage>();
  current.forEach((message) => merged.set(message.id, message));
  incoming.forEach((message) => merged.set(message.id, message));
  return Array.from(merged.values()).sort((a, b) => {
    const diff =
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (diff !== 0) return diff;
    return a.id.localeCompare(b.id);
  });
}

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

function formatMessageTime(value: string) {
  const parts = getUtcParts(value);
  if (!parts) return "";
  return `${pad2(parts.hour)}:${pad2(parts.minute)}`;
}

function formatMessageDate(value: string) {
  const parts = getUtcParts(value);
  if (!parts) return "";
  return `${pad2(parts.day)}.${pad2(parts.month)}.${parts.year}`;
}

function formatMessageDateTime(value: string) {
  const parts = getUtcParts(value);
  if (!parts) return "";
  return `${pad2(parts.day)}.${pad2(parts.month)}.${parts.year} ${pad2(
    parts.hour
  )}:${pad2(parts.minute)}`;
}

function dateKey(value: string) {
  const parts = getUtcParts(value);
  if (!parts) return "";
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

export function ChatThread({
  roomId,
  currentUserId,
  initialMessages,
  participants,
  roomLabel,
}: ChatThreadProps) {
  const supabase = useMemo(() => createClient(), []);
  const session = useAuthStore((state) => state.session);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const latestTimestampRef = useRef<string | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    latestTimestampRef.current =
      messages[messages.length - 1]?.created_at ?? null;
  }, [messages]);

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
    let cancelled = false;

    const fetchUpdates = async () => {
      const params = new URLSearchParams({ roomId });
      if (latestTimestampRef.current) {
        params.set("since", latestTimestampRef.current);
      }

      const res = await fetch(`/api/messages/room?${params.toString()}`);
      if (!res.ok) return;
      const data = (await res.json().catch(() => ({}))) as {
        messages?: ChatMessage[];
      };
      if (!data.messages?.length || cancelled) return;
      setMessages((prev) =>
        mergeMessages(prev, data.messages as ChatMessage[])
      );
    };

    const intervalId = window.setInterval(fetchUpdates, 5000);
    void fetchUpdates();

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [roomId]);

  useEffect(() => {
    if (!authReady) return;

    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const next = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.find((msg) => msg.id === next.id)) return prev;
            return [...prev, next].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authReady, supabase, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const content = draft.trim();
    if (!content) return;
    setDraft("");

    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, content }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setDraft(content);
      setError(data.error ?? "Failed to send message.");
      return;
    }

    const data = (await res.json()) as { message?: ChatMessage };
    if (data.message) {
      setMessages((prev) => [...prev, data.message as ChatMessage]);
    }
  };

  return (
    <div
      className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#1f2128] bg-[#0b0d12]"
      style={{ height: "70vh", maxHeight: 800 }}
    >
      <div className="shrink-0 flex items-center justify-between border-b border-[#1f2128] px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            Room
          </p>
          <h2 className="text-lg font-semibold">{roomLabel}</h2>
        </div>
        <div className="flex items-center gap-2">
          {participants.slice(0, 4).map((member) => {
            const name = member.display_name || "Player";
            return (
              <div
                key={member.id}
                className="h-9 w-9 overflow-hidden rounded-full border border-[#1f2128] bg-[#0a0b0f]"
                title={name}
              >
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/70">
                    {initialsFor(name)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 space-y-3 overflow-y-auto overscroll-contain px-5 py-4">
        {messages.length === 0 ? (
          <p className="text-sm text-white/50">Start the conversation.</p>
        ) : (
          messages.map((message, index) => {
            const isMe = message.sender_id === currentUserId;
            const timeLabel = formatMessageTime(message.created_at);
            const currentDateKey = dateKey(message.created_at);
            const previousDateKey =
              index > 0 ? dateKey(messages[index - 1].created_at) : "";
            const showDateSeparator =
              Boolean(currentDateKey) && currentDateKey !== previousDateKey;
            const dateLabel = formatMessageDate(message.created_at);
            return (
              <Fragment key={message.id}>
                {showDateSeparator && dateLabel ? (
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                      {dateLabel}
                    </span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                ) : null}
                <div
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      isMe
                        ? "bg-[#D946EF] text-white"
                        : "bg-white/5 text-white/80"
                    }`}
                    title={formatMessageDateTime(message.created_at)}
                  >
                    <p>{message.content}</p>
                    {timeLabel ? (
                      <p className="mt-1 text-[10px] text-white/60">
                        {timeLabel}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Fragment>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="shrink-0 border-t border-[#1f2128] px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message"
          />
          <Button type="submit" className="shrink-0">
            Send
          </Button>
        </div>
        {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FriendOption = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type CreateGroupFormProps = {
  friends: FriendOption[];
};

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CreateGroupForm({ friends }: CreateGroupFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleMember = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((member) => member !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    const res = await fetch("/api/messages/rooms/group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), members: selected }),
    });
    const result = (await res.json().catch(() => ({}))) as {
      roomId?: string;
    };
    setIsLoading(false);

    if (res.ok && result.roomId) {
      router.push(`/app/social?room=${result.roomId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold">Create group chat</p>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Group name"
        />
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
          Add friends
        </p>
        {friends.length === 0 ? (
          <p className="text-sm text-white/50">No friends to add yet.</p>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => {
              const nameLabel = friend.display_name || "Player";
              const isSelected = selected.includes(friend.id);
              return (
                <button
                  key={friend.id}
                  type="button"
                  onClick={() => toggleMember(friend.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                    isSelected
                      ? "border-[#22D3EE]/70 bg-[#22D3EE]/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="h-9 w-9 overflow-hidden rounded-full border border-[#1f2128] bg-[#0a0b0f]">
                    {friend.avatar_url ? (
                      <img
                        src={friend.avatar_url}
                        alt={nameLabel}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/70">
                        {initialsFor(nameLabel)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {nameLabel}
                    </p>
                    <p className="text-xs text-white/40">Tap to add</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <Button type="submit" className="gap-2" disabled={isLoading}>
        <Users className="h-4 w-4" />
        {isLoading ? "Creating" : "Create group"}
      </Button>
    </form>
  );
}

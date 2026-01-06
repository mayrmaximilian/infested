"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type StartDirectChatProps = {
  friendId: string;
};

export function StartDirectChat({ friendId }: StartDirectChatProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    const res = await fetch("/api/messages/rooms/direct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendId }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      roomId?: string;
      error?: string;
    };
    setIsLoading(false);

    if (res.ok && data.roomId) {
      router.push(`/app/social?room=${data.roomId}`);
      return;
    }
    setError(data.error ?? "Could not open chat.");
  };

  return (
    <div className="text-right">
      <Button
        size="sm"
        variant="secondary"
        className="gap-2"
        onClick={handleClick}
        disabled={isLoading}
      >
        <MessageCircle className="h-4 w-4" />
        {isLoading ? "Opening" : "Message"}
      </Button>
      {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

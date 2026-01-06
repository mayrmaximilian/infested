"use client";

import { useState, useTransition } from "react";
import { Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { followGameAction, unfollowGameAction } from "@/app/actions/games";

interface FollowButtonProps {
  gameId: string;
  isFollowing: boolean;
  followersCount: number;
}

export function FollowButton({
  gameId,
  isFollowing: initialFollowing,
  followersCount: initialCount,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followersCount, setFollowersCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      if (isFollowing) {
        const result = await unfollowGameAction(gameId);
        if (result.success) {
          setIsFollowing(false);
          setFollowersCount((c) => Math.max(0, c - 1));
        }
      } else {
        const result = await followGameAction(gameId);
        if (result.success) {
          setIsFollowing(true);
          setFollowersCount((c) => c + 1);
        }
      }
    });
  };

  return (
    <Button
      variant={isFollowing ? "default" : "secondary"}
      className="gap-2"
      onClick={handleClick}
      disabled={isPending}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          Following ({followersCount})
        </>
      ) : (
        <>
          <Users className="h-4 w-4" />
          Follow ({followersCount})
        </>
      )}
    </Button>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Trophy, Flame, Star, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Achievement = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
};

type UserAchievement = {
  unlocked_at: string;
  achievements: Achievement;
};

interface AchievementsBadgesProps {
  userAchievements: UserAchievement[];
  allAchievements: Achievement[];
  showLocked?: boolean;
  maxDisplay?: number;
}

const rarityColors: Record<string, string> = {
  common: "from-zinc-500 to-zinc-600",
  rare: "from-blue-500 to-blue-600",
  epic: "from-purple-500 to-purple-600",
  legendary: "from-amber-500 to-yellow-400",
};

const rarityBorders: Record<string, string> = {
  common: "border-zinc-500/30",
  rare: "border-blue-500/30",
  epic: "border-purple-500/30",
  legendary: "border-amber-500/30 shadow-amber-500/20",
};

const rarityGlow: Record<string, string> = {
  common: "",
  rare: "shadow-blue-500/10",
  epic: "shadow-purple-500/20",
  legendary: "shadow-lg shadow-amber-500/30 animate-pulse",
};

export function AchievementsBadges({
  userAchievements,
  allAchievements,
  showLocked = true,
  maxDisplay,
}: AchievementsBadgesProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const unlockedIds = new Set(userAchievements.map((ua) => ua.achievements.id));

  const displayAchievements = showLocked
    ? allAchievements
    : allAchievements.filter((a) => unlockedIds.has(a.id));

  const toShow = maxDisplay
    ? displayAchievements.slice(0, maxDisplay)
    : displayAchievements;

  return (
    <div className="flex flex-wrap gap-2">
      {toShow.map((achievement) => {
        const isUnlocked = unlockedIds.has(achievement.id);
        const userAch = userAchievements.find(
          (ua) => ua.achievements.id === achievement.id
        );

        return (
          <div
            key={achievement.id}
            className={cn(
              "group relative flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300",
              isUnlocked
                ? cn(
                    "bg-gradient-to-br cursor-pointer hover:scale-110",
                    rarityColors[achievement.rarity],
                    rarityBorders[achievement.rarity],
                    rarityGlow[achievement.rarity]
                  )
                : "border-white/10 bg-white/5 opacity-40 grayscale"
            )}
            title={
              isUnlocked
                ? `${achievement.name} - ${achievement.description}`
                : `🔒 ${achievement.name} - ${achievement.description}`
            }
          >
            <span className="text-xl">{achievement.icon}</span>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-50">
              <div className="whitespace-nowrap rounded-lg bg-black/90 px-3 py-2 text-xs shadow-xl border border-white/10">
                <p className="font-semibold">{achievement.name}</p>
                <p className="text-white/60">{achievement.description}</p>
                {achievement.xp_reward > 0 && (
                  <p className="text-[#D946EF] mt-1">
                    +{achievement.xp_reward} XP
                  </p>
                )}
                {isUnlocked && userAch && isMounted && (
                  <p className="text-white/40 text-[10px] mt-1">
                    Unlocked{" "}
                    {new Date(userAch.unlocked_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                <Lock className="h-4 w-4 text-white/30" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
}

export function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };

  // Determine badge color based on level
  const getBadgeStyle = () => {
    if (level >= 50)
      return "from-amber-400 to-yellow-300 text-black shadow-amber-500/50";
    if (level >= 25)
      return "from-purple-500 to-purple-400 text-white shadow-purple-500/40";
    if (level >= 10)
      return "from-blue-500 to-blue-400 text-white shadow-blue-500/30";
    if (level >= 5)
      return "from-emerald-500 to-emerald-400 text-white shadow-emerald-500/20";
    return "from-zinc-500 to-zinc-400 text-white";
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br font-bold shadow-lg",
        sizeClasses[size],
        getBadgeStyle()
      )}
    >
      {level}
    </div>
  );
}

interface XPProgressBarProps {
  currentXP: number;
  level: number;
  showLabel?: boolean;
}

export function XPProgressBar({
  currentXP,
  level,
  showLabel = true,
}: XPProgressBarProps) {
  const currentLevelXP = (level - 1) * (level - 1) * 100;
  const nextLevelXP = level * level * 100;
  const xpInLevel = currentXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progress = Math.min(100, (xpInLevel / xpNeeded) * 100);

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-white/60">
          <span>{xpInLevel.toLocaleString()} XP</span>
          <span>
            {xpNeeded.toLocaleString()} XP to level {level + 1}
          </span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#D946EF] to-[#22D3EE] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 px-3 py-1 text-sm">
      <Flame
        className={cn(
          "h-4 w-4",
          streak >= 7 ? "text-orange-400 animate-pulse" : "text-orange-500"
        )}
      />
      <span className="font-medium text-orange-400">{streak} day streak</span>
    </div>
  );
}

interface XPGainToastProps {
  xp: number;
  message?: string;
  onComplete?: () => void;
}

export function XPGainToast({ xp, message, onComplete }: XPGainToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right fade-in duration-300">
      <div className="flex items-center gap-3 rounded-xl border border-[#D946EF]/30 bg-black/90 px-4 py-3 shadow-xl shadow-[#D946EF]/10 backdrop-blur-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#D946EF] to-[#22D3EE]">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-[#D946EF]">+{xp} XP</p>
          {message && <p className="text-sm text-white/60">{message}</p>}
        </div>
      </div>
    </div>
  );
}

interface LevelUpToastProps {
  newLevel: number;
  onComplete?: () => void;
}

export function LevelUpToast({ newLevel, onComplete }: LevelUpToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#D946EF]/30 bg-gradient-to-br from-[#0b0d12] to-[#1a0f1c] px-12 py-10 shadow-2xl">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#D946EF]/30" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#D946EF] to-[#22D3EE] text-3xl font-bold text-white shadow-xl shadow-[#D946EF]/30">
            {newLevel}
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-[#D946EF]">
            Level Up!
          </p>
          <p className="text-2xl font-bold">You reached level {newLevel}</p>
          <p className="mt-1 text-white/60">
            Keep exploring to unlock more rewards!
          </p>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="h-6 w-6 animate-pulse text-[#D946EF]"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface AchievementUnlockedToastProps {
  achievement: {
    name: string;
    icon: string;
    description: string;
    xp_reward: number;
    rarity: string;
  };
  onComplete?: () => void;
}

export function AchievementUnlockedToast({
  achievement,
  onComplete,
}: AchievementUnlockedToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right fade-in duration-300">
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border bg-black/90 px-5 py-4 shadow-xl backdrop-blur-sm",
          rarityBorders[achievement.rarity]
        )}
      >
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-2xl",
            rarityColors[achievement.rarity]
          )}
        >
          {achievement.icon}
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-[#D946EF]">
            Achievement Unlocked!
          </p>
          <p className="font-semibold text-lg">{achievement.name}</p>
          <p className="text-sm text-white/60">{achievement.description}</p>
          {achievement.xp_reward > 0 && (
            <p className="text-sm text-[#22D3EE] mt-1">
              +{achievement.xp_reward} XP
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

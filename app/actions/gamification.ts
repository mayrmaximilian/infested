"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// XP rewards for different actions
const XP_REWARDS = {
  FOLLOW_GAME: 25,
  UNFOLLOW_GAME: -10, // Lose XP for unfollowing
  SUBMIT_PITCH: 50,
  VOTE_PITCH: 10,
  UNVOTE_PITCH: -5,
  DAILY_LOGIN: 15,
  COMPLETE_CHALLENGE: 100,
} as const;

export type XPResult = {
  success: boolean;
  xpGained?: number;
  newTotalXp?: number;
  newLevel?: number;
  leveledUp?: boolean;
  newAchievements?: string[];
  error?: string;
};

// Award XP to user
export async function awardXP(
  action: keyof typeof XP_REWARDS,
  details?: Record<string, unknown>
): Promise<XPResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const xpAmount = XP_REWARDS[action];

  // Call the award_xp function
  const { data, error } = await supabase.rpc("award_xp", {
    p_user_id: user.id,
    p_action: action,
    p_xp: xpAmount,
    p_details: details || {},
  });

  if (error) {
    console.error("Error awarding XP:", error);
    return { success: false, error: error.message };
  }

  const result = data?.[0];

  // Check for new achievements
  const newAchievements = await checkAndUnlockAchievements(user.id);

  revalidatePath("/app");

  return {
    success: true,
    xpGained: xpAmount,
    newTotalXp: result?.new_xp,
    newLevel: result?.new_level,
    leveledUp: result?.leveled_up,
    newAchievements,
  };
}

// Increment a stat and award XP
export async function incrementStatAndAwardXP(
  statName:
    | "games_followed"
    | "pitches_submitted"
    | "pitches_voted"
    | "challenges_completed",
  action: keyof typeof XP_REWARDS,
  details?: Record<string, unknown>
): Promise<XPResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Increment the stat
  await supabase.rpc("increment_stat", {
    p_user_id: user.id,
    p_stat_name: statName,
  });

  // Update streak
  await supabase.rpc("update_streak", { p_user_id: user.id });

  // Award XP
  return awardXP(action, details);
}

// Decrement a stat (for unfollowing, etc.)
export async function decrementStat(
  statName: "games_followed" | "pitches_submitted" | "pitches_voted"
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("user_stats")
    .update({
      [statName]: supabase.rpc("greatest", { a: 0, b: `${statName} - 1` }),
    })
    .eq("user_id", user.id);
}

// Check and unlock achievements
async function checkAndUnlockAchievements(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const unlockedAchievements: string[] = [];

  // Get user stats
  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!stats) return [];

  // Get all achievements user hasn't unlocked yet
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .not(
      "id",
      "in",
      `(SELECT achievement_id FROM user_achievements WHERE user_id = '${userId}')`
    );

  if (!achievements) return [];

  // Check each achievement
  for (const achievement of achievements) {
    let qualified = false;

    switch (achievement.requirement_type) {
      case "games_followed":
        qualified =
          (stats.games_followed ?? 0) >= achievement.requirement_value;
        break;
      case "pitches_submitted":
        qualified =
          (stats.pitches_submitted ?? 0) >= achievement.requirement_value;
        break;
      case "pitches_voted":
        qualified = (stats.pitches_voted ?? 0) >= achievement.requirement_value;
        break;
      case "current_streak":
        qualified =
          (stats.current_streak ?? 0) >= achievement.requirement_value;
        break;
      case "level":
        qualified = (stats.level ?? 1) >= achievement.requirement_value;
        break;
    }

    if (qualified) {
      // Unlock achievement
      const { error } = await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_id: achievement.id,
      });

      if (!error) {
        unlockedAchievements.push(achievement.name);

        // Award bonus XP for achievement
        if (achievement.xp_reward > 0) {
          await supabase.rpc("award_xp", {
            p_user_id: userId,
            p_action: `achievement_${achievement.slug}`,
            p_xp: achievement.xp_reward,
            p_details: { achievement: achievement.name },
          });
        }
      }
    }
  }

  return unlockedAchievements;
}

// Get user stats
export async function getUserStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Ensure stats exist with defaults
  await supabase.from("user_stats").upsert(
    {
      user_id: user.id,
      total_xp: 0,
      monthly_xp: 0,
      level: 1,
      current_streak: 0,
      games_followed: 0,
      pitches_submitted: 0,
    },
    { onConflict: "user_id", ignoreDuplicates: true }
  );

  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return stats;
}

// Get user achievements
export async function getUserAchievements() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("user_achievements")
    .select(
      `
      unlocked_at,
      achievements (
        id,
        slug,
        name,
        description,
        icon,
        category,
        rarity,
        xp_reward
      )
    `
    )
    .eq("user_id", user.id)
    .order("unlocked_at", { ascending: false });

  return data ?? [];
}

// Get all achievements (for displaying locked ones too)
export async function getAllAchievements() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("achievements")
    .select("*")
    .order("requirement_value", { ascending: true });

  return data ?? [];
}

// Get leaderboard (monthly)
export async function getLeaderboard(limit = 50) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_stats")
    .select(
      `
      user_id,
      display_name,
      total_xp,
      monthly_xp,
      level,
      current_streak,
      games_followed,
      pitches_submitted
    `
    )
    .order("monthly_xp", { ascending: false })
    .limit(limit);

  if (!data) return [];

  // Fetch profile info for each user
  const userIds = data.map((s) => s.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", userIds);

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  return data.map((stat, index) => {
    const profile = profileMap.get(stat.user_id);
    return {
      rank: index + 1,
      ...stat,
      monthly_xp: stat.monthly_xp ?? 0,
      profile: profile ?? {
        id: stat.user_id,
        display_name: stat.display_name ?? null,
        avatar_url: null,
      },
    };
  });
}

// Get active tournaments
export async function getActiveTournaments() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select(
      `
      id,
      title,
      description,
      sponsor_name,
      sponsor_logo_url,
      game_id,
      challenge_type,
      challenge_target,
      prize_description,
      prize_xp,
      cash_prize_amount,
      cash_prize_currency,
      starts_at,
      ends_at,
      games (
        id,
        title,
        cover_url
      )
    `
    )
    .eq("is_active", true)
    .gte("ends_at", new Date().toISOString())
    .order("ends_at", { ascending: true })
    .limit(3);

  if (!tournaments) return [];

  // Get user's entries if logged in
  let userEntries: Record<
    string,
    { current_progress: number; is_completed: boolean }
  > = {};
  if (user) {
    const { data: entries } = await supabase
      .from("tournament_entries")
      .select("tournament_id, current_progress, is_completed")
      .eq("user_id", user.id);

    if (entries) {
      userEntries = Object.fromEntries(
        entries.map((e) => [
          e.tournament_id,
          {
            current_progress: e.current_progress,
            is_completed: e.is_completed,
          },
        ])
      );
    }
  }

  // Get participant counts
  const tournamentIds = tournaments.map((t) => t.id);
  const { data: counts } = await supabase
    .from("tournament_entries")
    .select("tournament_id")
    .in("tournament_id", tournamentIds);

  const participantCounts: Record<string, number> = {};
  counts?.forEach((entry) => {
    participantCounts[entry.tournament_id] =
      (participantCounts[entry.tournament_id] || 0) + 1;
  });

  return tournaments.map((t) => ({
    ...t,
    participant_count: participantCounts[t.id] || 0,
    user_entry: userEntries[t.id] || null,
  }));
}

// Join a tournament
export async function joinTournament(tournamentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase.from("tournament_entries").insert({
    tournament_id: tournamentId,
    user_id: user.id,
    current_progress: 0,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Already joined" };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/challenges");
  return { success: true };
}

// Leave a tournament
export async function leaveTournament(tournamentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("tournament_entries")
    .delete()
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/app");
  revalidatePath("/app/challenges");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { incrementStatAndAwardXP, awardXP } from "./gamification";

const gameSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  summary: z.string().min(10, "Summary must be at least 10 characters."),
  heroUrl: z.string().url("Provide a valid hero image URL."),
  coverUrl: z
    .string()
    .url("Provide a valid cover image URL.")
    .optional()
    .or(z.literal("")),
  genre: z
    .enum([
      "action",
      "adventure",
      "rpg",
      "strategy",
      "simulation",
      "platformer",
      "roguelite",
      "puzzle",
      "horror",
      "other",
    ])
    .default("other"),
});

type ActionResult =
  | { success: string; id?: string; error?: undefined }
  | { error: string; success?: undefined; id?: undefined };

export async function createGamePageAction(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  if (!formData) {
    return { error: "Missing form data." };
  }

  const parsed = gameSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const roleMeta = (user.user_metadata as { role?: string })?.role;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = (profile?.role || roleMeta || "").toLowerCase();

  if (role !== "developer") {
    return { error: "Only developers can create game pages." };
  }

  const gameId = crypto.randomUUID();

  const { error } = await supabase.from("games").insert({
    id: gameId,
    owner_id: user.id,
    title: parsed.data.title,
    summary: parsed.data.summary,
    hero_url: parsed.data.heroUrl,
    cover_url: parsed.data.coverUrl || null,
    genre: parsed.data.genre,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/games");
  revalidatePath("/app/games");
  revalidatePath("/app/games/new");
  return { success: "Game page created.", id: gameId };
}

export async function updateGamePageAction(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    return { error: "Missing game id." };
  }

  const parsed = gameSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const { data: game } = await supabase
    .from("games")
    .select("owner_id")
    .eq("id", id)
    .maybeSingle();

  if (!game || game.owner_id !== user.id) {
    return { error: "You can only edit your own games." };
  }

  const { error } = await supabase
    .from("games")
    .update({
      title: parsed.data.title,
      summary: parsed.data.summary,
      hero_url: parsed.data.heroUrl,
      cover_url: parsed.data.coverUrl || null,
      genre: parsed.data.genre,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/games");
  revalidatePath("/app/games");
  revalidatePath(`/app/games/${id}`);
  return { success: "Game page updated.", id };
}

export async function deleteGamePageAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    return { error: "Missing game id." };
  }

  const { data: game } = await supabase
    .from("games")
    .select("owner_id")
    .eq("id", id)
    .maybeSingle();

  if (!game || game.owner_id !== user.id) {
    return { error: "You can only delete your own games." };
  }

  const { error } = await supabase.from("games").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/games");
  revalidatePath("/app/games");
  return { success: "Game deleted.", id };
}

// ============ CHALLENGES ============

const challengeSchema = z.object({
  gameId: z.string().uuid("Invalid game ID."),
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().optional(),
  type: z.enum(["daily", "weekly", "monthly", "special"]).default("weekly"),
});

export async function createChallengeAction(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const parsed = challengeSchema.safeParse({
    gameId: formData.get("gameId"),
    title: formData.get("title"),
    description: formData.get("description") || "",
    type: formData.get("type") || "weekly",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  // Verify user owns this game
  const { data: game } = await supabase
    .from("games")
    .select("owner_id")
    .eq("id", parsed.data.gameId)
    .maybeSingle();

  if (!game || game.owner_id !== user.id) {
    return { error: "You can only add challenges to your own games." };
  }

  const { error } = await supabase.from("challenges").insert({
    game_id: parsed.data.gameId,
    title: parsed.data.title,
    description: parsed.data.description || null,
    type: parsed.data.type,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/app/games/${parsed.data.gameId}`);
  return { success: "Challenge created." };
}

export async function deleteChallengeAction(
  challengeId: string,
  gameId: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  // Verify user owns the game this challenge belongs to
  const { data: challenge } = await supabase
    .from("challenges")
    .select("game_id, games!inner(owner_id)")
    .eq("id", challengeId)
    .maybeSingle();

  if (
    !challenge ||
    (challenge.games as { owner_id: string }[]).length === 0 ||
    (challenge.games as { owner_id: string }[])[0].owner_id !== user.id
  ) {
    return { error: "You can only delete challenges from your own games." };
  }

  const { error } = await supabase
    .from("challenges")
    .delete()
    .eq("id", challengeId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/app/games/${gameId}`);
  return { success: "Challenge deleted." };
}

// ==================== PITCH ACTIONS ====================

const pitchSchema = z.object({
  gameId: z.string().uuid("Invalid game ID."),
  title: z.string().min(3, "Title must be at least 3 characters.").max(100),
  description: z.string().max(500).optional(),
});

export async function submitPitchAction(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to submit a pitch." };
  }

  const parsed = pitchSchema.safeParse({
    gameId: formData.get("gameId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const { error } = await supabase.from("pitches").insert({
    game_id: parsed.data.gameId,
    user_id: user.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
  });

  if (error) {
    return { error: error.message };
  }

  // Award XP for submitting a pitch
  await incrementStatAndAwardXP("pitches_submitted", "SUBMIT_PITCH", {
    gameId: parsed.data.gameId,
  });

  revalidatePath(`/app/games/${parsed.data.gameId}`);
  return { success: "Pitch submitted!", xpGained: 50 };
}

export async function votePitchAction(pitchId: string, gameId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to vote." };
  }

  // Check if already voted
  const { data: existingVote } = await supabase
    .from("pitch_votes")
    .select("id")
    .eq("pitch_id", pitchId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingVote) {
    return { error: "You have already voted for this pitch." };
  }

  const { error } = await supabase.from("pitch_votes").insert({
    pitch_id: pitchId,
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  // Award XP for voting
  await incrementStatAndAwardXP("pitches_voted", "VOTE_PITCH", {
    pitchId,
    gameId,
  });

  revalidatePath(`/app/games/${gameId}`);
  return { success: "Vote recorded!", xpGained: 10 };
}

export async function unvotePitchAction(pitchId: string, gameId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("pitch_votes")
    .delete()
    .eq("pitch_id", pitchId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/app/games/${gameId}`);
  return { success: "Vote removed." };
}

export async function deletePitchAction(pitchId: string, gameId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  // Check if user owns the pitch or the game
  const { data: pitch } = await supabase
    .from("pitches")
    .select("user_id, game_id, games!inner(owner_id)")
    .eq("id", pitchId)
    .maybeSingle();

  if (!pitch) {
    return { error: "Pitch not found." };
  }

  const isOwner = pitch.user_id === user.id;
  const isGameOwner =
    (pitch.games as { owner_id: string }[]).length > 0 &&
    (pitch.games as { owner_id: string }[])[0].owner_id === user.id;

  if (!isOwner && !isGameOwner) {
    return { error: "You can only delete your own pitches." };
  }

  const { error } = await supabase.from("pitches").delete().eq("id", pitchId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/app/games/${gameId}`);
  return { success: "Pitch deleted." };
}

// ============ FOLLOW ACTIONS ============

export async function followGameAction(gameId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase.from("game_follows").insert({
    user_id: user.id,
    game_id: gameId,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You're already following this game." };
    }
    return { error: error.message };
  }

  // Award XP for following a game
  await incrementStatAndAwardXP("games_followed", "FOLLOW_GAME", { gameId });

  revalidatePath(`/app/games/${gameId}`);
  revalidatePath("/app/library");
  return { success: "Now following this game!", xpGained: 25 };
}

export async function unfollowGameAction(gameId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("game_follows")
    .delete()
    .eq("user_id", user.id)
    .eq("game_id", gameId);

  if (error) {
    return { error: error.message };
  }

  // Deduct XP for unfollowing
  await awardXP("UNFOLLOW_GAME", { gameId });

  revalidatePath(`/app/games/${gameId}`);
  revalidatePath("/app/library");
  return { success: "Unfollowed game." };
}

export async function isFollowingGame(gameId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data } = await supabase
    .from("game_follows")
    .select("id")
    .eq("user_id", user.id)
    .eq("game_id", gameId)
    .maybeSingle();

  return !!data;
}

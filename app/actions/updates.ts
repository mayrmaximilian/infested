"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getGameUpdates(gameId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("game_updates")
    .select("id, title, description, update_type, version, released_at")
    .eq("game_id", gameId)
    .order("released_at", { ascending: false });

  if (error) {
    console.error("Error fetching game updates:", error);
    return [];
  }

  return data || [];
}

export async function publishGameUpdate(
  gameId: string,
  title: string,
  description: string,
  updateType: "patch" | "major" | "hotfix" | "announcement",
  version?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to publish updates." };
  }

  // Verify user owns the game
  const { data: game } = await supabase
    .from("games")
    .select("owner_id")
    .eq("id", gameId)
    .maybeSingle();

  if (!game || game.owner_id !== user.id) {
    return { error: "You can only publish updates for your own games." };
  }

  const { data, error } = await supabase
    .from("game_updates")
    .insert({
      game_id: gameId,
      title,
      description,
      update_type: updateType,
      version,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Revalidate the game page to show new update
  revalidatePath(`/games/${gameId}`);

  return { success: true, data };
}

export async function deleteGameUpdate(updateId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  // Verify user owns the game this update belongs to
  const { data: update } = await supabase
    .from("game_updates")
    .select("game_id")
    .eq("id", updateId)
    .maybeSingle();

  if (!update) {
    return { error: "Update not found." };
  }

  const { data: game } = await supabase
    .from("games")
    .select("owner_id")
    .eq("id", update.game_id)
    .maybeSingle();

  if (!game || game.owner_id !== user.id) {
    return { error: "You can only delete your own updates." };
  }

  const { error } = await supabase
    .from("game_updates")
    .delete()
    .eq("id", updateId);

  if (error) {
    return { error: error.message };
  }

  // Revalidate the game page to remove the update from display
  revalidatePath(`/games/${update.game_id}`);

  return { success: true };
}

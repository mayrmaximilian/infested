"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const gameSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  summary: z.string().min(10, "Summary must be at least 10 characters."),
  heroUrl: z.string().url("Provide a valid image URL."),
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

  const { error } = await supabase
    .from("games")
    .insert({
      id: gameId,
      owner_id: user.id,
      title: parsed.data.title,
      summary: parsed.data.summary,
      hero_url: parsed.data.heroUrl,
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

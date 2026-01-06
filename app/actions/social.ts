"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SocialActionResult =
  | { success: string; error?: undefined }
  | { error: string; success?: undefined };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!user || error) {
    return { supabase, error: "You must be signed in." };
  }

  return { supabase, user };
}

export async function sendFriendRequestAction(
  formData: FormData
): Promise<SocialActionResult> {
  const targetId = formData.get("targetId");
  if (!targetId || typeof targetId !== "string") {
    return { error: "Missing user." };
  }

  const { supabase, user, error } = await requireUser();
  if (!user || error) {
    return { error: error ?? "You must be signed in." };
  }

  if (targetId === user.id) {
    return { error: "You cannot friend yourself." };
  }

  const { error: insertError } = await supabase.from("friendships").insert({
    requester_id: user.id,
    addressee_id: targetId,
    status: "pending",
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/app/social");
  return { success: "Friend request sent." };
}

export async function cancelFriendRequestAction(
  formData: FormData
): Promise<SocialActionResult> {
  const targetId = formData.get("targetId");
  if (!targetId || typeof targetId !== "string") {
    return { error: "Missing user." };
  }

  const { supabase, user, error } = await requireUser();
  if (!user || error) {
    return { error: error ?? "You must be signed in." };
  }

  const { error: deleteError } = await supabase
    .from("friendships")
    .delete()
    .eq("requester_id", user.id)
    .eq("addressee_id", targetId)
    .eq("status", "pending");

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/app/social");
  return { success: "Friend request canceled." };
}

export async function acceptFriendRequestAction(
  formData: FormData
): Promise<SocialActionResult> {
  const targetId = formData.get("targetId");
  if (!targetId || typeof targetId !== "string") {
    return { error: "Missing user." };
  }

  const { supabase, user, error } = await requireUser();
  if (!user || error) {
    return { error: error ?? "You must be signed in." };
  }

  const { error: updateError } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("requester_id", targetId)
    .eq("addressee_id", user.id)
    .eq("status", "pending");

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/app/social");
  return { success: "Friend request accepted." };
}

export async function declineFriendRequestAction(
  formData: FormData
): Promise<SocialActionResult> {
  const targetId = formData.get("targetId");
  if (!targetId || typeof targetId !== "string") {
    return { error: "Missing user." };
  }

  const { supabase, user, error } = await requireUser();
  if (!user || error) {
    return { error: error ?? "You must be signed in." };
  }

  const { error: deleteError } = await supabase
    .from("friendships")
    .delete()
    .eq("requester_id", targetId)
    .eq("addressee_id", user.id)
    .eq("status", "pending");

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/app/social");
  return { success: "Friend request declined." };
}

export async function removeFriendAction(
  formData: FormData
): Promise<SocialActionResult> {
  const targetId = formData.get("targetId");
  if (!targetId || typeof targetId !== "string") {
    return { error: "Missing user." };
  }

  const { supabase, user, error } = await requireUser();
  if (!user || error) {
    return { error: error ?? "You must be signed in." };
  }

  const { error: deleteError } = await supabase
    .from("friendships")
    .delete()
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${user.id})`
    );

  if (deleteError) {
    return { error: deleteError.message };
  }

  revalidatePath("/app/social");
  return { success: "Friend removed." };
}

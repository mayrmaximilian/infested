"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MessageActionResult =
  | { success: string; roomId?: string; error?: undefined }
  | { error: string; success?: undefined; roomId?: undefined };

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

export async function createDirectRoomAction(
  formData: FormData
): Promise<MessageActionResult> {
  const friendId = formData.get("friendId");
  if (!friendId || typeof friendId !== "string") {
    return { error: "Missing friend." };
  }

  const { supabase, user, error } = await requireUser();
  if (!user || error) {
    return { error: error ?? "You must be signed in." };
  }

  const { data: friendship } = await supabase
    .from("friendships")
    .select("status")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${user.id})`
    )
    .maybeSingle();

  if (!friendship || friendship.status !== "accepted") {
    return { error: "You can only message friends." };
  }

  const { data: existing } = await supabase
    .from("chat_rooms")
    .select("id")
    .or(
      `and(direct_user_a.eq.${user.id},direct_user_b.eq.${friendId}),and(direct_user_a.eq.${friendId},direct_user_b.eq.${user.id})`
    )
    .maybeSingle();

  if (existing?.id) {
    revalidatePath("/app/social");
    revalidatePath("/app/messages");
    return { success: "Room found.", roomId: existing.id };
  }

  const { data: room, error: roomError } = await supabase
    .from("chat_rooms")
    .insert({
      name: null,
      is_group: false,
      created_by: user.id,
      direct_user_a: user.id,
      direct_user_b: friendId,
    })
    .select("id")
    .single();

  if (roomError || !room) {
    return { error: roomError?.message ?? "Failed to create room." };
  }

  const { error: membersError } = await supabase.from("chat_members").insert([
    { room_id: room.id, user_id: user.id, role: "admin" },
    { room_id: room.id, user_id: friendId, role: "member" },
  ]);

  if (membersError) {
    return { error: membersError.message };
  }

  revalidatePath("/app/social");
  revalidatePath("/app/messages");
  return { success: "Room created.", roomId: room.id };
}

export async function createGroupRoomAction(
  formData: FormData
): Promise<MessageActionResult> {
  const name = formData.get("name");
  const membersRaw = formData.get("members");

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return { error: "Group name is too short." };
  }

  const memberIds = typeof membersRaw === "string" && membersRaw.length
    ? membersRaw.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  const { supabase, user, error } = await requireUser();
  if (!user || error) {
    return { error: error ?? "You must be signed in." };
  }

  const { data: room, error: roomError } = await supabase
    .from("chat_rooms")
    .insert({
      name: name.trim(),
      is_group: true,
      created_by: user.id,
      direct_user_a: null,
      direct_user_b: null,
    })
    .select("id")
    .single();

  if (roomError || !room) {
    return { error: roomError?.message ?? "Failed to create room." };
  }

  const uniqueMembers = Array.from(new Set([user.id, ...memberIds]));
  const memberRows = uniqueMembers.map((memberId) => ({
    room_id: room.id,
    user_id: memberId,
    role: memberId === user.id ? "admin" : "member",
  }));

  const { error: membersError } = await supabase
    .from("chat_members")
    .insert(memberRows);

  if (membersError) {
    return { error: membersError.message };
  }

  revalidatePath("/app/social");
  revalidatePath("/app/messages");
  return { success: "Group created.", roomId: room.id };
}

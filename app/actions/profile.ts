"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
  role: z.enum(["gamer", "developer"]),
  avatarUrl: z
    .string()
    .url("Must be a valid URL.")
    .max(300)
    .or(z.literal("").transform(() => undefined))
    .optional(),
});

type ActionResult =
  | { success: string; error?: undefined }
  | { error: string; success?: undefined };

export async function updateProfileAction(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You need to be signed in to update your profile." };
  }

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid data." };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      avatarUrl: parsed.data.avatarUrl,
    },
  });

  if (error) {
    return { error: error.message };
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: parsed.data.name,
      role: parsed.data.role,
      avatar_url: parsed.data.avatarUrl ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/app/settings");
  revalidatePath("/app");
  return { success: "Profile updated successfully." };
}

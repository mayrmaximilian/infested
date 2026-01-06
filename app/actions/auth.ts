"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z.string().min(2).max(50).optional(),
  role: z.enum(["gamer", "developer"]).default("gamer"),
});

type ActionResult =
  | { error: string; success?: never }
  | { success: string; error?: never };

export async function signInAction(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = credentialsSchema
    .omit({ name: true })
    .safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid credentials." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  redirect("/app");
}

export async function signUpAction(
  prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid credentials." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name, role: parsed.data.role },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/app");
  redirect("/app");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

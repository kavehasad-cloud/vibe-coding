"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type CreateClientState = { error?: string; success?: boolean };

export async function createClientAction(
  _prevState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  const name = String(formData.get("name") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();

  if (!name) {
    return { error: "Name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .insert({ name, contact_email: contactEmail || null });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

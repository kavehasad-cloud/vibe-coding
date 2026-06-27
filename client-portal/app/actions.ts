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

export async function updateClientAction(
  _prevState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();

  if (!id) {
    return { error: "Missing client id." };
  }
  if (!name) {
    return { error: "Name is required." };
  }

  const supabase = await createClient();
  // RLS (auth.uid() = owner_id) enforces ownership; no manual owner filter.
  const { error } = await supabase
    .from("clients")
    .update({ name, contact_email: contactEmail || null })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteClientAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  // RLS enforces ownership on delete.
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) {
    console.error("deleteClientAction:", error.message);
    return;
  }

  revalidatePath("/");
}

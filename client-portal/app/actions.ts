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

export type CreateProjectState = { error?: string; success?: boolean };

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const clientId = String(formData.get("client_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!clientId) {
    return { error: "Missing client id." };
  }
  if (!name) {
    return { error: "Name is required." };
  }

  const supabase = await createClient();
  // owner_id auto-fills via the DB default; RLS enforces ownership.
  const { error } = await supabase
    .from("projects")
    .insert({ client_id: clientId, name, status: "not_started" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

const PROJECT_STATUSES = [
  "not_started",
  "active",
  "on_hold",
  "completed",
  "cancelled",
] as const;

export async function updateProjectStatusAction(
  projectId: string,
  clientId: string,
  status: string
): Promise<{ error?: string }> {
  if (!projectId) {
    return { error: "Missing project id." };
  }
  if (!PROJECT_STATUSES.includes(status as (typeof PROJECT_STATUSES)[number])) {
    return { error: "Invalid status." };
  }

  const supabase = await createClient();
  // RLS enforces ownership on update; no manual owner filter.
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
  return {};
}

const PROJECT_HEALTH = ["green", "amber", "red"] as const;

export async function updateProjectHealthAction(
  projectId: string,
  clientId: string,
  health: string
): Promise<{ error?: string }> {
  if (!projectId) {
    return { error: "Missing project id." };
  }
  if (!PROJECT_HEALTH.includes(health as (typeof PROJECT_HEALTH)[number])) {
    return { error: "Invalid health." };
  }

  const supabase = await createClient();
  // RLS enforces ownership on update; no manual owner filter.
  const { error } = await supabase
    .from("projects")
    .update({ health })
    .eq("id", projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
  return {};
}

export async function updateProjectAction(
  _prevState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  const id = String(formData.get("id") ?? "");
  const clientId = String(formData.get("client_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!id) {
    return { error: "Missing project id." };
  }
  if (!name) {
    return { error: "Name is required." };
  }

  const supabase = await createClient();
  // RLS enforces ownership on update; no manual owner filter.
  const { error } = await supabase
    .from("projects")
    .update({ name })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function deleteProjectAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const clientId = String(formData.get("client_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  // RLS enforces ownership on delete.
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    console.error("deleteProjectAction:", error.message);
    return;
  }

  revalidatePath(`/clients/${clientId}`);
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

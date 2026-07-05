"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { parseDate } from "@/app/format";

// Defense-in-depth: Server Actions are reachable via direct POST, not just
// through the UI. RLS still applies in the DB, but every write also verifies
// here that the caller is an authenticated admin. Fails closed: any missing
// user, profile-read error, or role other than exactly "admin" is rejected.
async function requireAdmin(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, error: "Not authenticated." };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (error || profile?.role !== "admin") {
    return { supabase, error: "Not authorized." };
  }

  return { supabase };
}

export type CreateClientState = { error?: string; success?: boolean };

export async function createClientAction(
  _prevState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const name = String(formData.get("name") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();

  if (!name) {
    return { error: "Name is required." };
  }

  const { error } = await supabase
    .from("clients")
    .insert({ name, contact_email: contactEmail || null });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateClientAction(
  _prevState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();

  if (!id) {
    return { error: "Missing client id." };
  }
  if (!name) {
    return { error: "Name is required." };
  }

  // RLS (auth.uid() = owner_id) enforces ownership; no manual owner filter.
  const { error } = await supabase
    .from("clients")
    .update({ name, contact_email: contactEmail || null })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export type CreateProjectState = { error?: string; success?: boolean };

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const clientId = String(formData.get("client_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!clientId) {
    return { error: "Missing client id." };
  }
  if (!name) {
    return { error: "Name is required." };
  }

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
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  if (!projectId) {
    return { error: "Missing project id." };
  }
  if (!PROJECT_STATUSES.includes(status as (typeof PROJECT_STATUSES)[number])) {
    return { error: "Invalid status." };
  }

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
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  if (!projectId) {
    return { error: "Missing project id." };
  }
  if (!PROJECT_HEALTH.includes(health as (typeof PROJECT_HEALTH)[number])) {
    return { error: "Invalid health." };
  }

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
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const id = String(formData.get("id") ?? "");
  const clientId = String(formData.get("client_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!id) {
    return { error: "Missing project id." };
  }
  if (!name) {
    return { error: "Name is required." };
  }

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

export async function updateProjectSummaryAction(
  _prevState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const id = String(formData.get("id") ?? "");
  const projectPath = String(formData.get("project_path") ?? "");

  if (!id) {
    return { error: "Missing project id." };
  }

  // All three are optional free text; store null when blank to keep the
  // nullable columns clean rather than empty strings.
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const asks = String(formData.get("asks") ?? "").trim() || null;
  const issues = String(formData.get("issues") ?? "").trim() || null;

  // RLS enforces ownership on update; no manual owner filter.
  const { error } = await supabase
    .from("projects")
    .update({ summary, asks, issues })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  if (projectPath) revalidatePath(projectPath);
  return { success: true };
}

const RESOURCING_OPTIONS = ["staffed", "stretched", "bottlenecked"];

export async function updateProjectFinancialsAction(
  _prevState: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const id = String(formData.get("id") ?? "");
  const projectPath = String(formData.get("project_path") ?? "");

  if (!id) {
    return { error: "Missing project id." };
  }

  // Parse a currency field: blank → null; otherwise must be a valid number.
  const parseMoney = (
    raw: string,
    label: string
  ): { value: number | null } | { error: string } => {
    const trimmed = raw.trim();
    if (!trimmed) return { value: null };
    const num = Number(trimmed);
    if (!Number.isFinite(num)) {
      return { error: `${label} must be a valid number.` };
    }
    return { value: num };
  };

  const budgetResult = parseMoney(
    String(formData.get("budget") ?? ""),
    "Budget"
  );
  if ("error" in budgetResult) return { error: budgetResult.error };

  const actualResult = parseMoney(
    String(formData.get("actual_spend") ?? ""),
    "Actual spend"
  );
  if ("error" in actualResult) return { error: actualResult.error };

  const resourcingRaw = String(formData.get("resourcing") ?? "").trim();
  const resourcing = resourcingRaw || null;
  if (resourcing && !RESOURCING_OPTIONS.includes(resourcing)) {
    return { error: "Invalid resourcing status." };
  }

  // RLS enforces ownership on update; no manual owner filter.
  const { error } = await supabase
    .from("projects")
    .update({
      budget: budgetResult.value,
      actual_spend: actualResult.value,
      resourcing,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  if (projectPath) revalidatePath(projectPath);
  return { success: true };
}

export async function deleteProjectAction(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return;

  const id = String(formData.get("id") ?? "");
  const clientId = String(formData.get("client_id") ?? "");
  if (!id) return;

  // RLS enforces ownership on delete.
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    console.error("deleteProjectAction:", error.message);
    return;
  }

  revalidatePath(`/clients/${clientId}`);
}

export type CreateMilestoneState = { error?: string; success?: boolean };

export async function createMilestoneAction(
  _prevState: CreateMilestoneState,
  formData: FormData
): Promise<CreateMilestoneState> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const projectId = String(formData.get("project_id") ?? "");
  const projectPath = String(formData.get("project_path") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();

  if (!projectId) {
    return { error: "Missing project id." };
  }
  if (!name) {
    return { error: "Name is required." };
  }
  if (!startDate) {
    return { error: "Start date is required." };
  }
  // due_date is optional; only enforce ordering when both dates are present.
  // Equal (same-day) is allowed — reject only start strictly after due.
  if (dueDate && parseDate(startDate).getTime() > parseDate(dueDate).getTime()) {
    return { error: "Due date must be on or after the start date." };
  }

  // owner_id auto-fills via the DB default (auth.uid()); RLS enforces ownership.
  const { error } = await supabase.from("milestones").insert({
    project_id: projectId,
    name,
    start_date: startDate,
    due_date: dueDate || null,
  });

  if (error) {
    return { error: error.message };
  }

  if (projectPath) revalidatePath(projectPath);
  return { success: true };
}

export async function toggleMilestoneAction(
  id: string,
  isDone: boolean,
  projectPath: string
): Promise<{ error?: string }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  if (!id) {
    return { error: "Missing milestone id." };
  }

  // RLS enforces ownership on update; no manual owner filter.
  const { error } = await supabase
    .from("milestones")
    .update({ is_done: isDone })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  if (projectPath) revalidatePath(projectPath);
  return {};
}

export async function updateMilestoneAction(
  _prevState: CreateMilestoneState,
  formData: FormData
): Promise<CreateMilestoneState> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const id = String(formData.get("id") ?? "");
  const projectPath = String(formData.get("project_path") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();

  if (!id) {
    return { error: "Missing milestone id." };
  }
  if (!name) {
    return { error: "Name is required." };
  }
  if (!startDate) {
    return { error: "Start date is required." };
  }
  // due_date is optional; only enforce ordering when both dates are present.
  // Equal (same-day) is allowed — reject only start strictly after due.
  if (dueDate && parseDate(startDate).getTime() > parseDate(dueDate).getTime()) {
    return { error: "Due date must be on or after the start date." };
  }

  // RLS enforces ownership on update; no manual owner filter.
  const { error } = await supabase
    .from("milestones")
    .update({ name, start_date: startDate, due_date: dueDate || null })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  if (projectPath) revalidatePath(projectPath);
  return { success: true };
}

export async function deleteMilestoneAction(id: string, projectPath: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return;

  if (!id) return;

  // RLS enforces ownership on delete.
  const { error } = await supabase.from("milestones").delete().eq("id", id);
  if (error) {
    console.error("deleteMilestoneAction:", error.message);
    return;
  }

  if (projectPath) revalidatePath(projectPath);
}

export async function deleteClientAction(formData: FormData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // RLS enforces ownership on delete.
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) {
    console.error("deleteClientAction:", error.message);
    return;
  }

  revalidatePath("/dashboard");
}

const RISK_LEVELS = ["low", "medium", "high"] as const;

export type CreateRiskState = { error?: string; success?: boolean };

export async function createRiskAction(
  _prevState: CreateRiskState,
  formData: FormData
): Promise<CreateRiskState> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const projectId = String(formData.get("project_id") ?? "");
  const projectPath = String(formData.get("project_path") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const likelihood = String(formData.get("likelihood") ?? "");
  const impact = String(formData.get("impact") ?? "");
  const mitigation = String(formData.get("mitigation") ?? "").trim();

  if (!projectId) {
    return { error: "Missing project id." };
  }
  if (!description) {
    return { error: "Description is required." };
  }
  if (!RISK_LEVELS.includes(likelihood as (typeof RISK_LEVELS)[number])) {
    return { error: "Invalid likelihood." };
  }
  if (!RISK_LEVELS.includes(impact as (typeof RISK_LEVELS)[number])) {
    return { error: "Invalid impact." };
  }

  // owner_id auto-fills via the DB default (auth.uid()); RLS enforces ownership.
  const { error } = await supabase.from("risks").insert({
    project_id: projectId,
    description,
    likelihood,
    impact,
    mitigation: mitigation || null,
  });

  if (error) {
    return { error: error.message };
  }

  if (projectPath) revalidatePath(projectPath);
  return { success: true };
}

export async function updateRiskAction(
  _prevState: CreateRiskState,
  formData: FormData
): Promise<CreateRiskState> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const id = String(formData.get("id") ?? "");
  const projectPath = String(formData.get("project_path") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const likelihood = String(formData.get("likelihood") ?? "");
  const impact = String(formData.get("impact") ?? "");
  const mitigation = String(formData.get("mitigation") ?? "").trim();

  if (!id) {
    return { error: "Missing risk id." };
  }
  if (!description) {
    return { error: "Description is required." };
  }
  if (!RISK_LEVELS.includes(likelihood as (typeof RISK_LEVELS)[number])) {
    return { error: "Invalid likelihood." };
  }
  if (!RISK_LEVELS.includes(impact as (typeof RISK_LEVELS)[number])) {
    return { error: "Invalid impact." };
  }

  // RLS enforces ownership on update; no manual owner filter.
  const { error } = await supabase
    .from("risks")
    .update({
      description,
      likelihood,
      impact,
      mitigation: mitigation || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  if (projectPath) revalidatePath(projectPath);
  return { success: true };
}

export async function deleteRiskAction(id: string, projectPath: string) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return;

  if (!id) return;

  // RLS enforces ownership on delete.
  const { error } = await supabase.from("risks").delete().eq("id", id);
  if (error) {
    console.error("deleteRiskAction:", error.message);
    return;
  }

  if (projectPath) revalidatePath(projectPath);
}

export type CreateAllocationState = { error?: string; success?: boolean };

// Parse an FTE field: blank → 0; otherwise must be a finite, non-negative
// number (decimals like 1.5 are fine). Returns an error string for bad input.
function parseFte(raw: string): { value: number } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { value: 0 };
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num < 0) {
    return { error: "FTE must be a non-negative number." };
  }
  return { value: num };
}

export async function createAllocationAction(
  _prevState: CreateAllocationState,
  formData: FormData
): Promise<CreateAllocationState> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const projectId = String(formData.get("project_id") ?? "");
  const projectPath = String(formData.get("project_path") ?? "");
  const month = String(formData.get("month") ?? "").trim();

  if (!projectId) {
    return { error: "Missing project id." };
  }
  // An <input type="month"> yields "YYYY-MM"; normalize to the 1st of the month.
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return { error: "Month is required." };
  }

  const plannedResult = parseFte(String(formData.get("planned_fte") ?? ""));
  if ("error" in plannedResult) return { error: plannedResult.error };

  const actualResult = parseFte(String(formData.get("actual_fte") ?? ""));
  if ("error" in actualResult) return { error: actualResult.error };

  // owner_id auto-fills via the DB default (auth.uid()); RLS enforces ownership.
  const { error } = await supabase.from("allocations").insert({
    project_id: projectId,
    month: `${month}-01`,
    planned_fte: plannedResult.value,
    actual_fte: actualResult.value,
  });

  if (error) {
    // 23505 = unique_violation on UNIQUE(project_id, month): don't leak the raw
    // Postgres message, guide the admin to edit the existing row instead.
    if (error.code === "23505") {
      return { error: "That month already has an allocation — edit it instead." };
    }
    return { error: error.message };
  }

  if (projectPath) revalidatePath(projectPath);
  return { success: true };
}

// Positional-args action (not FormData): the scorecard grid saves a whole
// month's row programmatically after a per-cell confirm(), so there's no form.
// Option A — always write both values, never a partial single-field update.
export async function updateAllocationAction(
  id: string,
  projectPath: string,
  plannedFte: number,
  actualFte: number
): Promise<{ error?: string }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  if (!id) {
    return { error: "Missing allocation id." };
  }
  if (!Number.isFinite(plannedFte) || plannedFte < 0) {
    return { error: "Planned FTE must be a non-negative number." };
  }
  if (!Number.isFinite(actualFte) || actualFte < 0) {
    return { error: "Actual FTE must be a non-negative number." };
  }

  // RLS enforces ownership on update; no manual owner filter.
  const { error } = await supabase
    .from("allocations")
    .update({ planned_fte: plannedFte, actual_fte: actualFte })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  if (projectPath) revalidatePath(projectPath);
  return {};
}

// Returns { error } (unlike the other delete actions) so the grid can restore
// the optimistically-removed month if the delete fails.
export async function deleteAllocationAction(
  id: string,
  projectPath: string
): Promise<{ error?: string }> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  if (!id) return { error: "Missing allocation id." };

  // RLS enforces ownership on delete.
  const { error } = await supabase.from("allocations").delete().eq("id", id);
  if (error) {
    console.error("deleteAllocationAction:", error.message);
    return { error: error.message };
  }

  if (projectPath) revalidatePath(projectPath);
  return {};
}

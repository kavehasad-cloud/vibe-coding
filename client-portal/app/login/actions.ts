"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type AuthState = { error?: string };

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  // redirect() throws internally, so it must live outside any try/catch.
  redirect("/");
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message };

  // Note: if "Confirm email" is ON in the Supabase dashboard (the default),
  // signUp does NOT create a session — the user must click the email link
  // first, so this redirect will bounce back to /login. For smooth local
  // testing, turn it off: Supabase dashboard → Authentication → Sign In / Up
  // → Email → disable "Confirm email".
  redirect("/");
}

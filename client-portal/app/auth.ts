import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

// Shared logout server action — replaces the inline copies that used to live in
// the dashboard and portal pages. Sign out, then bounce to the login screen.
export async function logout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type SessionRole = {
  role: string;
  homeHref: string;
};

// Reads the current user's role from profiles and derives their home route.
// Called from the shared NavBar on every authenticated page (approach A: the
// bar self-fetches rather than threading a prop through each page). Pages still
// run their own auth gate before rendering, so by here a user normally exists;
// if not, we fall back to the client home, which is harmless (the page's own
// redirect wins).
export async function getSessionRole(): Promise<SessionRole> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role = "client";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role === "admin") role = "admin";
  }

  const homeHref = role === "admin" ? "/dashboard" : "/portal";
  return { role, homeHref };
}

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NewClientForm } from "./new-client-form";
import { ClientRow } from "./client-row";
import { Button } from "@/components/ui/button";

async function logout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Fail closed: only an explicit admin role renders this page. A profile-read
  // error, a missing profile, or any non-admin role is sent to the portal.
  if (profileError || profile?.role !== "admin") {
    redirect("/portal");
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, contact_email, notes, projects(count)");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Clients</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </div>

      <NewClientForm />

      {!clients || clients.length === 0 ? (
        <p className="mt-6 text-muted-foreground">No clients yet</p>
      ) : (
        <ul className="mt-6 divide-y rounded-lg border">
          {clients.map((client) => (
            <ClientRow
              key={client.id}
              client={client}
              projectCount={client.projects?.[0]?.count ?? 0}
            />
          ))}
        </ul>
      )}
    </main>
  );
}

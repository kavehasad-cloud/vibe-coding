import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, client_id")
    .eq("id", user.id)
    .single();

  if (profile?.role === "client") {
    redirect("/portal");
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, contact_email, notes, projects(count)");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Clients</h1>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
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

import { createClient } from "@/utils/supabase/server";
import { NewClientForm } from "./new-client-form";

export default async function Home() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, contact_email, notes");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Clients</h1>

      <NewClientForm />

      {!clients || clients.length === 0 ? (
        <p className="mt-6 text-muted-foreground">No clients yet</p>
      ) : (
        <ul className="mt-6 divide-y rounded-lg border">
          {clients.map((client) => (
            <li key={client.id} className="px-4 py-3">
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-muted-foreground">
                {client.contact_email}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

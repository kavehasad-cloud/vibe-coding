import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { NewProjectForm } from "../../new-project-form";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("name, contact_email")
    .eq("id", id)
    .single();

  if (!client) {
    notFound();
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, created_at")
    .eq("client_id", id)
    .order("created_at");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Back to clients
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {client.name}
      </h1>
      {client.contact_email ? (
        <p className="mt-1 text-muted-foreground">{client.contact_email}</p>
      ) : null}

      <h2 className="mt-8 text-xl font-medium">Projects</h2>

      {!projects || projects.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No projects yet</p>
      ) : (
        <ul className="mt-4 divide-y rounded-lg border">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <p className="font-medium">{project.name}</p>
              <span className="shrink-0 text-sm text-muted-foreground">
                {project.status}
              </span>
            </li>
          ))}
        </ul>
      )}

      <NewProjectForm clientId={id} />
    </main>
  );
}

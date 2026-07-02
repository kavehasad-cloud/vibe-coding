import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, HEALTH_STYLES } from "@/app/status-labels";

async function logout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function PortalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("client_id")
    .eq("id", user.id)
    .single();

  if (!profile?.client_id) {
    redirect("/login");
  }

  const { data: client } = await supabase
    .from("clients")
    .select("name")
    .eq("id", profile.client_id)
    .single();

  if (!client) {
    redirect("/login");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, health")
    .eq("client_id", profile.client_id)
    .order("created_at");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{client.name}</h1>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </div>

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
              <Link
                href={`/clients/${profile.client_id}/projects/${project.id}`}
                className="min-w-0 truncate font-medium hover:underline"
              >
                {project.name}
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {STATUS_LABELS[project.status] ?? project.status}
                </span>
                {project.status === "active" || project.status === "on_hold" ? (
                  <span
                    className={`rounded-md border px-2 py-1 text-sm capitalize ${
                      HEALTH_STYLES[project.health] ?? ""
                    }`}
                  >
                    {project.health}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

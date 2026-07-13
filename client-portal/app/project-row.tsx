"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateProjectAction,
  deleteProjectAction,
  type CreateClientState,
} from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectStatusSelect } from "./project-status-select";
import { ProjectHealthSelect } from "./project-health-select";
import { confirmDeleteProject } from "./confirm-delete";

type Project = {
  id: string;
  name: string;
  status: string;
  health: string;
};

const initialState: CreateClientState = {};

export function ProjectRow({
  project,
  clientId,
}: {
  project: Project;
  clientId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateProjectAction,
    initialState
  );

  // Leave edit mode once a save succeeds.
  useEffect(() => {
    if (state.success) setEditing(false);
  }, [state]);

  if (editing) {
    return (
      <li className="px-4 py-3">
        <form
          action={formAction}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <input type="hidden" name="id" value={project.id} />
          <input type="hidden" name="client_id" value={clientId} />
          <Input
            name="name"
            required
            defaultValue={project.name}
            placeholder="Project name"
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
        {state.error ? (
          <p className="mt-2 text-sm text-destructive">{state.error}</p>
        ) : null}
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <Link
        href={`/clients/${clientId}/projects/${project.id}`}
        className="min-w-0 truncate font-medium hover:underline"
      >
        {project.name}
      </Link>
      <div className="flex shrink-0 items-center gap-2">
        {project.status === "active" || project.status === "on_hold" ? (
          <ProjectHealthSelect
            projectId={project.id}
            clientId={clientId}
            currentHealth={project.health}
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
        <ProjectStatusSelect
          projectId={project.id}
          clientId={clientId}
          currentStatus={project.status}
        />
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <form
          action={deleteProjectAction}
          onSubmit={(e) => {
            if (!confirmDeleteProject(project.name)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={project.id} />
          <input type="hidden" name="client_id" value={clientId} />
          <Button
            size="sm"
            variant="outline"
            type="submit"
            className="text-graphite hover:text-destructive"
          >
            Delete
          </Button>
        </form>
      </div>
    </li>
  );
}

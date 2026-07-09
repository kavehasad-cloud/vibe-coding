// Confirm for deleting a client, used by the dashboard box controls
// (client-box-controls.tsx). A client delete cascades in the DB to all of its
// projects, and each project to its milestones and risks (FK on delete cascade),
// so the message spells out the blast radius. Returns true to proceed.
export function confirmDeleteClient(
  name: string,
  projectCount: number
): boolean {
  const message =
    projectCount > 0
      ? `Delete ${name}? This will also permanently delete their ${projectCount} project${
          projectCount === 1 ? "" : "s"
        }, along with all milestones, risks, and allocations. This cannot be undone.`
      : `Delete ${name}? This cannot be undone.`;
  return confirm(message);
}

// Confirm for deleting a single project. Deleting a project cascades in the DB
// to its milestones, risks, and allocations (FK on delete cascade), so the
// message names the full blast radius. Returns true to proceed.
export function confirmDeleteProject(name: string): boolean {
  return confirm(
    `Delete ${name}? This will also permanently delete all of its milestones, risks, and allocations. This cannot be undone.`
  );
}

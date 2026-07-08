import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSessionRole, logout } from "@/app/auth";

// Shared, role-aware top bar for every authenticated page. Self-fetches the
// role so each page only needs to drop <NavBar /> at the top of its <main>.
// Left: app-name home link (→ /dashboard for admin, → /portal for client).
// Right: the shared Log out action.
export async function NavBar() {
  const { homeHref } = await getSessionRole();

  return (
    <nav className="mb-8 flex items-center justify-between border-b pb-4">
      <Link
        href={homeHref}
        className="text-lg font-semibold tracking-tight hover:underline"
      >
        Client Portal
      </Link>
      <form action={logout}>
        <Button type="submit" variant="outline" size="sm">
          Log out
        </Button>
      </form>
    </nav>
  );
}

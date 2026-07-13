import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSessionRole, logout } from "@/app/auth";
import { NavMenu, type NavItem } from "@/app/nav-menu";

// Role → menu items. Extend by adding a line to a role's array (e.g. Reports,
// Settings). Only REAL destinations — no dead/404 links. Client has no items
// today: their one page, /portal, is already the logo's home link.
const NAV_ITEMS: Record<string, NavItem[]> = {
  admin: [{ label: "Dashboard", href: "/dashboard" }],
  client: [],
};

// Shared, role-aware top bar — identical on every authenticated page (DESIGN §4.6).
// Full-width, slim (52px), one hairline Platinum divider, no shadow.
// Left: EDON lockup → home (role-aware) + horizontal menu. Right: quiet Log out.
export async function NavBar() {
  const { role, homeHref } = await getSessionRole();
  const items = NAV_ITEMS[role] ?? [];

  return (
    <nav className="flex h-13 w-full items-center justify-between border-b px-6">
      <div className="flex items-center gap-6">
        <Link href={homeHref} aria-label="EDON — Home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/EDON_lockup_navy.svg"
            alt="EDON — Home"
            className="h-6 w-auto"
          />
        </Link>
        <NavMenu items={items} />
      </div>
      <form action={logout}>
        <Button type="submit" variant="outline" size="sm">
          Log out
        </Button>
      </form>
    </nav>
  );
}

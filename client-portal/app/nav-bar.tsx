import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSessionRole, logout } from "@/app/auth";

// Shared, role-aware top bar — identical on every authenticated page (DESIGN §4.6).
// Full-width, slim (52px), one hairline Platinum divider, no shadow.
// Left: EDON grid mark → home (role-aware). Right: quiet Log out.
export async function NavBar() {
  const { homeHref } = await getSessionRole();

  return (
    <nav className="flex h-13 w-full items-center justify-between border-b px-6">
      <Link href={homeHref} aria-label="EDON — Home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/EDON_gridmark_navy.svg"
          alt="EDON — Home"
          className="h-7 w-7"
        />
      </Link>
      <form action={logout}>
        <Button type="submit" variant="outline" size="sm">
          Log out
        </Button>
      </form>
    </nav>
  );
}

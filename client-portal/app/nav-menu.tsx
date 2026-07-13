"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export type NavItem = { label: string; href: string };

// The horizontal menu that sits beside the logo. A client island (the server
// NavBar can't read the current route) built on shadcn's NavigationMenu — flat
// links only, no flyout, so `viewport={false}` keeps it shadowless per the EDON
// register. The matching route gets a quiet ocean-tint active state (DESIGN §5).
export function NavMenu({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  // Nothing to show (e.g. client role today) → render nothing, not an empty bar.
  if (items.length === 0) return null;

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList className="gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                asChild
                active={active}
                className="px-3 py-1.5 text-sm font-medium text-graphite transition-colors hover:bg-ocean-tint hover:text-ink data-active:bg-ocean-tint data-active:text-ink"
              >
                <Link href={item.href}>{item.label}</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

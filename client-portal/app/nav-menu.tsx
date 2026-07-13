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
                className="rounded-none border-b-2 border-transparent px-1 pt-1.5 pb-1 text-sm text-muted-foreground transition-colors hover:bg-transparent hover:text-ink focus:bg-transparent data-active:border-ocean data-active:bg-transparent data-active:font-medium data-active:text-ink"
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

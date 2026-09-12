"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@content/types";

/**
 * Primary navigation.
 *
 * Both the name and the item list come from the CMS, so reordering the nav or
 * turning Writing on is done in Site Settings — this component never changes
 * for either. The routes themselves stay a fixed list in the schema: letting an
 * editor retype a URL is how a personal site grows dead links.
 */
const DARK_ROUTES = ["/gallery"];

export function Navigation({ name, items }: { name: string; items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const [atTop, setAtTop] = useState(false);

  // Never leave the panel open across a route change. Adjusted during render
  // rather than in an effect, which avoids a second render pass.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Whether the page is still at rest at the very top. Not from scrollSignal:
  // that publishes velocity for rAF consumers, and this is a boolean that has
  // to be right when nothing is moving. React bails out when the value is
  // unchanged, so the listener costs a comparison per scroll event.
  //
  // Frosted is the default and the no-JS state — the veil is what keeps the
  // nav readable once anything is behind it, so it may only ever be removed
  // by code that has confirmed there is nothing there.
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Routes on the dark ground invert the chrome with them, so the nav never
  // sits over a black page as a pale bar.
  const dark = DARK_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  return (
    <nav
      data-site-nav
      aria-label="Primary"
      className={cn(
        "sticky top-0 z-50 w-full",
        // Frosted rather than tinted on light: the ground is a wash, so any
        // flat fill — paper included — paints a visible band across it. A
        // white veil over a real blur keeps the hue showing through and still
        // separates the nav from whatever scrolls under it.
        //
        // At the top of the page there is nothing behind the nav to separate
        // it from, and the veil is the one thing that breaks the wash, so it
        // comes off. The blur stays on either way: blurring a smooth gradient
        // changes nothing, which is what keeps the transition from popping.
        //
        // Opaque on dark: the body behind the nav is still paper, so a
        // translucent dark bar would read as grey.
        dark
          ? "on-void bg-void"
          : cn(
              "backdrop-blur-md transition-colors duration-[--duration-fast]",
              !atTop && "bg-white/55",
            ),
      )}
    >
      <div className="shell">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link href="/" className="text-small font-medium tracking-tight" aria-label={`${name} — home`}>
            {name}
          </Link>

          {/* Desktop */}
          <ul className="hidden items-center gap-8 md:flex">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "text-small link-underline transition-colors duration-[--duration-fast]",
                    isActive(item.href) ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile */}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="meta md:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <hr className="rule" />

      <div
        id="mobile-nav"
        hidden={!open}
        className={cn("md:hidden", dark ? "bg-void" : "bg-white/80 backdrop-blur-md")}
      >
        <ul className="shell flex flex-col py-4">
          {items.map((item) => (
            <li key={item.href} className="border-b border-rule last:border-0">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn("text-title block py-4", isActive(item.href) ? "text-ink" : "text-muted")}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

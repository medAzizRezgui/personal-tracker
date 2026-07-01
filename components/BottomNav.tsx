"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  CalendarRange,
  Briefcase,
  Dumbbell,
  MoreHorizontal,
} from "lucide-react";

const TABS = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/week", label: "Week", icon: CalendarRange },
  { href: "/work", label: "Work", icon: Briefcase },
  { href: "/gym", label: "Gym", icon: Dumbbell },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="sticky bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-xl">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium"
                style={{ color: active ? "var(--accent)" : "var(--faint)" }}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

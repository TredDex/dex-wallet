"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  ArrowLeftRight,
  Activity,
  Settings,
} from "lucide-react";

const navItems = [
  {
    label: "Wallet",
    href: "/",
    icon: Wallet,
  },
  {
    label: "Swap",
    href: "/swap",
    icon: ArrowLeftRight,
  },
  {
    label: "Activity",
    href: "/activity",
    icon: Activity,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary navigation">
      <div className="mobile-bottom-nav-inner">
        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${
                active ? "active" : ""
              }`}
            >
              <div
                className={`mobile-nav-icon ${
                  active ? "active" : ""
                }`}
              >
                <Icon size={21} strokeWidth={active ? 2 : 1.8} />
              </div>

              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

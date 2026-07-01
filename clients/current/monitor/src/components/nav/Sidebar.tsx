"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wifi,
  Activity,
  ScrollText,
  Users,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/connections", label: "Connections", icon: Wifi },
  { href: "/traffic", label: "Traffic", icon: Activity },
  { href: "/logs", label: "Logs", icon: ScrollText },
  { href: "/users", label: "Users", icon: Users },
  { href: "/system", label: "System", icon: Server },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-card border-r">
      <div className="px-5 py-5 border-b">
        <span className="font-bold text-base tracking-tight">MikroTik Monitor</span>
        <p className="text-xs text-muted-foreground mt-0.5">RouterOS Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const MainNavbar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Journal",
      href: "/user/journal/my-diary",
    },
    {
      name: "Analysis",
      href: "/user//analysis/entries-analysis",
    },
    {
      name: "Settings",
      href: "/user/settings",
    },
  ];

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar; 
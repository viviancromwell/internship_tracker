"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import strideFullColor from "@/assets/icons/stride-full-color.svg";

const navItems = [
  { href: "/todo", label: "Todo" },
  { href: "/internships", label: "Internships" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-30 bg-neutral-50 border-b border-tan/60">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-10 py-4">
        {/* Logo */}
        <Link href="/internships">
          <Image src={strideFullColor} alt="Stride" height={32} />
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-charcoal"
                    : "text-neutral-500 hover:text-charcoal"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User / Sign out */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-charcoal hidden sm:inline">
            {session?.user?.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-charcoal transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

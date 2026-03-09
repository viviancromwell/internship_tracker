"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Briefcase, User, LogOut } from "lucide-react";
import strideLogo from "@/assets/icons/stride-logo-on-light.png";

const navItems = [
  { href: "/internships", label: "Internships", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col border-r border-tan bg-neutral-50 z-30">
      <div className="p-6 border-b border-tan">
        <Image src={strideLogo} alt="Stride" height={36} className="w-auto" />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-tan">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-charcoal">
            {session?.user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-charcoal truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-muted truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-muted hover:bg-neutral-100 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

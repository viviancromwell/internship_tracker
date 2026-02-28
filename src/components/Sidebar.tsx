"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Briefcase,
  User,
  LogOut,
  GraduationCap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/internships", label: "Internships", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const field = (session?.user as Record<string, unknown>)?.field as string;
  const isDesign = field === "design";

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 flex flex-col border-r z-30"
      style={{
        background: isDesign
          ? "linear-gradient(180deg, #fdf2f8, #faf5ff)"
          : "linear-gradient(180deg, #eff6ff, #f0f9ff)",
        borderColor: isDesign ? "#fbcfe8" : "#bfdbfe",
      }}
    >
      <div
        className="p-6 border-b"
        style={{ borderColor: isDesign ? "#fbcfe8" : "#bfdbfe" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: isDesign
                ? "linear-gradient(135deg, #ec4899, #a855f7)"
                : "linear-gradient(135deg, #2563eb, #1e3a5f)",
            }}
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-gray-900">
              Internship Tracker
            </h2>
            <p className="text-xs text-gray-500">
              {isDesign ? "Design & Creative" : "Political Science"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: isActive
                  ? isDesign
                    ? "linear-gradient(135deg, #ec4899, #a855f7)"
                    : "linear-gradient(135deg, #2563eb, #1e3a5f)"
                  : "transparent",
                color: isActive ? "#fff" : "#4b5563",
              }}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div
        className="p-4 border-t"
        style={{ borderColor: isDesign ? "#fbcfe8" : "#bfdbfe" }}
      >
        <div className="flex items-center gap-3 mb-3 px-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{
              background: isDesign
                ? "linear-gradient(135deg, #ec4899, #a855f7)"
                : "linear-gradient(135deg, #2563eb, #1e3a5f)",
            }}
          >
            {session?.user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

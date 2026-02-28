"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Star,
} from "lucide-react";

interface InternshipItem {
  id: string;
  company: string;
  role: string;
  category: string;
  location: string;
  deadline: string | null;
  availability: string;
  paid: boolean;
  status: string;
  priority: number;
}

const DESIGN_STATUSES = [
  "Not Started",
  "Researching",
  "Applied",
  "Portfolio Review",
  "Interview",
  "Offered",
  "Accepted",
  "Rejected",
];
const POLISCI_STATUSES = [
  "Not Started",
  "Researching",
  "Applied",
  "Interview",
  "Offered",
  "Accepted",
  "Rejected",
];

function getDeadlineInfo(deadline: string | null) {
  if (!deadline) return null;
  const match = deadline.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (!match) return null;
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const m = months[match[1].toLowerCase().substring(0, 3)];
  if (m === undefined) return null;
  const d = new Date(parseInt(match[3]), m, parseInt(match[2]));
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const days = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  return { days, isUrgent: days > 0 && days <= 7, isPast: days < 0 };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<InternshipItem[]>([]);
  const [loading, setLoading] = useState(true);

  const field = (session?.user as Record<string, unknown>)?.field as string;
  const isDesign = field === "design";
  const statuses = isDesign ? DESIGN_STATUSES : POLISCI_STATUSES;

  useEffect(() => {
    fetch("/api/internships")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.internships || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const total = items.length;
  const applied = items.filter((i) =>
    ["Applied", "Portfolio Review", "Interview", "Offered", "Accepted"].includes(i.status)
  ).length;
  const urgent = items.filter((i) => {
    const info = getDeadlineInfo(i.deadline);
    return info?.isUrgent && !["Rejected", "Accepted"].includes(i.status);
  });
  const openNow = items.filter((i) => i.availability === "open").length;
  const highPriority = items.filter((i) => i.priority === 3);

  const statusCounts = statuses
    .map((s) => ({ name: s, count: items.filter((i) => i.status === s).length }))
    .filter((s) => s.count > 0);

  const gradientStyle = isDesign
    ? "linear-gradient(135deg, #ec4899, #a855f7)"
    : "linear-gradient(135deg, #2563eb, #1e3a5f)";

  return (
    <div>
      <div
        className="rounded-2xl p-8 text-white mb-8"
        style={{ background: gradientStyle }}
      >
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="opacity-80">
          {isDesign
            ? "Design & Creative Arts Internship Tracker"
            : "Political Science Internship Tracker"}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Tracked", value: total, icon: Briefcase, color: "#6366f1" },
          { label: "Applied+", value: applied, icon: CheckCircle, color: "#10b981" },
          { label: "Open Now", value: openNow, icon: Clock, color: "#f59e0b" },
          { label: "Urgent", value: urgent.length, icon: AlertTriangle, color: "#ef4444" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: stat.color + "18" }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Pipeline</h2>
            <Link
              href="/internships"
              className="text-sm font-semibold flex items-center gap-1 hover:underline"
              style={{ color: isDesign ? "#ec4899" : "#2563eb" }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {statusCounts.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-28 text-sm font-medium text-gray-600 truncate">
                  {s.name}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center pl-2"
                    style={{
                      width: `${Math.max((s.count / total) * 100, 8)}%`,
                      background: gradientStyle,
                    }}
                  >
                    <span className="text-xs font-bold text-white">{s.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {urgent.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-5">
              <h2 className="text-base font-bold text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Urgent Deadlines
              </h2>
              <div className="space-y-2">
                {urgent.slice(0, 3).map((i) => {
                  const info = getDeadlineInfo(i.deadline);
                  return (
                    <div key={i.id} className="bg-white rounded-lg p-3 border border-red-100">
                      <div className="font-semibold text-sm text-gray-900">{i.company}</div>
                      <div className="text-xs text-gray-500">{i.role}</div>
                      <div className="text-xs font-bold text-red-600 mt-1">
                        {info?.days} day{info?.days !== 1 ? "s" : ""} left
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {highPriority.length > 0 && (
            <div
              className="rounded-xl border p-5"
              style={{
                background: isDesign ? "#fdf2f8" : "#eff6ff",
                borderColor: isDesign ? "#fbcfe8" : "#bfdbfe",
              }}
            >
              <h2
                className="text-base font-bold mb-3 flex items-center gap-2"
                style={{ color: isDesign ? "#be185d" : "#1e40af" }}
              >
                <Star className="w-4 h-4" /> High Priority
              </h2>
              <div className="space-y-2">
                {highPriority.slice(0, 4).map((i) => (
                  <div
                    key={i.id}
                    className="bg-white rounded-lg p-3 border"
                    style={{ borderColor: isDesign ? "#fce7f3" : "#dbeafe" }}
                  >
                    <div className="font-semibold text-sm text-gray-900">{i.company}</div>
                    <div className="text-xs text-gray-500">{i.role}</div>
                    <div className="flex gap-2 mt-1">
                      {i.paid && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                          PAID
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{i.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

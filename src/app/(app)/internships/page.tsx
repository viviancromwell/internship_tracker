"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Calendar } from "lucide-react";

interface Tooltip {
  about: string | null;
  candidate: string | null;
  skills: string | null;
  materials: string | null;
}

interface InternshipItem {
  id: string;
  company: string;
  role: string;
  category: string;
  location: string;
  description: string;
  url: string | null;
  deadline: string | null;
  period: string | null;
  paid: boolean;
  availability: string;
  undergradEligible: boolean;
  contact: string | null;
  tooltip: Tooltip;
  status: string;
  priority: number;
  notes: string | null;
}

const DESIGN_CATEGORIES = ["Design Studios", "Game Companies", "Tech/Product Design", "Creative Agencies", "Media & Entertainment", "Animation & VFX", "Other"];
const POLISCI_CATEGORIES = ["Government & Policy", "Nonprofits & Advocacy", "Legal & Law", "Campaign & Political Orgs", "Research & Think Tanks"];
const DESIGN_STATUSES = ["Not Started", "Researching", "Applied", "Portfolio Review", "Interview", "Offered", "Accepted", "Rejected"];
const POLISCI_STATUSES = ["Not Started", "Researching", "Applied", "Interview", "Offered", "Accepted", "Rejected"];

const SC: Record<string, string> = {
  "Not Started": "#D8C3A5", "Researching": "#60a5fa", "Applied": "#a78bfa",
  "Portfolio Review": "#f59e0b", "Interview": "#34d399", "Offered": "#818cf8", "Accepted": "#10b981", "Rejected": "#f87171",
};
const AVAIL: Record<string, string> = { open: "#E85A4F", soon: "#D8C3A5", closed: "#DC2626", check: "#8E8D8A" };
const AVAIL_LABEL: Record<string, string> = { open: "Open Now", soon: "Opening Soon", closed: "Closed", check: "Check Status" };

function getGoogleCalendarUrl(item: { company: string; role: string; deadline: string | null; url: string | null }) {
  if (!item.deadline) return null;
  const match = item.deadline.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (!match) return null;
  const months: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  const m = months[match[1].toLowerCase().substring(0, 3)];
  if (m === undefined) return null;
  const d = new Date(parseInt(match[3]), m, parseInt(match[2]));
  if (isNaN(d.getTime())) return null;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const next = new Date(d); next.setDate(next.getDate() + 1);
  const endStr = `${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`;
  const title = encodeURIComponent(`DEADLINE: ${item.company} - ${item.role}`);
  const details = encodeURIComponent(`Internship application deadline\n${item.url || ""}`);
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${endStr}&details=${details}`;
}

function getDeadlineInfo(deadline: string | null) {
  if (!deadline) return null;
  const match = deadline.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (!match) return null;
  const months: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  const m = months[match[1].toLowerCase().substring(0, 3)];
  if (m === undefined) return null;
  const d = new Date(parseInt(match[3]), m, parseInt(match[2]));
  if (isNaN(d.getTime())) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0); d.setHours(0, 0, 0, 0);
  const days = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  return { days, isUrgent: days > 0 && days <= 7, isPast: days < 0 };
}

export default function InternshipsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<InternshipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [avFilter, setAvFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showUndergradOnly, setShowUndergradOnly] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [view, setView] = useState<"list" | "board">("list");
  const [sortBy, setSortBy] = useState<"priority" | "deadline">("priority");
  const [tipId, setTipId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saveMsg, setSaveMsg] = useState("");

  const field = (session?.user as Record<string, unknown>)?.field as string;
  const categories = field === "design" ? DESIGN_CATEGORIES : POLISCI_CATEGORIES;
  const statuses = field === "design" ? DESIGN_STATUSES : POLISCI_STATUSES;

  useEffect(() => {
    fetch("/api/internships").then(r => r.json()).then(d => { setItems(d.internships || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const updateTracking = useCallback(async (internshipId: string, data: Record<string, unknown>) => {
    const res = await fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internshipId, ...data }),
    });
    if (res.ok) {
      setItems(prev => prev.map(i => i.id === internshipId ? { ...i, ...data } as InternshipItem : i));
      setSaveMsg("Saved"); setTimeout(() => setSaveMsg(""), 2000);
    }
  }, []);

  const filtered = items.filter(i => {
    const mc = filter === "All" || i.category === filter;
    const ma = avFilter === "all" || i.availability === avFilter;
    const ms = !search || [i.company, i.role, i.description, i.location].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const mu = !showUndergradOnly || i.undergradEligible;
    const mp = priorityFilter === "all" || (priorityFilter === "high" && i.priority === 3) || (priorityFilter === "any" && i.priority > 0);
    return mc && ma && ms && mu && mp;
  }).sort((a, b) => {
    if (sortBy === "deadline") {
      const da = getDeadlineInfo(a.deadline);
      const db = getDeadlineInfo(b.deadline);
      const ta = da ? da.days : Infinity;
      const tb = db ? db.days : Infinity;
      if (ta !== tb) return ta - tb;
      return b.priority - a.priority;
    }
    return b.priority - a.priority;
  });

  const stats = statuses.map(s => ({ n: s, c: items.filter(i => i.status === s).length })).filter(s => s.c > 0);

  const emptyForm = { company: "", role: "", category: categories[0], location: "", description: "", url: "", deadline: "", period: "", paid: false, availability: "check", undergradEligible: true, contact: "", tooltip: { about: "", candidate: "", skills: "", materials: "" } };

  const startEdit = (item: InternshipItem) => { setEditing(item.id); setForm({ ...item }); setAdding(false); };
  const startAdd = () => { setAdding(true); setEditing(null); setForm({ ...emptyForm }); };
  const cancel = () => { setEditing(null); setAdding(false); setForm({}); };

  const save = async () => {
    if (adding) {
      const res = await fetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newI = await res.json();
        setItems(prev => [...prev, { ...newI, status: "Not Started", priority: 0, notes: null, description: (form as Record<string, string>).description || "", tooltip: (form as Record<string, unknown>).tooltip as Tooltip || { about: null, candidate: null, skills: null, materials: null } }]);
        setAdding(false);
        setSaveMsg("Added"); setTimeout(() => setSaveMsg(""), 2000);
      }
    } else if (editing) {
      const res = await fetch("/api/internships", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing, ...form }),
      });
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === editing ? { ...i, ...form } as InternshipItem : i));
        setEditing(null);
        setSaveMsg("Updated"); setTimeout(() => setSaveMsg(""), 2000);
      }
    }
    setForm({});
  };

  const deleteItem = async (id: string) => {
    const res = await fetch(`/api/internships?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== id));
      setDelId(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-neutral-400 text-lg">Loading internships...</div></div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="rounded-2xl p-6 text-white mb-6 bg-charcoal">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">{field === "design" ? "Design Internships" : "PoliSci Internships"}</h1>
            <p className="opacity-70 text-sm mt-1">{items.length} opportunities tracked</p>
          </div>
          <div className="flex gap-2 items-center">
            {saveMsg && <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">{saveMsg}</span>}
          </div>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {stats.map(s => (
            <span key={s.n} className="bg-white/15 rounded-full px-3 py-1 text-xs flex items-center gap-2 font-semibold">
              <span className="w-2 h-2 rounded-full" style={{ background: SC[s.n] }} /> {s.n}: {s.c}
            </span>
          ))}
        </div>
      </div>

      {/* Urgent alerts */}
      {(() => {
        const urgent = items.filter(i => { const info = getDeadlineInfo(i.deadline); return info?.isUrgent && !["Rejected", "Accepted"].includes(i.status); });
        if (urgent.length === 0) return null;
        return (
          <div className="bg-destructive-50 border-2 border-destructive-200 rounded-xl p-5 mb-6">
            <h3 className="text-base font-bold text-destructive-700 flex items-center gap-2 mb-3">Deadlines This Week ({urgent.length})</h3>
            {urgent.map(i => { const info = getDeadlineInfo(i.deadline); return (
              <div key={i.id} className="bg-neutral-50 rounded-lg p-3 mb-2 border border-destructive-200 flex justify-between items-center flex-wrap gap-2">
                <div><strong className="text-neutral-900 text-sm">{i.company}</strong> <span className="text-muted text-sm ml-2">&mdash; {i.role}</span></div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-bold text-destructive-500">{info?.days} day{info?.days !== 1 ? "s" : ""} left</span>
                  <button onClick={() => updateTracking(i.id, { status: "Researching" })} className="px-3 py-1 bg-destructive-600 text-white border-none rounded-lg text-xs font-semibold cursor-pointer">Start Now</button>
                </div>
              </div>
            ); })}
          </div>
        );
      })()}

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-4 py-2.5 border border-tan rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2.5 border border-tan rounded-xl text-sm bg-neutral-50 font-semibold">
          <option>All</option>{categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={avFilter} onChange={e => setAvFilter(e.target.value)} className="px-3 py-2.5 border border-tan rounded-xl text-sm bg-neutral-50 font-semibold">
          <option value="all">All Availability</option>
          {Object.entries(AVAIL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="px-3 py-2.5 border border-tan rounded-xl text-sm bg-neutral-50 font-semibold">
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="any">Any Priority</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as "priority" | "deadline")} className="px-3 py-2.5 border border-tan rounded-xl text-sm bg-neutral-50 font-semibold">
          <option value="priority">Sort: Priority</option>
          <option value="deadline">Sort: Due Date</option>
        </select>
        <button onClick={() => setShowUndergradOnly(!showUndergradOnly)}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 cursor-pointer transition-all ${
            showUndergradOnly ? "bg-primary text-white border-primary" : "bg-neutral-50 text-neutral-500 border-tan"
          }`}>
          {showUndergradOnly ? "Undergrad Only" : "Show All"}
        </button>
        <div className="flex border-2 border-tan rounded-xl overflow-hidden">
          {(["list", "board"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-2.5 border-none text-sm font-semibold cursor-pointer ${
                view === v ? "bg-primary text-white" : "bg-neutral-50 text-neutral-500"
              }`}>
              {v === "list" ? "List" : "Board"}
            </button>
          ))}
        </div>
        <button onClick={startAdd} className="px-5 py-2.5 text-white border-none rounded-xl cursor-pointer font-semibold text-sm bg-primary hover:bg-accent transition-colors">+ Add</button>
      </div>

      {/* Edit/Add Form */}
      {(editing || adding) && (
        <div className="rounded-xl border-2 border-tan p-6 mb-5 bg-neutral-50">
          <h3 className="text-lg font-bold mb-4 text-primary">{adding ? "Add New" : "Edit"} Internship</h3>
          <div className="grid grid-cols-2 gap-3">
            {([["company", "Company/Org"], ["role", "Role"], ["location", "Location"], ["deadline", "Deadline"], ["period", "Period"], ["url", "URL"], ["contact", "Contact"]] as const).map(([k, l]) => (
              <div key={k}><label className="block text-xs font-semibold text-muted mb-1">{l}</label>
                <input value={(form as Record<string, string>)[k] || ""} onChange={e => setForm({ ...form, [k]: e.target.value })}
                  className="w-full px-3 py-2 border border-tan rounded-lg text-sm" /></div>
            ))}
            <div><label className="block text-xs font-semibold text-muted mb-1">Category</label>
              <select value={(form as Record<string, string>).category || ""} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-tan rounded-lg text-sm">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select></div>
            <div><label className="block text-xs font-semibold text-muted mb-1">Availability</label>
              <select value={(form as Record<string, string>).availability || "check"} onChange={e => setForm({ ...form, availability: e.target.value })}
                className="w-full px-3 py-2 border border-tan rounded-lg text-sm">
                {Object.entries(AVAIL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select></div>
            <div className="col-span-2"><label className="block text-xs font-semibold text-muted mb-1">Notes / Description</label>
              <textarea value={(form as Record<string, string>).description || ""} onChange={e => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full px-3 py-2 border border-tan rounded-lg text-sm resize-y" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={(form as Record<string, boolean>).paid || false} onChange={e => setForm({ ...form, paid: e.target.checked })} /><label className="text-sm text-neutral-600 font-semibold">Paid</label></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={(form as Record<string, boolean>).undergradEligible !== false} onChange={e => setForm({ ...form, undergradEligible: e.target.checked })} /><label className="text-sm text-neutral-600 font-semibold">Undergrad Eligible</label></div>
          </div>
          <div className="mt-4 p-4 rounded-lg border border-tan bg-white">
            <h4 className="text-xs font-bold mb-3 text-primary">Details (Tooltip)</h4>
            <div className="grid grid-cols-2 gap-3">
              {([["about", "About"], ["candidate", "Ideal Candidate"], ["skills", "Skills"], ["materials", "Materials"]] as const).map(([k, l]) => (
                <div key={k}><label className="block text-xs text-muted mb-1">{l}</label>
                  <textarea value={((form as Record<string, Record<string, string>>).tooltip)?.[k] || ""} rows={2}
                    onChange={e => setForm({ ...form, tooltip: { ...((form as Record<string, Record<string, string>>).tooltip || {}), [k]: e.target.value } })}
                    className="w-full px-3 py-2 border border-tan rounded-lg text-xs resize-y" /></div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} className="px-6 py-2 text-white border-none rounded-xl cursor-pointer font-semibold text-sm bg-primary hover:bg-accent transition-colors">Save</button>
            <button onClick={cancel} className="px-6 py-2 bg-neutral-100 text-muted border-none rounded-xl cursor-pointer font-semibold text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* List View */}
      {view === "list" ? (
        <div className="flex flex-col gap-3">
          {filtered.map(item => (
            <div key={item.id} className="bg-neutral-50 border border-tan rounded-xl p-5" style={{ borderLeft: `4px solid ${SC[item.status] || "#94a3b8"}` }}>
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-neutral-900 m-0">{item.company}</h3>
                    <select value={item.priority} onChange={e => updateTracking(item.id, { priority: parseInt(e.target.value) })}
                      className="px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                      style={{
                        border: `2px solid ${item.priority === 3 ? "#ef4444" : item.priority === 2 ? "#f59e0b" : item.priority === 1 ? "#3b82f6" : "#d1d5db"}`,
                        background: item.priority === 3 ? "#fef2f2" : item.priority === 2 ? "#fffbeb" : item.priority === 1 ? "#eff6ff" : "var(--color-neutral-50)",
                        color: item.priority === 3 ? "#ef4444" : item.priority === 2 ? "#d97706" : item.priority === 1 ? "#2563eb" : "var(--color-neutral-500)",
                      }}>
                      <option value="0">No Priority</option>
                      <option value="1">Low</option>
                      <option value="2">Medium</option>
                      <option value="3">High Priority</option>
                    </select>
                    {item.paid && <span className="bg-tan text-neutral-800 px-2 py-0.5 rounded-full text-xs font-bold border border-tan">PAID</span>}
                    {item.availability && <span className="px-2 py-0.5 rounded-full text-xs font-bold border" style={{ background: AVAIL[item.availability] + "18", color: AVAIL[item.availability], borderColor: AVAIL[item.availability] + "44" }}>{AVAIL_LABEL[item.availability]}</span>}
                  </div>
                  <p className="text-sm text-muted mt-1">{item.role} &bull; {item.location}</p>
                </div>
                <select value={item.status} onChange={e => updateTracking(item.id, { status: e.target.value })}
                  className="px-3 py-2 border border-tan rounded-lg text-xs font-semibold" style={{ background: (SC[item.status] || "#94a3b8") + "22" }}>
                  {statuses.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="mt-2.5 flex gap-3 flex-wrap text-xs text-muted font-semibold">
                <span>{item.category}</span>
                <span className="flex items-center gap-1">
                  {item.deadline || "Check listing"}
                  {(() => {
                    const calUrl = getGoogleCalendarUrl(item);
                    if (!calUrl) return null;
                    return <a href={calUrl} target="_blank" rel="noopener noreferrer" title="Add deadline to Google Calendar" className="hover:opacity-70 transition-opacity"><Calendar size={13} color="#4285F4" /></a>;
                  })()}
                </span>
                {(() => {
                  const info = getDeadlineInfo(item.deadline);
                  if (info?.isUrgent) return <span className="bg-destructive-50 text-destructive-500 px-2 py-0.5 rounded-full font-bold border border-destructive-200 animate-pulse-slow">{info.days} DAY{info.days !== 1 ? "S" : ""} LEFT</span>;
                  if (info?.isPast) return <span className="text-neutral-400 line-through">Deadline Passed</span>;
                  return null;
                })()}
              </div>
              {item.period && <p className="text-xs text-muted mt-1">{item.period}</p>}
              {item.contact && <p className="text-xs text-neutral-400 mt-1">{item.contact}</p>}
              {item.description && <p className="text-xs text-muted mt-2 leading-relaxed">{item.description}</p>}
              <div className="flex gap-2 mt-3 flex-wrap items-start">
                {/* Tooltip */}
                {item.tooltip && (item.tooltip.about || item.tooltip.candidate || item.tooltip.skills || item.tooltip.materials) && (
                  <div className="relative inline-block">
                    <button onClick={e => { e.stopPropagation(); setTipId(tipId === item.id ? null : item.id); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-tan ${
                        tipId === item.id ? "bg-primary/10 text-primary" : "bg-neutral-100 text-primary"
                      }`}>
                      Details
                    </button>
                    {tipId === item.id && (
                      <div onClick={e => e.stopPropagation()} className="absolute bottom-full left-0 mb-2 z-50 w-96 bg-neutral-50 border border-tan rounded-xl shadow-xl overflow-hidden">
                        <div className="px-4 py-3 text-white bg-charcoal">
                          <div className="text-sm font-bold">{item.company}</div>
                          <div className="text-xs opacity-85">{item.role}</div>
                        </div>
                        <div className="p-4 max-h-80 overflow-y-auto">
                          {([["About", item.tooltip.about], ["Ideal Candidate", item.tooltip.candidate], ["Skills", item.tooltip.skills], ["Materials", item.tooltip.materials]] as const).map(([l, v]) => v ? (
                            <div key={l} className="mb-3">
                              <div className="text-xs font-bold uppercase tracking-wide mb-1 text-primary">{l}</div>
                              <div className="text-xs text-neutral-600 leading-relaxed">{v}</div>
                            </div>
                          ) : null)}
                        </div>
                        <div className="border-t border-tan px-4 py-2 text-right">
                          <button onClick={() => setTipId(null)} className="text-xs text-neutral-400 bg-transparent border-none cursor-pointer font-semibold">Close</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold no-underline border border-tan bg-primary/10 text-primary">Apply / View</a>}
                <button onClick={() => startEdit(item)} className="px-3 py-1.5 bg-neutral-100 text-muted border border-neutral-200 rounded-lg cursor-pointer text-xs font-semibold">Edit</button>
                {delId === item.id ? (
                  <span className="flex gap-1 items-center">
                    <span className="text-xs text-destructive-500 font-semibold">Sure?</span>
                    <button onClick={() => deleteItem(item.id)} className="px-2 py-1 bg-destructive-600 text-white border-none rounded-md cursor-pointer text-xs font-bold">Yes</button>
                    <button onClick={() => setDelId(null)} className="px-2 py-1 bg-neutral-200 border-none rounded-md cursor-pointer text-xs font-bold">No</button>
                  </span>
                ) : <button onClick={() => setDelId(item.id)} className="px-3 py-1.5 bg-destructive-50 text-destructive-500 border border-destructive-200 rounded-lg cursor-pointer text-xs font-bold">Archive</button>}
              </div>
            </div>
          ))}
          {!filtered.length && <div className="text-center py-16 text-neutral-400 text-base font-semibold">No internships match your filters.</div>}
        </div>
      ) : (
        /* Board View */
        <div className="flex gap-3 overflow-x-auto pb-4">
          {statuses.filter(s => items.some(i => i.status === s)).map(st => (
            <div key={st} className="min-w-[260px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl" style={{ background: (SC[st] || "#94a3b8") + "22", border: `2px solid ${SC[st] || "#94a3b8"}` }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: SC[st] }} />
                <span className="text-sm font-bold">{st}</span>
                <span className="text-xs text-muted ml-auto">{items.filter(i => i.status === st).length}</span>
              </div>
              {items.filter(i => i.status === st).sort((a, b) => {
                const da = getDeadlineInfo(a.deadline);
                const db = getDeadlineInfo(b.deadline);
                const ta = da ? da.days : Infinity;
                const tb = db ? db.days : Infinity;
                if (ta !== tb) return ta - tb;
                return b.priority - a.priority;
              }).map(item => (
                <div key={item.id} onClick={() => startEdit(item)} className="bg-neutral-50 border border-tan rounded-xl p-4 mb-2 cursor-pointer hover:shadow-md transition-shadow">
                  <h4 className="text-sm font-bold m-0">{item.company}</h4>
                  <p className="text-xs text-muted mt-1">{item.role}</p>
                  <p className="text-xs text-neutral-400 mt-1">{item.deadline || ""}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {item.priority > 0 && <span className="px-2 py-0.5 rounded-md text-xs font-bold"
                      style={{ background: item.priority === 3 ? "#fef2f2" : item.priority === 2 ? "#fffbeb" : "#eff6ff", color: item.priority === 3 ? "#ef4444" : item.priority === 2 ? "#d97706" : "#2563eb" }}>
                      {item.priority === 3 ? "HIGH" : item.priority === 2 ? "MED" : "LOW"}</span>}
                    {item.paid && <span className="bg-tan text-neutral-800 px-2 py-0.5 rounded-md text-xs font-bold">PAID</span>}
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: AVAIL[item.availability] + "18", color: AVAIL[item.availability] }}>{item.availability}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

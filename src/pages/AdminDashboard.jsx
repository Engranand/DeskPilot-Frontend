import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTickets } from "../api/tickets";
import { getAgents } from "../api/users";
import { LoadingState, EmptyState } from "../components/LoadingState";

const nav = [
  { label: "Overview", key: "overview", icon: IconGrid, badge: null },
  { label: "Tickets", key: "tickets", icon: IconInbox, badge: null },
  { label: "Conversations", key: "chats", icon: IconChat, badge: null },
  { label: "AI Copilot", key: "ai", icon: IconSpark, badge: "SOON" },
  { label: "Knowledge", key: "kb", icon: IconBook, badge: null },
  { label: "Agents", key: "agents", icon: IconUsers, badge: null },
  { label: "Analytics", key: "analytics", icon: IconChart, badge: null },
  { label: "Widget", key: "widget", icon: IconCode, badge: null },
  { label: "Settings", key: "settings", icon: IconGear, badge: null },
];

const AdminDashboard = () => {
  const [active, setActive] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchTickets();
    fetchAgents();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await getTickets();
      setTickets(res.data.tickets);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await getAgents();
      setAgents(res.data.agents);
    } catch (err) {
      console.error("Failed to load agents", err);
    }
  };

  // Real KPIs, calculated from actual ticket data (no more hardcoded numbers)
  const openCount = tickets.filter((t) => t.status === "open").length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  ).length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;

  const kpis = [
    { label: "Open tickets", value: String(openCount), hint: "currently unresolved" },
    { label: "In progress", value: String(inProgressCount), hint: "being worked on" },
    { label: "Resolved", value: String(resolvedCount), hint: "all time" },
    { label: "Total tickets", value: String(tickets.length), hint: "in this org" },
  ];

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  // Client-side workload count from already-fetched tickets.
  // Fine at small scale; move to a backend aggregation if ticket volume grows a lot.
  const getAgentWorkload = (agentId) => {
    return tickets.filter(
      (t) =>
        t.assignedAgentId?._id === agentId &&
        t.status !== "resolved" &&
        t.status !== "closed"
    ).length;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-display flex">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? "w-16" : "w-64"} shrink-0 border-r border-border bg-card/40 flex flex-col transition-[width] duration-200`}
      >
        <div className="h-14 flex items-center gap-2 px-4 border-b border-border">
          <div className="size-7 rounded-sm bg-foreground text-background grid place-items-center font-mono text-[10px] font-bold">
  DP
</div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight">DeskPilot</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                Admin · v1.0
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {!collapsed && (
            <div className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
              Workspace
            </div>
          )}
          {nav.map((n) => {
            const Icon = n.icon;
            const isActive = active === n.key;
            return (
              <button
                key={n.key}
                onClick={() => setActive(n.key)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-foreground/80 hover:bg-muted border border-transparent"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{n.label}</span>
                    {n.badge && (
                      <span
                        className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
                          n.badge === "LIVE"
                            ? "bg-primary text-primary-foreground blink"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {n.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-mono"
          >
            <IconChevron className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
          {!collapsed && (
            <div className="mt-2 p-2.5 rounded-md border border-border bg-background/50">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-primary/20 border border-primary/40 grid place-items-center text-xs font-bold text-primary">
                  {user?.name?.slice(0, 2).toUpperCase() || "AK"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{user?.name || "Admin"}</div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">
                    {user?.role || "admin"}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground"
                  title="Sign out"
                >
                  <IconLogout className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-border flex items-center gap-3 px-4 md:px-6 bg-background/80 backdrop-blur sticky top-0 z-20">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>/</span>
            <span className="text-foreground">admin</span>
            <span>/</span>
            <span className="text-foreground capitalize">{active}</span>
          </div>

          <div className="flex-1 max-w-md ml-auto md:ml-6">
            <div className="relative">
              <IconSearch className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search tickets, users, articles…"
                className="w-full h-9 pl-9 pr-16 rounded-md border border-input bg-background text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-muted text-muted-foreground">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-primary">
              <span className="size-1.5 rounded-full bg-primary blink" />
              LIVE
            </span>
            <span>·</span>
            <span>all systems ok</span>
          </div>

          <button className="relative size-9 grid place-items-center rounded-md border border-border hover:bg-muted transition-colors">
            <IconBell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
          </button>
          <button className="hidden md:inline-flex h-9 items-center gap-1.5 px-3 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
            <IconPlus className="size-4" /> New ticket
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-x-hidden">
          {/* Page header */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                § 01 · Overview
              </div>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">
                Good afternoon, {user?.name?.split(" ")[0] || "Admin"}.
              </h1>
              <p className="text-sm text-muted-foreground">
                Here's what's happening across your workspace today.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              {["24h", "7d", "30d", "QTD"].map((r, i) => (
                <button
                  key={r}
                  className={`px-2.5 py-1.5 rounded-md border transition-colors ${
                    i === 1
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="relative rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors group"
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
                  {k.label}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <div className="text-2xl md:text-3xl font-bold tracking-tight">{k.value}</div>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground font-mono">{k.hint}</div>
              </div>
            ))}
          </section>

          {/* Grid: chart + ai feed */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-lg border border-border bg-card p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    § Ticket volume
                  </div>
                  <div className="text-sm font-semibold mt-0.5">Last 14 days</div>
                </div>
              </div>
              <div className="mt-4 h-40 grid place-items-center text-xs text-muted-foreground font-mono border border-dashed border-border rounded-md">
                Chart coming soon — needs a volume-by-day endpoint
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  § AI Copilot activity
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                  SOON
                </span>
              </div>
              <div className="mt-4 py-8 grid place-items-center text-xs text-muted-foreground font-mono border border-dashed border-border rounded-md">
                AI Copilot isn't wired up yet — this feed will populate once
                the AI endpoint is live.
              </div>
            </div>
          </section>

          {/* Queue table */}
          <section className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-5 py-3 border-b border-border">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  § Live queue
                </div>
                <div className="text-sm font-semibold mt-0.5">Active tickets</div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono">
                {["All", "Open", "In progress", "Resolved"].map((t, i) => (
                  <button
                    key={t}
                    className={`px-2.5 py-1.5 rounded-md border transition-colors ${
                      i === 0
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-muted/40">
                    <th className="px-4 md:px-5 py-2.5 font-normal">ID</th>
                    <th className="px-2 py-2.5 font-normal">Subject</th>
                    <th className="px-2 py-2.5 font-normal hidden md:table-cell">Requester</th>
                    <th className="px-2 py-2.5 font-normal hidden lg:table-cell">Channel</th>
                    <th className="px-2 py-2.5 font-normal">AI</th>
                    <th className="px-2 py-2.5 font-normal">Priority</th>
                    <th className="px-2 py-2.5 font-normal">Status</th>
                    <th className="px-4 md:px-5 py-2.5 font-normal text-right">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={8} className="py-8"><LoadingState label="Loading tickets..." /></td></tr>
                  )}
                  {!loading && tickets.length === 0 && (
                    <tr><td colSpan={8}><EmptyState title="No tickets yet" hint="New tickets will appear here" /></td></tr>
                  )}
                  {tickets.map((t) => (
                    <tr key={t._id} className="border-t border-border hover:bg-muted/40 transition-colors">
                      <td className="px-4 md:px-5 py-3 font-mono text-xs text-muted-foreground">
                        #{t._id.slice(-4)}
                      </td>
                      <td className="px-2 py-3 font-medium max-w-[280px] truncate">
 {t.subject}
  {t.aiSentiment === "frustrated" || t.aiSentiment === "angry" ? (
    <span className="ml-2 text-[9px] text-destructive">●</span>
  ) : null}
</td>
                      <td className="px-2 py-3 text-xs text-muted-foreground font-mono hidden md:table-cell">
                        {t.customerId?.email || "—"}
                      </td>
                      <td className="px-2 py-3 text-xs hidden lg:table-cell">Portal</td>
                       <td className="px-2 py-3">
                      {t.aiCategory ? (
                     <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border border-primary/30 bg-primary/5 text-primary">
                      <span className="size-1 rounded-full bg-current" />
                      {t.aiCategory}
                      </span>
                       ) : (
                       <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                           —
                      </span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <PrioPill v={t.priority} />
                      </td>
                      <td className="px-2 py-3">
                        <StatusPill v={t.status} />
                      </td>
                      <td className="px-4 md:px-5 py-3 text-right text-xs font-mono text-muted-foreground">
                        {timeAgo(t.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Agents + AI health */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    § Agents on shift
                  </div>
                  <div className="text-sm font-semibold mt-0.5">Team workload</div>
                </div>
              </div>

              <div className="mt-3 divide-y divide-border">
                {agents.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4">No agents yet.</p>
                )}
                {agents.map((a) => {
                  const load = getAgentWorkload(a._id);
                  return (
                    <div key={a._id} className="flex items-center gap-3 py-2.5">
                      <div className="size-9 rounded-full bg-muted grid place-items-center text-xs font-semibold shrink-0">
                        {a.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{a.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{a.email}</div>
                      </div>
                      <div className="hidden sm:flex flex-col items-end gap-1 min-w-[100px]">
                        <div className="text-[10px] font-mono text-muted-foreground">
                          Active: {load}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 md:p-5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                § AI health
              </div>
              <div className="mt-1 text-sm font-semibold">Copilot performance</div>
              <div className="mt-4 py-10 grid place-items-center text-xs text-muted-foreground font-mono border border-dashed border-border rounded-md">
                AI metrics coming soon.
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-2 pb-6 text-[10px] font-mono text-muted-foreground flex flex-wrap items-center justify-between gap-2">
            <div>DeskPilot AI · Admin Console · v1.0</div>
            <div className="flex items-center gap-3">
              <span>Region: ap-south-1</span>
              <span>·</span>
              <Link to="/login" className="hover:text-foreground">
                ← Back to login
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

/* ---------- Small display components ---------- */

function PrioPill({ v }) {
  const map = {
    urgent: "text-destructive border-destructive/40",
    high: "text-foreground border-foreground/30",
    medium: "text-muted-foreground border-border",
    low: "text-muted-foreground border-border",
  };
  const label = { urgent: "Urgent", high: "High", medium: "Med", low: "Low" };
  return (
    <span className={`inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border ${map[v] || "border-border text-muted-foreground"}`}>
      {label[v] || v}
    </span>
  );
}

function StatusPill({ v }) {
  const map = {
    open: "text-primary border-primary/30 bg-primary/5",
    in_progress: "text-foreground border-foreground/30 bg-muted",
    resolved: "text-muted-foreground border-border",
    closed: "text-muted-foreground border-border",
  };
  const label = { open: "Open", in_progress: "In progress", resolved: "Resolved", closed: "Closed" };
  return (
    <span className={`inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border ${map[v] || "border-border text-muted-foreground"}`}>
      {label[v] || v}
    </span>
  );
}

/* ---------- Icons (hand-drawn SVGs, no external icon library needed) ---------- */

function IconGrid({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconInbox({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M3 13l3-8h12l3 8" />
      <path d="M3 13v6h18v-6" />
      <path d="M8 13h8" />
    </svg>
  );
}
function IconChat({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1.4 3.6A8 8 0 0 1 21 12z" />
    </svg>
  );
}
function IconSpark({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
    </svg>
  );
}
function IconBook({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4V4z" />
      <path d="M4 16a4 4 0 0 1 4-4h10" />
    </svg>
  );
}
function IconUsers({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 20a5 5 0 0 1 6.5-4.8" />
    </svg>
  );
}
function IconChart({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </svg>
  );
}
function IconCode({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
    </svg>
  );
}
function IconGear({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}
function IconChevron({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function IconLogout({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M10 17l5-5-5-5M15 12H3M13 4h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
    </svg>
  );
}
function IconSearch({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
function IconBell({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}
function IconPlus({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTickets, claimTicket, updateTicket, getSuggestedReply } from "../api/tickets";
import { getMessagesByTicket } from "../api/messages";
import { getSocket } from "../lib/socket";
import { uploadFile } from "../api/upload";
import { LoadingState, EmptyState } from "../components/LoadingState";

const shortcuts = [
  { keys: ["J", "K"], label: "Prev / next" },
  { keys: ["R"], label: "Reply" },
  { keys: ["\u2318", "\u21b5"], label: "Send" },
  { keys: ["A"], label: "Assign" },
  { keys: ["E"], label: "Resolve" },
  { keys: ["/"], label: "Search" },
];

const macros = [
  "Ask for order ID",
  "Send refund confirmation",
  "Escalate to engineering",
  "Share SSO setup guide",
  "Request browser + version",
];

const AgentWorkspace = () => {
  const [tickets, setTickets] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("mine");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [aiPanel, setAiPanel] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const textRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchTickets();
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

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
     if (filter === "mine") return t.assignedAgentId?._id?.toString() === user.id;
      if (filter === "unassigned") return !t.assignedAgentId;
      return true;
    });
  }, [tickets, filter, user.id]);

  useEffect(() => {
    if (filteredTickets.length === 0) {
      setActiveId(null);
      return;
    }
    if (!filteredTickets.find((t) => t._id === activeId)) {
      setActiveId(filteredTickets[0]._id);
    }
  }, [filteredTickets, activeId]);

  const active = useMemo(
    () => tickets.find((t) => t._id === activeId) ?? null,
    [activeId, tickets]
  );

  useEffect(() => {
    setReply("");
    setPendingFile(null);
    if (active) fetchMessages(active._id);
    else setMessages([]);
  }, [activeId]);

  const fetchMessages = async (ticketId) => {
    try {
      const res = await getMessagesByTicket(ticketId);
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
  const socket = getSocket();

  socket.on("receive_message", (msg) => {
    if (msg.ticketId === activeId) {
      setMessages((prev) => [...prev, msg]);
    }
  });

  socket.on("error_message", (err) => {
    setToast(err);
  });

  return () => {
    socket.off("receive_message");
    socket.off("error_message");
  };
}, [activeId]); 

 useEffect(() => {
  if (active) {
    const socket = getSocket();
    socket.emit("join_ticket", active._id);
  }
}, [activeId, active]);


  const handleClaim = async (ticketId) => {
    try {
      await claimTicket(ticketId);
      setToast("Ticket claimed");
      fetchTickets();
    } catch (err) {
      setToast(err.response?.data?.message || "Failed to claim");
    }
  };

  const handleResolve = async () => {
    if (!active) return;
    try {
      await updateTicket(active._id, { status: "resolved" });
      setToast("Ticket resolved");
      fetchTickets();
    } catch (err) {
      setToast(err.response?.data?.message || "Failed to update");
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const handledToday = useMemo(() => {
    const today = new Date().toDateString();
    return tickets.filter(
      (t) =>
       t.assignedAgentId?._id?.toString() === user.id &&
        (t.status === "resolved" || t.status === "closed") &&
        new Date(t.updatedAt).toDateString() === today
    ).length;
  }, [tickets, user.id]);

  async function insertDraft() {
    if (!active) return;
    setLoadingDraft(true);
    try {
      const res = await getSuggestedReply(active._id);
      setReply(res.data.draft);
      setTimeout(() => textRef.current?.focus(), 0);
      setToast("AI draft inserted");
    } catch (err) {
      setToast(err.response?.data?.message || "AI suggestion failed");
    } finally {
      setLoadingDraft(false);
    }
  }

  async function send() {
    if (!reply.trim() && !pendingFile) return;
    if (!active) return;
    const socket = getSocket();

    let attachments = [];
    if (pendingFile) {
      setUploading(true);
      try {
        const res = await uploadFile(pendingFile);
        attachments = [res.data.url];
      } catch (err) {
        setToast("File upload failed");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    socket.emit("send_message", {
      ticketId: active._id,
      content: reply || "(attachment)",
      attachments,
    });
    setReply("");
    setPendingFile(null);
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-display">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="flex items-center gap-3 px-4 h-12">
          <Link to="/agent" className="flex items-center gap-2">
            <div className="size-6 rounded-sm bg-foreground text-background grid place-items-center font-mono text-[10px] font-bold">
              DP
            </div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              DeskPilot / Agent
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground ml-2">
            <span className="size-1.5 rounded-full bg-emerald-500 blink" /> On shift
            <span className="mx-2 text-border">/</span>
            <span>Queue {tickets.length} open</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <input
                placeholder="Search tickets, customers, macros..."
                className="h-8 w-64 bg-secondary/60 border border-border rounded-sm pl-7 pr-8 text-xs font-mono placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/60"
              />
              <SearchIcon className="absolute left-2 top-1.5 size-4 text-muted-foreground" />
              <kbd className="absolute right-2 top-1.5 text-[10px] font-mono text-muted-foreground border border-border rounded px-1">
                /
              </kbd>
            </div>
            <button className="h-8 px-2 border border-border rounded-sm text-xs font-mono hover:bg-secondary/60">
              <BellIcon className="size-4" />
            </button>
            <button
              onClick={logout}
              className="h-8 px-3 border border-border rounded-sm text-xs font-mono hover:bg-secondary/60 hidden sm:inline-flex items-center"
            >
              Logout &#8594;
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="size-7 rounded-full bg-primary/15 border border-primary/30 text-primary grid place-items-center font-mono text-[11px] font-bold">
                {user?.name?.slice(0, 2).toUpperCase() || "AG"}
              </div>
              <div className="hidden md:block leading-tight">
                <div className="text-xs font-medium">{user?.name || "Agent"}</div>
                <div className="text-[10px] font-mono text-muted-foreground">{user?.role || "agent"}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-border/70 bg-secondary/30">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 divide-x divide-border/70">
          {[
            { k: "Handled today", v: String(handledToday), d: "real" },
            { k: "First-reply avg", v: "-", d: "not tracked yet" },
            { k: "CSAT (7d)", v: "-", d: "not tracked yet" },
            { k: "AI acceptance", v: "-", d: "AI not wired yet" },
            { k: "Focus streak", v: "-", d: "not tracked yet" },
          ].map((s) => (
            <div key={s.k} className="px-4 py-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{s.k}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-semibold tracking-tight">{s.v}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{s.d}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_340px] min-h-[calc(100vh-6.5rem)]">
        <aside className="border-r border-border/70 bg-background flex flex-col">
          <div className="p-3 border-b border-border/70 flex items-center gap-1">
            {["mine", "team", "unassigned"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[11px] font-mono uppercase tracking-wider px-2 py-1 rounded-sm border ${
                  filter === f
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {f}
              </button>
            ))}
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">
              {filteredTickets.length} open
            </span>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading && <LoadingState label="Loading tickets..." />}
            {!loading && filteredTickets.length === 0 && (
              <EmptyState title="No tickets here" hint="Try a different filter" />
            )}
            {filteredTickets.map((t) => {
              const isActive = t._id === activeId;
              return (
                <button
                  key={t._id}
                  onClick={() => setActiveId(t._id)}
                  className={`w-full text-left px-3 py-3 border-b border-border/60 transition-colors ${
                    isActive
                      ? "bg-primary/5 border-l-2 border-l-primary"
                      : "hover:bg-secondary/50 border-l-2 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PrioDot prio={t.priority} />
                    <span className="font-mono text-[10px] text-muted-foreground">#{t._id.slice(-4)}</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                      {timeAgo(t.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1.5 text-sm font-medium leading-snug line-clamp-2">{t.subject}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="truncate">{t.customerId?.email || "Unknown"}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <StatusChip status={t.status} />
                    {!t.assignedAgentId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaim(t._id);
                        }}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-primary/40 text-primary hover:bg-primary/10"
                      >
                        Claim
                      </button>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="border-t border-border/70 p-3 font-mono text-[10px] text-muted-foreground grid grid-cols-2 gap-y-1">
            {shortcuts.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span className="flex gap-0.5">
                  {s.keys.map((k) => (
                    <kbd key={k} className="border border-border rounded px-1 text-foreground/80">
                      {k}
                    </kbd>
                  ))}
                </span>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex flex-col min-w-0">
          {!active ? (
            <div className="flex-1 grid place-items-center text-sm text-muted-foreground">
              Select a ticket to view the conversation.
            </div>
          ) : (
            <>
              <div className="border-b border-border/70 px-5 py-3 flex flex-wrap items-center gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>#{active._id.slice(-4)}</span>
                    <span>/</span>
                    <span>Portal</span>
                  </div>
                  <h2 className="mt-0.5 text-base font-semibold truncate">{active.subject}</h2>
                  <div className="text-xs text-muted-foreground">
                    {active.customerId?.name || "Unknown"} {" \u00b7 "}
                    <span className="font-mono">{active.customerId?.email || "-"}</span>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1.5 flex-wrap">
                  <ToolButton>Assign</ToolButton>
                  <ToolButton>Snooze</ToolButton>
                  <ToolButton>Merge</ToolButton>
                  <button
                    onClick={handleResolve}
                    className="h-8 px-3 rounded-sm bg-foreground text-background text-xs font-medium hover:opacity-90"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => setAiPanel((v) => !v)}
                    className="h-8 px-2 rounded-sm border border-border text-xs font-mono lg:hidden"
                  >
                    {aiPanel ? "Hide AI" : "AI"}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 bg-[color-mix(in_oklch,var(--background)_92%,var(--foreground)_2%)]">
                {messages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">No messages yet.</p>
                )}
                {messages.map((m) => (
                  <MessageBubble
                    key={m._id}
                    msg={{
                    from: m.senderId === user.id ? "agent" : m.senderRole,
                      name: m.senderRole,
                      time: new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      body: m.content,
                      attachments: m.attachments || [],
                    }}
                  />
                ))}
              </div>

              <div className="border-t border-border/70 bg-background">
                <div className="px-5 pt-3 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={insertDraft}
                    disabled={loadingDraft}
                    className="inline-flex items-center gap-1.5 h-7 px-2 rounded-sm border border-primary/40 bg-primary/10 text-primary text-xs font-mono hover:bg-primary/15 disabled:opacity-50"
                  >
                    <SparkIcon className="size-3.5" />
                    {loadingDraft ? "Generating..." : "Insert AI draft"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setPendingFile(e.target.files[0])}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 px-2 text-[11px] rounded-sm border border-border font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  >
                    {pendingFile ? `📎 ${pendingFile.name.slice(0, 15)}` : "Attach"}
                  </button>
                  {macros.map((m) => (
                    <button
                      key={m}
                      onClick={() => setReply((r) => (r ? r + "\n\n" + m : m))}
                      className="h-7 px-2 rounded-sm border border-border text-[11px] font-mono text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    >
                      {m}
                    </button>
                  ))}
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    Reply as <span className="text-foreground">{user?.name?.split(" ")[0] || "Agent"}</span> {" \u00b7 "}
                    Public
                  </span>
                </div>
                <div className="px-5 pt-2 pb-3">
                  <textarea
                    ref={textRef}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={`Reply to ${active.customerId?.name || "customer"}...  (Ctrl+Enter to send)`}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") send();
                    }}
                    rows={4}
                    className="w-full resize-none bg-secondary/40 border border-border rounded-sm p-3 text-sm font-mono leading-relaxed focus:outline-none focus:border-primary/60"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <ToolButton small>Macro</ToolButton>
                    <ToolButton small>Internal note</ToolButton>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                      {reply.length} chars
                    </span>
                    <button
                      onClick={send}
                      disabled={sending || uploading || (!reply.trim() && !pendingFile)}
                      className="h-8 px-4 rounded-sm bg-primary text-primary-foreground text-xs font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 inline-flex items-center gap-2"
                    >
                      {sending || uploading ? (
                        <>
                          <Spinner /> {uploading ? "Uploading" : "Sending"}
                        </>
                      ) : (
                        <>
                          Send reply <span className="font-mono opacity-70">Ctrl+Enter</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        <aside
          className={`${aiPanel ? "block" : "hidden"} lg:block border-l border-border/70 bg-secondary/20 overflow-y-auto`}
        >
          <div className="p-4 border-b border-border/70">
            <div className="flex items-center gap-2">
              <SparkIcon className="size-4 text-primary" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary">AI Copilot</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">demo preview</span>
            </div>
            <div className="mt-3 rounded-sm border border-border bg-background p-3">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>Suggested reply</span>
                <span className="text-primary">82% confidence</span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground/90">
                Hi there - thanks for reaching out. I'm looking into this and will follow up shortly with a
                resolution. (AI-generated draft preview - full AI Copilot integration coming soon.)
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <button
                  onClick={insertDraft}
                  className="h-7 px-2 rounded-sm bg-primary text-primary-foreground text-[11px] font-medium"
                >
                  Insert
                </button>
                <button className="h-7 px-2 rounded-sm border border-border text-[11px] font-mono hover:bg-secondary/60">
                  Rewrite
                </button>
                <button className="h-7 px-2 rounded-sm border border-border text-[11px] font-mono hover:bg-secondary/60">
                  Shorter
                </button>
              </div>
              <p className="mt-2 text-[10px] font-mono text-muted-foreground">
                Not generated from this ticket yet - AI Copilot integration coming soon.
              </p>
            </div>
          </div>

          <div className="p-4 border-b border-border/70">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Knowledge matches (demo)
            </div>
            <ul className="space-y-2">
              {[
                { t: "Payout holds & bank verification", s: "kb/billing/payouts", m: "94% match" },
                { t: "Retrying failed webhooks", s: "kb/api/webhooks", m: "71% match" },
                { t: "Refund policy - 30 day window", s: "kb/billing/refunds", m: "62% match" },
              ].map((k) => (
                <li key={k.t} className="rounded-sm border border-border bg-background p-2.5">
                  <div className="text-[13px] font-medium">{k.t}</div>
                  <div className="mt-0.5 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span>{k.s}</span>
                    <span className="text-primary">{k.m}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
              Customer
            </div>
            <div className="rounded-sm border border-border bg-background p-3 text-xs space-y-1.5">
              <Row k="Name" v={active?.customerId?.name || "-"} />
              <Row k="Email" v={active?.customerId?.email || "-"} />
              <Row k="Plan" v="- (not tracked yet)" />
              <Row k="Tags" v="- (not tracked yet)" />
            </div>
          </div>
        </aside>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 rounded-sm border border-border bg-foreground text-background px-3 py-2 text-xs font-mono shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default AgentWorkspace;

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="text-foreground text-right truncate">{v}</span>
    </div>
  );
}

function ToolButton({ children, small }) {
  return (
    <button
      className={`${small ? "h-7 px-2 text-[11px]" : "h-8 px-3 text-xs"} rounded-sm border border-border font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/60`}
    >
      {children}
    </button>
  );
}

function MessageBubble({ msg }) {
  const isAgent = msg.from === "agent" || msg.from === "admin";
  return (
    <div className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xl rounded-sm border px-3.5 py-2.5 ${
          isAgent ? "bg-foreground text-background border-foreground" : "bg-background border-border"
        }`}
      >
        <div
          className={`font-mono text-[10px] uppercase tracking-wider ${
            isAgent ? "text-background/60" : "text-muted-foreground"
          }`}
        >
          {msg.name} {"\u00b7"} {msg.time}
        </div>
        <p className="mt-1 text-sm leading-relaxed">{msg.body}</p>

        {msg.attachments && msg.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {msg.attachments.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <img
                  src={url}
                  alt="attachment"
                  className="h-20 w-20 rounded-md object-cover border border-border"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PrioDot({ prio }) {
  const map = {
    urgent: "bg-red-500",
    high: "bg-amber-500",
    medium: "bg-sky-500",
    low: "bg-emerald-500",
  };
  return <span className={`size-2 rounded-full ${map[prio] || "bg-muted-foreground"}`} title={prio} />;
}

function StatusChip({ status }) {
  const map = {
    open: "border-border text-foreground",
    in_progress: "border-amber-500/40 text-amber-600",
    resolved: "border-border text-muted-foreground",
    closed: "border-border text-muted-foreground",
  };
  const label = { open: "Open", in_progress: "In progress", resolved: "Resolved", closed: "Closed" };
  return (
    <span className={`font-mono text-[10px] uppercase tracking-wider border rounded-sm px-1.5 py-0.5 ${map[status]}`}>
      {label[status]}
    </span>
  );
}

function Spinner() {
  return (
    <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path
        d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}
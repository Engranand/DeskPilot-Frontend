import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTickets, createTicket } from "../api/tickets";
import { getMessagesByTicket } from "../api/messages";
import { getSocket } from "../lib/socket";
import { uploadFile } from "../api/upload";
import { LoadingState, EmptyState } from "../components/LoadingState";

const suggestedArticles = [
  { title: "Applying discount and promo codes at checkout", tag: "Billing", read: "2 min" },
  { title: "How to change shipping address on a placed order", tag: "Orders", read: "3 min" },
  { title: "Downloading GST-compliant invoices", tag: "Billing", read: "1 min" },
];

function statusColor(s) {
  switch (s) {
    case "open":
      return "border-primary/40 text-primary bg-primary/5";
    case "in_progress":
      return "border-amber-500/40 text-amber-600 bg-amber-500/5";
    case "resolved":
      return "border-emerald-500/40 text-emerald-600 bg-emerald-500/5";
    case "closed":
      return "border-foreground/20 text-muted-foreground bg-muted/40";
    default:
      return "border-border text-muted-foreground";
  }
}

const statusLabel = { open: "Open", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" };

function prioColor(p) {
  switch (p) {
    case "urgent":
      return "bg-red-500";
    case "high":
      return "bg-amber-500";
    case "medium":
      return "bg-sky-500";
    case "low":
      return "bg-emerald-500";
    default:
      return "bg-muted-foreground";
  }
}

function CustomerPortal() {
  const [tickets, setTickets] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [toast, setToast] = useState(null);
  const [botOpen, setBotOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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

  const active = useMemo(() => tickets.find((t) => t._id === activeId) ?? null, [tickets, activeId]);

  useEffect(() => {
    if (tickets.length > 0 && !tickets.find((t) => t._id === activeId)) {
      setActiveId(tickets[0]._id);
    }
  }, [tickets, activeId]);

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

  // Real-time: join ticket room + listen for new messages
  useEffect(() => {
    const socket = getSocket();

    socket.on("receive_message", (msg) => {
      if (msg.ticketId === activeId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("error_message", (err) => setToast(err));

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

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (filter === "Open" && !(t.status === "open" || t.status === "in_progress")) return false;
      if (filter === "Resolved" && !(t.status === "resolved" || t.status === "closed")) return false;
      if (query && !`${t._id} ${t.subject}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [tickets, filter, query]);

  const openCount = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;

  function showToast(msg) {
    setToast(msg);
  }

  async function sendReply() {
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
        showToast("File upload failed");
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

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-display">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-4 md:px-6">
          <Link to="/portal" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary text-[10px] font-mono font-bold">
              DP
            </span>
            <span className="text-sm font-semibold tracking-tight">DeskPilot AI</span>
            <span className="ml-2 hidden sm:inline text-[10px] font-mono uppercase tracking-widest text-muted-foreground border border-border px-1.5 py-0.5">
              Customer&nbsp;Portal
            </span>
          </Link>

          <div className="ml-auto hidden md:flex items-center gap-2">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search my tickets..."
                className="h-9 w-72 rounded-md border border-input bg-background/60 pl-8 pr-3 text-sm outline-none focus:border-primary/60"
              />
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <button
              onClick={() => setComposerOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <PlusIcon className="size-4" />
              New ticket
            </button>
          </div>

          <div className="ml-auto md:ml-0 flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="grid size-8 place-items-center rounded-full bg-secondary text-secondary-foreground text-[11px] font-semibold">
                {user?.name?.slice(0, 2).toUpperCase() || "CU"}
              </span>
              <div className="hidden sm:block leading-tight">
                <div className="font-medium">{user?.name || "Customer"}</div>
                <div className="text-[10px] text-muted-foreground">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="h-8 px-2.5 rounded-md border border-border text-xs font-mono hover:bg-secondary/60"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border/60 px-4 md:px-6 py-2 overflow-x-auto">
          {["All", "Open", "Resolved"].map((f) => {
            const count = f === "All" ? tickets.length : f === "Open" ? openCount : resolvedCount;
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                  isActive
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
                <span className={`font-mono text-[10px] ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {count}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setComposerOpen(true)}
            className="md:hidden ml-auto inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground"
          >
            <PlusIcon className="size-3.5" />
            New
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr_300px] gap-0 lg:h-[calc(100vh-6.75rem)]">
        {/* Left — ticket list */}
        <aside className="border-r border-border/60 lg:overflow-y-auto">
          <div className="px-4 pt-4 pb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            My tickets · {filtered.length}
          </div>
          <ul className="pb-4">
            {loading && (
              <li><LoadingState label="Loading tickets..." /></li>
            )}
            {!loading && filtered.length === 0 && (
              <li><EmptyState title="No tickets match this filter" /></li>
            )}
            {filtered.map((t) => {
              const isActive = t._id === activeId;
              return (
                <li key={t._id}>
                  <button
                    onClick={() => setActiveId(t._id)}
                    className={`w-full text-left px-4 py-3 border-l-2 transition-colors ${
                      isActive ? "bg-primary/5 border-primary" : "border-transparent hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`size-1.5 rounded-full ${prioColor(t.priority)}`} />
                      <span className="font-mono text-[11px] text-muted-foreground">#{t._id.slice(-4)}</span>
                      <span
                        className={`ml-auto rounded-full border px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider ${statusColor(t.status)}`}
                      >
                        {statusLabel[t.status]}
                      </span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-sm font-medium leading-snug">{t.subject}</div>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{timeAgo(t.createdAt)}</span>
                      {t.referenceId && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{t.referenceId}</span>
                        </>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Middle — conversation */}
        <section className="flex flex-col lg:overflow-hidden border-r border-border/60">
          {!active ? (
            <div className="flex-1 grid place-items-center text-sm text-muted-foreground">
              {loading ? "Loading..." : "No ticket selected. Create a new ticket to get started."}
            </div>
          ) : (
            <>
              <div className="border-b border-border/60 px-5 py-4">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                  <span>#{active._id.slice(-4)}</span>
                  <span>/</span>
                  <span>created {timeAgo(active.createdAt)}</span>
                </div>
                <div className="mt-1 flex items-start gap-3">
                  <h1 className="text-lg font-semibold tracking-tight leading-snug flex-1">{active.subject}</h1>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${statusColor(active.status)}`}
                  >
                    {statusLabel[active.status]}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`size-1.5 rounded-full ${prioColor(active.priority)}`} />
                    {active.priority} priority
                  </span>
                  {active.assignedAgentId ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="grid size-5 place-items-center rounded-full bg-secondary text-[10px] font-semibold">
                        {active.assignedAgentId.name?.slice(0, 2).toUpperCase() || "AG"}
                      </span>
                      Assigned to <span className="text-foreground">{active.assignedAgentId.name}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not yet assigned to an agent</span>
                  )}
                </div>
              </div>

              <div className="flex-1 lg:overflow-y-auto px-5 py-6 space-y-5 bg-gradient-to-b from-background to-muted/20">
                {messages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">No messages yet.</p>
                )}
                {messages.map((m) => (
                  <MessageBubble
                    key={m._id}
                    m={{
                      from: m.senderId === user.id ? "you" : "agent",
                      name: m.senderId === user.id ? "You" : m.senderRole,
                      time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      body: m.content,
                      attachments: m.attachments || [],
                    }}
                  />
                ))}
              </div>

              {active.status !== "closed" ? (
                <div className="border-t border-border/60 bg-background/80 px-5 py-3">
                  <div className="rounded-lg border border-border focus-within:border-primary/50 bg-background">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendReply();
                      }}
                      placeholder="Reply to your agent... (Ctrl+Enter to send)"
                      rows={2}
                      className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <div className="flex items-center gap-2 border-t border-border/60 px-2 py-1.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => setPendingFile(e.target.files[0])}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-7 px-2 rounded-md border border-border text-[11px] font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      >
                        {pendingFile ? `📎 ${pendingFile.name.slice(0, 15)}` : "Attach"}
                      </button>
                      <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                        {reply.length} chars
                      </span>
                      <button
                        disabled={uploading || (!reply.trim() && !pendingFile)}
                        onClick={sendReply}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-40 hover:bg-primary/90"
                      >
                        {uploading ? "Uploading..." : "Send reply"}
                        <ArrowRightIcon className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-border/60 bg-muted/20 px-5 py-4 text-center text-xs text-muted-foreground">
                  This ticket is closed.{" "}
                  <button onClick={() => setComposerOpen(true)} className="text-primary hover:underline">
                    Open a new ticket
                  </button>{" "}
                  if you need more help.
                </div>
              )}
            </>
          )}
        </section>

        {/* Right — context */}
        <aside className="lg:overflow-y-auto p-4 space-y-5">
          {active && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Ticket timeline
              </div>
              <ol className="mt-3 space-y-3 border-l border-border pl-4">
                <TimelineItem time={timeAgo(active.createdAt)} title="Ticket created" desc="" />
                {active.assignedAgentId && (
                  <TimelineItem
                    time=""
                    title={`Assigned to ${active.assignedAgentId.name}`}
                    desc="Support agent"
                    accent
                  />
                )}
                <TimelineItem time="Now" title={`Status: ${statusLabel[active.status]}`} desc="" />
              </ol>
            </div>
          )}

          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Suggested articles (demo)
            </div>
            <ul className="mt-3 space-y-2">
              {suggestedArticles.map((a) => (
                <li key={a.title}>
                  <div className="w-full rounded-md border border-border bg-card p-3 opacity-70">
                    <div className="text-sm font-medium leading-snug">{a.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <span>{a.tag}</span>
                      <span>·</span>
                      <span>{a.read} read</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[10px] font-mono text-muted-foreground">
              Knowledge base isn't wired up yet — coming soon.
            </p>
          </div>
        </aside>
      </div>

      <button
        onClick={() => setBotOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
      >
        <SparkIcon className="size-4" />
        Ask DeskPilot AI
      </button>

      {botOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[92vw] max-w-sm rounded-xl border border-border bg-background shadow-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">DeskPilot AI</div>
            <button onClick={() => setBotOpen(false)} className="text-muted-foreground hover:text-foreground">
              <XIcon className="size-4" />
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            AI chatbot isn't wired up yet — the RAG knowledge-base assistant is coming soon. For now, please use
            the ticket chat to reach a human agent.
          </p>
        </div>
      )}

      {composerOpen && (
        <NewTicketDialog
          onClose={() => setComposerOpen(false)}
          onCreate={async (data) => {
            try {
              const res = await createTicket(data);
              setTickets((prev) => [res.data.ticket, ...prev]);
              setActiveId(res.data.ticket._id);
              setComposerOpen(false);
              showToast("Ticket created");
            } catch (err) {
              showToast(err.response?.data?.message || "Failed to create ticket");
            }
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 right-6 z-50 rounded-md border border-border bg-background px-3 py-2 text-xs shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

export default CustomerPortal;

function MessageBubble({ m }) {
  const isYou = m.from === "you";
  return (
    <div className={`flex gap-3 ${isYou ? "flex-row-reverse" : ""}`}>
      <div
        className={`grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
          isYou ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        }`}
      >
        {m.name.slice(0, 2).toUpperCase()}
      </div>
      <div className={`max-w-[78%] ${isYou ? "items-end text-right" : ""} flex flex-col gap-1`}>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{m.name}</span>
          <span>·</span>
          <span>{m.time}</span>
        </div>
        <p className="text-sm leading-relaxed">{m.body}</p>
        {m.attachments && m.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {m.attachments.map((url, i) => (
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

function TimelineItem({ time, title, desc, accent }) {
  return (
    <li className="relative">
      <span
        className={`absolute -left-[21px] top-1 grid size-3 place-items-center rounded-full border ${
          accent ? "border-primary bg-primary/20" : "border-border bg-background"
        }`}
      >
        <span className={`size-1.5 rounded-full ${accent ? "bg-primary" : "bg-muted-foreground"}`} />
      </span>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{time}</div>
      <div className="text-sm font-medium">{title}</div>
      {desc && <div className="text-xs text-muted-foreground">{desc}</div>}
    </li>
  );
}

function NewTicketDialog({ onClose, onCreate }) {
  const [subject, setSubject] = useState("");
  const [prio, setPrio] = useState("medium");
  const [body, setBody] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!subject.trim() || !body.trim()) return;
    setSubmitting(true);

    let attachments = [];
    if (file) {
      setUploading(true);
      try {
        const res = await uploadFile(file);
        attachments = [res.data.url];
      } catch (err) {
        setUploading(false);
        setSubmitting(false);
        return;
      }
      setUploading(false);
    }

    await onCreate({
      subject: subject.trim(),
      description: body.trim(),
      priority: prio,
      referenceId: referenceId.trim() || undefined,
      attachments,
    });
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <SparkIcon className="size-4 text-primary" />
          <div className="text-sm font-semibold">New support ticket</div>
          <button onClick={onClose} className="ml-auto grid size-7 place-items-center rounded hover:bg-muted" aria-label="Close">
            <XIcon className="size-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Briefly describe the issue"
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/60"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Priority</label>
            <div className="mt-1 flex gap-1">
              {["low", "medium", "high", "urgent"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPrio(p)}
                  className={`flex-1 rounded-md border px-2 py-2 text-xs capitalize ${
                    prio === p
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Description</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Share details, steps to reproduce, and any error messages..."
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 resize-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Order ID / Reference (optional)</label>
            <input
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="e.g. ORD-88123"
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/60"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Attach screenshot (optional)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-xs"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-border px-5 py-3">
          <div className="ml-auto flex gap-2">
            <button onClick={onClose} className="h-9 rounded-md border border-input px-3 text-sm hover:bg-muted">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!subject.trim() || !body.trim() || submitting || uploading}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-40 hover:bg-primary/90"
            >
              {submitting ? (uploading ? "Uploading..." : "Creating...") : "Create ticket"}
              <ArrowRightIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}
function PlusIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
function ArrowRightIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function XIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
    </svg>
  );
}
function SparkIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8z" />
    </svg>
  );
}
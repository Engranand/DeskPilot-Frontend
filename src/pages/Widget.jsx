import { useEffect, useRef, useState } from "react";
import { createGuestTicket } from "../api/widget";
import { getMessagesByTicket } from "../api/messages";
import { io } from "socket.io-client";
import { Spinner } from "../components/LoadingState";

const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const statusLabel = { open: "Open", in_progress: "In progress", resolved: "Resolved", closed: "Closed" };

const Widget = () => {
  const [orgSlug, setOrgSlug] = useState("");
  const [stage, setStage] = useState("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ticket, setTicket] = useState(null);
  const [token, setToken] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("org");
    if (slug) setOrgSlug(slug);

    const savedToken = sessionStorage.getItem("widget_token");
    const savedTicket = sessionStorage.getItem("widget_ticket");
    if (savedToken && savedTicket) {
      setToken(savedToken);
      setTicket(JSON.parse(savedTicket));
      setStage("chat");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await createGuestTicket({ orgSlug, name, email, subject, description });
      const { ticket: newTicket, token: newToken } = res.data;

      sessionStorage.setItem("widget_token", newToken);
      sessionStorage.setItem("widget_ticket", JSON.stringify(newTicket));

      setTicket(newTicket);
      setToken(newToken);
      setStage("chat");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stage !== "chat" || !token || !ticket) return;

    fetchMessages();

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_ticket", ticket._id);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("receive_message", (msg) => {
      if (msg.ticketId === ticket._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.disconnect();
  }, [stage, token, ticket]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await getMessagesByTicket(ticket._id, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const sendReply = () => {
    if (!reply.trim() || !socketRef.current) return;
    socketRef.current.emit("send_message", { ticketId: ticket._id, content: reply });
    setReply("");
  };

  if (stage === "form") {
    return (
      <div className="min-h-screen bg-background text-foreground font-display flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="grid size-7 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary text-[10px] font-mono font-bold">
              DP
            </span>
            <div>
              <div className="text-sm font-semibold leading-tight">Chat with us</div>
              <div className="text-[10px] text-muted-foreground">We typically reply in a few minutes</div>
            </div>
          </div>

          {error && (
            <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition"
            />
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              required
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="How can we help?"
              required
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition resize-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Spinner className="size-4" /> Starting chat...
                </>
              ) : (
                "Start chat"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-display flex flex-col">
      <div className="border-b border-border px-4 py-3 flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary text-[10px] font-mono font-bold">
          DP
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{ticket.subject}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className={`size-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-muted-foreground"}`} />
            {connected ? "Connected" : "Connecting..."} · {statusLabel[ticket.status]}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground text-center">
            We've received your message. An agent will join shortly.
          </div>
        )}
        {messages.map((m) => (
          <div key={m._id} className={`flex ${m.senderRole === "customer" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-lg border px-3 py-2 text-sm ${
                m.senderRole === "customer" ? "border-primary/30 bg-primary/5" : "border-border bg-card"
              }`}
            >
              {m.content}
              {m.attachments && m.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.attachments.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt="attachment" className="h-16 w-16 rounded-md object-cover border border-border" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border p-3 flex gap-2">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendReply()}
          placeholder="Type a message..."
          className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition"
        />
        <button
          onClick={sendReply}
          disabled={!reply.trim()}
          className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Widget;
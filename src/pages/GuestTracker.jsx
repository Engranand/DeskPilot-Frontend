import { useState } from "react";
import { Link } from "react-router-dom";
import { guestLookupTicket } from "../api/tickets";
import { Spinner } from "../components/LoadingState";

const statusColor = {
  open: "border-primary/40 text-primary bg-primary/5",
  in_progress: "border-amber-500/40 text-amber-600 bg-amber-500/5",
  resolved: "border-emerald-500/40 text-emerald-600 bg-emerald-500/5",
  closed: "border-foreground/20 text-muted-foreground bg-muted/40",
};
const statusLabel = { open: "Open", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" };

const steps = [
  { label: "Submitted", key: "any" },
  { label: "In progress", key: "in_progress" },
  { label: "Resolved", key: "resolved" },
];

function statusStepIndex(status) {
  if (status === "open") return 0;
  if (status === "in_progress") return 1;
  if (status === "resolved" || status === "closed") return 2;
  return 0;
}

const GuestTracker = () => {
  const [orgSlug, setOrgSlug] = useState("");
  const [email, setEmail] = useState("");
  const [ticketCode, setTicketCode] = useState("");
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTicket(null);
    setLoading(true);

    try {
      const res = await guestLookupTicket({ orgSlug, email, ticketCode });
      setTicket(res.data.ticket);
    } catch (err) {
      setError(err.response?.data?.message || "Ticket not found");
    } finally {
      setLoading(false);
    }
  };

  const activeStep = ticket ? statusStepIndex(ticket.status) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-display flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="grid size-7 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary text-[10px] font-mono font-bold">
              DP
            </span>
            <span className="text-sm font-semibold">DeskPilot AI</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Track your ticket</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            No account needed — just enter your details below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-3">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Workspace</label>
            <input
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              placeholder="e.g. acme"
              required
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Email used on the ticket</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Ticket code</label>
            <input
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value)}
              placeholder="e.g. 40fc"
              required
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition font-mono"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Found in your ticket confirmation (e.g. #40fc)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              <>
                <Spinner className="size-4" /> Looking up...
              </>
            ) : (
              "Track ticket"
            )}
          </button>
        </form>

        {ticket && (
          <div className="mt-4 rounded-xl border border-border bg-card shadow-sm p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-muted-foreground">#{ticket._id.slice(-4)}</span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${statusColor[ticket.status]}`}
              >
                {statusLabel[ticket.status]}
              </span>
            </div>
            <h2 className="mt-1 text-base font-semibold">{ticket.subject}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{ticket.description}</p>
            {ticket.referenceId && (
              <p className="mt-2 text-xs font-mono text-muted-foreground">Reference: {ticket.referenceId}</p>
            )}

            <div className="mt-5 flex items-center">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`size-6 rounded-full grid place-items-center text-[10px] font-bold border-2 ${
                        i <= activeStep
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {i < activeStep ? "\u2713" : i + 1}
                    </div>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 mb-4 ${i < activeStep ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Created {new Date(ticket.createdAt).toLocaleDateString()}
            </p>

            <div className="mt-4 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              For live chat with your agent and full history, please{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                log in to your account
              </Link>
              .
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default GuestTracker;
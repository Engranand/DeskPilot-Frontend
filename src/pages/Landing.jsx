import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const features = [
  { title: "AI Ticket Classification", desc: "Automatically categorizes tickets and detects sentiment so urgent issues reach the right agent faster." },
  { title: "AI Reply Assistant", desc: "Generate contextual replies instantly. Agents review, edit, and send responses in seconds." },
  { title: "Real-Time Conversations", desc: "Communicate with customers instantly through live chat powered by WebSockets." },
  { title: "Multi-Tenant Architecture", desc: "Every organization gets a completely isolated workspace with secure data separation." },
  { title: "Website Support Widget", desc: "Embed a customizable chat widget into any website using a single script." },
  { title: "Knowledge Base AI Chatbot", desc: "Answer repetitive questions using your documentation before escalating to human agents." },
  { title: "File & Screenshot Uploads", desc: "Customers attach screenshots directly to tickets for faster, clearer resolutions." },
  { title: "Role-Based Access", desc: "Admins, agents, and customers each get a workspace built for exactly what they need to do." },
];

const aiChecklist = [
  "Auto Categorization",
  "Sentiment Detection",
  "AI Reply Suggestions",
  "Real-Time Chat",
  "Smart Ticket Routing",
  "Faster Resolution Times",
];

const steps = [
  "Create your organization.",
  "Invite your support agents.",
  "Install the website widget with one line of code.",
  "Customers start creating tickets instantly.",
  "AI categorizes requests and suggests replies.",
  "Resolve issues faster with real-time collaboration.",
];

const capabilities = [
  "AI-Powered Support",
  "Multi-Tenant SaaS",
  "Real-Time Chat",
  "Website Widget",
  "Secure Authentication",
  "Role-Based Access",
  "Cloud File Uploads",
  "Guest Ticket Tracking",
];

const roles = [
  { title: "Organization Admin", desc: "Manage agents, monitor tickets, configure the widget, and oversee your support operations." },
  { title: "Support Agents", desc: "Handle tickets, collaborate in real time, use AI-generated replies, and resolve customer issues efficiently." },
  { title: "Customers", desc: "Raise support requests, upload screenshots, chat instantly, and track every ticket from start to finish." },
];

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? "reveal-in" : "reveal"} ${className}`}
      style={visible && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

function CountUp({ to, suffix = "", prefix = "", decimals = 0, duration = 1600 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (t) => {
              const p = Math.min(1, (t - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(to * eased);
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

const EVENTS = [
  { tag: "AI", text: "Ticket auto-categorized as Billing", meta: "workspace demo" },
  { tag: "AGENT", text: "Reply sent in real time", meta: "live chat" },
  { tag: "AI", text: "Sentiment detected: frustrated", meta: "smart routing" },
  { tag: "WIDGET", text: "New chat from a website visitor", meta: "embeddable widget" },
];

function ActivityTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % EVENTS.length), 2600);
    return () => clearInterval(t);
  }, []);
  const e = EVENTS[i];
  return (
    <div className="flex items-center gap-3 font-mono text-[10px] md:text-xs uppercase tracking-wider">
      <span className="inline-flex items-center gap-1.5 text-primary">
        <span className="size-1.5 rounded-full bg-primary blink" />
        LIVE
      </span>
      <span className="text-muted-foreground">/</span>
      <span className="text-foreground border border-primary/30 text-primary px-1.5 py-0.5">{e.tag}</span>
      <span key={i} className="text-foreground reveal-in truncate">
        {e.text}
      </span>
      <span className="ml-auto text-muted-foreground hidden sm:inline">{e.meta}</span>
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="relative w-full aspect-[4/3] rounded-[4px] border border-foreground/10 bg-background shadow-2xl overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-foreground/10 bg-zinc-50">
        <span className="size-2 rounded-full bg-foreground/20" />
        <span className="size-2 rounded-full bg-foreground/20" />
        <span className="size-2 rounded-full bg-foreground/20" />
        <span className="ml-3 font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
          deskpilot / inbox
        </span>
      </div>
      <div className="grid grid-cols-[80px_1fr] h-[calc(100%-28px)]">
        <aside className="border-r border-foreground/10 bg-zinc-50/60 p-2 space-y-1">
          {["INBOX", "OPEN", "URGENT", "CLOSED"].map((l, i) => (
            <div
              key={l}
              className={`font-mono text-[7px] uppercase tracking-wider px-1.5 py-1 rounded ${
                i === 0 ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              {l}
            </div>
          ))}
        </aside>
        <div className="p-3 space-y-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
              Ticket #4291
            </span>
            <span className="font-mono text-[8px] uppercase tracking-widest text-primary border border-primary/30 px-1.5 py-0.5">
              URGENT
            </span>
          </div>
          <div className="border border-foreground/10 rounded-[3px] p-2 bg-white">
            <p className="text-[9px] font-medium leading-snug">
              Payment failed on checkout — can't complete order
            </p>
            <p className="text-[8px] text-muted-foreground mt-1 font-mono">maria@studio.co · 2m ago</p>
          </div>
          <div className="border border-primary/30 rounded-[3px] p-2 bg-primary/[0.04]">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="size-1 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-[7px] uppercase tracking-widest text-primary">AI Draft</span>
            </div>
            <p className="text-[8px] leading-snug text-foreground/80">
              <span className="shimmer-text">
                Hi Maria — sorry about the failed checkout. I've refunded the pending charge and issued a discount code…
              </span>
            </p>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {["94%", "1.2m", "12"].map((v, i) => (
              <div key={i} className="border border-foreground/10 rounded-[3px] p-1.5">
                <div className="font-mono text-[7px] uppercase tracking-widest text-muted-foreground">
                  {["CSAT", "TTFR", "OPEN"][i]}
                </div>
                <div className="font-display font-extrabold text-[11px] leading-none mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const Landing = () => {
  return (
    <main className="bg-background text-foreground font-display selection:bg-primary/20 min-h-screen">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="font-extrabold tracking-tighter text-lg uppercase italic">DeskPilot</span>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="bg-foreground text-background text-[11px] font-mono font-medium px-4 py-1.5 uppercase tracking-wider hover:bg-primary transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden />
        <div
          className="absolute -top-40 -right-20 w-[520px] h-[520px] rounded-full pointer-events-none opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-8 md:pt-24 md:pb-16 md:grid md:grid-cols-2 md:gap-12 md:items-center">
          <div>
            <span className="reveal-in inline-block font-mono text-[10px] uppercase tracking-widest text-primary mb-4 border border-primary/20 px-2 py-0.5">
              &#10022; AI-Powered Customer Support Platform
            </span>
            <h1 className="reveal-in font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-[0.9] text-balance mb-6">
              AI-Powered Helpdesk Built for Modern Businesses.
            </h1>
            <p className="reveal-in text-muted-foreground text-sm md:text-base leading-relaxed mb-8 max-w-[52ch] text-pretty">
              DeskPilot AI helps businesses manage customer support from one powerful platform. Automate ticket
              categorization, deliver AI-powered replies, enable real-time conversations, and embed a support
              widget on any website in minutes.
            </p>
            <div className="reveal-in flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="group text-center bg-foreground text-background py-4 sm:px-8 font-mono text-xs uppercase font-medium tracking-widest hover:bg-primary transition-colors inline-flex items-center justify-center gap-2"
              >
                Start Free
                <span className="inline-block transition-transform group-hover:translate-x-1">&#8594;</span>
              </Link>
              <Link
                to="/login"
                className="group text-center border border-border py-4 sm:px-8 font-mono text-xs uppercase font-medium tracking-widest hover:border-foreground transition-colors inline-flex items-center justify-center gap-2"
              >
                Log In
              </Link>
            </div>
          </div>
          <div className="reveal-in mt-12 md:mt-0">
            <DashboardMock />
          </div>
        </div>
        <div className="relative border-t border-border bg-background/60 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 overflow-hidden">
            <ActivityTicker />
          </div>
        </div>
      </section>

      <div className="border-b border-border overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
            Built with technologies developers trust
          </p>
        </div>
        <div className="relative py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="marquee flex gap-12 w-max whitespace-nowrap text-[13px] font-mono uppercase tracking-widest text-foreground/70">
            {Array.from({ length: 2 }).flatMap((_, r) =>
              ["React", "Node.js", "Express", "MongoDB", "Socket.IO", "Groq AI", "Cloudinary", "Tailwind CSS"].map(
                (t) => (
                  <span key={`${r}-${t}`} className="flex items-center gap-12">
                    {t}
                    <span className="text-primary">&#10022;</span>
                  </span>
                )
              )
            )}
          </div>
        </div>
      </div>

      <section className="border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { v: <CountUp to={94} suffix="%" />, l: "AI Categorization Accuracy" },
            { v: <CountUp to={12} suffix="s" />, l: "Avg First Reply" },
            { v: <CountUp to={5} suffix="+" />, l: "Roles Supported" },
            { v: <CountUp to={1} suffix=" line" />, l: "Widget Install" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="border-l-2 border-primary pl-4">
                <div className="font-display text-4xl md:text-6xl font-extrabold tracking-tighter leading-none">
                  {s.v}
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.l}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-zinc-50 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <Reveal>
            <span className="font-mono text-[10px] text-primary mb-4 block uppercase tracking-widest">
              [ Problem_Void ]
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight mb-6 max-w-3xl text-balance">
              Customer support shouldn't feel chaotic.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <Reveal delay={80}>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-pretty">
                Most growing businesses manage customer conversations through emails, WhatsApp, spreadsheets, or
                social media DMs. As requests increase, tracking issues becomes difficult, response times slow
                down, and important conversations get lost.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-sm md:text-base text-foreground leading-relaxed text-pretty font-medium">
                DeskPilot AI centralizes every customer interaction into one intelligent workspace — helping
                teams respond faster while AI handles repetitive tasks.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-foreground text-background">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <span className="font-mono text-[10px] text-primary mb-4 block uppercase tracking-widest">
              [ Install // 30 seconds ]
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight mb-4 text-balance">
              One line of code. Any website.
            </h2>
            <p className="text-sm md:text-base text-background/60 leading-relaxed max-w-md">
              Drop the DeskPilot widget into your site and start receiving AI-triaged tickets in under a minute.
              No backend, no config.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-[3px] border border-background/15 bg-black/40 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-2 border-b border-background/10 bg-white/[0.03]">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-background/30" />
                  <span className="size-2 rounded-full bg-background/30" />
                  <span className="size-2 rounded-full bg-background/30" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-background/40">
                  index.html
                </span>
              </div>
              <pre className="p-4 md:p-5 font-mono text-[11px] md:text-xs leading-relaxed overflow-x-auto">
                <span className="text-background/40">{"<!-- Paste before </body> -->"}</span>
                {"\n"}
                <span className="text-primary">{"<script"}</span>
                {"\n  "}
                <span className="text-background/80">src</span>
                <span className="text-background/40">=</span>
                <span className="text-emerald-300">"https://your-domain.com/widget.js"</span>
                {"\n  "}
                <span className="text-background/80">data-org-id</span>
                <span className="text-background/40">=</span>
                <span className="text-emerald-300">"your-org-slug"</span>
                {"\n"}
                <span className="text-primary">{"></script>"}</span>
              </pre>
              <div className="px-4 py-2 border-t border-background/10 flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-background/40">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 blink" />
                  Live
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <Reveal className="flex items-baseline justify-between mb-12">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Features // 01–08
            </p>
            <h3 className="font-display text-xl md:text-3xl font-extrabold tracking-tight text-right">
              Everything Your Team Needs
            </h3>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-12 md:gap-y-10">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div
                  className={`group border-l-2 pl-4 transition-all duration-300 hover:border-primary hover:pl-5 ${
                    i === 0 ? "border-primary" : "border-border"
                  }`}
                >
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-2">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h4 className="font-display font-extrabold text-lg mb-2 transition-colors group-hover:text-primary">
                    {f.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-foreground text-background">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <span className="font-mono text-[10px] text-primary mb-4 block uppercase tracking-widest">
            [ AI_Layer ]
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tighter mb-4 text-balance">
            Let AI Handle the Repetitive Work.
          </h2>
          <p className="text-sm md:text-base text-background/60 mb-10 max-w-2xl">
            DeskPilot AI doesn't replace your support team — it helps them work smarter.
          </p>
          <div className="grid md:grid-cols-2 gap-x-12 font-mono text-xs md:text-sm">
            {aiChecklist.map((item, i) => (
              <Reveal key={item} delay={i * 60}>
                <div className="flex items-center gap-3 py-3 border-b border-background/10">
                  <span className="text-primary font-bold">&#10003;</span>
                  <span>{item}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <span className="font-mono text-[10px] text-primary mb-4 block uppercase tracking-widest">
            [ Onboarding ]
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight mb-12">
            Get Started in Minutes
          </h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            {steps.map((s, i) => (
              <Reveal key={s} delay={i * 80}>
                <div className="group flex gap-4 py-3 border-b border-border transition-colors hover:border-primary/40">
                  <span className="font-mono text-xs text-primary shrink-0 pt-0.5 transition-transform group-hover:-translate-y-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm md:text-base font-medium">{s}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
            Capabilities // Matrix
          </p>
          <h3 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight mb-12">
            Built for Growing Businesses
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
            {capabilities.map((c, i) => (
              <Reveal key={c} delay={i * 40}>
                <div className="bg-zinc-50 p-4 text-[11px] md:text-xs font-mono uppercase tracking-wider transition-colors duration-300 hover:bg-foreground hover:text-background cursor-default h-full">
                  {c}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <span className="font-mono text-[10px] text-primary mb-4 block uppercase tracking-widest">
            [ Personas ]
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight mb-12">
            Built for Everyone
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {roles.map((r, i) => (
              <Reveal key={r.title} delay={i * 100}>
                <div>
                  <h4 className="font-mono text-xs text-primary mb-3 uppercase tracking-widest">{r.title}</h4>
                  <p className="text-sm md:text-base leading-relaxed">{r.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zinc-100">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-32 text-center">
          <Reveal>
            <h2 className="font-display text-3xl md:text-6xl font-extrabold tracking-tighter mb-6 text-balance">
              Smart Support. Faster Teams. Happier Customers.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-sm md:text-base text-muted-foreground mb-10 text-pretty max-w-2xl mx-auto">
              Everything you need to manage support — tickets, live chat, AI automation, and customer
              communication — in one modern platform.
            </p>
          </Reveal>
          <Reveal delay={200} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Link
              to="/register"
              className="group flex-1 bg-foreground text-background py-4 sm:px-8 font-mono text-xs uppercase tracking-widest hover:bg-primary transition-colors inline-flex items-center justify-center gap-2"
            >
              Start Free
              <span className="inline-block transition-transform group-hover:translate-x-1">&#8594;</span>
            </Link>
            <Link
              to="/login"
              className="flex-1 border border-foreground/30 py-4 sm:px-8 font-mono text-xs uppercase tracking-widest hover:border-foreground transition-colors inline-flex items-center justify-center"
            >
              Log In
            </Link>
          </Reveal>
        </div>
      </section>

      <footer className="bg-background border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="md:flex md:justify-between md:items-end gap-8">
            <div>
              <div className="font-display font-extrabold text-2xl uppercase italic mb-3">DeskPilot AI</div>
              <p className="text-xs text-muted-foreground font-mono leading-relaxed max-w-xs">
                Smart Support. Faster Teams. Happier Customers.
              </p>
            </div>
            <div className="mt-8 md:mt-0 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <Link to="/register">Get Started</Link>
              <Link to="/login">Log In</Link>
              <Link to="/track">Track a Ticket</Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-[9px] font-mono text-muted-foreground uppercase tracking-widest flex justify-between">
            <span>&copy; 2026 DeskPilot AI</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [orgSlug, setOrgSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginUser({ orgSlug, email, password });
      const { token, user, org } = res.data;

      login(user, token, org);

      if (user.role === "admin") navigate("/admin");
      else if (user.role === "agent") navigate("/agent");
      else navigate("/portal");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground font-display">
      {/* Background */}
      <div aria-hidden className="absolute inset-0 grid-bg opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 0%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* Left: Brand panel */}
        <aside className="hidden lg:flex flex-col justify-between border-r border-border/70 px-10 py-10">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary">
              <span className="font-mono text-[13px] font-bold tracking-tight">DP</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight">DeskPilot AI</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Operator Console
              </div>
            </div>
          </div>

          <div className="max-w-md">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              § 01 · Authentication
            </div>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight">
              Sign in to your <span className="shimmer-text">support cockpit.</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Access tickets, AI drafts, live conversations, and analytics for your
              organization. Session is scoped, encrypted, and audit-logged.
            </p>

            <ul className="mt-8 space-y-3 font-mono text-[12px] text-muted-foreground">
              {[
                "SSO-ready · SAML / OIDC",
                "Role-based workspace isolation",
                "Every action written to audit log",
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mt-[7px] inline-block h-[6px] w-[6px] rounded-full bg-primary blink" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>v1.0 · stable</span>
            <span className="flex items-center gap-2">
              <span className="h-[6px] w-[6px] rounded-full bg-emerald-500 blink" />
              All systems operational
            </span>
          </div>
        </aside>

        {/* Right: Form */}
        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary">
                <span className="font-mono text-[13px] font-bold tracking-tight">DP</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-bold tracking-tight">DeskPilot AI</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Operator Console
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-sm">
              <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-[7px] w-[7px] rounded-full bg-primary" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    auth / sign-in
                  </span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">01 / 01</span>
              </div>

              <div className="p-6 sm:p-7">
                <h2 className="text-xl font-bold tracking-tight">Welcome back</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your credentials to access your workspace.
                </p>

                {error && (
                  <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="group flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-sm font-medium opacity-50 cursor-not-allowed"
                  >
                    <GoogleIcon />
                    Google
                  </button>
                  <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="group flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-sm font-medium opacity-50 cursor-not-allowed"
                  >
                    <GithubIcon />
                    GitHub
                  </button>
                </div>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    or with email
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <Field
                    id="workspace"
                    label="Workspace"
                    hint="your-org"
                    prefix="deskpilot.ai/"
                    autoComplete="organization"
                    placeholder="acme"
                    required
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value)}
                  />
                  <Field
                    id="email"
                    label="Work email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        Password
                      </label>
                      <a href="#" className="text-xs text-muted-foreground transition hover:text-primary">
                        Forgot?
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2.5 pr-16 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-2 my-1 rounded px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <label className="flex select-none items-center gap-2 pt-1 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input accent-[color:var(--primary)]"
                      defaultChecked
                    />
                    Keep me signed in for 30 days
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-95 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Spinner /> Authenticating…
                      </>
                    ) : (
                      <>
                        Sign in
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  New to DeskPilot?{" "}
                 <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
                   Create a workspace
                </Link>
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/70 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="h-[6px] w-[6px] rounded-full bg-emerald-500 blink" />
                  Secure · TLS 1.3
                </span>
                <span>SOC 2 · GDPR</span>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to our{" "}
              <a href="#" className="underline-offset-4 hover:underline">Terms</a> and{" "}
              <a href="#" className="underline-offset-4 hover:underline">Privacy Policy</a>.
            </p>

            <div className="mt-8 flex items-center justify-center">
              <Link
                to="/login"
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition hover:text-foreground"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;

function Field({ id, label, hint, prefix, type = "text", ...rest }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </label>
        {hint && <span className="font-mono text-[10px] text-muted-foreground/70">{hint}</span>}
      </div>
      <div className="flex items-stretch overflow-hidden rounded-md border border-input bg-background transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        {prefix && (
          <span className="grid place-items-center border-r border-input bg-muted px-3 font-mono text-[11px] text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type={type}
          className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60"
          {...rest}
        />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.5 2.1-7.1 2.1-5.3 0-9.7-3-11.3-7.5l-6.5 5C9.6 39 16.3 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.1 5C41.5 34.9 43.5 30 43.5 24c0-1.2-.1-2.3-.3-3.5z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}
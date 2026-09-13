import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const slugify = (val) =>
    val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleOrgNameChange = (val) => {
    setOrgName(val);
    if (!slugTouched) setOrgSlug(slugify(val));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await registerUser({ orgName, orgSlug, name, email, password });
      const { token, user, org } = res.data;
      login(user, token, org);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground font-display">
      <div aria-hidden className="absolute inset-0 grid-bg opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 0%, color-mix(in oklch, var(--primary) 22%, transparent), transparent 70%)",
        }}
      />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary">
              <span className="font-mono text-[13px] font-bold tracking-tight">DP</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight">DeskPilot AI</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Create your workspace
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-[7px] w-[7px] rounded-full bg-primary" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  auth / sign-up
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <h2 className="text-xl font-bold tracking-tight">Get started</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up your organization and admin account in under a minute.
              </p>

              {error && (
                <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Organization name
                  </label>
                  <input
                    value={orgName}
                    onChange={(e) => handleOrgNameChange(e.target.value)}
                    placeholder="Acme Inc"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Workspace URL
                  </label>
                  <div className="flex items-stretch overflow-hidden rounded-md border border-input bg-background transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                    <span className="grid place-items-center border-r border-input bg-muted px-3 font-mono text-[11px] text-muted-foreground">
                      deskpilot.ai/
                    </span>
                    <input
                      value={orgSlug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setOrgSlug(slugify(e.target.value));
                      }}
                      placeholder="acme"
                      required
                      className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Your name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Work email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-95 disabled:opacity-70"
                >
                  {loading ? "Creating workspace..." : "Create workspace"}
                  {!loading && <span className="transition-transform group-hover:translate-x-1">&#8594;</span>}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have a workspace?{" "}
                <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Layers3,
  LockKeyhole,
  Users,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
export default function Home() {
  const { user, loading } = useAuth();
  return (
    <div className="min-h-screen overflow-hidden bg-[#0B0C10] text-[#C5C6C7]">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link
          to="/"
          className="flex items-center gap-3 text-xl font-bold text-white"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#66FCF1]/10 text-[#66FCF1]">
            <BookOpen size={21} />
          </span>
          Doc<span className="text-[#66FCF1]">Hub</span>
        </Link>
        <nav className="flex items-center gap-3">
          {loading ? (
            <span className="h-9 w-24 animate-pulse rounded-lg bg-white/5" />
          ) : user ? (
            <Link
              to="/dashboard"
              className="rounded-xl bg-[#66FCF1] px-4 py-2.5 text-sm font-bold text-[#0B0C10]"
            >
              Open workspace <ArrowRight className="ml-1 inline" size={15} />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-[#66FCF1] px-4 py-2.5 text-sm font-bold text-[#0B0C10]"
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6">
        <section className="relative grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_.95fr]">
          <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#45A29E]/10 blur-[120px]" />
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#45A29E]/30 bg-[#45A29E]/10 px-3 py-1.5 text-xs font-semibold text-[#66FCF1]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#66FCF1]" />{" "}
              Knowledge, organized
            </div>
            <h1 className="max-w-2xl text-5xl font-bold leading-[1.08] tracking-tight text-white md:text-7xl">
              A better home for{" "}
              <span className="text-[#66FCF1]">shared knowledge.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-slate-400">
              Create documentation, keep your work organized, and collaborate
              with your team in one secure workspace. Built for clarity,
              ownership, and accountable access.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 rounded-xl bg-[#66FCF1] px-6 py-3.5 text-sm font-bold text-[#0B0C10] hover:bg-[#a1fff8]"
              >
                Get started <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-white/10 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                Sign in
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#45A29E]" />{" "}
                JWT-secured sessions
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#45A29E]" /> Role-based
                access
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#45A29E]" /> Shared
                groups
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-[#45A29E]/10 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-[#11151c] p-5 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                </div>
                <span className="text-[10px] uppercase tracking-[.2em] text-slate-600">
                  Workspace preview
                </span>
              </div>
              <div className="grid grid-cols-[42px_1fr] gap-4 pt-5">
                <div className="space-y-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#66FCF1]/10 text-[#66FCF1]">
                    <BookOpen size={17} />
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-slate-500">
                    <Layers3 size={17} />
                  </div>
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-slate-500">
                    <Users size={17} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500">MY WORKSPACE</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    Engineering handbook
                  </h3>
                  <div className="mt-5 space-y-3">
                    {[
                      {
                        name: "Getting started with the API",
                        tag: "Published",
                        tone: "text-emerald-300",
                      },
                      {
                        name: "Deployment checklist",
                        tag: "Draft",
                        tone: "text-amber-300",
                      },
                      {
                        name: "Database conventions",
                        tag: "Published",
                        tone: "text-emerald-300",
                      },
                    ].map((x) => (
                      <div
                        key={x.name}
                        className="flex items-center justify-between rounded-xl border border-white/6 bg-white/[.025] p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#45A29E]/10 text-[#66FCF1]">
                            <FileText size={15} />
                          </div>
                          <span className="text-xs font-medium text-slate-300">
                            {x.name}
                          </span>
                        </div>
                        <span className={`text-[10px] ${x.tone}`}>{x.tag}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-xl border border-[#45A29E]/20 bg-[#45A29E]/5 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#66FCF1]">
                      <ShieldCheck size={15} /> Access controls active
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-slate-500">
                      Account ownership and group permissions are checked by the
                      API on every protected request.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="grid gap-4 border-t border-white/8 py-14 md:grid-cols-3">
          {[
            {
              icon: FileText,
              title: "Structured documentation",
              desc: "Write and preview Markdown records, organize them by category, and track publication status.",
            },
            {
              icon: Users,
              title: "Team collaboration",
              desc: "Create shared groups, assign records, and manage member access with owner and editor permissions.",
            },
            {
              icon: LockKeyhole,
              title: "Security by design",
              desc: "Short-lived access tokens, refresh sessions, role checks, and auditable administration.",
            },
          ].map((x) => (
            <div
              key={x.title}
              className="rounded-2xl border border-white/8 bg-[#11151c] p-6"
            >
              <x.icon className="mb-5 text-[#66FCF1]" size={22} />
              <h3 className="font-semibold text-white">{x.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{x.desc}</p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t border-white/8 px-6 py-7 text-center text-xs text-slate-600">
        DocHub · A secure internal knowledge-sharing platform
      </footer>
    </div>
  );
}

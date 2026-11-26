import { NavLink, useNavigate } from "react-router-dom";
import { BookOpen, LayoutDashboard, Users, Settings, Shield, LogOut, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AppShell({ children, title, description, action }: {
  children: ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { to: "/dashboard", label: "Workspace", icon: LayoutDashboard },
    { to: "/groups", label: "Shared groups", icon: Users },
    { to: "/account", label: "Account & security", icon: Settings },
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Administration", icon: Shield }] : []),
  ];
  async function signOut() { await logout(); navigate("/login", { replace: true }); }
  return <div className="min-h-screen bg-[#0B0C10] text-[#C5C6C7]">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/8 bg-[#11151c] p-5 transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <NavLink to="/" className="mb-10 flex items-center gap-3 px-2 text-xl font-bold tracking-tight text-white">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#66FCF1]/10 text-[#66FCF1]"><BookOpen size={21}/></span>
        Doc<span className="text-[#66FCF1]">Hub</span>
      </NavLink>
      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-500">Workspace</p>
      <nav className="space-y-1">{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} onClick={()=>setMobileOpen(false)} className={({isActive})=>`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive?"bg-[#66FCF1]/10 text-[#66FCF1]":"text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={17}/>{label}</NavLink>)}</nav>
      <div className="mt-auto rounded-2xl border border-white/8 bg-white/[.03] p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#45A29E]/20 text-sm font-bold text-[#66FCF1]">{user?.name?.slice(0,1).toUpperCase()}</div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{user?.name}</p><p className="text-xs capitalize text-slate-500">{user?.role}</p></div>
        </div>
        <button onClick={signOut} className="mt-4 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-400 hover:bg-red-400/10 hover:text-red-300"><LogOut size={15}/> Sign out</button>
      </div>
    </aside>
    {mobileOpen && <button aria-label="Close navigation" onClick={()=>setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/60 lg:hidden"/>}
    <div className="lg:pl-64">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/8 bg-[#0B0C10]/85 px-5 backdrop-blur-xl md:px-8">
        <button aria-label="Open navigation" onClick={()=>setMobileOpen(true)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden"><Menu size={20}/></button>
        <div className="hidden text-xs text-slate-500 sm:block">DOCHUB <span className="px-2 text-slate-700">/</span> {title.toUpperCase()}</div>
        <div className="ml-auto flex items-center gap-3">{action}<span className="hidden h-8 w-px bg-white/10 sm:block"/><span className="hidden text-sm text-slate-400 sm:block">{user?.email}</span></div>
      </header>
      <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-[#45A29E]">Knowledge workspace</p><h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>{description&&<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>}</div></div>
        {children}
      </main>
    </div>
  </div>;
}

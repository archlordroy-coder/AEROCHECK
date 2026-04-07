import { cn } from "@/lib/utils";
const appLogo = "/favicon.svg";
import {
  Activity,
  BellRing,
  BookCheck,
  ChevronRight,
  CircleUserRound,
  LayoutDashboard,
  Menu,
  Search,
  ShieldCheck,
  ShieldEllipsis,
  Workflow,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const navigation = [
  {
    to: "/",
    label: "Centre de pilotage",
    caption: "Vue operations et conformite",
    icon: LayoutDashboard,
  },
  {
    to: "/portail",
    label: "Postes metier",
    caption: "Roles, circuits et responsabilites",
    icon: Workflow,
  },
  {
    to: "/admin",
    label: "Super admin",
    caption: "Comptes, droits et donnees globales",
    icon: ShieldEllipsis,
  },
];

const quickOptions = [
  {
    label: "Dossiers",
    detail: "Suivi pieces et statuts",
    icon: BookCheck,
  },
  {
    label: "Conformite",
    detail: "Alertes et echeances",
    icon: ShieldCheck,
  },
  {
    label: "Comptes",
    detail: "Acces et permissions",
    icon: CircleUserRound,
  },
];

const navItemClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    "group flex items-start gap-3 rounded-[1.35rem] border px-4 py-4 transition-all",
    isActive
      ? "border-primary/20 bg-primary text-primary-foreground shadow-panel"
      : "border-transparent bg-white/55 text-muted-foreground hover:border-border hover:bg-white hover:text-foreground",
  );

export default function SiteLayout() {
  const location = useLocation();
  const current =
    navigation.find(
      (item) =>
        location.pathname === item.to ||
        (item.to !== "/" && location.pathname.startsWith(`${item.to}/`)),
    ) || navigation[0];

  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(245,249,250,1),rgba(233,242,245,0.95))]">
      <div className="grid h-full min-h-0 grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden h-full min-h-0 border-r border-border/70 bg-[linear-gradient(180deg,rgba(11,31,55,1),rgba(15,43,71,0.98))] text-white xl:flex xl:flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="group flex items-center gap-4 transition-all duration-300">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-white shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <img
                  src={appLogo}
                  alt="Logo AEROCHECK"
                  className="h-11 w-11 object-contain drop-shadow-sm"
                />
              </div>
              <div>
                <p className="font-display text-2xl font-black tracking-tight">
                  AEROCHECK
                </p>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-100/75">
                  Application metier
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-200/80">
              Gestion des comptes, licences, validations documentaires et
              gouvernance multi-pays dans un poste de travail unifie.
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
            <nav className="space-y-3">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink key={item.to} to={item.to} className={navItemClassName}>
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="mt-1 text-xs leading-6 text-inherit/75">
                        {item.caption}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5" />
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-white/10 px-4 py-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <Activity className="h-3.5 w-3.5" />
                Statut
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                Frontend + backend separes
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-200/80">
                La structure est prete pour des sessions, une base de donnees,
                l'audit et les jobs de notification.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 flex-col">
          <header className="border-b border-border/70 bg-white/80 px-4 py-4 backdrop-blur-xl md:px-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white text-foreground shadow-panel xl:hidden"
                    aria-label="Menu principal"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="group flex h-12 w-12 items-center justify-center rounded-[1rem] border border-border bg-white shadow-panel transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
                      <img
                        src={appLogo}
                        alt="Logo AEROCHECK"
                        className="h-9 w-9 object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div>
                      <p className="font-display text-xl font-black tracking-tight text-foreground">
                        AEROCHECK
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Poste de travail
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(260px,340px)_auto_auto] lg:items-center">
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-panel">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Recherche
                      </p>
                      <p className="truncate text-sm text-foreground">
                        Agents, licences, pays, comptes...
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground shadow-panel transition-colors hover:bg-muted"
                  >
                    <BellRing className="h-4 w-4 text-primary" />
                    3 alertes
                  </button>
                  <div className="rounded-2xl border border-border bg-slate-950 px-4 py-3 text-white shadow-panel">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                      Session
                    </p>
                    <p className="mt-1 text-sm font-semibold">Super admin</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-[1.75rem] border border-border/80 bg-white/70 p-4 shadow-panel">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                      {current.label}
                    </p>
                    <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-foreground md:text-3xl">
                      {current.caption}
                    </h1>
                  </div>

                  <nav className="flex flex-wrap gap-2" aria-label="Navigation principale">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all",
                            isActive
                              ? "border-primary bg-primary text-primary-foreground shadow-panel"
                              : "border-border bg-white text-foreground hover:bg-muted",
                          )
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="rounded-2xl border border-border bg-white px-4 py-3 shadow-panel">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      <Activity className="h-3.5 w-3.5" />
                      Systeme
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      Sessions et API decouplees
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white px-4 py-3 shadow-panel">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Controle
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      RBAC detaille et audit
                    </p>
                  </div>
                  {quickOptions.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-left shadow-panel transition-colors hover:bg-muted"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <option.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {option.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {option.detail}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-hidden p-3 md:p-4">
            <div className="h-full min-h-0 overflow-auto rounded-[2rem] border border-white/60 bg-white/55 p-3 shadow-panel backdrop-blur md:p-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

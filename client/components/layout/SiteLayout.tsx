import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Radar,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/", label: "Accueil" },
  { to: "/portail", label: "Portail" },
];

const navItemClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground shadow-panel"
      : "text-muted-foreground hover:bg-white/80 hover:text-foreground",
  );

export default function SiteLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(circle_at_top_left,_hsla(189,_81%,_64%,_0.20),_transparent_34%),radial-gradient(circle_at_top_right,_hsla(213,_91%,_35%,_0.16),_transparent_32%),linear-gradient(180deg,_hsla(210,_50%,_99%,_1),_hsla(195,_33%,_96%,_1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[linear-gradient(hsla(211,_33%,_86%,_0.22)_1px,_transparent_1px),linear-gradient(90deg,hsla(211,_33%,_86%,_0.22)_1px,_transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(180deg,black,transparent_88%)]" />

      <header className="sticky top-0 z-30 border-b border-white/70 bg-background/80 backdrop-blur-xl">
        <div className="container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-panel">
              <Radar className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-extrabold tracking-tight text-foreground">
                AEROCHECK
              </p>
              <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">
                Contrôle · Gestion · Suivi
              </p>
            </div>
          </NavLink>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <nav className="flex flex-wrap items-center gap-2 rounded-full border border-border/80 bg-white/85 p-1 shadow-panel">
              {navigation.map((item) => (
                <NavLink key={item.to} to={item.to} className={navItemClassName}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <NavLink
              to="/portail"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Explorer le portail
              <ArrowRight className="h-4 w-4" />
            </NavLink>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-border/80 bg-white/75 backdrop-blur-xl">
        <div className="container grid gap-8 py-10 md:grid-cols-[1.3fr_0.7fr] md:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Plateforme de conformité aéronautique
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Une base claire pour piloter la validité des licences.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Cette première version met en scène l’identité visuelle, le
                parcours de validation et la structure métier d’AEROCHECK pour
                une future extension vers les espaces agents, QIP, DLAA, DNA et
                super admin.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <NavLink
              to="/"
              className="flex items-center justify-between rounded-3xl border border-border bg-background px-5 py-4 text-sm font-medium text-foreground shadow-panel transition-transform hover:-translate-y-0.5"
            >
              Retour à l’accueil
              <Radar className="h-4 w-4 text-primary" />
            </NavLink>
            <NavLink
              to="/portail"
              className="flex items-center justify-between rounded-3xl border border-border bg-background px-5 py-4 text-sm font-medium text-foreground shadow-panel transition-transform hover:-translate-y-0.5"
            >
              Vue métier
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}

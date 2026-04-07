import { Compass, Home, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-14">
      <div className="max-w-2xl rounded-[2rem] border border-border/70 bg-white/90 p-8 text-center shadow-glow md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-panel">
          <Compass className="h-7 w-7" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.32em] text-primary">
          Route introuvable
        </p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-foreground md:text-5xl">
          Cet ecran n'existe pas encore dans le parcours AEROCHECK.
        </h1>
        <p className="mt-4 text-base leading-8 text-muted-foreground">
          L'interface a ete recentree sur le centre de pilotage et les postes
          metier. Les prochaines routes a ajouter logiquement sont
          l'authentification, la soumission de dossier, la validation et
          l'audit.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-panel transition-transform hover:-translate-y-0.5"
          >
            <Home className="h-4 w-4" />
            Retour a l'accueil
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-panel transition-transform hover:-translate-y-0.5"
          >
            <LayoutDashboard className="h-4 w-4 text-primary" />
            Ouvrir l'application
          </Link>
        </div>
      </div>
    </div>
  );
}

import SectionHeading from "@/components/home/SectionHeading";
import { getOverview } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Database,
  LoaderCircle,
  Lock,
  MonitorCog,
  DNAllipsis,
  UserCog,
} from "lucide-react";

export default function Admin() {
  const overviewQuery = useQuery({
    queryKey: ["overview"],
    queryFn: getOverview,
  });

  if (overviewQuery.isLoading) {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center py-12">
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-white/90 px-5 py-3 text-sm font-medium text-foreground shadow-panel">
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          Chargement du panel super admin...
        </div>
      </div>
    );
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return null;
  }

  const data = overviewQuery.data;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-glow md:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px] xl:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <DNAllipsis className="h-3.5 w-3.5" />
              Panel super admin
            </div>
            <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Gouverner toutes les donnees, tous les comptes et toutes les
              permissions depuis un seul poste de controle.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
              Le CDC v2 demande explicitement un espace capable de generer,
              modifier, verrouiller, auditer et superviser l'ensemble des donnees
              metier et techniques. Cette page traduit ce besoin dans le
              produit.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[1.6rem] border border-border bg-slate-950 p-5 text-white shadow-panel">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                <MonitorCog className="h-4 w-4" />
                Capacite attendue
              </div>
              <p className="mt-3 font-display text-2xl font-black">
                Administration absolue
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Comptes, pays, aeroports, licences, notifications, audit,
                monitoring et parametrage global.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-border bg-white p-5 shadow-panel">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                <Lock className="h-4 w-4" />
                Gouvernance
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Toute action sensible doit etre auditee, rolee et reversible au
                maximum.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-2">
        <SectionHeading
          eyebrow="Modules"
          title="Le panel admin ne doit rien laisser hors gouvernance"
          description="Ces modules sont necessaires pour respecter le CDC v2 et permettre la generation ou maintenance de toutes les donnees du systeme."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {data.adminModules.map((module, index) => (
            <article
              key={module.title}
              className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {module.scope}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-black text-foreground">
                    {module.title}
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {index % 2 === 0 ? (
                    <Database className="h-5 w-5" />
                  ) : (
                    <UserCog className="h-5 w-5" />
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {module.description}
              </p>
              <ul className="mt-5 space-y-3">
                {module.actions.map((action) => (
                  <li
                    key={action}
                    className="flex items-start gap-3 rounded-2xl bg-background px-4 py-3 text-sm leading-7 text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-2 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <article className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel">
          <SectionHeading
            eyebrow="Permissions"
            title="Le role systeme doit s'appuyer sur une matrice de permissions explicite"
            description="Le CDC v2 suggere un controle plus fin que de simples roles. Cette matrice donne la direction fonctionnelle."
          />

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-border">
            <div className="grid grid-cols-[2.3fr_repeat(5,minmax(0,1fr))] gap-3 border-b border-border bg-muted/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span>Capacite</span>
              <span>Agent</span>
              <span>QIP</span>
              <span>DLAA</span>
              <span>SUPER_ADMINA</span>
              <span>Super admin</span>
            </div>
            {data.permissionMatrix.map((row) => (
              <div
                key={row.capability}
                className="grid grid-cols-[2.3fr_repeat(5,minmax(0,1fr))] gap-3 border-b border-border/70 px-4 py-4 text-sm last:border-b-0"
              >
                <span className="font-medium text-foreground">{row.capability}</span>
                {[row.agent, row.qip, row.dlaa, row.dna, row.super_admin].map(
                  (value, index) => (
                    <span key={`${row.capability}-${index}`} className="text-center">
                      {value ? "Oui" : "Non"}
                    </span>
                  ),
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel">
          <SectionHeading
            eyebrow="Cycle de compte"
            title="Le systeme de comptes doit etre gouverne de bout en bout"
            description="Creation, activation, usage, suspension et audit doivent tous etre encadres."
          />

          <div className="mt-6 space-y-4">
            {data.accountLifecycle.map((step) => (
              <div
                key={step.title}
                className="rounded-[1.5rem] border border-border bg-background p-4"
              >
                <h3 className="font-display text-xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {step.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {step.owners.map((owner) => (
                    <span
                      key={owner}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      {owner}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

import SectionHeading from "@/components/home/SectionHeading";
import { getOverview } from "@/lib/api";
import { roleIcons, roleSnapshots } from "@/lib/workspace-config";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Portal() {
  const overviewQuery = useQuery({
    queryKey: ["overview"],
    queryFn: getOverview,
  });

  if (overviewQuery.isLoading) {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center py-12">
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-white/90 px-5 py-3 text-sm font-medium text-foreground shadow-panel">
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          Chargement des postes metier...
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
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Postes metier et dashboards
            </div>
            <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Une interface qui montre qui agit, sur quoi, et avec quel niveau
              d'autorite.
            </h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">
              Le cahier des charges insiste sur la repartition stricte des
              responsabilites. Cette page rend chaque espace explicite avec ses
              indicateurs, permissions et actions attendues.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-panel transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au centre de pilotage
          </Link>
        </div>
      </section>

      <section className="mt-2">
        <SectionHeading
          eyebrow="Dashboards"
          title="Chaque role doit voir un poste de travail, pas un simple resume marketing"
          description="Les cartes suivantes simulent ce que devrait afficher un premier ecran utile pour chaque profil majeur de la plateforme."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {data.workspaces.map((workspace) => {
            const snapshot = roleSnapshots[workspace.role];
            const RoleIcon = roleIcons[workspace.role];

            return (
              <article
                key={workspace.role}
                className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      {workspace.title}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-black text-foreground">
                      {snapshot.heading}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <RoleIcon className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {workspace.summary}
                </p>

                <div className="mt-5 grid gap-3">
                  {snapshot.stats.map((stat) => (
                    <div
                      key={stat}
                      className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground"
                    >
                      {stat}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-dashed border-border bg-muted/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Actions cles
                  </p>
                  <ul className="mt-3 space-y-2">
                    {snapshot.actions.map((action) => (
                      <li
                        key={action}
                        className="flex items-start gap-2 text-sm leading-7 text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Permissions
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {workspace.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/portail/${workspace.role}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5"
                >
                  Ouvrir l'interface
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-2 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel">
          <SectionHeading
            eyebrow="Responsabilites"
            title="La segregation des taches doit rester visible en permanence"
            description="Le CDC impose une creation de compte et des validations differentes selon les roles. Cette zone sert de rappel fonctionnel."
          />

          <div className="mt-6 space-y-4">
            {data.workspaces.map((workspace) => (
              <div
                key={workspace.role}
                className="rounded-[1.5rem] border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {workspace.title}
                  </h3>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    {workspace.role}
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {workspace.responsibilities.map((responsibility) => (
                    <li
                      key={responsibility}
                      className="flex items-start gap-2 text-sm leading-7 text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel">
          <SectionHeading
            eyebrow="Exigences"
            title="Les contraintes non fonctionnelles influencent directement l'interface"
            description="Disponibilite, audit, compatibilite et securite ne sont pas des notes annexes: elles doivent guider le design des futurs ecrans."
          />

          <div className="mt-6 space-y-4">
            {data.requirementGroups.map((group, index) => (
              <div
                key={group.title}
                className="rounded-[1.5rem] border border-border bg-background p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {index % 2 === 0 ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {group.title}
                  </h3>
                </div>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-2xl bg-white px-4 py-3 text-sm leading-7 text-muted-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

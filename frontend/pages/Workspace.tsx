import SectionHeading from "@/components/home/SectionHeading";
import { roleIcons, roleInterfaceContent, roleSnapshots } from "@/lib/workspace-config";
import { statsApi } from "@/lib/api";
import { UserRole } from "@shared/api";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, LoaderCircle } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

const validRoles: UserRole[] = ["agent", "qip", "dlaa", "dna", "super_admin"];

export default function WorkspacePage() {
  const { role } = useParams<{ role: UserRole }>();
  const overviewQuery = useQuery({
    queryKey: ["overview"],
    queryFn: statsApi.overview,
  });

  if (!role || !validRoles.includes(role)) {
    return <Navigate to="/portail" replace />;
  }

  if (overviewQuery.isLoading) {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center py-12">
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-white/90 px-5 py-3 text-sm font-medium text-foreground shadow-panel">
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          Chargement de l'espace metier...
        </div>
      </div>
    );
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return <Navigate to="/portail" replace />;
  }

  const workspace = overviewQuery.data.workspaces.find((item) => item.role === role);

  if (!workspace) {
    return <Navigate to="/portail" replace />;
  }

  const snapshot = roleSnapshots[role];
  const interfaceContent = roleInterfaceContent[role];
  const RoleIcon = roleIcons[role];

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-glow md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <RoleIcon className="h-3.5 w-3.5" />
              {interfaceContent.badge}
            </div>
            <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-foreground md:text-5xl">
              {workspace.title}
            </h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">
              {interfaceContent.summary}
            </p>
          </div>

          <Link
            to="/portail"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-panel transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux postes metier
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {snapshot.stats.map((stat) => (
          <article
            key={stat}
            className="rounded-[1.75rem] border border-border/70 bg-white/90 p-5 shadow-panel"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Indicateur cle
            </p>
            <p className="mt-3 font-display text-2xl font-black text-foreground">
              {stat}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-2">
        <SectionHeading
          eyebrow="Interface"
          title={`Cette carte ouvre maintenant un veritable espace ${workspace.title.toLowerCase()}`}
          description="Chaque role dispose de ses propres panneaux, actions et zones de controle au lieu d'un simple encart de presentation."
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          {interfaceContent.panels.map((panel) => (
            <article
              key={panel.title}
              className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <panel.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-black text-foreground">
                    {panel.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {panel.detail}
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-3">
                {panel.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-2xl bg-background px-4 py-3 text-sm leading-7 text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-2 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel">
          <SectionHeading
            eyebrow="Actions"
            title="Actions immediates attendues dans cet espace"
            description="Le premier ecran doit orienter le role vers les prochaines operations utiles."
          />

          <div className="mt-6 space-y-3">
            {snapshot.actions.map((action) => (
              <div
                key={action}
                className="rounded-[1.5rem] border border-border bg-background px-4 py-4 text-sm font-medium text-foreground"
              >
                {action}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel">
          <SectionHeading
            eyebrow="Responsabilites"
            title="Perimetre fonctionnel du role"
            description="Cette zone rappelle ce que ce poste doit piloter au quotidien."
          />

          <div className="mt-6 space-y-3">
            {workspace.responsibilities.map((responsibility) => (
              <div
                key={responsibility}
                className="rounded-[1.5rem] border border-border bg-background px-4 py-4 text-sm leading-7 text-muted-foreground"
              >
                {responsibility}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

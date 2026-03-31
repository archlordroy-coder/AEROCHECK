import SectionHeading from "@/components/home/SectionHeading";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  FileCheck2,
  MailCheck,
  Shield,
  UserRound,
  Users,
} from "lucide-react";

const workspaces = [
  {
    title: "Agent",
    icon: UserRound,
    description:
      "Création de compte, dépôt des pièces et suivi de la conformité en temps réel.",
    bullets: ["Tableau de validité", "Notifications e-mail", "Historique des pièces"],
  },
  {
    title: "QIP",
    icon: FileCheck2,
    description:
      "Validation de premier niveau, gestion des comptes agents et supervision nationale.",
    bullets: ["Validation initiale", "Administration pays", "Accès aux dossiers"],
  },
  {
    title: "DLAA",
    icon: BadgeCheck,
    description:
      "Deuxième niveau de contrôle avec vision consolidée des QIP et des agents du pays.",
    bullets: ["Double vérification", "Verrouillage des comptes", "Vision transverse"],
  },
  {
    title: "DNA",
    icon: Users,
    description:
      "Observation globale des opérations pays et ajout d’autres superviseurs DNA.",
    bullets: ["Supervision régionale", "Vue multi-pays", "Pilotage hiérarchique"],
  },
  {
    title: "Super admin",
    icon: Shield,
    description:
      "Monitoring plateforme, trafic et gouvernance technique de l’écosystème.",
    bullets: ["Trafic", "Santé globale", "Administration stratégique"],
  },
];

const modules = [
  {
    title: "Documents intelligents",
    icon: FileCheck2,
    text: "Centraliser le certificat médical, le test d’anglais et le contrôle de compétences avec leurs règles d’expiration.",
  },
  {
    title: "Circuit d’approbation",
    icon: MailCheck,
    text: "Tracer la validation QIP puis DLAA avec notifications automatiques en cas de rejet ou de validation finale.",
  },
  {
    title: "Pilotage analytique",
    icon: ChartNoAxesCombined,
    text: "Offrir des indicateurs de conformité, d’échéances à venir et de performance par pays ou aéroport.",
  },
  {
    title: "Administration des rôles",
    icon: BriefcaseBusiness,
    text: "Attribuer les permissions selon les responsabilités réelles de chaque acteur dans la chaîne de contrôle.",
  },
];

export default function Portal() {
  return (
    <div className="container py-10 md:py-14">
      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-white/85 p-6 shadow-glow md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              Portail métier AEROCHECK
            </div>
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-black tracking-tight text-foreground md:text-5xl">
                Une vue claire des espaces qui structureront l’application.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                Cette page pose la base produit de la future plateforme : chaque
                rôle dispose d’un espace dédié, d’une capacité de validation et
                d’un niveau de supervision cohérent avec le document source.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-panel transition-transform hover:-translate-y-0.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à l’accueil
              </Link>
              <div className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground">
                Prototype UX prêt à détailler
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.75rem] border border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(236,247,250,0.92))] p-5 shadow-panel">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border/70 bg-white p-5">
                <p className="text-sm text-muted-foreground">Rôles couverts</p>
                <p className="mt-2 font-display text-4xl font-black text-foreground">
                  5
                </p>
              </div>
              <div className="rounded-3xl border border-border/70 bg-white p-5">
                <p className="text-sm text-muted-foreground">Niveaux de validation</p>
                <p className="mt-2 font-display text-4xl font-black text-foreground">
                  2
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-dashed border-primary/20 bg-primary/5 p-5">
              <p className="text-sm font-semibold text-primary">
                Objectif de la prochaine étape
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Transformer ces cartes en dashboards détaillés, formulaires de
                création de compte et écrans de validation réels, sans casser
                l’identité visuelle commune.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 space-y-8">
        <SectionHeading
          eyebrow="Espaces utilisateurs"
          title="Une architecture métier lisible par rôle"
          description="Chaque acteur dispose d’une responsabilité précise dans la chaîne de contrôle. Cette organisation permet d’éviter les doublons et de sécuriser la délivrance des licences."
        />

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => {
            const Icon = workspace.icon;

            return (
              <article
                key={workspace.title}
                className="rounded-[1.75rem] border border-border/70 bg-white/90 p-6 shadow-panel"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    {workspace.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {workspace.description}
                </p>
                <ul className="mt-5 space-y-3">
                  {workspace.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3 text-sm font-medium text-foreground"
                    >
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-16 rounded-[2rem] border border-border/70 bg-white/85 p-6 shadow-panel md:p-8">
        <SectionHeading
          eyebrow="Blocs fonctionnels"
          title="Les modules à industrialiser ensuite"
          description="La base visuelle est prête pour accueillir les fonctionnalités métier les plus structurantes du produit."
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <article
                key={module.title}
                className="rounded-[1.75rem] border border-border/70 bg-background p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {module.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {module.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

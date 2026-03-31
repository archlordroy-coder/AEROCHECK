import SectionHeading from "@/components/home/SectionHeading";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileHeart,
  MailCheck,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

const metrics = [
  {
    value: "02",
    label: "niveaux de validation",
    detail: "contrôle initial par QIP puis validation finale par DLAA",
  },
  {
    value: "03",
    label: "documents indispensables",
    detail: "certificat médical, test d’anglais et contrôle de compétences",
  },
  {
    value: "05",
    label: "profils utilisateurs",
    detail: "agent, QIP, DLAA, DNA et super admin",
  },
];

const documents = [
  {
    title: "Certificat médical",
    icon: FileHeart,
    accent: "from-sky-500/20 via-cyan-400/10 to-transparent",
    rules: [
      "Valable 2 ans pour les personnes de 0 à 40 ans.",
      "Valable 1 an pour les personnes de plus de 40 ans.",
      "Le système doit anticiper l’expiration selon l’âge du demandeur.",
    ],
  },
  {
    title: "Test d’anglais",
    icon: BadgeCheck,
    accent: "from-emerald-500/20 via-teal-400/10 to-transparent",
    rules: [
      "Note inférieure à 4 : échec.",
      "Note 4 : validité de 3 ans ; note 5 : validité de 6 ans.",
      "Note 6 : validité à vie.",
    ],
  },
  {
    title: "Contrôle de compétences",
    icon: ClipboardCheck,
    accent: "from-amber-500/20 via-orange-400/10 to-transparent",
    rules: [
      "Valable uniquement sur 1 an.",
      "Pièce indispensable avant toute délivrance de licence.",
      "Doit être contrôlée à chaque nouveau cycle de renouvellement.",
    ],
  },
];

const processSteps = [
  {
    title: "Soumission du dossier",
    description:
      "Le demandeur crée son compte, renseigne ses informations et transmet les trois pièces justificatives.",
    icon: FileCheck2,
  },
  {
    title: "Contrôle QIP",
    description:
      "Le QIP vérifie le dossier, valide ou rejette la demande et autorise la seconde revue uniquement si le dossier est conforme.",
    icon: CheckCircle2,
  },
  {
    title: "Validation DLAA",
    description:
      "Le DLAA réalise la deuxième vérification et confirme la délivrance. Le demandeur reçoit ensuite la notification finale.",
    icon: MailCheck,
  },
];

const roles = [
  {
    title: "Agent",
    icon: UserRound,
    text: "Crée son compte, dépose ses pièces et suit la validité de ses documents depuis son dashboard.",
  },
  {
    title: "QIP",
    icon: Building2,
    text: "Administre les comptes agents de son pays et réalise la première validation documentaire.",
  },
  {
    title: "DLAA",
    icon: ShieldCheck,
    text: "Supervise les QIP du pays, verrouille la création de comptes et effectue la validation de second niveau.",
  },
  {
    title: "DNA",
    icon: Users,
    text: "Observe le fonctionnement global dans les pays et peut ajouter d’autres superviseurs DNA.",
  },
  {
    title: "Super admin",
    icon: BriefcaseBusiness,
    text: "Monitor l’activité de la plateforme et garde une vision transverse du trafic et des opérations.",
  },
];

const accountForms = [
  {
    title: "Compte agent",
    fields: [
      "Nom(s) & prénom(s)",
      "Fonction",
      "E-mail",
      "Pays",
      "Aéroport d’affectation",
      "Téléphone(s)",
      "Mot de passe",
    ],
  },
  {
    title: "Compte QIP / DLAA",
    fields: [
      "Nom(s) & prénom(s)",
      "Poste occupé",
      "Matricule",
      "Date de nomination",
      "Pays de fonction",
    ],
  },
  {
    title: "Compte DNA",
    fields: [
      "Nom(s) & prénom(s)",
      "Poste occupé",
      "Matricule",
      "Date de nomination",
    ],
  },
  {
    title: "Compte super admin",
    fields: ["Nom(s) & prénom(s)", "E-mail"],
  },
];

export default function Index() {
  return (
    <div className="container py-8 md:py-12">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-start xl:gap-12">
        <div className="space-y-8 lg:pr-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary shadow-panel">
            <BellRing className="h-3.5 w-3.5" />
            Plateforme de gestion des licences aéroportuaires
          </div>

          <div className="space-y-5">
            <h1 className="font-display text-5xl font-black tracking-tight text-foreground md:text-6xl xl:text-7xl">
              Une interface claire pour contrôler, valider et suivre chaque
              licence en toute confiance.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              AEROCHECK centralise les pièces obligatoires, structure le double
              niveau de validation et donne à chaque acteur une vision simple de
              la conformité documentaire dans son périmètre.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/portail"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Découvrir les espaces métiers
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white/80 px-6 py-3.5 text-sm font-semibold text-foreground shadow-panel">
              <CalendarClock className="h-4 w-4 text-primary" />
              Règles de validité intégrées dès la conception
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-[1.75rem] border border-border/70 bg-white/85 p-5 shadow-panel backdrop-blur"
              >
                <p className="font-display text-4xl font-black text-foreground">
                  {metric.value}
                </p>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  {metric.label}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {metric.detail}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(231,244,247,0.94))] p-5 shadow-glow md:p-7 lg:ml-2">
          <div className="flex items-center justify-between rounded-[1.5rem] border border-border/70 bg-white px-5 py-4 shadow-panel">
            <div>
              <p className="text-sm text-muted-foreground">État du dossier</p>
              <p className="font-display text-2xl font-bold text-foreground">
                Validation orchestrée
              </p>
            </div>
            <div className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-700">
              Conforme si 3/3 pièces actives
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <article className="rounded-[1.5rem] border border-border/70 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Certificat médical
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    Validité pilotée selon l’âge
                  </p>
                </div>
                <div className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
                  1 à 2 ans
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-muted">
                <div className="h-2 w-[78%] rounded-full bg-primary" />
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-border/70 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Test d’anglais</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    Durée variable selon la note
                  </p>
                </div>
                <div className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
                  3, 6 ans ou à vie
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["< 4 : échec", "4 : 3 ans", "5 : 6 ans", "6 : à vie"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-border/70 bg-[linear-gradient(135deg,hsl(var(--primary))/0.95,hsl(var(--accent))/0.95)] p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/70">
                    Notification automatisée
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    Rejet immédiat ou délivrance finale confirmée par e-mail.
                  </p>
                </div>
                <MailCheck className="h-6 w-6 shrink-0 text-white" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
                  Si rejet : notification instantanée au demandeur.
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
                  Si validation QIP : transmission DLAA automatique.
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="mt-20 space-y-8 lg:mt-24">
        <SectionHeading
          eyebrow="Règles documentaires"
          title="Les trois pièces qui conditionnent la délivrance de la licence"
          description="Le design met en avant les règles métier dès la page d’accueil pour rendre les échéances compréhensibles et réduire les erreurs de soumission."
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {documents.map((document) => {
            const Icon = document.icon;

            return (
              <article
                key={document.title}
                className="relative overflow-hidden rounded-[1.9rem] border border-border/70 bg-white/90 p-6 shadow-panel"
              >
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${document.accent}`}
                />
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-primary shadow-panel">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold text-foreground">
                    {document.title}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {document.rules.map((rule) => (
                      <li key={rule} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-20 grid gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start lg:gap-10">
        <div className="rounded-[2rem] border border-border/70 bg-white/85 p-6 shadow-panel md:p-8">
          <SectionHeading
            eyebrow="Workflow"
            title="Un circuit de délivrance en trois temps"
            description="La logique de l’application suit strictement la chronologie métier décrite dans votre document."
          />

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-4 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5">
              <XCircle className="mt-1 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-semibold text-rose-900">Cas de rejet</p>
                <p className="mt-2 text-sm leading-7 text-rose-700">
                  Dès qu’un dossier est rejeté à une étape, le demandeur est
                  informé par e-mail. La seconde vérification n’existe que si le
                  QIP valide d’abord le dossier.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-900">Cas de validation</p>
                <p className="mt-2 text-sm leading-7 text-emerald-700">
                  Après validation par le DLAA, le demandeur reçoit l’accord
                  final. Ce point doit devenir le cœur des futurs workflows et
                  notifications du produit.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          {processSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.title}
                className="group rounded-[1.75rem] border border-border/70 bg-white/90 p-6 shadow-panel transition-transform hover:-translate-y-1"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-panel">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                        Étape {index + 1}
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-5 text-sm leading-7 text-muted-foreground md:text-base">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-20 space-y-8 lg:mt-24">
        <SectionHeading
          eyebrow="Acteurs du système"
          title="Des responsabilités bien séparées pour garder une gouvernance fiable"
          description="La page met en scène les cinq profils utilisateurs avec leurs missions propres, afin que la structure du produit soit lisible dès le premier écran."
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <article
                key={role.title}
                className="rounded-[1.75rem] border border-border/70 bg-white/90 p-5 shadow-panel"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold text-foreground">
                  {role.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {role.text}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-20 rounded-[2rem] border border-border/70 bg-white/85 p-6 shadow-panel md:p-8 lg:mt-24">
        <SectionHeading
          eyebrow="Création de comptes"
          title="Une base prête pour les futurs formulaires"
          description="Chaque formulaire reprend les champs décrits dans le brief afin que l’implémentation fonctionnelle puisse ensuite être détaillée sans revoir l’architecture visuelle."
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {accountForms.map((form) => (
            <article
              key={form.title}
              className="rounded-[1.75rem] border border-border/70 bg-background p-6"
            >
              <h3 className="font-display text-2xl font-bold text-foreground">
                {form.title}
              </h3>
              <div className="mt-5 flex flex-wrap gap-3">
                {form.fields.map((field) => (
                  <span
                    key={field}
                    className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 pb-8 lg:mt-24">
        <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)))] p-8 text-white shadow-glow md:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/70">
                Première livraison design
              </p>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight md:text-4xl">
                L’application dispose maintenant d’une direction visuelle forte et d’une structure produit crédible.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 md:text-base">
                La prochaine itération peut détailler les écrans de connexion,
                les dashboards par rôle et les formulaires réels, en conservant
                ce socle visuel et cette navigation partagée.
              </p>
            </div>
            <Link
              to="/portail"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-primary shadow-panel transition-transform hover:-translate-y-0.5"
            >
              Voir le portail
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

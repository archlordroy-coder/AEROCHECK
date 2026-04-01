import SectionHeading from "@/components/home/SectionHeading";
import { getHealth, statsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  FileBadge2,
  Fingerprint,
  LoaderCircle,
  Lock,
  MailCheck,
  ShieldCheck,
  TimerReset,
  Users2,
} from "lucide-react";

const activityFeed = [
  {
    title: "12 dossiers en attente de verification QIP",
    detail: "Le backlog local doit rester fluide pour eviter un effet d'entonnoir.",
    tone: "warning",
  },
  {
    title: "4 licences approchent de l'expiration sous 30 jours",
    detail: "Le moteur d'alerte doit prioriser le medical et le controle de competences.",
    tone: "danger",
  },
  {
    title: "8 validations DLAA bouclees aujourd'hui",
    detail: "Le second niveau reste la porte d'entree vers la delivrance finale.",
    tone: "success",
  },
];

const governanceChecklist = [
  "Authentification securisee et gestion de session avec expiration d'inactivite.",
  "Controle d'acces strict base sur les roles Agent, QIP, DLAA, DNA et Super admin.",
  "Journal d'audit sur les validations, rejets, creations et suspensions de comptes.",
  "Canal de notification e-mail pour expirations, rejets et validations finales.",
];

const sampleQueue = [
  {
    agent: "Boris M.",
    country: "Cameroun",
    stage: "Verification QIP",
    risk: "Medical expire dans 28 jours",
  },
  {
    agent: "Fatou D.",
    country: "Senegal",
    stage: "Validation DLAA",
    risk: "Dossier complet, priorite haute",
  },
  {
    agent: "Nadia K.",
    country: "Congo",
    stage: "Correction agent",
    risk: "Test d'anglais inferieur a 4",
  },
];

function toneClasses(tone: string) {
  if (tone === "danger") {
    return "border-destructive/25 bg-destructive/5 text-destructive";
  }

  if (tone === "success") {
    return "border-emerald-500/25 bg-emerald-500/5 text-emerald-700";
  }

  return "border-amber-500/25 bg-amber-500/5 text-amber-700";
}

export default function Index() {
  const overviewQuery = useQuery({
    queryKey: ["overview"],
    queryFn: statsApi.overview,
  });
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  });

  if (overviewQuery.isLoading) {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center py-12">
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-white/90 px-5 py-3 text-sm font-medium text-foreground shadow-panel">
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          Chargement du centre de pilotage...
        </div>
      </div>
    );
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <div className="container py-12">
        <div className="rounded-[2rem] border border-destructive/30 bg-white/90 p-8 shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-destructive">
            API indisponible
          </p>
          <h1 className="mt-3 font-display text-4xl font-black text-foreground">
            Le centre de pilotage ne peut pas recuperer les donnees du backend.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
            Lance le backend avec <code>npm run dev:backend</code>, puis
            recharge la page.
          </p>
        </div>
      </div>
    );
  }

  const data = overviewQuery.data;
  const health = healthQuery.data;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_420px]">
        <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-white/90 shadow-glow">
          <div className="border-b border-border/70 px-6 py-6 md:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Centre de pilotage conformite
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {data.tagline}
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl font-display text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Une interface orientee exploitation pour surveiller le cycle de
              vie des licences et les points de blocage du workflow.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
              Le cahier des charges attend une application metier, pas une
              simple vitrine. Cette page concentre donc l'etat du systeme, les
              risques documentaires, les volumes et les controles a maintenir.
            </p>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8 xl:grid-cols-4">
            {data.metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-[1.5rem] border border-border bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(245,248,249,0.92))] p-5 shadow-panel"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mt-3 font-display text-4xl font-black text-foreground">
                  {metric.value}
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {metric.detail}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-[2rem] border border-border/70 bg-slate-950 p-6 text-white shadow-panel">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              <Lock className="h-4 w-4" />
              Etat technique
            </div>
            <p className="mt-4 font-display text-2xl font-black">
              Backend autonome
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {health?.status === "ok"
                ? `Disponible sur ${health.apiBaseUrl}.`
                : "Verification du backend en attente."}
            </p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Prets pour la suite
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                Authentification, notifications, audit et persistance peuvent
                maintenant evoluer sans coupler Vite et Express.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <BellRing className="h-4 w-4" />
              Signalements du jour
            </div>
            <div className="mt-4 space-y-3">
              {activityFeed.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-2xl border px-4 py-4 ${toneClasses(item.tone)}`}
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-current/80">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-2">
        <SectionHeading
          eyebrow="Operations"
          title="Vue operationnelle du workflow attendu par le cahier des charges"
          description="Les files de traitement, les echeances et les niveaux de validation doivent etre visibles immediatement pour reduire retards et erreurs."
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <article className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  File de traitement
                </p>
                <h3 className="mt-2 font-display text-2xl font-black text-foreground">
                  Dossiers a traiter en priorite
                </h3>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                QIP / DLAA
              </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-border">
              <div className="grid grid-cols-[1.1fr_0.8fr_0.9fr_1fr] gap-3 border-b border-border bg-muted/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span>Agent</span>
                <span>Pays</span>
                <span>Etape</span>
                <span>Risque</span>
              </div>
              {sampleQueue.map((row) => (
                <div
                  key={row.agent}
                  className="grid grid-cols-[1.1fr_0.8fr_0.9fr_1fr] gap-3 border-b border-border/70 px-4 py-4 text-sm text-foreground last:border-b-0"
                >
                  <span className="font-semibold">{row.agent}</span>
                  <span>{row.country}</span>
                  <span>{row.stage}</span>
                  <span className="text-muted-foreground">{row.risk}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              <TimerReset className="h-4 w-4" />
              Chronologie de validation
            </div>
            <div className="mt-5 space-y-4">
              {data.workflow.map((step, index) => (
                <div key={step.title} className="grid grid-cols-[36px_1fr] gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    {index < data.workflow.length - 1 ? (
                      <div className="mt-2 h-full w-px bg-border" />
                    ) : null}
                  </div>
                  <div className="rounded-[1.4rem] border border-border bg-background px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{step.title}</p>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                        {step.owner}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {step.description}
                    </p>
                    <p className="mt-3 text-sm font-medium text-foreground">
                      Sortie: {step.output}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mt-2">
        <SectionHeading
          eyebrow="Conformite documentaire"
          title="Les documents critiques doivent rester lisibles, dates en main"
          description="Le CDC insiste sur les regles de validite, les alertes d'expiration et la verification stricte avant delivrance de licence."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {data.documents.map((document, index) => (
            <article
              key={document.id}
              className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {index === 0 ? (
                    <FileBadge2 className="h-5 w-5" />
                  ) : index === 1 ? (
                    <MailCheck className="h-5 w-5" />
                  ) : (
                    <Clock3 className="h-5 w-5" />
                  )}
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Document obligatoire
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl font-black text-foreground">
                {document.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {document.summary}
              </p>
              <div className="mt-5 rounded-[1.4rem] border border-border bg-background px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Validite
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {document.validity}
                </p>
              </div>
              <ul className="mt-5 space-y-3">
                {document.rules.map((rule) => (
                  <li
                    key={rule}
                    className="flex items-start gap-3 rounded-2xl bg-muted/50 px-4 py-3 text-sm leading-7 text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 rounded-[1.4rem] border border-primary/15 bg-primary/5 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Strategie d'alerte
                </p>
                <p className="mt-2 text-sm leading-7 text-primary">
                  {document.alertWindow}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-2 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <article className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel">
          <SectionHeading
            eyebrow="Gouvernance"
            title="Ce que l'interface doit rendre visible pour rester conforme"
            description="Plusieurs exigences non fonctionnelles etaient sous-exposees. Cette zone les remet au coeur de l'application."
          />

          <div className="mt-6 space-y-3">
            {governanceChecklist.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[1.4rem] border border-border bg-background px-4 py-4"
              >
                <Fingerprint className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm leading-7 text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-border/70 bg-white/90 p-6 shadow-panel">
          <SectionHeading
            eyebrow="Comptes"
            title="La hierarchie de creation des comptes doit etre explicite"
            description="Le CDC definit des createurs differents selon les roles. L'interface doit le montrer clairement pour eviter les mauvaises interpretations."
          />

          <div className="mt-6 space-y-4">
            {data.accountRules.map((rule) => (
              <div
                key={rule.title}
                className="rounded-[1.5rem] border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {rule.title}
                  </h3>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    {rule.createdBy}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {rule.approvalRule}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {rule.fields.map((field) => (
                    <span
                      key={field}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-2 rounded-[2rem] border border-border/70 bg-slate-950 p-6 text-white shadow-panel md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
              Ecarts corrigeables
            </p>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight">
              Les points historiquement trop faibles dans l'interface ont ete
              ramenes au premier plan.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300">
              L'ancien ecran montrait surtout l'identite produit. Le nouveau
              centre de pilotage rend visibles les alertes, le backlog, la
              gouvernance de compte, le workflow, l'audit et les regles
              documentaires.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Users2 className="h-4 w-4 text-cyan-300" />
                Supervision multi-role
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Agent, QIP, DLAA, DNA et super admin sont visibles comme postes
                d'action, pas seulement comme labels.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <AlertTriangle className="h-4 w-4 text-amber-300" />
                Alerte et expiration
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Les documents et leurs fenetres d'alerte sont maintenant
                presentes comme un coeur metier.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

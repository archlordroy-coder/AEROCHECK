import { UserRole } from "@shared/api";
import {
  BellRing,
  BookCheck,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Globe2,
  Lock,
  ShieldCheck,
  ShieldEllipsis,
  UserRound,
  Users,
} from "lucide-react";

export const roleSnapshots: Record<
  UserRole,
  { heading: string; stats: string[]; actions: string[] }
> = {
  agent: {
    heading: "Mon dossier",
    stats: [
      "2 documents valides",
      "1 expiration sous 30 jours",
      "1 commentaire QIP",
    ],
    actions: [
      "Completer mon profil",
      "Soumettre un document",
      "Consulter mes notifications",
    ],
  },
  qip: {
    heading: "Validation locale",
    stats: [
      "12 dossiers en attente",
      "4 rejets a traiter",
      "98 agents suivis",
    ],
    actions: [
      "Verifier les pieces",
      "Commenter un rejet",
      "Transmettre au DLAA",
    ],
  },
  dlaa: {
    heading: "Validation nationale",
    stats: [
      "8 decisions en attente",
      "2 pays sous surveillance",
      "1 verrouillage actif",
    ],
    actions: [
      "Arbitrer les dossiers",
      "Verifier les QIP",
      "Verrouiller les inscriptions",
    ],
  },
  dna: {
    heading: "Supervision region",
    stats: ["6 pays observes", "3 pics de charge", "1 escalade en cours"],
    actions: ["Creer un DLAA", "Suivre les delais", "Piloter la gouvernance"],
  },
  super_admin: {
    heading: "Administration globale",
    stats: [
      "99,5% cible SLA",
      "0 incident critique",
      "5 actions sensibles tracees",
    ],
    actions: [
      "Suspendre un compte",
      "Consulter l'audit",
      "Administrer la plateforme",
    ],
  },
};

export const roleIcons: Record<UserRole, typeof UserRound> = {
  agent: UserRound,
  qip: Users,
  dlaa: ShieldCheck,
  dna: Globe2,
  super_admin: ShieldEllipsis,
};

export const roleInterfaceContent: Record<
  UserRole,
  {
    badge: string;
    summary: string;
    panels: {
      title: string;
      detail: string;
      icon: typeof Gauge;
      items: string[];
    }[];
  }
> = {
  agent: {
    badge: "Espace personnel",
    summary:
      "L'agent doit retrouver un cockpit simple pour suivre son dossier, ses echeances et ses retours de validation sans bruit administratif inutile.",
    panels: [
      {
        title: "Mon dossier actif",
        detail: "Vision instantanee des pieces deposees et de leur validite.",
        icon: BookCheck,
        items: [
          "Carte de licence et statut de renouvellement",
          "Pieces medical, anglais et competences",
          "Blocage a lever avant transmission",
        ],
      },
      {
        title: "Actions immediates",
        detail: "Les prochaines taches ne doivent jamais etre ambiguës.",
        icon: ClipboardList,
        items: [
          "Soumettre une nouvelle piece",
          "Corriger un rejet recu du QIP",
          "Mettre a jour mon aeroport d'affectation",
        ],
      },
      {
        title: "Alertes personnelles",
        detail: "Alerte preventive avant expiration ou dossier incomplet.",
        icon: BellRing,
        items: [
          "Expiration medicale sous 30 jours",
          "Test d'anglais a reverifier",
          "Notification de decision DLAA",
        ],
      },
    ],
  },
  qip: {
    badge: "Validation premier niveau",
    summary:
      "Le QIP a besoin d'une interface orientee file de traitement, controles documentaires et commentaires de retour vers les agents.",
    panels: [
      {
        title: "Queue de verification",
        detail: "Priorisation des dossiers a traiter et des urgences.",
        icon: Gauge,
        items: [
          "Dossiers nouveaux a verifier",
          "Rejets en attente de correction agent",
          "Pieces expirant avant decision finale",
        ],
      },
      {
        title: "Conformite documentaire",
        detail: "Lecture rapide des regles et des anomalies detectees.",
        icon: ShieldCheck,
        items: [
          "Controle du niveau d'anglais",
          "Validation de la fenetre medicale selon l'age",
          "Confirmation du controle de competences",
        ],
      },
      {
        title: "Transmission DLAA",
        detail: "Le passage au niveau national doit etre trace et explicite.",
        icon: CheckCircle2,
        items: [
          "Resume des dossiers prets",
          "Commentaire de transmission",
          "Journal des decisions locales",
        ],
      },
    ],
  },
  dlaa: {
    badge: "Validation nationale",
    summary:
      "Le poste DLAA doit concentrer les arbitrages, la supervision QIP et les commandes de verrouillage ou d'ouverture des inscriptions.",
    panels: [
      {
        title: "Arbitrage final",
        detail: "Decider, rejeter ou demander complement sur les dossiers transmis.",
        icon: ShieldCheck,
        items: [
          "Liste des dossiers prets pour decision",
          "Historique des commentaires QIP",
          "Decision motivee et notification associee",
        ],
      },
      {
        title: "Suivi des QIP",
        detail: "La qualite du premier niveau doit etre visible.",
        icon: Users,
        items: [
          "Temps moyens de verification",
          "Taux de rejet par QIP",
          "Dossiers anormalement retardes",
        ],
      },
      {
        title: "Parametres nationaux",
        detail: "Le pays doit pouvoir ajuster l'acces et les inscriptions.",
        icon: Lock,
        items: [
          "Verrouillage des nouvelles inscriptions",
          "Activation d'une campagne de renouvellement",
          "Surveillance du backlog national",
        ],
      },
    ],
  },
  dna: {
    badge: "Supervision transverse",
    summary:
      "L'espace DNA doit se comporter comme une tour de controle regionale avec comparatifs multi-pays, creation de comptes hierarchiques et escalades.",
    panels: [
      {
        title: "Vue multi-pays",
        detail: "Comparer les volumes, retards et risques entre pays.",
        icon: Globe2,
        items: [
          "SLA par pays",
          "Backlogs et goulets de validation",
          "Taux d'expiration a court terme",
        ],
      },
      {
        title: "Gouvernance des comptes",
        detail: "Creation de DLAA et DNA selon les regles du CDC.",
        icon: Users,
        items: [
          "Creation de comptes hierarchiques",
          "Suspension preventive",
          "Controle des zones de responsabilite",
        ],
      },
      {
        title: "Escalades",
        detail: "Les anomalies inter-pays doivent avoir un circuit clair.",
        icon: BellRing,
        items: [
          "Pics de charge ou saturation",
          "Pays en derive de delais",
          "Alerte sur comptes sensibles",
        ],
      },
    ],
  },
  super_admin: {
    badge: "Administration absolue",
    summary:
      "Le super admin pilote toute la plateforme avec une interface complete pour les donnees de reference, les permissions, l'audit et la sante technique.",
    panels: [
      {
        title: "Referentiels globaux",
        detail: "Editer les pays, aeroports, roles, statuts et parametrages globaux.",
        icon: BookCheck,
        items: [
          "Pays et aeroports actifs",
          "Types de comptes et permissions",
          "Parametres d'alerte et templates",
        ],
      },
      {
        title: "Audit et securite",
        detail: "Toute action sensible doit etre visible et investigable.",
        icon: ShieldEllipsis,
        items: [
          "Journal des connexions et suspensions",
          "Historique des creations de comptes",
          "Surveillance des actions critiques",
        ],
      },
      {
        title: "Monitoring technique",
        detail: "Le back-office doit aussi montrer la sante du systeme.",
        icon: Gauge,
        items: [
          "Etat API et sessions",
          "Disponibilite et performance",
          "Alertes sur files et notifications",
        ],
      },
    ],
  },
};

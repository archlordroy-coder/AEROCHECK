import { OverviewResponse } from "@shared/api";

export const overviewData: OverviewResponse = {
  productName: "ATCOCLICLE",
  tagline: "ATCO Licence Validity Monitor",
  description:
    "ATCOCLICLE assure le suivi de la validite des documents qui permettent la delivrance et le renouvellement des licences des controleurs aeriens de l'ASECNA.",
  objectives: [
    "Assurer le monitoring de l'etat des licences ATCO (valide, expiree, suspendue).",
    "Automatiser les alertes d'expiration des trois documents critiques.",
    "Digitaliser la soumission, la verification QIP et la validation DLAA.",
    "Garantir securite, fiabilite, tracabilite et efficacite du circuit.",
    "Offrir une vision multi-pays avec tri par pays et aeroport.",
  ],
  metrics: [
    {
      value: "5",
      label: "profils metiers",
      detail: "Agent, QIP, DLAA, DNA et super administrateur.",
    },
    {
      value: "3",
      label: "documents critiques",
      detail: "Certificat medical, anglais et controle de competences.",
    },
    {
      value: "2",
      label: "niveaux de validation",
      detail: "Verification locale QIP puis validation nationale DLAA.",
    },
    {
      value: "100%",
      label: "gouvernance admin",
      detail: "Le super admin doit pouvoir gerer toutes les donnees et permissions.",
    },
  ],
  documents: [
    {
      id: "medical",
      title: "Certificat medical",
      summary:
        "Controle l'aptitude physique et mentale de l'agent avant delivrance ou renouvellement.",
      validity: "2 ans avant 40 ans, 1 an apres 40 ans.",
      rules: [
        "0 a 40 ans : validite de 2 ans.",
        "Plus de 40 ans : validite de 1 an.",
        "Le systeme doit recalculer l'expiration selon l'age du titulaire.",
      ],
      alertWindow: "Alerte recommandee 90, 30 et 7 jours avant expiration.",
    },
    {
      id: "english",
      title: "Test d'anglais",
      summary:
        "Justifie le niveau linguistique requis pour les operations aeroportuaires.",
      validity: "3 ans, 6 ans ou a vie selon la note.",
      rules: [
        "Note inferieure a 4 : dossier invalide.",
        "Note 4 : validite de 3 ans.",
        "Note 5 : validite de 6 ans.",
        "Note 6 : validite a vie.",
      ],
      alertWindow: "Alerte recommandee 180, 60 et 15 jours avant expiration.",
    },
    {
      id: "skills",
      title: "Controle de competences",
      summary:
        "Atteste que l'agent maitrise les gestes et procedures liees a son habilitation.",
      validity: "1 an.",
      rules: [
        "Valable uniquement 12 mois.",
        "Obligatoire pour toute delivrance ou renouvellement de licence.",
        "Doit etre reverifie a chaque cycle.",
      ],
      alertWindow: "Alerte recommandee 60, 30 et 7 jours avant expiration.",
    },
  ],
  workflow: [
    {
      title: "Soumission agent",
      owner: "Agent",
      description:
        "L'agent cree son compte, renseigne ses informations et depose ses trois pieces justificatives.",
      output: "Dossier en attente de verification QIP.",
    },
    {
      title: "Verification locale",
      owner: "QIP",
      description:
        "Le QIP controle la conformite documentaire, valide ou rejette le dossier avec commentaire.",
      output: "Dossier transmis au DLAA ou retourne a l'agent.",
    },
    {
      title: "Validation nationale",
      owner: "DLAA",
      description:
        "Le DLAA effectue le second niveau de controle et statue sur la delivrance finale.",
      output: "Licence approuvee ou rejetee avec notification.",
    },
    {
      title: "Gouvernance et audit",
      owner: "DNA / Super admin",
      description:
        "Les superviseurs suivent les indicateurs, les blocages, les inscriptions, les permissions et les anomalies.",
      output: "Pilotage global, verrouillage et audit.",
    },
  ],
  workspaces: [
    {
      role: "agent",
      title: "Espace Agent",
      summary:
        "Depot des documents, suivi des statuts et anticipation des echeances personnelles.",
      responsibilities: [
        "Completer le profil et les informations de poste.",
        "Televerser les trois documents reglementaires.",
        "Suivre les rejets, commentaires et dates d'expiration.",
      ],
      permissions: [
        "Creer son compte via le formulaire public.",
        "Modifier son dossier avant validation finale.",
        "Recevoir des notifications e-mail.",
      ],
      dashboardHighlights: [
        "Pieces actives et a renouveler.",
        "Historique des soumissions.",
        "Etat courant de la licence.",
      ],
    },
    {
      role: "qip",
      title: "Espace QIP",
      summary:
        "Gestion des agents de son pays et verification de premier niveau des dossiers.",
      responsibilities: [
        "Verifier la conformite documentaire des agents.",
        "Valider ou rejeter les dossiers avec motifs.",
        "Suivre les comptes agents de son pays.",
      ],
      permissions: [
        "Acceder aux dossiers en attente.",
        "Voir tous les agents de son pays.",
        "Transmettre les dossiers conformes au DLAA.",
      ],
      dashboardHighlights: [
        "File d'attente de verification.",
        "Dossiers a risque d'expiration.",
        "Taux de validation du pays.",
      ],
    },
    {
      role: "dlaa",
      title: "Espace DLAA",
      summary:
        "Validation nationale finale, verrouillage des comptes et supervision des QIP.",
      responsibilities: [
        "Valider ou rejeter les dossiers transmis par les QIP.",
        "Superviser la performance des QIP du pays.",
        "Verrouiller la creation de comptes si besoin.",
      ],
      permissions: [
        "Deuxieme niveau de validation.",
        "Voir tous les agents du pays.",
        "Verrouiller les inscriptions.",
      ],
      dashboardHighlights: [
        "Decisions en attente.",
        "Qualite des validations QIP.",
        "Indicateurs de conformite nationale.",
      ],
    },
    {
      role: "dna",
      title: "Espace DNA",
      summary:
        "Supervision multi-pays, gouvernance de la plateforme et creation de profils hierarchiques.",
      responsibilities: [
        "Observer l'activite globale par pays.",
        "Creer les comptes DLAA et DNA selon les regles.",
        "Alerter en cas de saturation ou derive de delais.",
      ],
      permissions: [
        "Vision transverse multi-pays.",
        "Ajouter un DNA.",
        "Voir tous les pays.",
      ],
      dashboardHighlights: [
        "Conformite par pays.",
        "Volumes de dossiers.",
        "Temps moyens de traitement.",
      ],
    },
    {
      role: "super_admin",
      title: "Espace Super admin",
      summary:
        "Administration globale, gouvernance des donnees, securite, audit et arbitrages structurants de la plateforme.",
      responsibilities: [
        "Creer, suspendre ou supprimer tout compte.",
        "Gerer tous les pays, aeroports, dossiers, permissions et journaux d'audit.",
        "Piloter les parametres globaux, la sante applicative et le monitoring technique.",
      ],
      permissions: [
        "Acces complet a la plateforme.",
        "Monitoring technique et gouvernance globale.",
        "Administration avancee de toutes les donnees.",
      ],
      dashboardHighlights: [
        "Sante globale de la plateforme.",
        "Audit des actions critiques.",
        "Disponibilite, comptes et permissions.",
      ],
    },
  ],
  accountRules: [
    {
      title: "Compte Agent",
      fields: [
        "Nom(s) et prenom(s)",
        "Fonction",
        "Adresse e-mail",
        "Pays",
        "Aeroport d'affectation",
        "Telephone",
        "Mot de passe",
      ],
      createdBy: "Auto-inscription publique",
      approvalRule: "Validation ulterieure par le QIP du pays.",
    },
    {
      title: "Compte QIP",
      fields: [
        "Nom(s) et prenom(s)",
        "Poste occupe",
        "Matricule",
        "Date de nomination",
        "Pays de fonction",
      ],
      createdBy: "DLAA ou DNA du pays",
      approvalRule: "Creation sous gouvernance nationale ou regionale.",
    },
    {
      title: "Compte DLAA",
      fields: [
        "Nom(s) et prenom(s)",
        "Poste occupe",
        "Matricule",
        "Date de nomination",
      ],
      createdBy: "DNA",
      approvalRule: "Le DLAA peut ensuite verrouiller les inscriptions du pays.",
    },
    {
      title: "Compte DNA",
      fields: ["Nom(s) et prenom(s)", "Adresse e-mail", "Poste", "Zone suivie"],
      createdBy: "DNA ou super administrateur",
      approvalRule: "La gouvernance regionale est reservee a une chaine de creation controlee.",
    },
    {
      title: "Compte Super admin",
      fields: ["Nom(s) et prenom(s)", "Adresse e-mail", "Role", "Statut"],
      createdBy: "Super administrateur principal",
      approvalRule: "Controle total sur l'ensemble des donnees, comptes et permissions.",
    },
  ],
  requirementGroups: [
    {
      title: "Securite",
      items: [
        "Authentification avec mot de passe securise et hachage.",
        "Sessions avec expiration automatique apres inactivite.",
        "RBAC strict selon le role et les permissions detaillees.",
        "Journal d'audit des validations, rejets, creations et suspensions de compte.",
      ],
    },
    {
      title: "Performance",
      items: [
        "Temps de chargement inferieur a 3 secondes en conditions normales.",
        "Support d'au moins 500 utilisateurs simultanes.",
        "Disponibilite cible de 99,5% hors maintenance planifiee.",
      ],
    },
    {
      title: "Compatibilite",
      items: [
        "Responsive mobile, tablette et desktop.",
        "Support des navigateurs modernes.",
        "Compatibilite Windows, macOS, Linux, Android et iOS.",
      ],
    },
    {
      title: "Continuite",
      items: [
        "Sauvegarde quotidienne.",
        "Plan de reprise d'activite.",
        "Conservation des donnees pendant 10 ans minimum.",
      ],
    },
  ],
  adminModules: [
    {
      title: "Administration des comptes",
      description:
        "Creation, suspension, suppression, reinitialisation et activation des comptes tous roles confondus.",
      actions: [
        "Creer un utilisateur",
        "Suspendre un compte",
        "Reinitialiser un mot de passe",
        "Changer un role",
      ],
      scope: "Global",
    },
    {
      title: "Generation et edition des donnees de reference",
      description:
        "Gestion des pays, aeroports, postes, statuts, templates et parametres utilises dans l'ensemble du produit.",
      actions: [
        "Ajouter un pays",
        "Ajouter un aeroport",
        "Maintenir les listes de reference",
        "Parametrer les alertes",
      ],
      scope: "Global",
    },
    {
      title: "Pilotage des licences et dossiers",
      description:
        "Consultation et edition de tous les dossiers, documents et decisions de validation.",
      actions: [
        "Voir tous les dossiers",
        "Reaffecter un dossier",
        "Forcer un statut",
        "Auditer l'historique",
      ],
      scope: "Global",
    },
    {
      title: "Monitoring technique",
      description:
        "Surveillance de la sante applicative, des erreurs, des flux de notification et des performances.",
      actions: [
        "Voir les incidents",
        "Verifier les jobs de notification",
        "Suivre les erreurs API",
        "Superviser l'activite systeme",
      ],
      scope: "Super admin",
    },
  ],
  permissionMatrix: [
    {
      capability: "Soumettre ses documents",
      agent: true,
      qip: false,
      dlaa: false,
      dna: false,
      super_admin: true,
    },
    {
      capability: "Voir tous les agents du pays",
      agent: false,
      qip: true,
      dlaa: true,
      dna: true,
      super_admin: true,
    },
    {
      capability: "Voir tous les pays",
      agent: false,
      qip: false,
      dlaa: false,
      dna: true,
      super_admin: true,
    },
    {
      capability: "Ajouter un DNA",
      agent: false,
      qip: false,
      dlaa: false,
      dna: true,
      super_admin: true,
    },
    {
      capability: "Verrouiller les inscriptions",
      agent: false,
      qip: false,
      dlaa: true,
      dna: false,
      super_admin: true,
    },
    {
      capability: "Monitoring technique",
      agent: false,
      qip: false,
      dlaa: false,
      dna: false,
      super_admin: true,
    },
  ],
  accountLifecycle: [
    {
      title: "Creation du compte",
      description:
        "Selon le role, le compte est cree par auto-inscription ou par une autorite hierarchique.",
      owners: ["Agent", "DLAA", "DNA", "Super admin"],
    },
    {
      title: "Activation et validation",
      description:
        "Le compte est active, verifie et rattache a son pays, son aeroport et son niveau de permission.",
      owners: ["QIP", "DLAA", "Super admin"],
    },
    {
      title: "Exploitation et controle",
      description:
        "L'utilisateur agit selon son role, ses droits et l'etat du verrouillage des inscriptions.",
      owners: ["Tous les roles selon permissions"],
    },
    {
      title: "Suspension, suppression et audit",
      description:
        "Tout compte peut etre suspendu, requalifie ou supprime par l'autorite competente avec trace obligatoire.",
      owners: ["Super admin", "DNA selon delegation"],
    },
  ],
  technologyStack: [
    {
      title: "Frontend",
      items: [
        "React + Vite + TypeScript",
        "React Router",
        "TanStack Query",
        "TailwindCSS + Radix UI + shadcn/ui",
        "React Hook Form + Zod",
        "TanStack Table pour le panel admin",
      ],
    },
    {
      title: "Backend",
      items: [
        "Node.js + Express + TypeScript",
        "Prisma ORM",
        "PostgreSQL",
        "JWT ou sessions securisees",
        "Argon2 pour les mots de passe",
        "Pino pour logs et audit",
      ],
    },
    {
      title: "Services complementaires",
      items: [
        "SMTP ou API email",
        "Stockage de fichiers S3/MinIO/Cloudinary",
        "BullMQ + Redis pour rappels et traitements asynchrones",
        "OpenAPI/Swagger pour documentation API",
      ],
    },
  ],
};

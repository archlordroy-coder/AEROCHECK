export type UserRole = "agent" | "qip" | "dlaa" | "dna" | "super_admin";

export interface PlatformMetric {
  value: string;
  label: string;
  detail: string;
}

export interface RegulatoryDocument {
  id: string;
  title: string;
  summary: string;
  validity: string;
  rules: string[];
  alertWindow: string;
}

export interface WorkflowStep {
  title: string;
  owner: string;
  description: string;
  output: string;
}

export interface Workspace {
  role: UserRole;
  title: string;
  summary: string;
  responsibilities: string[];
  permissions: string[];
  dashboardHighlights: string[];
}

export interface AccountRule {
  title: string;
  fields: string[];
  createdBy: string;
  approvalRule: string;
}

export interface RequirementGroup {
  title: string;
  items: string[];
}

export interface AdminModule {
  title: string;
  description: string;
  actions: string[];
  scope: string;
}

export interface PermissionMatrixRow {
  capability: string;
  agent: boolean;
  qip: boolean;
  dlaa: boolean;
  dna: boolean;
  super_admin: boolean;
}

export interface AccountLifecycleStep {
  title: string;
  description: string;
  owners: string[];
}

export interface TechnologyStackGroup {
  title: string;
  items: string[];
}

export interface OverviewResponse {
  productName: string;
  tagline: string;
  description: string;
  objectives: string[];
  metrics: PlatformMetric[];
  documents: RegulatoryDocument[];
  workflow: WorkflowStep[];
  workspaces: Workspace[];
  accountRules: AccountRule[];
  requirementGroups: RequirementGroup[];
  adminModules: AdminModule[];
  permissionMatrix: PermissionMatrixRow[];
  accountLifecycle: AccountLifecycleStep[];
  technologyStack: TechnologyStackGroup[];
}

export interface HealthResponse {
  message: string;
  status: "ok";
  apiBaseUrl: string;
}

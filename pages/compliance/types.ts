import { RiskLevel, CountryCode } from '../../types';

export enum ComplianceCategoryExtended {
  AML_CFT = 'مكافحة غسيل الأموال وتمويل الإرهاب',
  GOVERNANCE = 'الحوكمة والمطابقة المؤسسية',
  CMA_REGS = 'لوائح هيئة أسواق المال',
  CBK_REGS = 'تعليمات بنك الكويت المركزي',
  MOCI_LICENSES = 'تراخيص وزارة التجارة والصناعة',
  LABOR_SOCIAL = 'قوانين العمل والتأمينات الاجتماعية',
  DATA_PRIVACY = 'حماية البيانات وسرية المعلومات',
  TAX_ZAKAT = 'الضرائب والزكاة والجمارك',
  CONTRACT_OBLIG = 'الالتزامات والاشتراطات التعاقدية',
  REAL_ESTATE_REGS = 'لوائح الاستثمار والعقارات',
}

export enum ComplianceSubmodule {
  DASHBOARD = 'dashboard',
  POLICIES = 'policies',
  OBLIGATIONS = 'obligations',
  RISKS = 'risks',
  VIOLATIONS = 'violations',
  AUDITS = 'audits',
  INVESTIGATIONS = 'investigations',
  CORRECTIVE_ACTIONS = 'corrective_actions',
  APPROVALS = 'approvals',
  PERIODIC = 'periodic',
  REPORTS = 'reports',
  TASKS = 'tasks',
  DOCUMENTS = 'documents',
  AUDIT_LOGS = 'audit_logs',
}

export interface PolicyProfile {
  id: string;
  title: string;
  code: string;
  category: ComplianceCategoryExtended;
  riskLevel: RiskLevel;
  status: 'Approved' | 'Under Review' | 'Draft' | 'Expired';
  statusAr: string;
  effectiveDate: string;
  expiryDate?: string;
  owner: string;
  version: string;
  attachments: string[];
  notes: string;
  approvals: ApprovalStep[];
  history: HistoryLog[];
  isArchived?: boolean;
}

export interface ObligationProfile {
  id: string;
  title: string;
  description: string;
  authority: string;
  category: ComplianceCategoryExtended;
  riskLevel: RiskLevel;
  frequency: 'Annual' | 'Quarterly' | 'Monthly' | 'One-time' | 'Continuous';
  dueDate: string;
  status: 'Compliant' | 'In Progress' | 'Overdue' | 'Under Review';
  statusAr: string;
  assignedTo: string;
  evidenceLink?: string;
  attachments: string[];
  notes: string;
  correctiveActions: string[];
  history: HistoryLog[];
  isArchived?: boolean;
}

export interface RiskRegisterProfile {
  id: string;
  title: string;
  description: string;
  category: ComplianceCategoryExtended;
  riskLevel: RiskLevel;
  impactScore: number; // 1-5
  likelihoodScore: number; // 1-5
  status: 'Identified' | 'Mitigated' | 'Mitigation Pending' | 'Closed';
  statusAr: string;
  owner: string;
  mitigationPlan: string;
  residualRisk: RiskLevel;
  targetDate: string;
  approvals: ApprovalStep[];
  history: HistoryLog[];
  isArchived?: boolean;
}

export interface ViolationProfile {
  id: string;
  title: string;
  authority: string;
  penaltyAmount: number; // KWD
  penaltyAmountAr: string;
  riskLevel: RiskLevel;
  incidentDate: string;
  status: 'Open' | 'In Remediation' | 'Under Appeal' | 'Closed_Paid' | 'Closed_Resolved';
  statusAr: string;
  assignedTo: string;
  description: string;
  notes: string;
  correctiveActions: string[];
  investigationId?: string;
  attachments: string[];
  approvals: ApprovalStep[];
  history: HistoryLog[];
  isArchived?: boolean;
}

export interface AuditProfile {
  id: string;
  title: string;
  auditor: string;
  auditorTitle: string;
  department: string;
  startDate: string;
  endDate?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Postponed';
  statusAr: string;
  score?: number; // 0-100
  scope: string;
  findings: string[];
  recommendations: string[];
  attachments: string[];
  notes: string;
  approvals: ApprovalStep[];
  history: HistoryLog[];
  isArchived?: boolean;
}

export interface InvestigationProfile {
  id: string;
  idNumber: string; // e.g., INV-2026-003
  subject: string;
  parties: string[];
  investigator: string;
  startDate: string;
  endDate?: string;
  status: 'Under Investigation' | 'Suspended' | 'Closed' | 'Archived';
  statusAr: string;
  notes: string;
  findings: string;
  recommendedPenalty?: string;
  attachments: string[];
  history: HistoryLog[];
  isArchived?: boolean;
}

export interface CorrectiveActionProfile {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  completionDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  statusAr: string;
  priority: 'High' | 'Medium' | 'Low';
  relatedViolationId?: string;
  notes: string;
  attachments: string[];
  history: HistoryLog[];
  isArchived?: boolean;
}

export interface ApprovalStep {
  id: string;
  title: string;
  approver: string;
  role: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  statusAr: string;
  date?: string;
  notes?: string;
  signature?: string;
}

export interface HistoryLog {
  id: string;
  date: string;
  user: string;
  action: string;
  details: string;
}

export interface RegulatoryReport {
  id: string;
  title: string;
  referenceNumber: string;
  authority: string;
  reviewer: string;
  role: string;
  submissionDate: string;
  status: 'Approved' | 'Pending Approval' | 'Submitted';
  statusAr: string;
  qrCodeSeed: string;
  verificationLink?: string;
}

export interface FollowupProfile {
  id: string;
  title: string;
  frequency: 'Monthly' | 'Quarterly' | 'Semiannually' | 'Annually';
  frequencyAr: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  statusAr: string;
  responsible: string;
}

export interface TaskProfile {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  completionRate: number; // 0 - 100
  priority: 'High' | 'Medium' | 'Low';
  priorityAr: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  statusAr: string;
  reminderSent: boolean;
  history: HistoryLog[];
  isArchived?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
  module: string;
  ipAddress: string;
}


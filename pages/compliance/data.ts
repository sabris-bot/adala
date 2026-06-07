import { RiskLevel } from '../../types';
import { 
  PolicyProfile, ObligationProfile, RiskRegisterProfile, ViolationProfile, 
  AuditProfile, InvestigationProfile, CorrectiveActionProfile, RegulatoryReport, 
  FollowupProfile, ComplianceCategoryExtended 
} from './types';

export const initialPolicies: PolicyProfile[] = [];
export const initialObligations: ObligationProfile[] = [];
export const initialRisks: RiskRegisterProfile[] = [];
export const initialViolations: ViolationProfile[] = [];
export const initialAudits: AuditProfile[] = [];
export const initialInvestigations: InvestigationProfile[] = [];
export const initialCorrectiveActions: CorrectiveActionProfile[] = [];
export const initialReports: RegulatoryReport[] = [];
export const initialFollowups: FollowupProfile[] = [];
export const initialTasks: any[] = [];
export const initialAuditLogs: any[] = [];

export enum PerformanceTier {
  EXCELLENT = 'Excellent',
  EXCEEDS_EXPECTATIONS = 'Exceeds Expectations',
  MEETS_EXPECTATIONS = 'Meets Expectations',
  NEEDS_IMPROVEMENT = 'Needs Improvement',
}

export type PerformanceAppraisalStatus = 'Draft' | 'Pending Legal/HR Approval' | 'Certified';

export interface TranslatedItem {
  ar: string;
  en: string;
}

export interface LocalEmployee {
  id: string;
  employeeId: string;
  civilId: string;
  fullName: TranslatedItem;
  jobTitle: TranslatedItem;
  department: TranslatedItem;
  joiningDate: string;
  basicSalary: number;
  allowancesAmount: number;
  nationality: TranslatedItem;
  warningsCount: number;
  avatarInitials: string;
  hireDate: string;
}

export interface LocalAppraisal {
  id: string;
  employeeId: string;
  appraisalPeriod: string;
  appraisalDate: string;
  status: PerformanceAppraisalStatus;
  appraiserName: TranslatedItem;
  overallScore: number;
  scores: {
    drafting: number;      // Legal Drafting & Research
    successRate: number;   // Case Success & Timelines
    clientRelations: number; // Client Ethics & Communication
    compliance: number;    // Hours & Policy Compliance
  };
  strengths: TranslatedItem;
  improvements: TranslatedItem;
  training: TranslatedItem;
  refId: string;
  signatureCode: string;
  signeeName: TranslatedItem;
  signedAt: string;
}

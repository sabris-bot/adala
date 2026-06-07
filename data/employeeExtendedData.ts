import { Employee } from '../types';

export interface ExtendedEmployee extends Employee {
  // Enhanced arrays
  leaveRequests: Array<{
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    requestedAt: string;
    approvals: Array<{ role: string; name: string; date: string }>;
  }>;
  attendanceLogs: Array<{
    date: string;
    checkIn: string;
    checkOut: string;
    status: 'Present' | 'Late' | 'Absent' | 'OnLeave';
    delayMinutes: number;
  }>;
  disciplinaryActions: Array<{
    id: string;
    violationDate: string;
    violationType: string;
    violationTypeEn?: string;
    violationDetails: string;
    violationDetailsEn?: string;
    penalty: string;
    penaltyEn?: string;
    authorityDeciding: string;
    status: 'Pending' | 'Approved' | 'Appealed';
    penaltyAmount?: number;
    warningsIssued?: string;
  }>;
  investigations: Array<{
    id: string;
    caseNumber: string;
    date: string;
    subject: string;
    investigator: string;
    results: string;
    recommendations: string;
    status: 'Open' | 'Closed' | 'Archived';
    penaltyProposed?: string;
    approvedBy?: string;
  }>;
  loans: Array<{
    id: string;
    principalAmount: number;
    monthlyInstallment: number;
    balanceAmount: number;
    issueDate: string;
    maturityDate: string;
    status: 'Active' | 'Paid' | 'Delayed';
    payments: Array<{ date: string; amount: number; installmentNum: number }>;
  }>;
  evaluations: Array<{
    id: string;
    period: string;
    date: string;
    overallScore: number;
    qualitativeFeedback: string;
    objectivesMet: string[];
    criteriaScores: {
      communication: number;
      teamwork: number;
      qualityOfWork: number;
      speed: number;
      adherenceToLaw: number;
    };
    evaluatorName: string;
  }>;
  administrativeRequests: Array<{
    id: string;
    type: string;
    details: string;
    requestedDate: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    hrNotes?: string;
  }>;
  historyTimeline: Array<{
    id: string;
    date: string;
    category: 'Hiring' | 'Promotion' | 'Bonus' | 'Investigation' | 'Warning' | 'Request' | 'Upload' | 'Leave' | 'Loan';
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    performedBy: string;
  }>;
  legalNotes: Array<{
    id: string;
    date: string;
    author: string;
    noteText: string;
  }>;
}

export const initialExtendedEmployees: ExtendedEmployee[] = [];

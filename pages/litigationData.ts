import { CaseStatus, RiskLevel, CaseMainType, CasePriority, CourtLevel } from '../types';

export interface LitigationCase {
    id: string;
    title: string;
    caseNumber: string;
    automatedNo: string;
    clientName: string;
    clientRole: string;
    opponentName: string;
    opponentRole: string;
    court: string;
    circuit: string;
    status: CaseStatus;
    priority: CasePriority;
    risk: RiskLevel;
    assignedLawyer: string;
    filingDate: string;
    nextHearingDate?: string;
    financials: {
        totalFees: number;
        paid: number;
        remaining: number;
    };
    notes?: string;
}

export interface LitigationHearing {
    id: string;
    caseNumber: string;
    caseTitle: string;
    court: string;
    room: string;
    date: string;
    time: string;
    type: string;
    status: 'Scheduled' | 'Completed' | 'Postponed' | 'Cancelled';
    assignedLawyer: string;
    outcome?: string;
}

export interface EnforcementAction {
    id: string;
    executionNo: string;
    caseNumber: string;
    clientName: string;
    debtorName: string;
    awardedAmount: number;
    paidAmount: number;
    status: 'Open' | 'Travel_Ban_Issued' | 'Seizure_Active' | 'Bank_Freeze' | 'Settled';
    actionsTaken: string[];
    lastUpdateDate: string;
    notes?: string;
}

export interface JudgmentEntry {
    id: string;
    caseNumber: string;
    caseTitle: string;
    courtLevel: CourtLevel;
    issueDate: string;
    judgeName: string;
    verdictSummary: string;
    legalGrounds: string;
    status: 'Final' | 'Appealed' | 'Enforcing' | 'Suspended';
}

export interface AppealEntry {
    id: string;
    caseNumber: string;
    originalJudgmentDate: string;
    deadlineDate: string;
    remainingDays: number;
    status: 'Drafting' | 'Filed' | 'Expired' | 'Rejected';
    courtBranch: string;
    appealGrounds: string;
}

export interface CassationEntry {
    id: string;
    caseNumber: string;
    appealJudgmentDate: string;
    cassationNo: string;
    deadlineDate: string;
    remainingDays: number;
    status: 'Preparing' | 'In_Consultation' | 'Scheduled' | 'Decided';
    grounds: string;
}

export interface MemoEntry {
    id: string;
    title: string;
    category: 'مرافعة ختامية' | 'جوابية دفاعية' | 'صحيفة استئناف' | 'عريضة تمييز' | 'تظلم إداري';
    caseType: string;
    authorName: string;
    content: string;
    lastModified: string;
    tags: string[];
}

export interface FollowupTask {
    id: string;
    delegateName: string;
    caseNumber: string;
    category: string;
    description: string;
    court: string;
    status: 'PREPARING' | 'ON_WAY' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
    notes?: string;
    reportedAt?: string;
}

export interface CourtEntry {
    id: string;
    name: string;
    location: string;
    phone: string;
    workingHours: string;
    activeStatus: 'Active' | 'Maintenance';
}

export interface CircuitEntry {
    id: string;
    name: string;
    courtName: string;
    headJudge: string;
    type: string;
    sessionDay: string;
}

export interface ClientProfile {
    id: string;
    name: string;
    type: 'Corporate' | 'Individual';
    civilOrRegId: string;
    phone: string;
    email: string;
    activeCasesCount: number;
    trustScore: 'Excellent' | 'Good' | 'Risky';
}

export interface OpposingParty {
    id: string;
    name: string;
    legalRepName: string;
    phone: string;
    activeCasesCount: number;
    riskStatus: 'Aggressive' | 'Cooperative' | 'Hostile';
}

export interface LawyerEntry {
    id: string;
    name: string;
    membershipNo: string;
    degree: 'أ' | 'ب' | 'ج' | 'دستورية وتمييز';
    status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
    activeCasesCount: number;
    email: string;
}

export interface NotificationNotice {
    id: string;
    recipientName: string;
    caseNumber: string;
    type: 'صحيفة دعوى' | 'إنذار رسمي' | 'إقرار حكم' | 'تنفيذ جبري';
    deliveryMethod: 'سهل الحكومي' | 'مندوب محكمة' | 'بريد مسجل';
    sentDate: string;
    status: 'Delivered' | 'Pending' | 'Refused' | 'Returned';
}

export interface LegalReport {
    id: string;
    title: string;
    period: string;
    generatedAt: string;
    winRatio: number;
    collectedAmounts: number;
    activeCasesCount: number;
    creator: string;
}

export interface DocumentAttachment {
    id: string;
    title: string;
    caseNumber: string;
    fileSize: string;
    fileType: 'PDF' | 'Word' | 'Image';
    category: 'توكيل رسمي' | 'صحيفة دعوى' | 'تقرير خبير' | 'سند دين';
    uploadedAt: string;
}

export interface ScheduleAppointment {
    id: string;
    title: string;
    date: string;
    time: string;
    category: 'جلسة خبراء' | 'اجتماع موكل' | 'إجراء قلم كتاب' | 'تسوية ودية';
    location: string;
    assignedLawyer: string;
}

export interface LegalTask {
    id: string;
    title: string;
    caseNumber: string;
    assignedTo: string;
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string;
    status: 'Pending' | 'In_Progress' | 'Completed' | 'Overdue';
}

export const initialCases: LitigationCase[] = [];
export const initialHearings: LitigationHearing[] = [];
export const initialEnforcements: EnforcementAction[] = [];
export const initialJudgments: JudgmentEntry[] = [];
export const initialAppeals: AppealEntry[] = [];
export const initialCassations: CassationEntry[] = [];
export const initialMemos: MemoEntry[] = [];
export const initialFollowups: FollowupTask[] = [];
export const initialCourts: CourtEntry[] = [];
export const initialCircuits: CircuitEntry[] = [];
export const initialClients: ClientProfile[] = [];
export const initialOpponents: OpposingParty[] = [];
export const initialLawyers: LawyerEntry[] = [];
export const initialNotifications: NotificationNotice[] = [];
export const initialReports: LegalReport[] = [];
export const initialDocuments: DocumentAttachment[] = [];
export const initialAppointments: ScheduleAppointment[] = [];
export const initialTasks: LegalTask[] = [];

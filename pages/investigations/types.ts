export enum CaseStatus {
    NEW = 'جديد',
    ONGOING = 'قيد التحقيق الدقيق',
    ON_HOLD = 'معلّق إدارياً',
    CLOSED = 'منتهي ومحفوظ عمالياً',
    ARCHIVED = 'مؤرشف ومحمي'
}

export interface LegalSafeguards {
    within15Days: boolean;      // التحقيق خلال 15 يوماً من كشف الواقعة (مادة 35)
    writtenNotice: boolean;     // إبلاغ الموظف كتابة بما ينسب إليه
    heardEmployee: boolean;     // سماع وتحقيق دفاع الموظف رسمياً
    signedOnPages: boolean;     // توقيع الموظف على صفحات محضر السماع
    proportionalPenalty: boolean; // التدريج العقابي مطابق للمادة 102
}

export interface InvestigationWitness {
    id: string;
    name: string;
    phone: string;
    status: 'summoned' | 'attended' | 'absent';
    statement?: string; // إفادة الشاهد المكتوبة
}

export interface InvestigationEvidence {
    id: string;
    name: string;
    type: string;
    dateAdded: string;
    notes?: string;
}

export interface InvestigationSessionQuestion {
    id: string;
    question: string;
    answer: string;
}

export interface InvestigationSession {
    id: string;
    sessionDate: string;
    partyName: string;
    partyType: 'employee' | 'witness'; // الموظف المتهم أو الشاهد
    questions: InvestigationSessionQuestion[];
    notes?: string;
    digitalSignature?: string; // توقيع إلكتروني للطرف
    isOathTaken?: boolean; // حلف اليمين (للشهود)
}

export interface InvestigationCase {
    id: string;
    caseNumber: string;
    subject: string;
    employeeId: string;
    employeeName: string;
    employeeJobTitle: string;
    employeeDepartment: string;
    investigator: string;
    status: CaseStatus;
    startDate: string;
    endDate?: string;
    complainantName: string;
    complainantTitle: string;
    violations: string[];
    evidence: InvestigationEvidence[];
    witnesses: InvestigationWitness[];
    sessions: InvestigationSession[];
    recommendation: string;
    proposedPenalty: string;
    approvedByInvestigator: boolean;
    approvedByLegalManager: boolean;
    approvedByGeneralManager: boolean;
    createdAt: string;
    customDocTemplateContent?: string;
    category?: string; // تصنيف المخالفة الرئيسي
    safeguards?: LegalSafeguards; // صمام الأمان والضمانات
}

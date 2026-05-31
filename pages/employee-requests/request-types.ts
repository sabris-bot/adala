import React from 'react';

// 1. Definition of the 13 Administrative Request Types
export enum RequestType {
    LEAVE = 'Leave Request',                         // طلب إجازة
    PERMISSION = 'Permission Request',                 // طلب استئذان
    SALARY_CERTIFICATE = 'Salary Certificate',       // طلب تعريف راتب
    CERTIFICATE = 'Certificate Request',             // طلب شهادة
    DATA_UPDATE = 'Data Update Request',             // طلب تعديل بيانات
    LOAN = 'Loan Request',                           // طلب قرض
    ADVANCE = 'Salary Advance Request',               // طلب سلفة
    TRAINING = 'Training Request',                   // طلب تدريب
    DEPUTATION = 'Deputation Request',               // طلب انتداب
    TRANSFER = 'Department Transfer',                 // طلب نقل
    PROMOTION = 'Promotion Request',                 // طلب ترقية
    DUTY_RESUMPTION = 'Duty Resumption Request',     // طلب مباشرة عمل
    CUSTOM = 'Custom Request',                       // طلب مخصص آخر
}

// 2. Request Statuses (Required by Kuwait labor code and user instructions)
export type RequestWorkflowStatus = 
    | 'Draft' 
    | 'Pending Line Manager' 
    | 'Under HR Review' 
    | 'Under Financial Review' 
    | 'Under Legal Review' 
    | 'Signed & Completed' 
    | 'Rejected';

// Translated Arabic UI Statuses
export const statusTranslations: Record<string, string> = {
    'Draft': 'مسودة',
    'Pending Line Manager': 'جديد / بانتظار المدير المباشر',
    'Under HR Review': 'قيد المراجعة (الموارد البشرية)',
    'Under Financial Review': 'قيد المراجعة (الإدارة المالية)',
    'Under Legal Review': 'قيد المراجعة (الإدارة القانونية)',
    'Signed & Completed': 'مكتمل ومعتمد نهائياً',
    'Rejected': 'مرفوض'
};

// 3. Approval Workflow Roles
export interface ApprovalStage {
    roleId: 'applicant' | 'line_manager' | 'hr' | 'finance' | 'legal' | 'final_approval';
    roleAr: string;
    roleEn: string;
    status: 'pending' | 'approved' | 'rejected' | 'not_required';
    approverName?: string;
    actionDate?: string;
    notes?: string;
}

// 4. Detailed Employee Request Interface
export interface EmployeeRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeJobTitle: string;
    employeeDepartment: string;
    requestType: RequestType;
    requestDate: string;
    status: RequestWorkflowStatus;
    referenceNumber: string;
    
    // Custom values for form fields per RequestType
    leaveType?: 'annual' | 'sick' | 'emergency' | 'maternity' | 'pilgrimage' | 'special';
    startDate?: string;
    endDate?: string;
    leaveDaysCount?: number;
    
    permissionDate?: string;
    permissionTimeRange?: string; // e.g. "08:00 - 10:00"
    permissionHours?: number;
    
    recipientName?: string; // For Salary Certificates or certificates
    includeSalaryDetails?: boolean;
    language?: 'ar' | 'en';
    
    fieldToUpdate?: string; // For data modification
    oldValue?: string;
    newValue?: string;
    
    loanAmount?: number;
    installmentsCount?: number;
    monthlyInstallment?: number;
    guarantorName?: string; // الضمانات والتعهدات
    guarantorId?: string;
    
    trainingCourseTitle?: string;
    trainingProvider?: string;
    trainingCost?: number;
    
    deputationLocation?: string;
    deputationDurationDays?: number;
    deputationPerDiem?: number;
    
    currentDept?: string;
    requestedDept?: string;
    currentTitle?: string;
    requestedTitle?: string;
    
    currentSalary?: number;
    proposedSalary?: number;
    raisePercentage?: number;
    retroactiveDate?: string;
    
    resumptionDate?: string;
    resumptionReferenceCode?: string;
    
    customTitle?: string;
    customContent?: string;

    // Background Integration Fields of Selected Employee at creation time
    warningsCountAtRequest?: number;
    outstandingLoansCount?: number;
    hasActiveInvestigation?: boolean;
    remainingLeaveDays?: number;
    joiningDate?: string;
    nationality?: string;
    civilId?: string;
    
    reasonNote: string;
    notes?: string;
    hrNotes?: string;
    completedAt?: string;

    // Advanced Document Editing Layer Saved State
    customPrintedDocContent?: string; // Stores user in-line edits before printing

    // Multi-stage Approvals Record
    approvals: ApprovalStage[];
}
